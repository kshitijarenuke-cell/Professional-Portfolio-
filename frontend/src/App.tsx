import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Toast } from './components/Toast';
import { Loader } from './components/Loader';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Journey } from './components/sections/Journey';
import { Achievements } from './components/sections/Achievements';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CanvasBackground } from './components/three/CanvasBackground';
import { Navbar } from './components/Navbar';
import { resolveBackendAssetUrl } from './api/client';
import type { SectionId, Theme } from './types';
import './portfolio.css';

export const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Initialize Lenis smooth scrolling safely if present
    if (typeof (window as any).Lenis !== 'undefined') {
      try {
        const lenis = new (window as any).Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      } catch (e) {
        console.warn('[Lenis Init Warn]', e);
      }
    }
  }, []);

  // Track global window scroll and compute 3D section progress
  useEffect(() => {
    const sections: SectionId[] = ['hero', 'about', 'skills', 'projects', 'journey', 'achievements', 'contact'];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const rawPercent = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, rawPercent)));

      const windowMiddle = scrollY + window.innerHeight * 0.45;
      let currentIdx = 0;
      let fractionalProgress = 0;

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;

          if (windowMiddle >= top && windowMiddle <= top + height) {
            currentIdx = i;
            const withinSection = (windowMiddle - top) / height;
            fractionalProgress = i + Math.min(1, Math.max(0, withinSection));
            break;
          } else if (windowMiddle > top + height && i === sections.length - 1) {
            currentIdx = sections.length - 1;
            fractionalProgress = sections.length - 1;
          }
        }
      }

      setActiveSection(sections[currentIdx] || 'hero');
      setScrollProgress(fractionalProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (sectionId: SectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AuthProvider>
      <CanvasBackground scrollProgress={scrollProgress} theme={theme} />
      <Loader />
      <Toast />

      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        scrollPercent={scrollPercent}
        onOpenResume={() => {
          window.open(resolveBackendAssetUrl('/uploads/Resume.pdf'), '_blank');
        }}
      />

      <main className="w-full overflow-hidden relative z-10">
        <Hero onNavigate={handleNavigate} />
        <hr className="divider" />
        <About />
        <hr className="divider" />
        <Skills />
        <hr className="divider" />
        <Projects />
        <hr className="divider" />
        <Journey />
        <hr className="divider" />
        <Achievements />
        <hr className="divider" />
        <Contact />
        <hr className="divider" />
      </main>

      <Footer />

      {/* Admin Modals */}
      <AdminLoginModal />
      <AdminDashboard />
    </AuthProvider>
  );
};

export default App;
