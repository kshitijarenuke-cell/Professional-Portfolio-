import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import type { AboutData } from '../../types';
import { Code2, Brain, Target, GraduationCap, MapPin, Cpu } from 'lucide-react';

const PROFILE_FALLBACK = '/profile.png';

export const About: React.FC = () => {
  const { triggerAdminAction, openDashboard } = useAuth();
  const [about, setAbout] = useState<AboutData | null>(null);

  const fetchAbout = async () => {
    try {
      const res = await api.get<AboutData>('/about');
      if (res.data) setAbout(res.data);
    } catch (e) {
      console.error('[About fetch error]', e);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleEditClick = () => {
    triggerAdminAction(() => {
      openDashboard('about');
    });
  };

  const profileSrc = about?.profileImage && about.profileImage.trim() !== ''
    ? about.profileImage
    : PROFILE_FALLBACK;

  // Parallax mouse tracking on avatar
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const avatarContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!avatarContainerRef.current) return;
    const rect = avatarContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 28;
    const y = (e.clientY - rect.top - rect.height / 2) / 28;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Pixel/particle fragments surrounding avatar
  const fragments = [
    { top: '12%', left: '10%', delay: 0.1, duration: 4, size: 4 },
    { top: '28%', left: '6%', delay: 0.4, duration: 3.5, size: 3 },
    { top: '48%', left: '14%', delay: 0.2, duration: 4.5, size: 5 },
    { top: '68%', left: '9%', delay: 0.6, duration: 3.8, size: 4 },
    { top: '82%', left: '7%', delay: 0.3, duration: 5, size: 5 },
    { top: '18%', right: '8%', delay: 0.5, duration: 4.2, size: 3 },
    { top: '38%', right: '12%', delay: 0.1, duration: 3.2, size: 5 },
    { top: '58%', right: '7%', delay: 0.7, duration: 4.8, size: 4 },
    { top: '72%', right: '9%', delay: 0.3, duration: 3.6, size: 5 },
    { top: '88%', right: '8%', delay: 0.8, duration: 5.2, size: 6 },
  ];

  return (
    <section className="relative pt-12 pb-16 px-6 sm:px-12 md:px-20 lg:px-28 w-full overflow-hidden bg-black select-none z-10" id="about">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-gradient-to-b from-black via-black to-[#07090c]" />

      <div className="max-w-6xl w-full mx-auto relative z-2">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 section-label-row mb-7 sm:mb-8"
        >
          <span className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-[#00D2FF] font-display">
            02 / ABOUT
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-cyan-500/30" />
          <button
            onClick={handleEditClick}
            className="admin-only edit-about-btn text-xs text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 px-2.5 py-1 rounded-full hover:bg-cyan-500/10 cursor-pointer transition-all inline-flex items-center gap-1.5"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 11, height: 11 }}>
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Info
          </button>
        </motion.div>

        {/* Main Two-Column Desktop / Stacked Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_auto_1.5fr] gap-8 lg:gap-12 items-center mb-12">
          
          {/* LEFT COLUMN: Large Avatar Portrayal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center select-none w-full max-w-[380px] lg:max-w-none mx-auto"
            ref={avatarContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background wave line network behind avatar */}
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none z-1" viewBox="0 0 400 400" fill="none">
              <path d="M-50,200 Q100,100 200,300 T450,200" stroke="#00D2FF" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M-50,220 Q120,80 220,320 T450,220" stroke="#00D2FF" strokeWidth="0.5" opacity="0.5" />
              <path d="M-50,180 Q80,120 180,280 T450,180" stroke="#00D2FF" strokeWidth="0.5" opacity="0.3" />
            </svg>

            {/* Glowing cyan disc at bottom base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-gradient-to-r from-transparent via-[#00D2FF]/25 to-transparent blur-[6px] rounded-full pointer-events-none z-2" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-[1.5px] bg-[#00D2FF]/70 shadow-[0_0_12px_#00D2FF] rounded-full pointer-events-none z-3" />

            {/* Image Wrapper with subtle rim glow and parallax motion */}
            <motion.div 
              className="relative rounded-2xl overflow-visible z-4 p-[1.5px]"
              animate={{ x: mousePos.x, y: mousePos.y }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              {/* Outer cyan rim stroke pulse */}
              <div className="absolute inset-0 rounded-2xl border border-[#00D2FF]/20 shadow-[0_0_20px_rgba(0,210,255,0.1)] animate-pulse pointer-events-none" />
              
              <img
                src={profileSrc}
                alt="Kshitija Renuke"
                className="w-full h-auto object-cover rounded-2xl block relative z-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PROFILE_FALLBACK;
                }}
              />

              {/* Floating Cyan Pixel Fragments */}
              {fragments.map((frag, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: frag.top,
                    left: frag.left || 'auto',
                    right: frag.right || 'auto',
                    width: frag.size,
                    height: frag.size,
                    backgroundColor: '#00D2FF',
                    boxShadow: '0 0 8px #00D2FF',
                    borderRadius: '1px',
                    pointerEvents: 'none',
                    zIndex: 6,
                  }}
                  animate={{
                    y: [-8, -40, -8],
                    opacity: [0.2, 0.75, 0.2],
                  }}
                  transition={{
                    duration: frag.duration,
                    delay: frag.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* CENTER DIVISION: Thin Vertical Data Line with Animating Nodes */}
          <div className="about-vertical-line h-[380px] w-[1px] bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent relative mx-2 self-center">
            {/* Animating Data Nodes */}
            <motion.div
              className="absolute w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_8px_#00D2FF] -left-[2.5px]"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_8px_#00D2FF] -left-[2.5px]"
              animate={{ top: ['30%', '100%', '0%', '30%'] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_8px_#00D2FF] -left-[2.5px]"
              animate={{ top: ['70%', '0%', '100%', '70%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* RIGHT COLUMN: Statement, narrative, and Identity Rows */}
          <div className="w-full flex flex-col justify-center">
            
            {/* Big Headline Statement */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-[28px] lg:text-[32px] font-extrabold font-display leading-[1.2] text-white tracking-tight mb-5"
            >
              I BUILD DIGITAL EXPERIENCES<br />
              THAT LIVE BETWEEN <span className="bg-gradient-to-r from-[#00D2FF] via-[#06b6d4] to-[#00D2FF] bg-clip-text text-transparent font-display">CODE</span>,<br />
              <span className="bg-gradient-to-r from-[#00D2FF] via-[#06b6d4] to-[#00D2FF] bg-clip-text text-transparent font-display">INTELLIGENCE</span> & <span className="bg-gradient-to-r from-[#00D2FF] via-[#06b6d4] to-[#00D2FF] bg-clip-text text-transparent font-display">INTERACTION</span>.
            </motion.h2>

            {/* Narrative Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 font-light text-sm sm:text-[14.5px] leading-relaxed mb-6 max-w-2xl font-sans"
            >
              {about?.description || "I'm a Computer Science Engineering undergraduate student passionate about building scalable full-stack web applications, engineering responsive digital products, exploring AI integrations, and designing human-centered interactive software."}
            </motion.p>

            {/* Identity Rows */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-1 mb-8"
            >
              {/* Row 1: BUILD */}
              <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] group">
                <div className="w-10 h-10 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10">
                  <Code2 className="w-4.5 h-4.5 text-[#00D2FF]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#00D2FF] font-display uppercase tracking-wider mb-0.5">
                    01 / BUILD
                  </div>
                  <div className="text-slate-300 text-xs sm:text-[13px] font-light">
                    Full-stack digital products from concept to deployment.
                  </div>
                </div>
                <div className="about-row-line flex-grow h-[1px] bg-cyan-500/15 relative ml-4">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_6px_#00D2FF]" />
                </div>
              </div>

              {/* Row 2: EXPLORE */}
              <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] group">
                <div className="w-10 h-10 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10">
                  <Brain className="w-4.5 h-4.5 text-[#00D2FF]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#00D2FF] font-display uppercase tracking-wider mb-0.5">
                    02 / EXPLORE
                  </div>
                  <div className="text-slate-300 text-xs sm:text-[13px] font-light">
                    AI, automation and creative technology that push boundaries.
                  </div>
                </div>
                <div className="about-row-line flex-grow h-[1px] bg-cyan-500/15 relative ml-4">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_6px_#00D2FF]" />
                </div>
              </div>

              {/* Row 3: DIRECTION */}
              <div className="flex items-center gap-4 py-3 group">
                <div className="w-10 h-10 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10">
                  <Target className="w-4.5 h-4.5 text-[#00D2FF]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#00D2FF] font-display uppercase tracking-wider mb-0.5">
                    03 / DIRECTION
                  </div>
                  <div className="text-slate-300 text-xs sm:text-[13px] font-light">
                    Clean code. Scalable systems. Useful, human-centered experiences.
                  </div>
                </div>
                <div className="about-row-line flex-grow h-[1px] bg-cyan-500/15 relative ml-4">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_6px_#00D2FF]" />
                </div>
              </div>
            </motion.div>

            {/* VIEW RESUME CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href={about?.resumeUrl || '/uploads/Resume.pdf'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-[#00D2FF] hover:bg-[#00D2FF]/5 hover:border-[#00D2FF] hover:shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all duration-300 text-xs font-bold tracking-wider uppercase font-display select-none"
                target="_blank"
                rel="noreferrer"
              >
                View Resume ↗
              </a>
            </motion.div>

          </div>
        </div>

        {/* BOTTOM IDENTITY STRIP: 4 items segmented by thin lines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full bg-[#080A0E] border border-white/[0.05] rounded-xl overflow-hidden shadow-2xl relative z-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y divide-white/[0.04] md:divide-y-0 md:divide-x divide-white/[0.06] items-center">
            
            {/* Item 1: B.TECH CSE */}
            <div className="flex items-center gap-3.5 px-6 py-4.5">
              <div className="text-[#00D2FF] p-2 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-lg flex-shrink-0">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 font-display uppercase tracking-wider mb-0.5">
                  B.TECH CSE
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  ITM Kharghar
                </div>
                <div className="text-[11px] text-slate-500">
                  2028
                </div>
              </div>
            </div>

            {/* Item 2: FULL-STACK */}
            <div className="flex items-center gap-3.5 px-6 py-4.5">
              <div className="text-[#00D2FF] p-2 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-lg flex-shrink-0">
                <Code2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 font-display uppercase tracking-wider mb-0.5">
                  FULL-STACK
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  MERN Stack
                </div>
                <div className="text-[11px] text-slate-500">
                  Developer
                </div>
              </div>
            </div>

            {/* Item 3: AI + WEB */}
            <div className="flex items-center gap-3.5 px-6 py-4.5">
              <div className="text-[#00D2FF] p-2 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-lg flex-shrink-0">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 font-display uppercase tracking-wider mb-0.5">
                  AI + WEB
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Exploring AI tools
                </div>
                <div className="text-[11px] text-slate-500">
                  & Integrations
                </div>
              </div>
            </div>

            {/* Item 4: MUMBAI, INDIA */}
            <div className="flex items-center gap-3.5 px-6 py-4.5">
              <div className="text-[#00D2FF] p-2 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-lg flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 font-display uppercase tracking-wider mb-0.5">
                  MUMBAI, INDIA
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Available for
                </div>
                <div className="text-[11px] text-slate-500">
                  Remote & Onsite
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
