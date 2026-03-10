import re
from datetime import datetime
from typing import Annotated, Optional

from pydantic import AfterValidator, BaseModel, Field


# ---------------------------------------------------------------------------
# Reusable validated types
# ---------------------------------------------------------------------------

_SESSION_ID_RE = re.compile(r"^[a-zA-Z0-9_\-]{1,100}$")


def _validate_session_id(v: str) -> str:
    if not _SESSION_ID_RE.match(v):
        raise ValueError(
            "session_id must be 1–100 characters containing only "
            "alphanumeric characters, hyphens, or underscores"
        )
    return v


# Annotated type — apply once, reuse everywhere
SessionId = Annotated[str, AfterValidator(_validate_session_id)]


# ---------------------------------------------------------------------------
# Playground
# ---------------------------------------------------------------------------

class PlaygroundRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)
    system_prompt: str = Field(
        default="You are a helpful marketing assistant.",
        max_length=5_000,
    )
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    session_id: SessionId = Field(default="default", max_length=100)
    model: Optional[str] = Field(default=None, max_length=100)


class PlaygroundResponse(BaseModel):
    response: str
    prompt: str
    model: str


# ---------------------------------------------------------------------------
# Activities
# ---------------------------------------------------------------------------

class ActivityOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    icon: str
    instructions: str
    tips: str
    example_inputs: str
    system_prompt: str
    input_fields: str
    order: int

    model_config = {"from_attributes": True}


class ActivityGenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    session_id: SessionId = Field(default="default", max_length=100)
    model: Optional[str] = Field(default=None, max_length=100)


class ActivityGenerateResponse(BaseModel):
    response: str
    activity_slug: str
    prompt: str
    model: str


# ---------------------------------------------------------------------------
# A/B Comparison
# ---------------------------------------------------------------------------

class ABCompareRequest(BaseModel):
    prompt_a: str = Field(min_length=1, max_length=10_000)
    prompt_b: str = Field(min_length=1, max_length=10_000)
    system_prompt: str = Field(
        default="You are a helpful marketing assistant.",
        max_length=5_000,
    )
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    session_id: SessionId = Field(default="default", max_length=100)
    model_a: Optional[str] = Field(default=None, max_length=100)
    model_b: Optional[str] = Field(default=None, max_length=100)


class ABCompareResponse(BaseModel):
    response_a: str
    response_b: str
    prompt_a: str
    prompt_b: str
    model_a: str
    model_b: str


# ---------------------------------------------------------------------------
# History
# ---------------------------------------------------------------------------

class HistoryOut(BaseModel):
    id: int
    session_id: str
    activity_slug: Optional[str]
    prompt: str
    system_prompt: str
    response: str
    model: str
    temperature: float
    is_favorite: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FavoriteToggle(BaseModel):
    is_favorite: bool
    is_favorite: bool
