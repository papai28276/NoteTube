import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--surface-0)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <nav
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--brand-600), var(--brand-700))',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={17} color="white" />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Note<span className="text-gradient">Tube</span>
          </span>
        </Link>

        {/* Nav links + theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                color:
                  location.pathname === l.to
                    ? 'var(--brand-600)'
                    : 'var(--text-muted)',
                background:
                  location.pathname === l.to
                    ? 'var(--brand-50)'
                    : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {l.label}
            </Link>
          ))}

          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            style={{
              marginLeft: '0.25rem',
              padding: '0.45rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface-1)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>
        </div>
      </nav>
    </header>
  );
}
