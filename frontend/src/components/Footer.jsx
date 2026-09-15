import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-1)',
        padding: '1.25rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, var(--brand-600), var(--brand-700))',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={14} color="white" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            NoteTube
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
          © {new Date().getFullYear()} NoteTube.
        </p>
      </div>
    </footer>
  );
}
