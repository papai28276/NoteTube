import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 'validate', label: 'YouTube video found' },
  { id: 'transcript', label: 'Transcript extracted' },
  { id: 'clean', label: 'Transcript processed' },
  { id: 'ai', label: 'Generating AI notes' },
  { id: 'flashcards', label: 'Creating flashcards' },
  { id: 'quiz', label: 'Preparing quiz' },
];

function StepIcon({ status }) {
  if (status === 'done') return <CheckCircle2 size={20} className="step-dot-done" />;
  if (status === 'active') return <Loader2 size={20} className="step-dot-active" style={{ animation: 'spin 1s linear infinite' }} />;
  return <Circle size={20} className="step-dot-pending" />;
}

export default function ProcessingScreen({ currentStep = 'validate' }) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '2.5rem',
      }}
    >
      {/* Liquid Siri-style Morphing Orb */}
      <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Layer 1 (Base Blob) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
          animation: 'morph 6s ease-in-out infinite, spin-blob 12s linear infinite',
          opacity: 0.8,
          boxShadow: '0 0 40px hsla(var(--brand-hue), 100%, 45%, 0.6)',
        }} />
        {/* Layer 2 (Inner Highlight Blob) */}
        <div style={{
          position: 'absolute', inset: '10%',
          background: 'linear-gradient(45deg, var(--brand-300, #ff8fa3), var(--brand-400))',
          animation: 'morph 4s ease-in-out infinite reverse, spin-blob 8s linear infinite reverse',
          opacity: 0.9,
          mixBlendMode: 'overlay',
        }} />
        {/* Layer 3 (Core) */}
        <div style={{
          position: 'absolute', inset: '25%',
          background: 'var(--brand-100)',
          animation: 'morph 3s ease-in-out infinite, spin-blob 5s linear infinite',
          opacity: 0.9,
          filter: 'blur(6px)',
        }} />
        {/* Sparkles Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <Sparkles size={38} color="white" strokeWidth={2.5} />
        </motion.div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Generating your study material…
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          This may take 30–60 seconds for longer videos.
        </p>
      </div>

      {/* Animated Skeleton Layout */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
        {/* Title skeleton */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: '70%', height: '24px', borderRadius: '0.5rem', background: 'var(--surface-2)' }}
        />
        {/* Paragraph skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.1 }} style={{ width: '100%', height: '12px', borderRadius: '0.25rem', background: 'var(--surface-2)' }} />
          <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }} style={{ width: '90%', height: '12px', borderRadius: '0.25rem', background: 'var(--surface-2)' }} />
          <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.3 }} style={{ width: '95%', height: '12px', borderRadius: '0.25rem', background: 'var(--surface-2)' }} />
        </div>
        {/* List skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {[0.4, 0.5, 0.6].map((delay, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay }} style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0 }} />
              <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay }} style={{ width: `${80 - i * 10}%`, height: '12px', borderRadius: '0.25rem', background: 'var(--surface-2)' }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-blob { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
      `}</style>
    </motion.div>
  );
}
