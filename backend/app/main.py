import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.sessions import SessionMiddleware

from app.admin import setup_admin
from app.ai_service import AVAILABLE_MODELS, DEFAULT_MODEL
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import Activity, PromptHistory, User, UserToken  # noqa: F401 — registers tables with Base
from app.rate_limit import limiter
from app.routers import activities, history, playground
from app.routers import auth as auth_router
from app.seed.activities import ACTIVITIES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Startup helpers
# ---------------------------------------------------------------------------

def _seed_activities() -> None:
    """Upsert guided activities on every launch so seed changes take effect."""
    db = SessionLocal()
    try:
        added = updated = 0
        for data in ACTIVITIES:
            existing = db.query(Activity).filter(Activity.slug == data["slug"]).first()
            if existing:
                for key, value in data.items():
                    setattr(existing, key, value)
                updated += 1
            else:
                db.add(Activity(**data))
                added += 1
        db.commit()
        logger.info("Seed complete — %d added, %d updated.", added, updated)
    finally:
        db.close()


def _ensure_prompt_history_soft_delete_column() -> None:
    """Add prompt_history.is_deleted for existing databases without migrations."""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    if "prompt_history" not in table_names:
        return

    columns = {column["name"] for column in inspector.get_columns("prompt_history")}
    if "is_deleted" in columns:
        return

    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE prompt_history ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT 0")
        )
    logger.info("Added prompt_history.is_deleted column for soft delete support.")


def _ensure_activity_icon_length() -> None:
    """Expand activities.icon to avoid truncation when seeding data."""
    if "sqlite" in settings.database_url:
        return

    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    if "activities" not in table_names:
        return

    columns = {column["name"]: column["type"] for column in inspector.get_columns("activities")}
    icon_type = columns.get("icon")
    icon_length = getattr(icon_type, "length", None)
    if icon_length is None or icon_length >= 50:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE activities ALTER COLUMN icon TYPE VARCHAR(50)"))
    logger.info("Expanded activities.icon column to VARCHAR(50).")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Create database tables and seed data before serving requests."""
    Base.metadata.create_all(bind=engine)
    _ensure_prompt_history_soft_delete_column()
    _ensure_activity_icon_length()
    _seed_activities()
    yield


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="GenAI Marketing Lab",
    description="A hands-on AI playground for marketing professionals to practice prompt engineering and content creation.",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware — last added = outermost = runs first.
# Execution order: CORS → Session → app
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router)
app.include_router(playground.router)
app.include_router(activities.router)
app.include_router(history.router)

# Admin UI (mounted at /admin/)
setup_admin(app, engine)


# ---------------------------------------------------------------------------
# Meta endpoints
# ---------------------------------------------------------------------------

@app.get("/api/models", tags=["meta"])
def list_models():
    """Return the list of AI models available for selection."""
    return {"models": AVAILABLE_MODELS, "default": DEFAULT_MODEL}


@app.get("/api/health", tags=["meta"])
def health():
    """Simple liveness probe."""
    return {"status": "ok", "app": "GenAI Marketing Lab"}
