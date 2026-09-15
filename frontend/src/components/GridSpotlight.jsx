import { useEffect, useState } from 'react';

export default function GridSpotlight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
        backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        WebkitMaskImage: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        opacity: 0.4,
        transition: 'mask-image 0.1s ease-out, -webkit-mask-image 0.1s ease-out',
      }}
    />
  );
}
