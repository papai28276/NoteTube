import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Brain, Lightbulb, CreditCard, HelpCircle, Download,
  Sparkles, AlertTriangle,
} from 'lucide-react';

import YouTubeInput from '../components/YouTubeInput';
import FeatureCard from '../components/FeatureCard';
import HowItWorks from '../components/HowItWorks';
import ProcessingScreen from '../components/ProcessingScreen';
import RecentNotes from '../components/RecentNotes';
import { videoApi } from '../services/api';
import { useLocalNotes } from '../hooks/useLocalNotes';

const FEATURES = [
  { icon: Brain, title: 'AI Notes', description: 'Convert long lectures into structured, easy-to-read notes.', delay: 0 },
  { icon: FileText, title: 'Smart Summary', description: 'Get a concise summary so you can grasp the video without re-watching.', delay: 0.07 },
  { icon: Lightbulb, title: 'Key Concepts', description: 'Identify and explain the most important concepts from the lecture.', delay: 0.14 },
  { icon: CreditCard, title: 'Flashcards', description: 'Auto-generated revision flashcards with an interactive flip UI.', delay: 0.21 },
  { icon: HelpCircle, title: 'AI Quiz', description: 'Test your understanding with auto-generated multiple-choice questions.', delay: 0.28 },
  { icon: Download, title: 'PDF Export', description: 'Download your study material as a beautifully formatted PDF.', delay: 0.35 },
];

const STEPS = [
  { id: 'validate', label: 'YouTube video found' },
  { id: 'transcript', label: 'Transcript extracted' },
  { id: 'clean', label: 'Transcript processed' },
  { id: 'ai', label: 'Generating AI notes' },
  { id: 'flashcards', label: 'Creating flashcards' },
  { id: 'quiz', label: 'Preparing quiz' },
];

export default function Home() {
  const navigate = useNavigate();
  const { addNote } = useLocalNotes();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('validate');
  const [error, setError] = useState('');

  const advance = (step) => setCurrentStep(step);

  const handleSubmit = async (url, provider) => {
    setLoading(true);
    setError('');
    setCurrentStep('validate');

    try {
      // Validate URL first
      const validation = await videoApi.validate(url);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      // Simulate step progression for UX
      await delay(400);
      advance('transcript');
      await delay(500);
      advance('clean');
      await delay(300);
      advance('ai');

      let result;
      if (validation.is_playlist) {
        const playlistResult = await videoApi.processPlaylist(url, provider);
        if (playlistResult.videos.length === 0) {
          throw new Error("Could not process any videos in this playlist.");
        }
        result = playlistResult.videos[0];
        
        // Save all processed videos to history
        for (const v of playlistResult.videos) {
          addNote({
            videoId: v.video.video_id,
            title: v.notes.title || v.video.title,
            channel: v.video.channel,
            thumbnailUrl: v.video.thumbnail_url,
            url: v.video.url,
            data: v,
          });
        }
      } else {
        result = await videoApi.process(url, provider);
        // Save to local history
        addNote({
          videoId: result.video.video_id,
          title: result.notes.title || result.video.title,
          channel: result.video.channel,
          thumbnailUrl: result.video.thumbnail_url,
          url: result.video.url,
          data: result,
        });
      }

      advance('flashcards');
      await delay(200);
      advance('quiz');
      await delay(150);

      navigate('/results', { state: { result } });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <ProcessingScreen key="processing" currentStep={currentStep} />
        ) : (
          <motion.div 
            key="home" 
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }} 
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Hero ──────────────────────────────────────────────────── */}
            <section
              style={{
                position: 'relative',
                minHeight: '72vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5rem 1.5rem 3rem',
                textAlign: 'center',
                gap: '2rem',
              }}
            >
              {/* Animated Background Orbs */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: -1, pointerEvents: 'none' }}>
                <div style={{
                  position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw',
                  background: 'radial-gradient(circle, hsla(var(--brand-hue), 100%, 45%, 0.15) 0%, transparent 60%)',
                  borderRadius: '50%', animation: 'float-orb 15s ease-in-out infinite', filter: 'blur(60px)'
                }} />
                <div style={{
                  position: 'absolute', top: '20%', right: '-5%', width: '35vw', height: '35vw',
                  background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 60%)',
                  borderRadius: '50%', animation: 'float-orb 18s ease-in-out infinite reverse', filter: 'blur(60px)'
                }} />
                <div style={{
                  position: 'absolute', bottom: '-20%', left: '30%', width: '50vw', height: '50vw',
                  background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)',
                  borderRadius: '50%', animation: 'float-orb 20s ease-in-out infinite 2s', filter: 'blur(60px)'
                }} />
              </div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.9rem',
                  background: 'var(--brand-50)',
                  border: '1px solid var(--brand-200)',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--brand-700)',
                  letterSpacing: '0.03em',
                }}
              >
                <Sparkles size={12} />
                AI-POWERED STUDY NOTES
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <h1
                  style={{
                    fontSize: 'clamp(2.4rem, 7vw, 4rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    color: 'var(--text-primary)',
                    margin: '0 0 0.75rem',
                  }}
                >
                  Turn videos into{' '}
                  <span className="text-gradient">knowledge.</span>
                </h1>
                <p
                  style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    color: 'var(--text-muted)',
                    maxWidth: '520px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                  }}
                >
                  Transform YouTube lectures into structured AI-powered study notes —
                  summaries, flashcards, and a quiz in seconds.
                </p>
              </motion.div>

              {/* Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                style={{ width: '100%' }}
              >
                <YouTubeInput onSubmit={handleSubmit} loading={loading} />
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      background: 'rgba(220,38,38,0.08)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '0.75rem',
                      color: 'var(--error)',
                      fontSize: '0.9rem',
                      maxWidth: '600px',
                    }}
                  >
                    <AlertTriangle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent notes */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <RecentNotes />
              </motion.div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section style={{ padding: '4rem 1.5rem', background: 'var(--surface-1)' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                >
                  <h2
                    style={{
                      fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Everything you need to study smarter
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    NoteTube transforms any lecture into a complete study package.
                  </p>
                </motion.div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {FEATURES.map((f) => (
                    <FeatureCard key={f.title} {...f} />
                  ))}
                </div>
              </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────────── */}
            <HowItWorks />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
