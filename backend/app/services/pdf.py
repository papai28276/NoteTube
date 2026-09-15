"""
PDF export service using ReportLab.
Generates a professional study document from NotesData.
"""
import io
import logging
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

from app.schemas.video import NotesData, VideoInfo

logger = logging.getLogger(__name__)

# ── Colour palette ─────────────────────────────────────────────────────────────
BRAND_VIOLET = colors.HexColor("#7c3aed")
BRAND_VIOLET_LIGHT = colors.HexColor("#ede9fe")
DARK_TEXT = colors.HexColor("#1e1b4b")
MUTED_TEXT = colors.HexColor("#6b7280")
BORDER_COLOR = colors.HexColor("#e5e7eb")
SUCCESS_COLOR = colors.HexColor("#059669")


def _build_styles() -> dict:
    base = getSampleStyleSheet()
    styles = {}

    styles["app_title"] = ParagraphStyle(
        "app_title",
        parent=base["Title"],
        fontSize=28,
        textColor=BRAND_VIOLET,
        spaceAfter=4,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    )
    styles["tagline"] = ParagraphStyle(
        "tagline",
        parent=base["Normal"],
        fontSize=12,
        textColor=MUTED_TEXT,
        spaceAfter=8,
        alignment=TA_CENTER,
        fontName="Helvetica-Oblique",
    )
    styles["video_title"] = ParagraphStyle(
        "video_title",
        parent=base["Heading1"],
        fontSize=18,
        textColor=DARK_TEXT,
        spaceAfter=6,
        spaceBefore=12,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    )
    styles["section_heading"] = ParagraphStyle(
        "section_heading",
        parent=base["Heading1"],
        fontSize=14,
        textColor=BRAND_VIOLET,
        spaceBefore=16,
        spaceAfter=8,
        fontName="Helvetica-Bold",
        borderPad=4,
    )
    styles["sub_heading"] = ParagraphStyle(
        "sub_heading",
        parent=base["Heading2"],
        fontSize=12,
        textColor=DARK_TEXT,
        spaceBefore=10,
        spaceAfter=4,
        fontName="Helvetica-Bold",
    )
    styles["body"] = ParagraphStyle(
        "body",
        parent=base["Normal"],
        fontSize=10,
        textColor=DARK_TEXT,
        spaceAfter=6,
        leading=15,
        alignment=TA_JUSTIFY,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        parent=base["Normal"],
        fontSize=10,
        textColor=DARK_TEXT,
        leftIndent=18,
        spaceAfter=4,
        leading=14,
        bulletIndent=8,
    )
    styles["small_muted"] = ParagraphStyle(
        "small_muted",
        parent=base["Normal"],
        fontSize=8,
        textColor=MUTED_TEXT,
        alignment=TA_CENTER,
    )
    styles["concept_name"] = ParagraphStyle(
        "concept_name",
        parent=base["Normal"],
        fontSize=11,
        textColor=BRAND_VIOLET,
        fontName="Helvetica-Bold",
        spaceAfter=2,
    )
    styles["flashcard_q"] = ParagraphStyle(
        "flashcard_q",
        parent=base["Normal"],
        fontSize=10,
        textColor=DARK_TEXT,
        fontName="Helvetica-Bold",
        spaceAfter=3,
    )
    styles["flashcard_a"] = ParagraphStyle(
        "flashcard_a",
        parent=base["Normal"],
        fontSize=10,
        textColor=SUCCESS_COLOR,
        spaceAfter=8,
        leftIndent=12,
    )
    return styles


def _header_footer(canvas, doc):
    """Add page numbers and branding to every page."""
    canvas.saveState()
    w, h = A4
    # Header line
    canvas.setStrokeColor(BRAND_VIOLET)
    canvas.setLineWidth(1)
    canvas.line(2 * cm, h - 1.5 * cm, w - 2 * cm, h - 1.5 * cm)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(BRAND_VIOLET)
    canvas.drawString(2 * cm, h - 1.3 * cm, "NoteTube")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(MUTED_TEXT)
    canvas.drawRightString(w - 2 * cm, h - 1.3 * cm, "Turn videos into knowledge.")
    # Footer
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.line(2 * cm, 1.5 * cm, w - 2 * cm, 1.5 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED_TEXT)
    canvas.drawCentredString(w / 2, 1.0 * cm, f"Page {doc.page}")
    canvas.restoreState()


