"""
YouTube service — extracts video ID, fetches metadata, retrieves transcripts.
Compatible with youtube-transcript-api >= 1.x
Does NOT download video files.
"""
import re
import logging
from typing import Optional

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

from app.schemas.video import VideoInfo

logger = logging.getLogger(__name__)


# ── URL patterns ───────────────────────────────────────────────────────────────

YOUTUBE_URL_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})",
]

YOUTUBE_PLAYLIST_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/playlist\?(?:.*&)?list=([a-zA-Z0-9_-]+)",
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?(?:.*&)?list=([a-zA-Z0-9_-]+)",
]


def extract_video_id(url: str) -> Optional[str]:
    """Extract the 11-character video ID from any supported YouTube URL."""
    url = url.strip()
    for pattern in YOUTUBE_URL_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def extract_playlist_id(url: str) -> Optional[str]:
    """Extract the playlist ID from a YouTube URL."""
    url = url.strip()
    for pattern in YOUTUBE_PLAYLIST_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _format_duration(seconds: int) -> str:
    """Convert seconds to MM:SS or H:MM:SS string."""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


# ── Metadata ───────────────────────────────────────────────────────────────────

def get_video_metadata(video_id: str, original_url: str) -> VideoInfo:
    """
    Attempt to retrieve video metadata via yt_dlp.
    Falls back gracefully — title/channel/duration may be None.
    """
    title = "YouTube Video"
    channel = None
    duration = None
    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

    try:
        import yt_dlp  # type: ignore

        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}", download=False
            )
            if info:
                title = info.get("title", title)
                channel = info.get("uploader") or info.get("channel")
                raw_duration = info.get("duration")
                if raw_duration:
                    duration = _format_duration(int(raw_duration))
                thumb = info.get("thumbnail")
                if thumb:
                    thumbnail_url = thumb

    except Exception as exc:
        logger.warning("yt_dlp metadata fetch failed for %s: %s", video_id, exc)

    return VideoInfo(
        video_id=video_id,
        title=title,
        channel=channel,
        duration=duration,
        thumbnail_url=thumbnail_url,
        url=f"https://www.youtube.com/watch?v={video_id}",
    )


def get_playlist_videos(playlist_id: str) -> list[str]:
    """
    Retrieve a list of video URLs from a playlist ID using yt_dlp.
    """
    try:
        import yt_dlp  # type: ignore

        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": "in_playlist",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/playlist?list={playlist_id}", download=False
            )
            if info and "entries" in info:
                urls = []
                for entry in info["entries"]:
                    if entry and entry.get("url"):
                        urls.append(entry["url"])
                    elif entry and entry.get("id"):
                        urls.append(f"https://www.youtube.com/watch?v={entry['id']}")
                return urls
    except Exception as exc:
        logger.warning("yt_dlp playlist fetch failed for %s: %s", playlist_id, exc)

    return []

# ── Errors ─────────────────────────────────────────────────────────────────────

class TranscriptUnavailableError(Exception):
    pass


class VideoNotFoundError(Exception):
    pass


# ── Transcript ─────────────────────────────────────────────────────────────────

def get_transcript(video_id: str) -> list[dict]:
    """
    Retrieve the best available transcript for a video.
    Compatible with youtube-transcript-api >= 1.0.

    Priority:
      1. Manual English transcript
      2. Auto-generated English transcript
      3. Any transcript (translated to English if possible)

    Returns a list of segment dicts: {"text": str, "start": float, "duration": float}
    """
    ytt_api = YouTubeTranscriptApi()

    try:
        transcript_list = ytt_api.list(video_id)
    except VideoUnavailable:
        raise VideoNotFoundError(
            "This video is private, deleted, or otherwise unavailable."
        )
    except Exception as exc:
        logger.error("Failed to list transcripts for %s: %s", video_id, exc)
        raise TranscriptUnavailableError(
            "We couldn't access a transcript for this video. "
            "Please try another video with available captions."
        )

    # Priority 1: manual English
    try:
        transcript = transcript_list.find_manually_created_transcript(["en", "en-US", "en-GB"])
        snippets = transcript.fetch()
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in snippets]
    except Exception:
        pass

    # Priority 2: auto-generated English
    try:
        transcript = transcript_list.find_generated_transcript(["en", "en-US", "en-GB"])
        snippets = transcript.fetch()
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in snippets]
    except Exception:
        pass

    # Priority 3: any language — translate to English if possible
    try:
        for t in transcript_list:
            try:
                translated = t.translate("en")
                snippets = translated.fetch()
            except Exception:
                snippets = t.fetch()
            return [{"text": s.text, "start": s.start, "duration": s.duration} for s in snippets]
    except Exception:
        pass

    raise TranscriptUnavailableError(
        "We couldn't access a transcript for this video. "
        "Please try another video with available captions."
    )
