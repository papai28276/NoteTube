import { useEffect } from 'react';

const HUES = [
  350, // Neon Red
  50,  // Yellow
  320, // Pink
  270, // Purple
  140, // Green
  30,  // Brown
  20,  // Orange
  15   // Peach
];

export function useColorCycle() {
  useEffect(() => {
    let animationFrameId;
    let startTime = Date.now();
    const durationPerColor = 12000; // 12 seconds per color

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const totalDuration = HUES.length * durationPerColor;
      const progress = (elapsed % totalDuration) / durationPerColor;
      
      const currentIndex = Math.floor(progress);
      const nextIndex = (currentIndex + 1) % HUES.length;
      
      const currentHue = HUES[currentIndex];
      const nextHue = HUES[nextIndex];
      
      const remainder = progress - currentIndex;
      
      // Shortest path interpolation for hue
      let delta = nextHue - currentHue;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      let h = currentHue + delta * remainder;
      h = (h + 360) % 360; // Keep strictly within 0-360
      
      document.documentElement.style.setProperty('--brand-hue', h);
      
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', `hsl(${h}, 100%, 45%)`);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);
}
