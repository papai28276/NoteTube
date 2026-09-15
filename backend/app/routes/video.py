"""
Video processing routes.
"""
import logging
from fastapi import APIRouter, HTTPException, Response

from app.schemas.video import (
    VideoRequest,
    ValidateResponse,
    ProcessResponse,
    ErrorResponse,
    PlaylistResponse,
)
from app.services.youtube import (
    extract_video_id,
    get_video_metadata,
    get_transcript,
    TranscriptUnavailableError,
    VideoNotFoundError,
)
from app.services.transcript import process_transcript
from app.services.ai import generate_notes, AIServiceError, AIRateLimitError
from app.services.pdf import generate_pdf
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/videos", tags=["videos"])
settings = get_settings()


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


# ── Validate URL ───────────────────────────────────────────────────────────────

@router.post("/validate", response_model=ValidateResponse)
async def validate_url(request: VideoRequest):
    """Quick URL validation without fetching any data."""
    video_id = extract_video_id(request.url)
    if video_id:
        return ValidateResponse(valid=True, video_id=video_id, message="Valid YouTube URL.")
        
    from app.services.youtube import extract_playlist_id
    playlist_id = extract_playlist_id(request.url)
    if playlist_id:
        return ValidateResponse(valid=True, video_id=playlist_id, is_playlist=True, message="Valid YouTube playlist URL.")
        
    return ValidateResponse(valid=False, message="Please enter a valid YouTube URL.")


# ── Full processing pipeline ───────────────────────────────────────────────────

@router.post("/process", response_model=ProcessResponse)
async def process_video(request: VideoRequest):
    """
    Full pipeline:
      1. Validate URL → extract video ID
      2. Fetch metadata
      3. Fetch transcript
      4. Clean + chunk transcript
      5. Generate AI notes
      6. Return structured response
    """
    # Step 1 — Video ID
    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=422, detail="Please enter a valid YouTube URL.")

    # Step 2 — Metadata
    try:
        video_info = get_video_metadata(video_id, request.url)
    except Exception as exc:
        logger.error("Metadata fetch failed: %s", exc)
        # Non-fatal — create a minimal VideoInfo
        from app.schemas.video import VideoInfo
        video_info = VideoInfo(
            video_id=video_id,
            title="YouTube Video",
            url=f"https://www.youtube.com/watch?v={video_id}",
            thumbnail_url=f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        )

    # Step 3 — Transcript
    try:
        segments = get_transcript(video_id)
    except VideoNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except TranscriptUnavailableError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Step 4 — Clean + chunk
    clean_text, chunks = process_transcript(
        segments, max_words=settings.CHUNK_WORD_LIMIT
    )

    if not clean_text.strip():
        raise HTTPException(
            status_code=422,
            detail="The transcript appears to be empty. Please try another video.",
        )

    # Guard against transcripts that are too long
    word_count = len(clean_text.split())
    if word_count > settings.MAX_TRANSCRIPT_WORDS:
        # Trim to safe limit
        clean_text = " ".join(clean_text.split()[:settings.MAX_TRANSCRIPT_WORDS])
        from app.services.transcript import chunk_transcript
        chunks = chunk_transcript(clean_text, max_words=settings.CHUNK_WORD_LIMIT)
        logger.warning("Transcript trimmed to %d words", settings.MAX_TRANSCRIPT_WORDS)

    # Step 5 — AI notes
    try:
        notes = generate_notes(
            chunks, 
            video_title=video_info.title,
            provider=request.ai_provider or "Groq"
        )
    except AIRateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    except AIServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    # Override AI title with video title if AI left it generic
    if not notes.title or notes.title.lower() in ("youtube video", "video"):
        notes.title = video_info.title

    return ProcessResponse(
        video=video_info,
        transcript=clean_text,
        notes=notes,
    )


# ── Playlist processing ────────────────────────────────────────────────────────

@router.post("/playlist", response_model=PlaylistResponse)
async def process_playlist(request: VideoRequest):
    """
    Process up to 5 videos from a playlist sequentially.
    """
    from app.services.youtube import extract_playlist_id, get_playlist_videos
    
    playlist_id = extract_playlist_id(request.url)
    if not playlist_id:
        raise HTTPException(status_code=422, detail="Please enter a valid YouTube playlist URL.")
        
    urls = get_playlist_videos(playlist_id)
    if not urls:
        raise HTTPException(status_code=404, detail="No videos found in this playlist.")
        
    # Limit to 5 for performance/rate limiting
    urls = urls[:5]
    
    videos_results = []
    failed_videos = []
    
    for url in urls:
        # Create a new request for each video
        video_req = VideoRequest(
            url=url,
            template_type=request.template_type,
            target_language=request.target_language,
            ai_provider=request.ai_provider
        )
        try:
            # Re-use the existing process logic
            result = await process_video(video_req)
            videos_results.append(result)
        except Exception as exc:
            logger.error("Failed to process playlist video %s: %s", url, exc)
            failed_videos.append({"url": url, "error": str(exc)})
            
    return PlaylistResponse(
        playlist_id=playlist_id,
        videos=videos_results,
        failed_videos=failed_videos
    )


# ── PDF export ─────────────────────────────────────────────────────────────────

@router.post("/export/pdf")
async def export_pdf(request: ProcessResponse):
    """Generate and return a PDF of the notes."""
    try:
        pdf_bytes = generate_pdf(request.notes, request.video)
        safe_title = "".join(
            c if c.isalnum() or c in " _-" else "_" for c in request.notes.title
        )[:60]
        filename = f"NoteTube_{safe_title}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        logger.error("PDF generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="PDF generation failed. Please try again.")
