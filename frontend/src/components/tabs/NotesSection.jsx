import { motion } from 'framer-motion';
import CopyButton from '../CopyButton';
import { calculateReadingTime, extractTextFromNotes } from '../../utils/text';
import { Clock } from 'lucide-react';

// Render markdown-lite content (bold, bullets, numbered lists)
function renderContent(content) {
  if (!content) return null;
  return content.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    // Bullet
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <li key={i} style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          <InlineBold text={trimmed.replace(/^[-•]\s/, '')} />
        </li>
      );
    }
    // Numbered
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <li key={i} style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          <InlineBold text={trimmed.replace(/^\d+\.\s/, '')} />
        </li>
      );
    }
    return (
      <p key={i} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
        <InlineBold text={trimmed} />
      </p>
    );
  });
}

function InlineBold({ text }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

export default function NotesSection({ detailed_notes }) {
  if (!detailed_notes?.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No detailed notes available.</p>;
  }

  const allText = extractTextFromNotes(detailed_notes);
  const readingTime = calculateReadingTime(allText);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Clock size={14} />
          <span>{readingTime} min read</span>
        </div>
        <CopyButton text={allText} />
      </div>

      {detailed_notes.map((section, i) => (
        <div
          key={i}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.9rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                width: '26px',
                height: '26px',
                background: 'linear-gradient(135deg,var(--brand-500),var(--brand-700))',
                color: 'white',
                borderRadius: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {section.heading}
            </h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'none' }}>
              {renderContent(section.content)}
            </ul>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
