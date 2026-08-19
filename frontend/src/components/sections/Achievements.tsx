import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, X, ExternalLink } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/portfolioData';
import { GlassCard } from '../ui/GlassCard';
import type { Achievement } from '../../types';

export const Achievements: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'certification' | 'achievements'>('all');
  const [selectedCert, setSelectedCert] = useState<Achievement | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };
    if (selectedCert) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedCert]);

  // Filter achievements data
  const filteredAchievements = ACHIEVEMENTS.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'certification') return item.category === 'certification';
    if (activeFilter === 'achievements') return item.category === 'award' || item.category === 'hackathon';
    return true;
  });

  return (
    <section
      id="achievements"
      className="section-wrapper px-6 sm:px-12 md:px-20 lg:px-28 w-full select-none"
    >
      <div className="max-w-6xl w-full mx-auto relative z-10">
        
        {/* LEFT-ALIGNED Header Section Label */}
        <div className="flex items-center gap-4 section-label-row mb-7">
          <span className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-[#00D2FF] font-display">
            06 / RECOGNITION
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-cyan-500/30" />
        </div>

        {/* Section Intro Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="text-slate-400 font-sans text-sm sm:text-[14.5px] max-w-2xl leading-relaxed mb-8"
        >
          Certifications, technical credentials and achievements that reflect continuous learning and practical experience.
        </motion.p>

        {/* Minimal Tab Filter Bar */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/[0.04] pb-3">
          {(['all', 'certification', 'achievements'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold font-display uppercase tracking-wider transition-all duration-300 border bg-transparent cursor-pointer ${
                activeFilter === filter
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter === 'all' ? 'ALL' : filter === 'certification' ? 'CERTIFICATIONS' : 'ACHIEVEMENTS'}
            </button>
          ))}
        </div>

        {/* 2-Column Split-Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard
                  className="p-5 h-full group transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,210,255,0.08)] hover:-translate-y-[2px]"
                  id={`achievement-card-${item.id}`}
                >
                  <div className="flex flex-col sm:flex-row gap-5 h-full w-full">
                    {/* Left Side: Image Preview */}
                    <div
                      onClick={() => setSelectedCert(item)}
                      className="w-full sm:w-[42%] aspect-[4/3] sm:aspect-auto sm:h-full relative overflow-hidden rounded-xl border border-cyan-500/10 bg-black/55 flex items-center justify-center cursor-pointer group/img"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-[1.03]"
                        />
                      ) : (
                        <div className="text-slate-500 text-[11px] font-bold font-display uppercase tracking-wider">
                          Certificate Preview
                        </div>
                      )}
                      {/* Subtle Scan Overlay Line */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF]/0 via-[#00D2FF]/5 to-[#00D2FF]/0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none animate-pulse" />
                    </div>

                    {/* Right Side: Credential Details */}
                    <div className="w-full sm:w-[58%] flex flex-col justify-between">
                      <div>
                        {/* Issuer & Year Date */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.issuer}
                          </span>
                          <span className="text-[9px] text-[#00D2FF] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                            {item.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-[15px] sm:text-base font-extrabold text-white leading-snug mb-2 group-hover:text-[#00D2FF] transition-colors duration-300">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div>
                        {/* Skill Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4 border-t border-white/[0.04] pt-3">
                          {item.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-medium text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Verified Badge & View CTA */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                          {item.credentialId ? (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-cyan-400/60 flex items-center gap-1 font-bold uppercase tracking-wider">
                              <Award className="w-3.5 h-3.5" /> Recognition
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedCert(item)}
                            className="text-[11px] font-bold uppercase tracking-wider text-[#00D2FF] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                          >
                            View Link ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Premium Certificate Lightbox Modal */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-3xl w-full bg-[#080a0e] rounded-2xl border border-cyan-500/20 p-5 relative cursor-default flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(0,210,255,0.15)]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Lightbox Certificate Image */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.04] bg-black/80 flex items-center justify-center p-2 mt-6">
                  {selectedCert.imageUrl ? (
                    <img
                      src={selectedCert.imageUrl}
                      alt={selectedCert.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-500 font-bold uppercase tracking-wider font-display">
                      Certificate Preview
                    </div>
                  )}
                </div>

                {/* Certificate Meta Details */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 border-t border-white/[0.04] pt-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white mb-0.5">
                      {selectedCert.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-light">
                      Issued by {selectedCert.issuer} &middot; {selectedCert.date}
                    </p>
                  </div>

                  {/* Verification CTA Link */}
                  {selectedCert.verifyUrl && (
                    <a
                      href={selectedCert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#080A0C] font-bold text-xs shadow-lg shadow-[#00D2FF]/20 transition-all uppercase tracking-wider"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
