import logging
from collections.abc import Iterator

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

FALLBACK_DEFAULT_MODEL = "openai/gpt-4o-mini"

# Models available through OpenRouter for selection in the UI
AVAILABLE_MODELS: list[dict[str, str]] = [
    {"id": "anthropic/claude-sonnet-4-5",          "name": "Claude Sonnet 4.5 (Anthropic)"},
    {"id": "anthropic/claude-3.5-haiku",            "name": "Claude 3.5 Haiku (Anthropic)"},
    {"id": "openai/gpt-4o",                         "name": "GPT-4o (OpenAI)"},
    {"id": "openai/gpt-4o-mini",                    "name": "GPT-4o Mini (OpenAI)"},
    {"id": "google/gemini-2.0-flash-001",           "name": "Gemini 2.0 Flash (Google)"},
    {"id": "meta-llama/llama-3.3-70b-instruct",    "name": "Llama 3.3 70B (Meta)"},
    {"id": "mistralai/mistral-large-2411",          "name": "Mistral Large (Mistral)"},
    {"id": "deepseek/deepseek-chat",               "name": "DeepSeek Chat (DeepSeek)"},
]

_VALID_MODEL_IDS = {m["id"] for m in AVAILABLE_MODELS}

DEFAULT_MODEL = (
    settings.default_model
    if settings.default_model in _VALID_MODEL_IDS
    else FALLBACK_DEFAULT_MODEL
)

if settings.default_model not in _VALID_MODEL_IDS:
    logger.warning(
        "DEFAULT_MODEL=%r is not in AVAILABLE_MODELS; falling back to %r",
        settings.default_model,
        FALLBACK_DEFAULT_MODEL,
    )

_client: OpenAI | None = None


def ensure_openrouter_api_key() -> None:
    """Ensure OPENROUTER_API_KEY is configured before making API calls."""
    if not settings.openrouter_api_key:
        raise ValueError("Please add your OpenRouter API key.")


def validate_model(model: str) -> None:
    if model not in _VALID_MODEL_IDS:
        raise ValueError(f"Unknown model: {model!r}. Choose one of: {sorted(_VALID_MODEL_IDS)}")


def _get_client() -> OpenAI:
    """Return the OpenRouter singleton client, initialising it on first call."""
    global _client
    if _client is None:
        ensure_openrouter_api_key()
        _client = OpenAI(
            base_url=settings.openrouter_base_url,
            api_key=settings.openrouter_api_key,
        )
    return _client


def generate_content(
    prompt: str,
    system_prompt: str = "You are a helpful marketing assistant.",
    temperature: float = 0.7,
    model: str = DEFAULT_MODEL,
) -> str:
    """Send a single-turn message via OpenRouter and return the text response."""
    validate_model(model)
    try:
        completion = _get_client().chat.completions.create(
            model=model,
            max_tokens=settings.max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": prompt},
            ],
        )
        return completion.choices[0].message.content or ""
    except Exception as exc:
        logger.error("OpenRouter API error: %s", exc)
        raise


def stream_content(
    prompt: str,
    system_prompt: str = "You are a helpful marketing assistant.",
    temperature: float = 0.7,
    model: str = DEFAULT_MODEL,
) -> Iterator[str]:
    """Stream partial text chunks from OpenRouter as they are generated."""
    validate_model(model)
    try:
        stream = _get_client().chat.completions.create(
            model=model,
            max_tokens=settings.max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            stream=True,
        )

        for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as exc:
        logger.error("OpenRouter streaming API error: %s", exc)
        raise
