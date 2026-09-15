from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional


# ── Request ──────────────────────────────────────────────────────────────────

class VideoRequest(BaseModel):
    url: str
    template_type: Optional[str] = "General"
    target_language: Optional[str] = "en"
    ai_provider: Optional[str] = "Groq"

    @field_validator("url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        patterns = [
            "youtube.com/watch",
            "youtu.be/",
            "youtube.com/shorts/",
            "youtube.com/embed/",
        ]
        if not any(p in v for p in patterns):
            raise ValueError("Please enter a valid YouTube URL")
        return v


# ── Video metadata ────────────────────────────────────────────────────────────

class VideoInfo(BaseModel):
    video_id: str
    title: str
    channel: Optional[str] = None
    duration: Optional[str] = None  # human-readable e.g. "12:34"
    thumbnail_url: Optional[str] = None
    url: str


# ── Note components ───────────────────────────────────────────────────────────

class KeyConcept(BaseModel):
    name: str
    explanation: str
    example: Optional[str] = None


class Flashcard(BaseModel):
    question: str
    answer: str


class QuizOption(BaseModel):
    label: str   # "A", "B", "C", "D"
    text: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str]       # plain option strings
    correct_answer: str      # the correct option text
    explanation: str


class NoteSection(BaseModel):
    heading: str
    content: str


# ── AI output (validated from Groq JSON response) ─────────────────────────────

class NotesData(BaseModel):
    title: str
    summary: str
    key_concepts: list[KeyConcept] = []
    detailed_notes: list[NoteSection] = []
    important_points: list[str] = []
    examples: list[str] = []
    flashcards: list[Flashcard] = []
    quiz: list[QuizQuestion] = []


# ── Final API response ────────────────────────────────────────────────────────

class ProcessResponse(BaseModel):
    video: VideoInfo
    transcript: str          # cleaned transcript for display
    notes: NotesData


class ValidateResponse(BaseModel):
    valid: bool
    video_id: Optional[str] = None
    is_playlist: bool = False
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class PlaylistResponse(BaseModel):
    playlist_id: str
    videos: list[ProcessResponse]
    failed_videos: list[dict] # e.g. [{"url": "...", "error": "..."}]
