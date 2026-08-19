import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Server, Database, Terminal, Wrench, CheckCircle2, ArrowRight } from 'lucide-react';
import { SKILL_CATEGORIES } from '../../data/portfolioData';
import type { SkillItem } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { soundEngine } from '../../utils/audio';
import { MaskHeading, ParagraphReveal, cardRevealVariants } from '../../utils/motion';

export const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Frontend');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(SKILL_CATEGORIES[0].skills[0]);

  const categoryIcons: Record<string, React.ReactNode> = {
    Frontend: <Code2 className="w-4 h-4" />,
    Backend: <Server className="w-4 h-4" />,
    Database: <Database className="w-4 h-4" />,
    Programming: <Terminal className="w-4 h-4" />,
    Tools: <Wrench className="w-4 h-4" />
  };

  const currentCategoryData = SKILL_CATEGORIES.find((c) => c.category === activeCategory) || SKILL_CATEGORIES[0];

  const handleSelectSkill = (skill: SkillItem) => {
    soundEngine.playClick();
    setSelectedSkill(skill);
  };

  return (
    <section
      id="skills"
      className="section-wrapper px-6 sm:px-12 md:px-20 lg:px-28"
    >
      <div className="max-w-6xl w-full mx-auto">
        {/* Editorial Header */}
        <div className="flex items-center gap-4 section-label-row">
          <span className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-[#00D2FF] dark:text-[#00D2FF] light:text-[#0284C7] font-display">
            02 / Capabilities
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-cyan-500/30" />
        </div>

        <MaskHeading
          lines={['Technical Stack &', 'Engineering Tooling']}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 max-w-2xl"
        />

        <ParagraphReveal
          delay={0.15}
          className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-10"
        >
          A structured breakdown of languages, frameworks, databases, and development workflows utilized across full-stack production projects.
        </ParagraphReveal>

        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          {SKILL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveCategory(cat.category);
                  setSelectedSkill(cat.skills[0]);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer group ${
                  isActive
                    ? 'bg-[#00D2FF] text-[#080A0C] font-bold shadow-[0_4px_16px_rgba(0,210,255,0.3)]'
                    : 'glass-panel text-slate-400 hover:text-slate-100 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:border-[#00D2FF]/30'
                }`}
              >
                <span className="transition-transform group-hover:scale-110">{categoryIcons[cat.category]}</span>
                <span>{cat.category}</span>
              </button>
            );
          })}
        </div>

        {/* Skills Grid and Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Skill Cards List with Staggered Viewport Entrance */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentCategoryData.skills.map((skill, index) => {
              const isSelected = selectedSkill.name === skill.name;
              return (
                <motion.div
                  key={skill.name}
                  variants={cardRevealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  custom={index}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <GlassCard
                    onClick={() => handleSelectSkill(skill)}
                    className={`p-5 h-full flex flex-col justify-between cursor-pointer border transition-all duration-300 ${
                      isSelected
                        ? 'border-[#00D2FF]/80 bg-[#00D2FF]/10 shadow-lg shadow-[#00D2FF]/15'
                        : 'group-hover:border-[#00D2FF]/40 group-hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {/* Expanding technical indicator line on hover */}
                          <div
                            className={`h-3 rounded-full bg-[#00D2FF] transition-all duration-300 ${
                              isSelected ? 'w-3' : 'w-1 group-hover:w-2.5 opacity-60 group-hover:opacity-100'
                            }`}
                          />
                          <h4 className="font-bold text-sm sm:text-base text-slate-100 dark:text-slate-100 light:text-slate-900 group-hover:scale-[1.02] transition-transform origin-left">
                            {skill.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold text-[#00D2FF] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {skill.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-4">
                        {skill.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 dark:border-white/5 light:border-black/5 text-[11px] text-slate-500">
                      <span>{skill.projects.length} Applied Projects</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'text-[#00D2FF] translate-x-1' : 'group-hover:translate-x-1 group-hover:text-[#00D2FF]'}`} />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Selected Skill Deep-Dive Inspector */}
          <div className="lg:col-span-5 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSkill.name}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col"
              >
                <GlassCard className="p-6 sm:p-8 flex-1 flex flex-col justify-between" id="skill-detail-inspector">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 dark:border-white/10 light:border-black/10">
                      <span className="text-xs font-semibold text-[#00D2FF] uppercase tracking-wider">
                        Competency Deep Dive
                      </span>
                      <span className="text-xs text-slate-400">{selectedSkill.category}</span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
                      {selectedSkill.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed mb-6">
                      {selectedSkill.description}
                    </p>

                    {/* Key Technical Highlights */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Key Applications & Focus
                      </h4>
                      {selectedSkill.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applied In Projects */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Applied In Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.projects.map((proj) => (
                        <span
                          key={proj}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-[#00D2FF] border border-cyan-500/20"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
