import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function TranscriptViewer({ transcript }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  if (!transcript) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Transcript not available.</p>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = search.trim()
    ? transcript.replace(
        new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark style="background:rgba(139,92,246,0.25);border-radius:2px;padding:0 2px">$1</mark>'
      )
    : transcript;

  const displayText = !expanded && transcript.length > 1200
    ? transcript.slice(0, 1200) + '…'
    : transcript;

  const displayHtml = search.trim()
    ? highlighted
    : (!expanded && transcript.length > 1200
        ? transcript.slice(0, 1200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '…'
        : transcript.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '200px',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '0.6rem',
            padding: '0.5rem 0.75rem',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Transcript */}
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          padding: '1.5rem',
          maxHeight: expanded ? 'none' : '360px',
          overflow: 'auto',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          position: 'relative',
        }}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />

      {/* Expand / collapse */}
      {transcript.length > 1200 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="btn-secondary"
          style={{ alignSelf: 'center', fontSize: '0.85rem' }}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? 'Show less' : 'Show full transcript'}
        </button>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        {transcript.split(' ').length.toLocaleString()} words
      </p>
    </motion.div>
  );
}
