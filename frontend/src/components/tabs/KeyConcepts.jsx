import { motion } from 'framer-motion';
import { Lightbulb, Clock } from 'lucide-react';
import CopyButton from '../CopyButton';
import { calculateReadingTime } from '../../utils/text';

export default function KeyConcepts({ key_concepts }) {
  if (!key_concepts?.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No key concepts available.</p>;
  }

  const allText = key_concepts.map(c => `${c.name}: ${c.explanation} ${c.example ? `(Example: ${c.example})` : ''}`).join('\n\n');
  const readingTime = calculateReadingTime(allText);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Clock size={14} />
          <span>{readingTime} min read</span>
        </div>
        <CopyButton text={allText} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
      {key_concepts.map((concept, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg,var(--brand-100),var(--brand-200))',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-600)',
                flexShrink: 0,
              }}
            >
              <Lightbulb size={16} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {concept.name}
            </h3>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
            {concept.explanation}
          </p>

          {concept.example && (
            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.6rem 0.9rem',
                background: 'var(--surface-2)',
                borderRadius: '0.5rem',
                borderLeft: '3px solid var(--brand-400)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-600)', display: 'block', marginBottom: '0.2rem' }}>
                Example
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{concept.example}</span>
            </div>
          )}
        </motion.div>
      ))}
      </motion.div>
    </div>
  );
}
