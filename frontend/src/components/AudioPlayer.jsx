import { useState, useEffect } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioPlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    // Stop speaking when unmounting or text changes
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    return () => window.speechSynthesis.cancel();
  }, [text]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 10000)); // limit length just in case
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!isSupported) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <button
        onClick={togglePlay}
        style={{
          background: 'none',
          border: 'none',
          color: isPlaying ? 'var(--brand-500)' : 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
        title={isPlaying ? "Stop reading" : "Read aloud"}
      >
        {isPlaying ? <Square size={16} /> : <Play size={16} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ height: isPlaying ? ['4px', '14px', '4px'] : '4px' }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.15,
              ease: 'easeInOut'
            }}
            style={{
              width: '3px',
              background: isPlaying ? 'var(--brand-500)' : 'var(--text-muted)',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </div>
  );
}
