export default function NoiseOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: -200,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundRepeat: 'repeat',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
        mixBlendMode: 'overlay',
        animation: 'noise-shift 0.2s steps(2) infinite',
      }}
    />
  );
}