def generate_pdf(notes: NotesData, video: VideoInfo) -> bytes:
    """
    Generate a PDF study document from NotesData.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2 * cm,
        title=notes.title,
        author="NoteTube",
    )

    s = _build_styles()
    story = []

    # ── Cover ──────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph("NoteTube", s["app_title"]))
    story.append(Paragraph("Turn videos into knowledge.", s["tagline"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_VIOLET_LIGHT))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(_escape(notes.title or video.title), s["video_title"]))

    meta_parts = []
    if video.channel:
        meta_parts.append(video.channel)
    if video.duration:
        meta_parts.append(video.duration)
    if meta_parts:
        story.append(Paragraph(" • ".join(meta_parts), s["small_muted"]))

    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"Source: {video.url}", s["small_muted"]))
    story.append(PageBreak())

    # ── Summary ────────────────────────────────────────────────────────────────
    story.append(Paragraph("Summary", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for para in notes.summary.split("\n\n"):
        if para.strip():
            story.append(Paragraph(_escape(para.strip()), s["body"]))
    story.append(PageBreak())

    # ── Detailed Notes ─────────────────────────────────────────────────────────
    story.append(Paragraph("Detailed Notes", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for section in notes.detailed_notes:
        story.append(Paragraph(_escape(section.heading), s["sub_heading"]))
        for line in section.content.split("\n"):
            line = line.strip()
            if not line:
                continue
            if line.startswith("- ") or line.startswith("• "):
                story.append(Paragraph("• " + _escape(line[2:]), s["bullet"]))
            elif line.startswith("* "):
                story.append(Paragraph("• " + _escape(line[2:]), s["bullet"]))
            else:
                story.append(Paragraph(_escape(line), s["body"]))
    story.append(PageBreak())

    # ── Key Concepts ───────────────────────────────────────────────────────────
    story.append(Paragraph("Key Concepts", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for concept in notes.key_concepts:
        block = [
            Paragraph(_escape(concept.name), s["concept_name"]),
            Paragraph(_escape(concept.explanation), s["body"]),
        ]
        if concept.example:
            block.append(
                Paragraph(f"<i>Example: {_escape(concept.example)}</i>", s["body"])
            )
        block.append(Spacer(1, 0.3 * cm))
        story.append(KeepTogether(block))

    # ── Important Points ───────────────────────────────────────────────────────
    story.append(Paragraph("Important Points", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for point in notes.important_points:
        story.append(Paragraph(f"✓  {_escape(point)}", s["bullet"]))
    story.append(PageBreak())

    # ── Examples ──────────────────────────────────────────────────────────────
    if notes.examples:
        story.append(Paragraph("Examples", s["section_heading"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
        story.append(Spacer(1, 0.2 * cm))
        for i, ex in enumerate(notes.examples, 1):
            story.append(Paragraph(f"{i}. {_escape(ex)}", s["body"]))
        story.append(Spacer(1, 0.3 * cm))

    # ── Flashcards ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Flashcards", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for i, card in enumerate(notes.flashcards, 1):
        block = [
            Paragraph(f"Q{i}: {_escape(card.question)}", s["flashcard_q"]),
            Paragraph(f"A: {_escape(card.answer)}", s["flashcard_a"]),
        ]
        story.append(KeepTogether(block))
    story.append(PageBreak())

    # ── Quiz ───────────────────────────────────────────────────────────────────
    story.append(Paragraph("Quiz", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR))
    story.append(Spacer(1, 0.2 * cm))
    for i, q in enumerate(notes.quiz, 1):
        block = [
            Paragraph(f"Q{i}: {_escape(q.question)}", s["sub_heading"]),
        ]
        for opt in q.options:
            block.append(Paragraph(f"   • {_escape(opt)}", s["bullet"]))
        block.append(
            Paragraph(
                f"<b>Answer:</b> {_escape(q.correct_answer)}",
                s["body"],
            )
        )
        block.append(
            Paragraph(
                f"<i>Explanation: {_escape(q.explanation)}</i>",
                s["body"],
            )
        )
        block.append(Spacer(1, 0.4 * cm))
        story.append(KeepTogether(block))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    return buffer.getvalue()


def _escape(text: str) -> str:
    """Escape special ReportLab XML characters."""
    if not text:
        return ""
    text = str(text)
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    # Remove actual newlines inside paragraphs (handled by caller)
    return text
