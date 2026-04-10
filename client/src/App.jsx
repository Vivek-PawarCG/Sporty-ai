/**
 * Sporty-AI — Intelligent Stadium Experience Platform
 * 
 * Root application component that assembles all sections:
 * Hero → Features → Live Demo → Architecture → Roadmap
 */

import GridBackground from './components/layout/GridBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/hero/Hero';
import FeatureGrid from './components/features/FeatureGrid';
import DemoPanel from './components/demo/DemoPanel';
import ArchDiagram from './components/architecture/ArchDiagram';
import Roadmap from './components/roadmap/Roadmap';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      {/* Skip link for keyboard/screen reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Animated background effects */}
      <GridBackground />

      {/* Sticky navigation */}
      <Navbar />

      {/* Main content */}
      <main id="main-content" className="container">
        <Hero />
        <DemoPanel />
        <FeatureGrid />

        {/* <ArchDiagram />
        <Roadmap /> */}
      </main>

      {/* Footer */}
      <Footer />
    </ErrorBoundary>
  );
}
