import json
import logging
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from queue import Queue

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.ai_service import (
    DEFAULT_MODEL,
    ensure_openrouter_api_key,
    generate_content,
    stream_content,
    user_facing_openrouter_error,
    validate_model,
)
from app.config import settings
from app.database import get_db
from app.models import PromptHistory
from app.rate_limit import limiter
from app.schemas import (
    ABCompareRequest,
    ABCompareResponse,
    PlaygroundRequest,
    PlaygroundResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/playground", tags=["playground"])


@router.post("/generate", response_model=PlaygroundResponse)
@limiter.limit(settings.rate_limit)
def playground_generate(
    request: Request,
    req: PlaygroundRequest,
    db: Session = Depends(get_db),
):
    """Generate content from a free-form prompt and save it to history."""
    model = req.model or DEFAULT_MODEL
    try:
        response = generate_content(
            prompt=req.prompt,
            system_prompt=req.system_prompt,
            temperature=req.temperature,
            model=model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Playground generation failed")
        raise HTTPException(status_code=502, detail=user_facing_openrouter_error(exc, model))

    db.add(
        PromptHistory(
            session_id=req.session_id,
            activity_slug=None,
            prompt=req.prompt,
            system_prompt=req.system_prompt,
            response=response,
            model=model,
            temperature=req.temperature,
        )
    )
    db.commit()

    return PlaygroundResponse(response=response, prompt=req.prompt, model=model)


@router.post("/generate/stream")
@limiter.limit(settings.rate_limit)
def playground_generate_stream(
    request: Request,
    req: PlaygroundRequest,
    db: Session = Depends(get_db),
):
    """Stream generated content chunks as plain text and save final output to history."""
    model = req.model or DEFAULT_MODEL
    try:
        validate_model(model)
        ensure_openrouter_api_key()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    response_parts: list[str] = []

    def chunk_iterator() -> Iterator[str]:
        try:
            for chunk in stream_content(
                prompt=req.prompt,
                system_prompt=req.system_prompt,
                temperature=req.temperature,
                model=model,
            ):
                response_parts.append(chunk)
                yield chunk
        except Exception as exc:
            logger.exception("Playground streaming generation failed")
            yield "\n\n[Notice] " + user_facing_openrouter_error(exc, model)
        finally:
            response = "".join(response_parts)
            if response:
                db.add(
                    PromptHistory(
                        session_id=req.session_id,
                        activity_slug=None,
                        prompt=req.prompt,
                        system_prompt=req.system_prompt,
                        response=response,
                        model=model,
                        temperature=req.temperature,
                    )
                )
                db.commit()

    return StreamingResponse(chunk_iterator(), media_type="text/plain; charset=utf-8")


@router.post("/compare", response_model=ABCompareResponse)
@limiter.limit(settings.rate_limit)
def playground_compare(
    request: Request,
    req: ABCompareRequest,
    db: Session = Depends(get_db),
):
    """Generate responses for up to three prompts side-by-side and save to history."""
    model_a = req.model_a or DEFAULT_MODEL
    model_b = req.model_b or DEFAULT_MODEL
    model_c = req.model_c or DEFAULT_MODEL if req.prompt_c else None
    try:
        jobs: list[tuple[str, str, str]] = [
            ("a", req.prompt_a, model_a),
            ("b", req.prompt_b, model_b),
        ]
        if req.prompt_c and model_c:
            jobs.append(("c", req.prompt_c, model_c))

        with ThreadPoolExecutor(max_workers=len(jobs)) as executor:
            future_map = {
                label: executor.submit(
                    generate_content,
                    prompt=prompt,
                    system_prompt=req.system_prompt,
                    temperature=req.temperature,
                    model=model,
                )
                for label, prompt, model in jobs
            }

            response_a = future_map["a"].result()
            response_b = future_map["b"].result()
            response_c = future_map["c"].result() if "c" in future_map else None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Playground compare failed")
        raise HTTPException(status_code=502, detail=user_facing_openrouter_error(exc, model_a))

    db.add(
        PromptHistory(
            session_id=req.session_id,
            activity_slug="__compare__",
            prompt=json.dumps(
                {
                    "prompt_a": req.prompt_a,
                    "prompt_b": req.prompt_b,
                    "prompt_c": req.prompt_c,
                }
            ),
            system_prompt=req.system_prompt,
            response=json.dumps(
                {
                    "response_a": response_a,
                    "response_b": response_b,
                    "response_c": response_c,
                }
            ),
            model="|||".join([m for m in [model_a, model_b, model_c] if m]),
            temperature=req.temperature,
        )
    )
    db.commit()

    return ABCompareResponse(
        response_a=response_a,
        response_b=response_b,
        response_c=response_c,
        prompt_a=req.prompt_a,
        prompt_b=req.prompt_b,
        prompt_c=req.prompt_c,
        model_a=model_a,
        model_b=model_b,
        model_c=model_c,
    )


@router.post("/compare/stream")
@limiter.limit(settings.rate_limit)
def playground_compare_stream(
    request: Request,
    req: ABCompareRequest,
    db: Session = Depends(get_db),
):
    """Stream lane-tagged compare chunks as NDJSON and save combined history when complete."""
    model_a = req.model_a or DEFAULT_MODEL
    model_b = req.model_b or DEFAULT_MODEL
    model_c = req.model_c or DEFAULT_MODEL if req.prompt_c else None

    try:
        validate_model(model_a)
        validate_model(model_b)
        if model_c:
            validate_model(model_c)
        ensure_openrouter_api_key()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    jobs: list[tuple[str, str, str]] = [
        ("a", req.prompt_a, model_a),
        ("b", req.prompt_b, model_b),
    ]
    if req.prompt_c and model_c:
        jobs.append(("c", req.prompt_c, model_c))

    def stream_iterator() -> Iterator[str]:
        queue: Queue[dict[str, str]] = Queue()
        response_parts: dict[str, list[str]] = {"a": [], "b": [], "c": []}
        worker_error: list[str] = []

        def worker(label: str, prompt: str, model: str) -> None:
            try:
                for chunk in stream_content(
                    prompt=prompt,
                    system_prompt=req.system_prompt,
                    temperature=req.temperature,
                    model=model,
                ):
                    queue.put({"type": "chunk", "lane": label, "chunk": chunk})
            except Exception as exc:
                logger.exception("Compare streaming lane failed: %s", label)
                queue.put(
                    {
                        "type": "error",
                        "lane": label,
                        "message": user_facing_openrouter_error(exc, model),
                    }
                )
            finally:
                queue.put({"type": "done", "lane": label})

        with ThreadPoolExecutor(max_workers=len(jobs)) as executor:
            for label, prompt, model in jobs:
                executor.submit(worker, label, prompt, model)

            completed = 0
            while completed < len(jobs):
                event = queue.get()
                event_type = event.get("type")
                lane = event.get("lane") or ""

                if event_type == "chunk":
                    chunk = event.get("chunk") or ""
                    response_parts[lane].append(chunk)
                    yield json.dumps({"lane": lane, "chunk": chunk}) + "\n"
                elif event_type == "error":
                    message = event.get("message") or "AI generation failed. Please try again."
                    worker_error.append(f"lane {lane}: {message}")
                elif event_type == "done":
                    completed += 1

        if worker_error:
            yield json.dumps({"error": " ".join(worker_error)}) + "\n"
            return

        response_a = "".join(response_parts["a"])
        response_b = "".join(response_parts["b"])
        response_c = "".join(response_parts["c"]) if req.prompt_c else None

        db.add(
            PromptHistory(
                session_id=req.session_id,
                activity_slug="__compare__",
                prompt=json.dumps(
                    {
                        "prompt_a": req.prompt_a,
                        "prompt_b": req.prompt_b,
                        "prompt_c": req.prompt_c,
                    }
                ),
                system_prompt=req.system_prompt,
                response=json.dumps(
                    {
                        "response_a": response_a,
                        "response_b": response_b,
                        "response_c": response_c,
                    }
                ),
                model="|||".join([m for m in [model_a, model_b, model_c] if m]),
                temperature=req.temperature,
            )
        )
        db.commit()

        yield json.dumps(
            {
                "done": True,
                "model_a": model_a,
                "model_b": model_b,
                "model_c": model_c,
            }
        ) + "\n"

    return StreamingResponse(stream_iterator(), media_type="application/x-ndjson")
