import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, LayoutGroup, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Focus, Minimize } from 'lucide-react';

import VideoInfo from '../components/VideoInfo';
import ExportButtons from '../components/ExportButtons';
import SummarySection from '../components/tabs/SummarySection';
import NotesSection from '../components/tabs/NotesSection';
import KeyConcepts from '../components/tabs/KeyConcepts';
import ImportantPoints from '../components/tabs/ImportantPoints';
import Flashcards from '../components/tabs/Flashcards';
import Quiz from '../components/tabs/Quiz';
import TranscriptViewer from '../components/tabs/TranscriptViewer';

import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';
import AudioPlayer from '../components/AudioPlayer';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'notes', label: 'Notes' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'points', label: 'Key Points' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'transcript', label: 'Transcript' },
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const { scrollY } = useScroll();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => document.body.classList.remove('focus-mode');
  }, [isFocusMode]);

  if (!result) return null;

  const { video, transcript, notes } = result;

  const getActiveText = () => {
    switch (activeTab) {
      case 'summary': return notes.summary || '';
      case 'notes': return notes.detailed_notes ? notes.detailed_notes.map(n => `## ${n.heading}\n${n.content}`).join('\n\n') : '';
      case 'concepts': return notes.key_concepts ? JSON.stringify(notes.key_concepts) : '';
      case 'points': return notes.important_points ? JSON.stringify(notes.important_points) : '';
      case 'transcript': return transcript;
      default: return '';
    }
  };

  const hasTOC = activeTab === 'notes' || activeTab === 'summary';
  const activeText = getActiveText();

  function renderTab() {
    switch (activeTab) {
      case 'summary':    return <SummarySection summary={notes.summary} />;
      case 'notes':      return <NotesSection detailed_notes={notes.detailed_notes} />;
      case 'concepts':   return <KeyConcepts key_concepts={notes.key_concepts} />;
      case 'points':     return <ImportantPoints important_points={notes.important_points} examples={notes.examples} />;
      case 'flashcards': return <Flashcards flashcards={notes.flashcards} />;
      case 'quiz':       return <Quiz quiz={notes.quiz} />;
      case 'transcript': return <TranscriptViewer transcript={transcript} />;
      default:           return null;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <ReadingProgressBar />
      
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        
        {/* Main Content Area */}
        <div style={{ 
          width: '100%', 
          maxWidth: '900px', 
          padding: '2rem 1.5rem 10rem',
          transition: 'all 0.5s ease',
          margin: isFocusMode ? '0 auto' : '0',
        }}>
          
          <div className="non-focus-elements" style={{ opacity: isFocusMode ? 0 : 1, transition: 'opacity 0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/')}
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <ArrowLeft size={15} />
                Back
              </motion.button>

              {/* Focus Mode Toggle */}
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="btn-secondary"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'var(--brand-50)', color: 'var(--brand-600)', borderColor: 'var(--brand-200)' }}
              >
                {isFocusMode ? <Minimize size={15} /> : <Focus size={15} />}
                {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
              </button>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <VideoInfo video={video} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <ExportButtons data={result} />
              <AudioPlayer text={activeText} />
            </motion.div>
          </div>

          {/* Exit Focus button when in focus mode */}
          {isFocusMode && (
            <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 100 }}>
               <button
                onClick={() => setIsFocusMode(false)}
                className="btn-secondary"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(128,128,128,0.1)', backdropFilter: 'blur(10px)' }}
              >
                <Minimize size={15} />
                Exit Focus
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="stagger-fade"
              style={{ marginTop: isFocusMode ? '0' : '2rem' }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar (Table of Contents) */}
        {!isFocusMode && hasTOC && (
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 'calc(50% + 480px)', // Positions exactly to the right of the 900px main container
            width: '240px', 
            paddingTop: '2rem', 
          }} className="toc-sidebar">
            <TableOfContents markdown={activeText} />
          </div>
        )}
      </div>

      {/* Floating Dynamic Dock */}
      <div style={{ position: 'fixed', bottom: '2rem', left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: !isFocusMode ? 0 : 100, opacity: !isFocusMode ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '999px',
            padding: '0.4rem',
            display: 'flex',
            gap: '0.2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px var(--border)',
            overflowX: 'auto',
            maxWidth: '95vw',
          }}
          className="dynamic-dock no-scrollbar"
        >
        <LayoutGroup>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="dockPill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
                  borderRadius: '999px',
                  zIndex: -1,
                  boxShadow: '0 4px 12px hsla(var(--brand-hue), 100%, 45%, 0.4)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 2 }}>{tab.label}</span>
          </button>
        ))}
        </LayoutGroup>
        </motion.div>
      </div>

    </motion.div>
  );
}
