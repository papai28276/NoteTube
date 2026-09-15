import { motion } from 'framer-motion';
import { BookOpen, Shield } from 'lucide-react';
import Footer from '../components/Footer';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, var(--brand-600), var(--brand-700))',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 10px 28px hsla(var(--brand-hue), 100%, 45%, 0.3)',
            }}
          >
            <BookOpen size={28} color="white" />
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}
          >
            About <span className="text-gradient">NoteTube</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            NoteTube is an open-source AI-powered tool that transforms YouTube educational
            videos into structured study material — instantly.
          </p>
        </motion.div>

        {/* What it does */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
          style={{ marginBottom: '1.5rem' }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            What it does
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.95rem' }}>
            Paste any YouTube video URL with available captions. NoteTube fetches the transcript,
            cleans and chunks it, then sends it to a large language model (Groq's
            <strong> Llama 3.3 70B</strong>) to generate:
          </p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.9, paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            <li>A concise summary</li>
            <li>Structured detailed notes organised by topic</li>
            <li>Key concepts with explanations and examples</li>
            <li>Important revision points</li>
            <li>Interactive flashcards with flip animation</li>
            <li>A multiple-choice quiz with explanations</li>
            <li>PDF and Markdown export</li>
          </ul>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card"
          style={{ marginBottom: '1.5rem' }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Technology Stack
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              { label: 'Frontend', value: 'React + Vite + Tailwind' },
              { label: 'Animations', value: 'Framer Motion' },
              { label: 'Backend', value: 'FastAPI + Python' },
              { label: 'AI', value: 'Groq (Llama 3.3 70B)' },
              { label: 'Transcripts', value: 'youtube-transcript-api' },
              { label: 'PDF', value: 'ReportLab' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-2)',
                  borderRadius: '0.6rem',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="card"
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Shield size={20} style={{ color: 'var(--brand-500)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Privacy
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                NoteTube does <strong>not</strong> store your notes on any server. Recent notes are kept
                locally in your browser's localStorage only. No account required, no data sent
                beyond the Groq API call to generate the notes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
}
