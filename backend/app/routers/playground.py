import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.ai_service import DEFAULT_MODEL, generate_content
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
    except Exception:
        logger.exception("Playground generation failed")
        raise HTTPException(status_code=502, detail="AI generation failed. Please try again.")

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
        response_a = generate_content(
            prompt=req.prompt_a,
            system_prompt=req.system_prompt,
            temperature=req.temperature,
            model=model_a,
        )
        response_b = generate_content(
            prompt=req.prompt_b,
            system_prompt=req.system_prompt,
            temperature=req.temperature,
            model=model_b,
        )
        response_c = None
        if req.prompt_c:
            response_c = generate_content(
                prompt=req.prompt_c,
                system_prompt=req.system_prompt,
                temperature=req.temperature,
                model=model_c,
            )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Playground compare failed")
        raise HTTPException(status_code=502, detail="AI generation failed. Please try again.")

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
