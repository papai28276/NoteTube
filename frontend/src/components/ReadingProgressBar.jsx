import { motion, useScroll } from 'framer-motion';

export default function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'hsla(var(--brand-hue), 100%, 65%, 1)',
        boxShadow: '0 0 10px hsla(var(--brand-hue), 100%, 45%, 0.8), 0 0 20px hsla(var(--brand-hue), 100%, 45%, 0.4)',
        transformOrigin: '0%',
        scaleX: scrollYProgress,
        zIndex: 9999,
      }}
    />
  );
}
