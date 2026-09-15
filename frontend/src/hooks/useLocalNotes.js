import { useState, useCallback } from 'react';

const STORAGE_KEY = 'notetube-recent-notes';
const MAX_ITEMS = 10;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function useLocalNotes() {
  const [notes, setNotes] = useState(load);

  const addNote = useCallback((entry) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.videoId !== entry.videoId);
      const updated = [
        {
          id: Date.now(),
          videoId: entry.videoId,
          title: entry.title,
          channel: entry.channel,
          thumbnailUrl: entry.thumbnailUrl,
          url: entry.url,
          savedAt: new Date().toISOString(),
          data: entry.data, // full ProcessResponse
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      save(updated);
      return updated;
    });
  }, []);

  const removeNote = useCallback((id) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    save([]);
    setNotes([]);
  }, []);

  return { notes, addNote, removeNote, clearAll };
}
