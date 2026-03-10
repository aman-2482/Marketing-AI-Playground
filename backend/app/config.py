from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AI
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    max_tokens: int = 4096

    # Database
    database_url: str = "sqlite:///./genai_marketing_lab.db"

    # API
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    rate_limit: str = "30/minute"

    # Security — override secret_key and admin credentials in production
    secret_key: str = "change-me-in-production"
    admin_username: str = "admin"
    admin_password: str = "112233"

    # Runtime
    env: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
