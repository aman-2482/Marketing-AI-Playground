import logging

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "anthropic/claude-sonnet-4-5"

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

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    """Return the OpenRouter singleton client, initialising it on first call."""
    global _client
    if _client is None:
        if not settings.openrouter_api_key:
            raise ValueError(
                "OPENROUTER_API_KEY is not set. Add it to your .env file."
            )
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
    if model not in _VALID_MODEL_IDS:
        raise ValueError(f"Unknown model: {model!r}. Choose one of: {sorted(_VALID_MODEL_IDS)}")
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
