import { motion } from 'framer-motion';
import { Link2, FileText, Brain, GraduationCap } from 'lucide-react';

const STEPS = [
  { num: '01', icon: Link2, title: 'Paste URL', description: 'Drop any YouTube lecture or educational video URL.' },
  { num: '02', icon: FileText, title: 'Extract Transcript', description: 'We instantly fetch the available video captions.' },
  { num: '03', icon: Brain, title: 'AI Understands', description: 'Groq LLM analyses and processes the full content.' },
  { num: '04', icon: GraduationCap, title: 'Get Study Notes', description: 'Receive structured notes, flashcards, and a quiz.' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            How It Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Four simple steps to turn any lecture into study material.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                padding: '2rem 1rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--brand-500)',
                  letterSpacing: '0.1em',
                }}
              >
                {step.num}
              </span>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg,var(--brand-600),var(--brand-700))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 6px 18px hsla(var(--brand-hue), 100%, 45%, 0.3)',
                }}
              >
                <step.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
