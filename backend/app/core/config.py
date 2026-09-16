from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "NoteTube"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS — allow Vite dev server + production frontend
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://notetube-zjl2.onrender.com",
        "https://note-tube-eight.vercel.app",
    ]

    # AI Providers
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-latest"
    
    # AI Shared Config
    AI_MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = 0.3

    # Transcript processing
    CHUNK_WORD_LIMIT: int = 3000   # words per chunk before sending to AI
    MAX_TRANSCRIPT_WORDS: int = 60000  # safety cap

    # Rate limiting (simple in-memory)
    MAX_REQUESTS_PER_MINUTE: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
