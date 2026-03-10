import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.ai_service import DEFAULT_MODEL, generate_content
from app.config import settings
from app.database import get_db
from app.models import Activity, PromptHistory
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
    except Exception:
        logger.exception("Activity generation failed for slug=%s", slug)
        raise HTTPException(status_code=502, detail="AI generation failed. Please try again.")

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
