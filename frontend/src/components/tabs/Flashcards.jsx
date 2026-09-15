import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export default function Flashcards({ flashcards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!flashcards?.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No flashcards available.</p>;
  }

  const card = flashcards[index];
  const total = flashcards.length;

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % total), 150);
  }, [total]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i - 1 + total) % total), 150);
  }, [total]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // prevent scroll down
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
    >
      {/* Counter */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
        FLASHCARD {index + 1} / {total}
      </p>

      {/* Card */}
      <motion.div
        ref={cardRef}
        className="flashcard-container"
        style={{ width: '100%', maxWidth: '540px', cursor: 'pointer', rotateX, rotateY, transformStyle: "preserve-3d" }}
        onClick={() => setFlipped((f) => !f)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="button"
        aria-label={flipped ? 'Hide answer' : 'Reveal answer'}
      >
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`} style={{ transformStyle: "preserve-3d", boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>
          {/* Front */}
          <div className="flashcard-face flashcard-front">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              QUESTION
            </p>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {card.question}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.75 }}>
              ANSWER
            </p>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5 }}>
              {card.answer}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={goPrev}
          className="btn-secondary"
          style={{ padding: '0.55rem 1rem' }}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
          Prev
        </button>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="btn-primary"
          style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
        >
          <RotateCcw size={15} />
          {flipped ? 'Hide' : 'Reveal'}
        </button>

        <button
          onClick={goNext}
          className="btn-secondary"
          style={{ padding: '0.55rem 1rem' }}
          aria-label="Next card"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dot navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' }}>
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFlipped(false); setIndex(i); }}
            style={{
              width: i === index ? '20px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              border: 'none',
              background: i === index ? 'var(--brand-600)' : 'var(--surface-3)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s ease',
            }}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
