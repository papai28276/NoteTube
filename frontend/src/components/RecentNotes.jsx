import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, X } from 'lucide-react';
import { useLocalNotes } from '../hooks/useLocalNotes';
import { useNavigate } from 'react-router-dom';

export default function RecentNotes() {
  const { notes, removeNote, clearAll } = useLocalNotes();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!notes.length) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '0.4rem 0',
        }}
      >
        <History size={15} />
        Recent Notes ({notes.length})
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {open && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
              }}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-panel"
              style={{
                position: 'relative',
                marginLeft: 'auto',
                width: '100%',
                maxWidth: '400px',
                height: '100%',
                background: 'var(--surface-0)',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} color="var(--brand-500)" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>History</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sub-header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stored locally</span>
                <button
                  onClick={clearAll}
                  style={{ fontSize: '0.75rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Trash2 size={12} /> Clear all
                </button>
              </div>

              {/* Note items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="card glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                    }}
                    onClick={() => {
                      setOpen(false);
                      navigate('/results', { state: { result: note.data } });
                    }}
                  >
                    {note.thumbnailUrl && (
                      <img
                        src={note.thumbnailUrl}
                        alt=""
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {new Date(note.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNote(note.id); }}
                      style={{ color: 'var(--text-muted)', background: 'var(--surface-1)', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '0.4rem', flexShrink: 0, display: 'flex' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
