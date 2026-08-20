import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ArrowDown } from 'lucide-react';
import type { SectionId, Theme } from '../types';
import { soundEngine } from '../utils/audio';
import { SparkleResumeButton } from './ui/SparkleResumeButton';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  theme: Theme;
  onToggleTheme: () => void;
  scrollPercent: number;
  onOpenResume?: () => void;
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'achievements', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  theme,
  onToggleTheme,
  scrollPercent,
  onOpenResume,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: SectionId) => {
    soundEngine.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-white/5 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#00D2FF] via-[#38BDF8] to-[#06b6d4] transition-all duration-100"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Main Floating Rounded Navigation Bar Capsule */}
      <header className={`floating-navbar-container ${scrollPercent > 2 ? 'scrolled' : ''} px-6 sm:px-8 md:px-10 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between`}>
        {/* Left: Brand Monogram KR. */}
        <button
          id="nav-brand-logo"
          onClick={() => handleNavClick('hero')}
          className="flex items-center font-display font-black text-2xl tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer border-none bg-transparent"
        >
          <span>KR</span>
          <span className="text-[#00D2FF] font-black">.</span>
        </button>

        {/* Center: Nav links with smooth sliding active indicator */}
        <div
          id="desktop-nav-bar"
          className="journey-md-flex items-center gap-6 lg:gap-8 relative"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`relative py-1.5 px-1 text-xs lg:text-[13.5px] font-medium transition-colors flex flex-col items-center cursor-pointer group border-none bg-transparent ${
                  isActive
                    ? 'text-[#00D2FF] font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>

                {/* Smooth sliding active indicator line */}
                {isActive ? (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#00D2FF] shadow-[0_0_8px_#00D2FF]"
                    transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.15 }}
                  />
                ) : (
                  /* Tiny hover indicator expansion */
                  <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full bg-white/20 scale-x-0 group-hover:scale-x-75 transition-transform duration-200 origin-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Theme Toggle + Solid Electric Cyan Resume Button */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            id="nav-theme-toggle"
            onClick={() => {
              soundEngine.playClick();
              onToggleTheme();
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            type="button"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Solid Vibrant Electric Cyan Resume Button */}
          <SparkleResumeButton
            id="nav-resume-btn"
            pdfUrl="/resume/Kshitija-Renuke-Resume.pdf"
            pdfFileName="Kshitija-Renuke-Resume.pdf"
            onClick={() => {
              soundEngine.playClick();
              if (onOpenResume) onOpenResume();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#080A0C] bg-[#00D2FF] hover:bg-[#38BDF8] shadow-[0_2px_14px_rgba(0,210,255,0.35)] hover:shadow-[0_4px_20px_rgba(0,210,255,0.55)] transition-all duration-200 cursor-pointer border-none"
          >
            <span>Resume</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </SparkleResumeButton>

          {/* Mobile Menu Hamburger */}
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
            type="button"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-20 z-40 p-5 rounded-2xl border border-white/10 md:hidden flex flex-col gap-3 shadow-2xl backdrop-blur-2xl bg-[#060709]/95"
          >
            <div className="text-xs font-medium text-slate-400 px-2 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Navigation</span>
              <span className="text-[10px] text-[#00D2FF]">Available for hire</span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border-none bg-transparent ${
                    activeSection === item.id
                      ? 'bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeSection === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />}
                </button>
              ))}
            </div>

            <SparkleResumeButton
              pdfUrl="/resume/Kshitija-Renuke-Resume.pdf"
              pdfFileName="Kshitija-Renuke-Resume.pdf"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-3 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#080A0C] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00D2FF]/25 border-none"
            >
              <span>View &amp; Download Resume</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </SparkleResumeButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
