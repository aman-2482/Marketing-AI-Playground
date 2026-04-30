import json
import logging
from collections.abc import Iterator

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
from app.models import Activity, PromptHistory, User
from app.routers.auth import get_current_user
from app.rate_limit import limiter
from app.schemas import ActivityGenerateRequest, ActivityGenerateResponse, ActivityOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/activities", tags=["activities"])


@router.get("/", response_model=list[ActivityOut])
def list_activities(db: Session = Depends(get_db)):
    """Return all active guided activities, sorted by display order."""
    return (
        db.query(Activity)
        .filter(Activity.is_active.is_(True))
        .order_by(Activity.order)
        .all()
    )


@router.get("/{slug}", response_model=ActivityOut)
def get_activity(slug: str, db: Session = Depends(get_db)):
    """Return a single activity by slug."""
    activity = db.query(Activity).filter(Activity.slug == slug).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.post("/{slug}/generate", response_model=ActivityGenerateResponse)
@limiter.limit(settings.rate_limit)
def activity_generate(
    request: Request,
    slug: str,
    req: ActivityGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate AI content for a guided activity and save it to history."""
    activity = db.query(Activity).filter(Activity.slug == slug).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    try:
        model = req.model or DEFAULT_MODEL
        response = generate_content(
            prompt=req.prompt,
            system_prompt=activity.system_prompt,
            temperature=req.temperature,
            model=model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Activity generation failed for slug=%s", slug)
        raise HTTPException(status_code=502, detail=user_facing_openrouter_error(exc, model))

    db.add(
        PromptHistory(
            session_id=req.session_id,
            activity_slug=slug,
            prompt=req.prompt,
            system_prompt=activity.system_prompt,
            response=response,
            model=model,
            temperature=req.temperature,
        )
    )
    db.commit()

    return ActivityGenerateResponse(response=response, activity_slug=slug, prompt=req.prompt, model=model)


@router.post("/{slug}/generate/stream")
@limiter.limit(settings.rate_limit)
def activity_generate_stream(
    request: Request,
    slug: str,
    req: ActivityGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Stream AI content for a guided activity and save final output to history."""
    activity = db.query(Activity).filter(Activity.slug == slug).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

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
                system_prompt=activity.system_prompt,
                temperature=req.temperature,
                model=model,
            ):
                response_parts.append(chunk)
                yield json.dumps({"chunk": chunk}) + "\n"
        except Exception as exc:
            logger.exception("Activity streaming generation failed for slug=%s", slug)
            yield json.dumps({"error": user_facing_openrouter_error(exc, model)}) + "\n"
        finally:
            response = "".join(response_parts)
            if response:
                db.add(
                    PromptHistory(
                        session_id=req.session_id,
                        activity_slug=slug,
                        prompt=req.prompt,
                        system_prompt=activity.system_prompt,
                        response=response,
                        model=model,
                        temperature=req.temperature,
                    )
                )
                db.commit()
            yield json.dumps({"done": True}) + "\n"

    headers = {
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
    return StreamingResponse(chunk_iterator(), media_type="application/x-ndjson", headers=headers)
