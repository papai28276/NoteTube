import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Quiz({ quiz }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // [{correct: bool}]
  const [finished, setFinished] = useState(false);

  if (!quiz?.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No quiz available.</p>;
  }

  const q = quiz[current];
  const isAnswered = selected !== null;
  const score = answers.filter((a) => a.correct).length;

  const handleSelect = (opt) => {
    if (isAnswered) return;
    const correct = opt === q.correct_answer;
    setSelected(opt);
    setAnswers((prev) => [...prev, { correct }]);
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };

  // Score screen
  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    const message =
      pct >= 80 ? '🎉 Excellent! You really know this topic.' :
      pct >= 60 ? '👍 Good job! A bit more review and you\'ll nail it.' :
      '📚 Keep studying — you\'ve got this!';

    useEffect(() => {
      if (pct === 100) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, [pct]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 1rem' }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg,var(--brand-500),var(--brand-700))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trophy size={32} color="white" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Quiz Complete!
          </h2>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-600)', lineHeight: 1 }}>
            {score} / {quiz.length}
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{message}</p>
        </div>

        <button onClick={handleRestart} className="btn-primary">
          <RotateCcw size={15} />
          Restart Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Question {current + 1} of {quiz.length}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--brand-600)', fontWeight: 600 }}>
            {answers.filter((a) => a.correct).length} correct
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((current) / quiz.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--brand-500), var(--brand-700))',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}
      >
        <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {q.options.map((opt, i) => {
          let className = 'quiz-option';
          if (isAnswered) {
            if (opt === q.correct_answer) className += ' correct';
            else if (opt === selected) className += ' wrong';
          }
          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
            >
              <span style={{ marginRight: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
              {isAnswered && opt === q.correct_answer && (
                <CheckCircle2 size={16} style={{ marginLeft: 'auto', color: 'var(--success)' }} />
              )}
              {isAnswered && opt === selected && opt !== q.correct_answer && (
                <XCircle size={16} style={{ marginLeft: 'auto', color: 'var(--error)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                background: selected === q.correct_answer
                  ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${selected === q.correct_answer ? 'var(--success)' : 'var(--error)'}`,
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: selected === q.correct_answer ? 'var(--success)' : 'var(--error)' }}>
                {selected === q.correct_answer ? '✓ Correct! ' : '✗ Incorrect. '}
              </strong>
              {q.explanation}
            </div>

            <button onClick={handleNext} className="btn-primary" style={{ alignSelf: 'flex-end' }}>
              {current < quiz.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
