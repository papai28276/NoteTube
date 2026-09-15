import { motion } from 'framer-motion';
import CopyButton from '../CopyButton';
import { calculateReadingTime } from '../../utils/text';
import { Clock } from 'lucide-react';

export default function SummarySection({ summary }) {
  const readingTime = calculateReadingTime(summary);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '0.5rem 0' }}
    >
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          padding: '1.75rem',
          lineHeight: 1.8,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clock size={14} />
            <span>{readingTime} min read</span>
          </div>
          <CopyButton text={summary} />
        </div>
        
        {summary
          ? summary.split('\n\n').map((para, i) => (
              <p
                key={i}
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.97rem',
                  marginBottom: '1rem',
                  lineHeight: 1.8,
                }}
              >
                {para}
              </p>
            ))
          : <p style={{ color: 'var(--text-muted)' }}>No summary available.</p>}
      </div>
    </motion.div>
  );
}
