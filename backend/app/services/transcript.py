"""
Transcript cleaning and chunking service.
Converts raw transcript segments into clean, AI-ready text chunks.
"""
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ── Cleaning ───────────────────────────────────────────────────────────────────

def clean_transcript(segments: list[dict]) -> str:
    """
    Convert raw transcript segments into a single clean string.

    Steps:
      1. Extract text from each segment
      2. Remove filler/noise characters
      3. Fix spacing and line breaks
      4. Remove duplicate sentences
      5. Return a single readable string
    """
    if not segments:
        return ""

    texts: list[str] = []
    for seg in segments:
        text = seg.get("text", "").strip()
        if not text:
            continue

        # Remove music/sound annotations like [Music], (applause), etc.
        text = re.sub(r"\[.*?\]", "", text)
        text = re.sub(r"\(.*?\)", "", text)

        # Remove leftover HTML entities
        text = re.sub(r"&amp;", "&", text)
        text = re.sub(r"&lt;", "<", text)
        text = re.sub(r"&gt;", ">", text)
        text = re.sub(r"&#39;", "'", text)
        text = re.sub(r"&quot;", '"', text)

        # Collapse multiple spaces/newlines into a single space
        text = re.sub(r"\s+", " ", text).strip()

        if text:
            texts.append(text)

    if not texts:
        return ""

    # Join segments into continuous text
    raw = " ".join(texts)

    # Fix sentence boundaries — ensure capital letter after period where missing
    raw = re.sub(r"\.([a-z])", lambda m: ". " + m.group(1).upper(), raw)

    # Remove consecutive duplicate phrases (common in auto-generated transcripts)
    raw = _remove_duplicate_phrases(raw)

    # Final whitespace normalisation
    raw = re.sub(r" +", " ", raw).strip()

    return raw


def _remove_duplicate_phrases(text: str) -> str:
    """
    Remove immediately repeated word sequences (common in auto-captions).
    E.g. "hello hello world" → "hello world"
    """
    # Remove directly consecutive repeated words (2–6 word sequences)
    for n in range(6, 1, -1):
        pattern = r"\b((?:\w+\s+){" + str(n - 1) + r"}\w+)\s+\1\b"
        text = re.sub(pattern, r"\1", text, flags=re.IGNORECASE)
    return text


# ── Chunking ───────────────────────────────────────────────────────────────────

def chunk_transcript(text: str, max_words: int = 3000) -> list[str]:
    """
    Split a long transcript into chunks of at most `max_words` words.
    Tries to split on sentence boundaries to preserve coherence.

    Returns a list of non-empty chunk strings.
    """
    if not text:
        return []

    words = text.split()
    total_words = len(words)

    if total_words == 0:
        return []

    if total_words <= max_words:
        return [text]

    chunks: list[str] = []
    sentences = re.split(r"(?<=[.!?])\s+", text)

    current_chunk_words: list[str] = []
    current_word_count = 0

    for sentence in sentences:
        sentence_words = sentence.split()
        sentence_word_count = len(sentence_words)

        if current_word_count + sentence_word_count > max_words and current_chunk_words:
            chunks.append(" ".join(current_chunk_words))
            current_chunk_words = sentence_words
            current_word_count = sentence_word_count
        else:
            current_chunk_words.extend(sentence_words)
            current_word_count += sentence_word_count

    if current_chunk_words:
        chunks.append(" ".join(current_chunk_words))

    logger.info(
        "Transcript chunked: %d words → %d chunk(s) of ~%d words each",
        total_words,
        len(chunks),
        max_words,
    )
    return [c for c in chunks if c.strip()]


# ── Pipeline helper ────────────────────────────────────────────────────────────

def process_transcript(segments: list[dict], max_words: int = 3000) -> tuple[str, list[str]]:
    """
    Full pipeline: clean segments → return (clean_text, chunks).
    """
    clean_text = clean_transcript(segments)
    chunks = chunk_transcript(clean_text, max_words=max_words)
    return clean_text, chunks
