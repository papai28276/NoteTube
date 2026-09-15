import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CopyButton({ text, className = "", style = {} }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`btn-secondary ${className}`}
      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem', ...style }}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
