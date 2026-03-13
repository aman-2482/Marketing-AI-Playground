from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PromptHistory
from app.schemas import FavoriteToggle, HistoryOut

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/", response_model=list[HistoryOut])
def list_history(
    session_id: str = "default",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return prompt history for a session, newest first."""
    return (
        db.query(PromptHistory)
        .filter(
            PromptHistory.session_id == session_id,
            PromptHistory.is_deleted.is_(False),
        )
        .order_by(PromptHistory.created_at.desc())
        .limit(limit)
        .all()
    )


@router.patch("/{history_id}/favorite", response_model=HistoryOut)
def toggle_favorite(
    history_id: int,
    body: FavoriteToggle,
    db: Session = Depends(get_db),
):
    """Toggle the favorite flag on a history entry."""
    entry = (
        db.query(PromptHistory)
        .filter(
            PromptHistory.id == history_id,
            PromptHistory.is_deleted.is_(False),
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    entry.is_favorite = body.is_favorite
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    """Soft-delete a single history entry."""
    entry = (
        db.query(PromptHistory)
        .filter(
            PromptHistory.id == history_id,
            PromptHistory.is_deleted.is_(False),
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    entry.is_deleted = True
    db.commit()
    return {"detail": "Deleted"}
