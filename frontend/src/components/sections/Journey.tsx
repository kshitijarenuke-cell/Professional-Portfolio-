import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { GraduationCap, Briefcase, Rocket, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { JOURNEY_MILESTONES } from '../../data/portfolioData';
import { GlassCard } from '../ui/GlassCard';
import { MaskHeading, ParagraphReveal } from '../../utils/motion';

export const Journey: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 70%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    mass: 0.1,
  });

  return (
    <section
      id="journey"
      className="section-wrapper px-6 sm:px-12 md:px-20 lg:px-28"
    >
      <div className="max-w-5xl w-full mx-auto">
        {/* Editorial Section Header */}
        <div className="flex items-center gap-4 section-label-row">
          <span className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7] font-display">
            05 / Experience
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-cyan-500/30" />
        </div>

        <MaskHeading
          lines={['Engineering Journey', '& Trajectory']}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 max-w-2xl"
        />

        <ParagraphReveal
          delay={0.15}
          className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-10"
        >
          From foundational diploma coursework to full-stack engineering internships, undergraduate studies, and production application development.
        </ParagraphReveal>

        {/* Timeline Path Flow */}
        <div ref={timelineRef} className="relative">
          {/* Base Background Track Line */}
          <div className="journey-md-block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/20 dark:bg-white/20 light:bg-slate-300 pointer-events-none z-10" />

          {/* Scroll-Driven Dynamic Progress Drawing Line */}
          <motion.div
            style={{ scaleY: smoothProgress }}
            className="journey-md-block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00D2FF] via-[#38BDF8] to-[#06b6d4] origin-top shadow-[0_0_15px_#00D2FF] pointer-events-none z-20"
          />

          <div className="space-y-12">
            {JOURNEY_MILESTONES.map((milestone, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Center Node Beacon with Scroll Transition from Outline -> Glowing Cyan */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6, borderColor: 'rgba(71,85,105,0.6)' }}
                    whileInView={{
                      scale: 1,
                      opacity: 1,
                      borderColor: '#00D2FF',
                      boxShadow: '0 0 16px rgba(0,210,255,0.6)',
                    }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="journey-md-flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0C0E12] dark:bg-[#0C0E12] light:bg-[#FAF9F6] border-2 items-center justify-center z-20"
                  >
                    {milestone.type === 'education' ? (
                      <GraduationCap className="w-3.5 h-3.5 text-[#00D2FF]" />
                    ) : milestone.type === 'experience' ? (
                      <Briefcase className="w-3.5 h-3.5 text-[#00D2FF]" />
                    ) : (
                      <Rocket className="w-3.5 h-3.5 text-[#00D2FF]" />
                    )}
                  </motion.div>

                  {/* Card Container with Staggered Viewport Entrance */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40, filter: 'blur(4px)' }}
                    whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full md:w-[46%]"
                  >
                    <GlassCard className="p-6 sm:p-7" id={`journey-card-${milestone.id}`}>
                      {/* Header Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 dark:border-white/10 light:border-black/10">
                        <span className="flex items-center gap-1.5 text-xs text-[#00D2FF] font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {milestone.year}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-cyan-400/80" />
                          {milestone.location}
                        </span>
                      </div>

                      {/* Milestone Title with Mask Reveal */}
                      <div className="overflow-hidden mb-1">
                        <motion.h3
                          initial={{ y: '100%', opacity: 0 }}
                          whileInView={{ y: '0%', opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="font-display text-lg sm:text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900"
                        >
                          {milestone.title}
                        </motion.h3>
                      </div>

                      <div className="text-xs text-[#00D2FF]/90 font-medium mb-3">
                        {milestone.role} • <span className="text-slate-300 dark:text-slate-300 light:text-slate-700">{milestone.organization}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-4">
                        {milestone.description}
                      </p>

                      {/* Achievements Bullets */}
                      <div className="space-y-2 mb-4 pt-2 border-t border-white/5 dark:border-white/5 light:border-black/5">
                        {milestone.achievements.map((ach, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00D2FF] shrink-0 mt-0.5" />
                            <span>{ach}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tech Stack Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-white/5 dark:bg-white/5 light:bg-black/5 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-white/5 dark:border-white/5 light:border-black/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
