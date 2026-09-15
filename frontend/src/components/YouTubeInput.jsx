import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, AlertCircle, Play, Wand2 } from 'lucide-react';
import { isValidYouTubeUrl } from '../utils/youtube';
import Magnetic from './Magnetic';

export default function YouTubeInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('Groq');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please paste a YouTube URL.');
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setError('Please enter a valid YouTube URL or Playlist URL.');
      return;
    }
    setError('');
    onSubmit(trimmed, provider);
  };

  const handleSurprise = () => {
    // Example: Stanford CS229: Machine Learning
    const surpriseUrl = 'https://www.youtube.com/watch?v=jGwO_UgTS7I';
    setUrl(surpriseUrl);
    setError('');
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (isValidYouTubeUrl(pasted.trim())) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Input box */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '0.875rem',
          overflow: 'hidden',
          border: error ? '1.5px solid var(--error)' : undefined,
          transition: 'border-color 0.15s, box-shadow 0.2s',
        }}
      >
        {/* YouTube icon pill */}
        <div
          style={{
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            color: '#ff0000',
            flexShrink: 0,
          }}
        >
          <Play size={22} fill="#ff0000" />
        </div>

        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onPaste={handlePaste}
          placeholder="Paste YouTube URL… e.g. https://youtube.com/watch?v=..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.9rem 0.5rem',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '1rem',
          }}
          aria-label="YouTube URL input"
          id="youtube-url-input"
        />

        <button
          type="button"
          onClick={handleSurprise}
          disabled={loading}
          className="btn-secondary"
          style={{ margin: '0.35rem', borderRadius: '0.6rem', flexShrink: 0, padding: '0 0.75rem', border: 'none', background: 'var(--surface-1)' }}
          title="Surprise me with a famous lecture"
        >
          <Wand2 size={16} />
        </button>

        <Magnetic strength={0.25}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ margin: '0.35rem', borderRadius: '0.6rem', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Sparkles size={16} />
            {loading ? 'Processing…' : 'Generate Notes'}
          </button>
        </Magnetic>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.6rem',
              color: 'var(--error)',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '0.8rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Supports videos and playlists.
        </p>
        
        <select 
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          disabled={loading}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: '0.5rem',
            padding: '0.2rem 0.5rem',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          <option value="Groq">Llama 3 (Groq)</option>
          <option value="OpenAI">GPT-4o Mini (OpenAI)</option>
          <option value="Gemini">Gemini 1.5 Flash (Google)</option>
          <option value="Claude">Claude 3.5 Sonnet (Anthropic)</option>
        </select>
      </div>
    </form>
  );
}
