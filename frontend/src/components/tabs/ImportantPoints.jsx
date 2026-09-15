import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import CopyButton from '../CopyButton';
import { calculateReadingTime } from '../../utils/text';

export default function ImportantPoints({ important_points, examples }) {
  const allText = (important_points || []).join('\n') + '\n\n' + (examples || []).join('\n');
  const readingTime = calculateReadingTime(allText);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Clock size={14} />
          <span>{readingTime} min read</span>
        </div>
        <CopyButton text={allText} />
      </div>

      {/* Important Points */}
      {important_points?.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Key Takeaways
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {important_points.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                }}
              >
                <CheckCircle2 size={17} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {point}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {examples?.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Examples &amp; Case Studies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {examples.map((example, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderLeft: '4px solid var(--brand-400)',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>#{i + 1} </span>
                {example}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
