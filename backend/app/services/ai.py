"""
AI service — Groq API integration for structured note generation.
Designed to be swappable with OpenAI / Gemini by replacing the client.
"""
import json
import logging
import re
from typing import Optional

from groq import Groq
from groq import RateLimitError, APIError, APIConnectionError
import openai
import anthropic
from anthropic import RateLimitError as AnthropicRateLimitError, APIError as AnthropicAPIError
from google import genai
from google.genai import types, errors as genai_errors
import time
from app.core.config import get_settings
from app.schemas.video import NotesData, KeyConcept, Flashcard, QuizQuestion, NoteSection

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize Gemini
# (In google.genai, we instantiate the client instead of using global config)

# ── Client factory (swap here for another provider) ───────────────────────────

def _get_groq_client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set.")
    return Groq(api_key=settings.GROQ_API_KEY)

def _get_openai_client() -> openai.Client:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set.")
    return openai.Client(api_key=settings.OPENAI_API_KEY)

def _get_gemini_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def _get_anthropic_client() -> anthropic.Anthropic:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set.")
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


# ── Prompt templates ───────────────────────────────────────────────────────────

CHUNK_SUMMARY_PROMPT = """You are an expert educational content analyst.
Below is a chunk of a YouTube video transcript. Write a concise, informative summary
of the key points covered in this segment. Focus on the substance — avoid filler words.

TRANSCRIPT CHUNK:
{chunk}

Respond with only the summary text, no preamble."""


FULL_NOTES_PROMPT = """You are an expert educational content analyst and a highly creative, insightful teacher.
You have been given a video transcript (or a combined summary of transcript chunks).
Generate comprehensive, highly detailed, and creative study material in valid JSON format.
You MUST draw upon your own vast knowledge base to expand upon the concepts mentioned in the video. Do not just summarize; provide deep, logical explanations, analogies, and detailed breakdowns of the topics discussed so the student truly understands the "why" and "how".

Your explanation of the video's core topic in the "summary" section MUST be extensively detailed (at least 4-6 paragraphs), acting as a rich, logical introduction that thoroughly explains the overarching themes from your own creative perspective.

VIDEO TITLE: {title}

TRANSCRIPT / SUMMARY:
{content}

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no extra text):
{{
  "title": "Descriptive title for the notes",
  "summary": "4-6 paragraphs of an extensively detailed, creative, and logical explanation of the overarching topic. Do not just summarize the video; explain the concepts using your own knowledge and perspective.",
  "key_concepts": [
    {{
      "name": "Concept name",
      "explanation": "Clear explanation in 3-4 sentences",
      "example": "Concrete example or analogy"
    }}
  ],
  "detailed_notes": [
    {{
      "heading": "Section heading",
      "content": "Extremely detailed markdown-formatted content. Write like an engaging textbook chapter. Explain the logic, provide creative analogies, and go in-depth on the 'why' and 'how'. Use bullet points, numbered lists, and **bold** for key terms. Minimum 3-4 paragraphs per section."
    }}
  ],
  "important_points": [
    "Short revision point 1",
    "Short revision point 2"
  ],
  "examples": [
    "Concrete example or case study"
  ],
  "flashcards": [
    {{
      "question": "Clear question",
      "answer": "Concise answer"
    }}
  ],
  "quiz": [
    {{
      "question": "Multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this answer is correct"
    }}
  ]
}}

Requirements:
- summary: MUST be very detailed (4-6 paragraphs) containing creative, logical explanations of the topic.
- key_concepts: 5-12 concepts
- detailed_notes: 5-10 sections with HIGHLY SUBSTANTIVE, detailed textbook-level content. Supplement with your own knowledge to explain concepts better.
- important_points: 10-20 bullet points
- examples: 5-10 detailed examples
- flashcards: 10-20 cards
- quiz: 5-10 questions with 4 options each
- All core topics must come from the transcript, but you MUST use your own knowledge to explain them creatively and logically.
- Use clear, engaging, and creative student-friendly language"""


# ── Core AI calls ──────────────────────────────────────────────────────────────

def _call_llm(prompt: str, provider: str = "Groq", max_tokens: Optional[int] = None) -> str:
    """Low-level LLM API call."""
    provider = provider.lower()
    
    if provider == "openai":
        client = _get_openai_client()
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens or settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )
        return response.choices[0].message.content or ""
        
    elif provider == "gemini":
        client = _get_gemini_client()
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens or settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE,
            )
        )
        try:
            return response.text
        except ValueError as e:
            logger.error("Gemini response missing text. Might be blocked. %s", e)
            return ""
            
    elif provider == "claude":
        client = _get_anthropic_client()
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=max_tokens or settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
        
    else: # Default to Groq
        client = _get_groq_client()
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens or settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )
        return response.choices[0].message.content or ""


