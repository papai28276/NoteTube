import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TableOfContents({ markdown }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!markdown) return;
    
    // Extract headings from markdown (lines starting with ## or ###)
    const lines = markdown.split('\n');
    const extracted = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        // Generate a URL-friendly id
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        extracted.push({ id, text, level });
      }
    });
    
    setHeadings(extracted);
  }, [markdown]);

  useEffect(() => {
    // Note: react-markdown generates ids for headings automatically if configured,
    // or we can just observe DOM elements that match our extracted text.
    // For simplicity, we observe all h2 and h3 elements inside .prose-notes.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the closest heading in our list by text content
            const text = entry.target.textContent;
            const heading = headings.find(h => h.text === text);
            if (heading) setActiveId(heading.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    // Wait a tick for markdown to render
    setTimeout(() => {
      const elements = document.querySelectorAll('.prose-notes h2, .prose-notes h3');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div
      style={{
        position: 'sticky',
        top: '120px',
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
        paddingLeft: '1.5rem',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Contents
      </h4>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`} // Assuming we setup react-markdown to add IDs, or we just rely on visual active state
          onClick={(e) => {
            e.preventDefault();
            const els = Array.from(document.querySelectorAll('.prose-notes h2, .prose-notes h3'));
            const target = els.find(el => el.textContent === h.text);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          style={{
            fontSize: '0.85rem',
            color: activeId === h.id ? 'var(--brand-500)' : 'var(--text-muted)',
            textDecoration: 'none',
            paddingLeft: h.level === 3 ? '1rem' : '0',
            transition: 'color 0.2s',
            fontWeight: activeId === h.id ? 600 : 400,
            display: 'block',
            lineHeight: 1.4,
          }}
        >
          {h.text}
        </a>
      ))}
    </div>
  );
}
