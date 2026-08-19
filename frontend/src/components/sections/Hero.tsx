import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import type { SectionId } from '../../types';

interface HeroSectionProps {
  onNavigate: (section: SectionId) => void;
  onOpenResume?: () => void;
}

// Magnetic CTA Button Component (Max 8px subtle pull towards cursor when nearby)
const MagneticCTAButton: React.FC<{
  id: string;
  onClick: () => void;
  className: string;
  mousePos: { x: number; y: number };
  children: React.ReactNode;
}> = ({ id, onClick, className, mousePos, children }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!btnRef.current || mousePos.x < 0) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Proximity radius ~110px
    if (dist < 110 && dist > 0) {
      const pullX = Math.max(-8, Math.min(8, dx * 0.12));
      const pullY = Math.max(-8, Math.min(8, dy * 0.12));
      setOffset({ x: pullX, y: pullY });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [mousePos]);

  return (
    <motion.button
      id={id}
      ref={btnRef}
      onClick={onClick}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 240, damping: 18, mass: 0.15 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export const Hero: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseLeave = () => {
      setMousePos({ x: -100, y: -100 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-20 pt-28 sm:pt-36 pb-10 select-none overflow-hidden"
    >
      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Column: Editorial Information */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left">
          {/* Availability Line (Direct match to reference image) */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-slate-300 dark:text-slate-300 light:text-slate-700 mb-6 sm:mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] shadow-[0_0_10px_#00D2FF]" />
            <span>AVAILABLE FOR INTERNSHIPS &amp; FULL-TIME ROLES</span>
          </motion.div>

          {/* Big Bold Headline: KSHITIJA (White) / RENUKE (Electric Cyan) with Editorial Mask Reveal */}
          <div className="mb-5 sm:mb-6 select-none">
            <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-[100px] xl:text-[112px] leading-[0.9] tracking-tight uppercase">
              <span className="block overflow-hidden py-1">
                <motion.span
                  initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.95, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-[#FFFFFF] dark:text-[#FFFFFF] light:text-slate-900"
                >
                  KSHITIJA
                </motion.span>
              </span>
              <span className="block overflow-hidden py-1">
                <motion.span
                  initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.95, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7]"
                >
                  RENUKE
                </motion.span>
              </span>
            </h1>
          </div>

          {/* Subtitle with Accent Underline */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
            className="flex flex-col items-start mb-6"
          >
            <div className="text-xs sm:text-sm md:text-[15px] font-semibold tracking-[0.14em] uppercase text-slate-200 dark:text-slate-200 light:text-slate-800">
              FULL-STACK DEVELOPER &amp; CREATIVE TECHNOLOGIST
            </div>
            {/* Thin cyan underline under FULL-STACK */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-12 h-[2px] bg-[#00D2FF] dark:bg-[#00D2FF] light:bg-[#0284C7] mt-2 rounded-full origin-left"
            />
          </motion.div>

          {/* Editorial Description with highlighted keywords */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.65, delay: 0.55, ease: [0.215, 0.61, 0.355, 1] }}
            className="text-sm sm:text-base md:text-[17px] font-normal text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-xl leading-relaxed mb-8 sm:mb-10"
          >
            I design and build modern digital products where{' '}
            <span className="text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7] font-medium">engineering rigor</span>,{' '}
            <span className="text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7] font-medium">intuitive interaction</span>, and{' '}
            <span className="text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7] font-medium">intelligent systems</span> meet.
          </motion.p>

          {/* Magnetic CTA Buttons: Explore Projects + About Me */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <MagneticCTAButton
              id="hero-explore-projects-btn"
              onClick={() => onNavigate('projects')}
              mousePos={mousePos}
              className="group px-6 py-3.5 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#080A0C] font-bold text-sm sm:text-[15px] flex items-center gap-2 shadow-[0_4px_20px_rgba(0,210,255,0.35)] hover:shadow-[0_6px_28px_rgba(0,210,255,0.55)] transition-shadow duration-300 cursor-pointer"
            >
              <span>Explore Projects</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </MagneticCTAButton>

            <MagneticCTAButton
              id="hero-about-me-btn"
              onClick={() => onNavigate('about')}
              mousePos={mousePos}
              className="px-6 py-3.5 rounded-xl bg-[#12151B]/80 hover:bg-[#1C2028] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white font-medium text-sm sm:text-[15px] transition-colors duration-300 cursor-pointer backdrop-blur-sm"
            >
              About Me
            </MagneticCTAButton>
          </motion.div>
        </div>

        {/* Right Column: Visual Stage (Interactive canvas sits directly behind) */}
        <div className="lg:col-span-5 xl:col-span-6 h-64 sm:h-80 lg:h-[480px] w-full flex items-center justify-center pointer-events-none" />
      </div>

      {/* Hero Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.75 }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pt-6"
      >
        {/* Bottom Left: Mouse Pill Icon + Scroll to explore */}
        <button
          id="hero-scroll-hint-btn"
          onClick={() => onNavigate('about')}
          className="flex items-center gap-3 text-slate-400 hover:text-[#00D2FF] transition-colors group cursor-pointer"
        >
          {/* Custom Mouse Outline Icon */}
          <div className="w-5 h-8 rounded-full border-[1.5px] border-slate-400 group-hover:border-[#00D2FF] flex items-start justify-center p-1 transition-colors">
            <div className="w-1 h-2 rounded-full bg-slate-400 group-hover:bg-[#00D2FF] animate-bounce transition-colors" />
          </div>
          <span className="text-xs font-medium tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
            Scroll to explore
          </span>
        </button>

        {/* Bottom Right: Social Icons with thin vertical dividers */}
        <div className="flex items-center gap-3 text-slate-400">
          <a
            id="hero-github-link"
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 hover:text-[#00D2FF] transition-colors"
            title="GitHub Profile"
          >
            <Github className="w-4 h-4" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            id="hero-linkedin-link"
            href={PERSONAL_INFO.linkedin}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 hover:text-[#00D2FF] transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            id="hero-email-link"
            href={`mailto:${PERSONAL_INFO.email}`}
            className="p-1.5 hover:text-[#00D2FF] transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
};
