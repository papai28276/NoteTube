import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import About from './pages/About';
import { useColorCycle } from './hooks/useColorCycle';
import NoiseOverlay from './components/NoiseOverlay';
import GridSpotlight from './components/GridSpotlight';

function AppContent() {
  useColorCycle();
  const location = useLocation();
  
  return (
    <>
      <NoiseOverlay />
      <GridSpotlight />
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