def _summarize_chunk(chunk: str, provider: str = "Groq") -> str:
    """Summarize a single transcript chunk."""
    prompt = CHUNK_SUMMARY_PROMPT.format(chunk=chunk)
    try:
        return _call_llm(prompt, provider, max_tokens=800)
    except Exception as exc:
        logger.warning("Chunk summarization failed: %s", exc)
        # Fall back to first 500 words of the chunk
        return " ".join(chunk.split()[:500])


# ── JSON extraction ────────────────────────────────────────────────────────────

def _extract_json(raw: str) -> dict:
    """Extract the first JSON object from an LLM response string."""
    # Strip markdown code fences if present
    raw = re.sub(r"```(?:json)?", "", raw).strip()

    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Find first { … } block
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from AI response. Raw: {raw[:300]}")


# ── Validation helpers ─────────────────────────────────────────────────────────

def _parse_notes(data: dict, fallback_title: str) -> NotesData:
    """Validate and coerce raw AI JSON into NotesData, with field-level fallbacks."""

    def safe_list(raw, cast_fn):
        if not isinstance(raw, list):
            return []
        result = []
        for item in raw:
            try:
                result.append(cast_fn(item))
            except Exception:
                continue
        return result

    key_concepts = safe_list(
        data.get("key_concepts", []),
        lambda x: KeyConcept(
            name=x.get("name", "Concept"),
            explanation=x.get("explanation", ""),
            example=x.get("example"),
        ),
    )

    detailed_notes = safe_list(
        data.get("detailed_notes", []),
        lambda x: NoteSection(
            heading=x.get("heading", "Section"),
            content=x.get("content", ""),
        ),
    )

    flashcards = safe_list(
        data.get("flashcards", []),
        lambda x: Flashcard(
            question=x.get("question", ""),
            answer=x.get("answer", ""),
        ),
    )

    quiz = safe_list(
        data.get("quiz", []),
        lambda x: QuizQuestion(
            question=x.get("question", ""),
            options=x.get("options", []),
            correct_answer=x.get("correct_answer", ""),
            explanation=x.get("explanation", ""),
        ),
    )

    return NotesData(
        title=data.get("title") or fallback_title,
        summary=data.get("summary") or "Summary not available.",
        key_concepts=key_concepts,
        detailed_notes=detailed_notes,
        important_points=[p for p in data.get("important_points", []) if isinstance(p, str)],
        examples=[e for e in data.get("examples", []) if isinstance(e, str)],
        flashcards=flashcards,
        quiz=quiz,
    )


# ── Public API ─────────────────────────────────────────────────────────────────

class AIServiceError(Exception):
    """Raised on unrecoverable AI failures."""
    pass


class AIRateLimitError(AIServiceError):
    """Raised when the AI provider returns a rate limit error."""
    pass


def generate_notes(
    chunks: list[str],
    video_title: str = "YouTube Video",
    provider: str = "Groq"
) -> NotesData:
    """
    Main entry point.

    For single chunks, sends directly to the full-notes prompt.
    For multiple chunks, summarises each chunk first, then combines summaries.

    Returns validated NotesData.
    Raises AIServiceError or AIRateLimitError on failure.
    """
    try:
        if not chunks:
            raise AIServiceError("No transcript content to process.")

        if len(chunks) == 1:
            content = chunks[0]
            logger.info("Single chunk — sending directly to full-notes prompt")
        else:
            logger.info("Multiple chunks (%d) — summarising each first", len(chunks))
            chunk_summaries = []
            for i, chunk in enumerate(chunks, 1):
                logger.info("Summarising chunk %d/%d", i, len(chunks))
                summary = _summarize_chunk(chunk, provider)
                chunk_summaries.append(f"[Part {i}]\n{summary}")
                
                # Help avoid Gemini's strict 15 RPM free tier limit
                if provider.lower() == "gemini" and i < len(chunks):
                    time.sleep(4)
                    
            content = "\n\n".join(chunk_summaries)

        prompt = FULL_NOTES_PROMPT.format(title=video_title, content=content)
        logger.info("Sending full-notes prompt to %s (%d chars)", provider, len(prompt))

        raw_response = _call_llm(prompt, provider, max_tokens=settings.AI_MAX_TOKENS)
        logger.debug("Raw AI response: %s", raw_response[:500])

        data = _extract_json(raw_response)
        notes = _parse_notes(data, fallback_title=video_title)
        logger.info("Notes generated successfully")
        return notes

    except (RateLimitError, openai.RateLimitError, AnthropicRateLimitError) as exc:
        logger.error("Rate limit / quota exceeded: %s", exc)
        raise AIRateLimitError(
            "The AI service is temporarily busy or out of quota. Please check your API credits or try again later."
        ) from exc
    except genai_errors.APIError as exc:
        logger.error("Gemini API Error: %s", exc)
        if exc.code == 429:
            raise AIRateLimitError("Gemini rate limit exceeded. Please try again later.") from exc
        raise AIServiceError(f"Gemini API error: {exc.message}") from exc
    except AIServiceError:
        raise
    except Exception as exc:
        logger.error("AI Provider API error or unexpected error: %s", exc)
        raise AIServiceError(
            "We couldn't generate notes right now. Please try again."
        ) from exc
