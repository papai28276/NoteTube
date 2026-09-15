export function calculateReadingTime(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  const wpm = 200;
  return Math.ceil(words / wpm);
}

export function extractTextFromNotes(notes) {
  if (!notes) return "";
  let text = "";
  if (Array.isArray(notes)) {
    notes.forEach(note => {
      text += (note.heading || "") + "\n" + (note.content || "") + "\n\n";
    });
  }
  return text;
}
