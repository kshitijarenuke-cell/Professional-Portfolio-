import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, X, ExternalLink, Edit2, Trash2, Plus, Upload, Loader2, AlertTriangle, Check } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/portfolioData';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { api, uploadFile, resolveBackendAssetUrl } from '../../api/client';
import type { Credential } from '../../types';

export const Achievements: React.FC = () => {
  const { isAdmin, triggerAdminAction, showToast } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>(ACHIEVEMENTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'certification' | 'achievements'>('all');
  const [selectedCert, setSelectedCert] = useState<Credential | null>(null);

  // Edit / Create Modal State
  const [editingCert, setEditingCert] = useState<Credential | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formIssuer, setFormIssuer] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState<'certification' | 'award' | 'hackathon'>('certification');
  const [formDescription, setFormDescription] = useState('');
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [formCredentialId, setFormCredentialId] = useState('');
  const [formVerifyUrl, setFormVerifyUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deletingCert, setDeletingCert] = useState<Credential | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  // Fetch credentials from MongoDB API
  const fetchCredentials = async () => {
    try {
      const res = await api.get<Credential[]>('/credentials');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCredentials(res.data);
      }
    } catch (err) {
      console.error('[Credentials fetch error]', err);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCert) setSelectedCert(null);
        if (editingCert || isCreating) handleCloseEditModal();
        if (deletingCert) setDeletingCert(null);
      }
    };
    if (selectedCert || editingCert || isCreating || deletingCert) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedCert, editingCert, isCreating, deletingCert]);

  // Open Edit Modal with fresh card data
  const handleOpenEdit = (item: Credential) => {
    triggerAdminAction(() => {
      setEditingCert(item);
      setIsCreating(false);
      setFormTitle(item.title || '');
      setFormIssuer(item.issuer || '');
      setFormDate(item.date || '');
      setFormCategory(item.category || 'certification');
      setFormDescription(item.description || '');
      setFormSkills(item.skills ? [...item.skills] : []);
      setSkillInput('');
      setFormCredentialId(item.credentialId || '');
      setFormVerifyUrl(item.verifyUrl || '');
      setFormImageUrl(item.imageUrl || '');
      setImageFile(null);
      setImagePreview(item.imageUrl || '');
    });
  };

  // Open Create Modal
  const handleOpenAdd = () => {
    triggerAdminAction(() => {
      setEditingCert(null);
      setIsCreating(true);
      setFormTitle('');
      setFormIssuer('');
      setFormDate(new Date().getFullYear().toString());
      setFormCategory('certification');
      setFormDescription('');
      setFormSkills(['AWS S3', 'Cloud']);
      setSkillInput('');
      setFormCredentialId('');
      setFormVerifyUrl('');
      setFormImageUrl('');
      setImageFile(null);
      setImagePreview('');
    });
  };

  // Close Edit / Create Modal
  const handleCloseEditModal = () => {
    setEditingCert(null);
    setIsCreating(false);
    setImageFile(null);
    setImagePreview('');
    setSkillInput('');
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (item: Credential) => {
    triggerAdminAction(() => {
      setDeletingCert(item);
    });
  };

  // Handle Image File Selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Tag Input
  const handleAddSkill = () => {
    const tag = skillInput.replace(',', '').trim();
    if (tag && !formSkills.includes(tag)) {
      setFormSkills([...formSkills, tag]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setFormSkills(formSkills.filter((s) => s !== tagToRemove));
  };

  // Save changes (Create or Update by MongoDB _id)
  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formIssuer.trim()) {
      showToast('✗ Title and issuer are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formImageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadFile(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          showToast('✗ Image upload failed, preserving old image');
        }
      }

      const payload = {
        title: formTitle.trim(),
        issuer: formIssuer.trim(),
        date: formDate.trim(),
        category: formCategory,
        description: formDescription.trim(),
        skills: formSkills,
        credentialId: formCredentialId.trim(),
        verifyUrl: formVerifyUrl.trim(),
        imageUrl: finalImageUrl,
      };

      if (isCreating) {
        const res = await api.post<{ success: boolean; data: Credential }>('/credentials', payload);
        if (res.data.success && res.data.data) {
          setCredentials((prev) => [...prev, res.data.data]);
          showToast('✓ Credential created successfully');
          handleCloseEditModal();
        } else {
          showToast('✗ Failed to create credential');
        }
      } else if (editingCert) {
        const targetId = editingCert._id || editingCert.id;
        const res = await api.put<{ success: boolean; data: Credential }>(`/credentials/${targetId}`, payload);
        if (res.data.success && res.data.data) {
          const updated = res.data.data;
          setCredentials((prev) =>
            prev.map((item) => {
              const itemId = item._id || item.id;
              return itemId === targetId ? updated : item;
            })
          );
          showToast('✓ Credential updated successfully');
          handleCloseEditModal();
        } else {
          showToast('✗ Failed to update credential');
        }
      }
    } catch (err: any) {
      console.error('[Save Credential Error]', err);
      showToast('✗ ' + (err.response?.data?.message || 'Failed to save credential'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete by MongoDB _id
  const handleConfirmDelete = async () => {
    if (!deletingCert) return;
    const targetId = deletingCert._id || deletingCert.id;
    if (!targetId) return;

    setIsDeletingLoading(true);
    try {
      const res = await api.delete<{ success: boolean }>(`/credentials/${targetId}`);
      if (res.data.success) {
        setCredentials((prev) => prev.filter((item) => (item._id || item.id) !== targetId));
        showToast('✓ Credential deleted');
        setDeletingCert(null);
      } else {
        showToast('✗ Failed to delete credential');
      }
    } catch (err: any) {
      console.error('[Delete Credential Error]', err);
      showToast('✗ ' + (err.response?.data?.message || 'Failed to delete credential'));
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Filter credentials data
  const filteredAchievements = credentials.filter((item) => {
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
        
        {/* Header Section Label */}
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

        {/* Filter Bar + Admin Add Button */}
        <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/[0.04] pb-3 flex-wrap">
          <div className="flex items-center gap-3">
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

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[#00D2FF] text-[11px] font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,210,255,0.1)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Credential
            </button>
          )}
        </div>

        {/* 2-Column Split-Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((item, idx) => {
              const cardKey = item._id || item.id || `cred-${idx}`;
              return (
                <motion.div
                  key={cardKey}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlassCard
                    className="p-5 h-full group relative transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,210,255,0.08)] hover:-translate-y-[2px]"
                    id={`achievement-card-${cardKey}`}
                  >
                    {/* Admin Action Buttons (Edit / Delete) */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          className="w-8 h-8 rounded-full bg-[#0f0a1e]/80 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/25 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                          title="Edit Credential"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(item);
                          }}
                          className="w-8 h-8 rounded-full bg-[#0f0a1e]/80 border border-white/10 hover:border-red-500/50 hover:bg-red-500/25 text-slate-300 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-5 h-full w-full">
                      {/* Left Side: Image Preview */}
                      <div
                        onClick={() => setSelectedCert(item)}
                        className="w-full sm:w-[42%] aspect-[4/3] sm:aspect-auto sm:h-full relative overflow-hidden rounded-xl border border-cyan-500/10 bg-black/55 flex items-center justify-center cursor-pointer group/img"
                      >
                        {item.imageUrl ? (
                          <img
                            src={resolveBackendAssetUrl(item.imageUrl)}
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
                          <div className="flex items-center justify-between gap-2 mb-2 pr-16 sm:pr-14">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                              {item.issuer}
                            </span>
                            <span className="text-[9px] text-[#00D2FF] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 shrink-0">
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
                            {item.skills && item.skills.map((skill) => (
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
              );
            })}
          </AnimatePresence>
        </div>

        {/* ================================================================= */}
        {/* EDIT / CREATE CREDENTIAL MODAL */}
        {/* ================================================================= */}
        <AnimatePresence>
          {(editingCert || isCreating) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEditModal}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-2xl w-full bg-[#080a0e] rounded-2xl border border-cyan-500/30 p-6 relative flex flex-col shadow-[0_0_40px_rgba(0,210,255,0.15)] my-auto max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white tracking-wide">
                      {isCreating ? 'ADD CREDENTIAL' : 'EDIT CREDENTIAL'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isCreating ? 'Create a new certification or achievement card' : 'Modify credential details and certificate image'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseEditModal}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveCredential} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. AWS Certified Cloud Foundations"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                    />
                  </div>

                  {/* 2-col row: Issuer & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Issuer / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={formIssuer}
                        onChange={(e) => setFormIssuer(e.target.value)}
                        placeholder="e.g. Amazon Web Services (AWS)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Year / Date
                      </label>
                      <input
                        type="text"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        placeholder="e.g. 2024"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* 2-col row: Category Type & Status Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Type / Category
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e121a] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                      >
                        <option value="certification">Certification (Certifications Tab)</option>
                        <option value="award">Award (Achievements Tab)</option>
                        <option value="hackathon">Hackathon (Achievements Tab)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Status / Credential ID
                      </label>
                      <input
                        type="text"
                        value={formCredentialId}
                        onChange={(e) => setFormCredentialId(e.target.value)}
                        placeholder="e.g. AWS-CF-VALIDATED (Empty for Recognition)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Validated foundational knowledge of AWS Cloud infrastructure..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Skills Tags */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Skills / Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-xl bg-white/[0.02] border border-white/10 min-h-[42px] items-center">
                      {formSkills.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-[#00D2FF] flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(tag)}
                            className="text-cyan-400 hover:text-white ml-0.5 cursor-pointer bg-transparent border-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Add skill tag, press Enter..."
                        className="flex-1 bg-transparent text-white text-xs outline-none px-2 py-1 min-w-[140px]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">Press Enter or comma to add a skill tag</span>
                  </div>

                  {/* Certificate Image Preview & Upload */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Certificate Image
                    </label>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Preview Box */}
                      <div className="w-28 h-20 rounded-lg bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {imagePreview ? (
                          <img
                            src={resolveBackendAssetUrl(imagePreview)}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-500 text-center px-1">No Image</span>
                        )}
                      </div>

                      {/* Upload CTA Controls */}
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[#00D2FF] text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{imagePreview ? 'Replace Certificate Image' : 'Upload Certificate Image'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={handleImageFileChange}
                            />
                          </label>

                          {imagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                                setFormImageUrl('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium cursor-pointer transition-all"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Uploads to Cloudinary permanent CDN (JPG, PNG, WebP supported)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification URL */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Verification / Credential URL
                    </label>
                    <input
                      type="text"
                      value={formVerifyUrl}
                      onChange={(e) => setFormVerifyUrl(e.target.value)}
                      placeholder="https://aws.amazon.com/verification or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00D2FF] text-white text-xs outline-none transition-colors"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#080A0C] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ================================================================= */}
        <AnimatePresence>
          {deletingCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCert(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full bg-[#080a0e] rounded-2xl border border-red-500/30 p-6 relative flex flex-col items-center text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold font-display text-white mb-2">
                  Delete Credential?
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-medium">"{deletingCert.title}"</span>? This action cannot be undone.
                </p>

                <div className="flex items-center gap-3 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setDeletingCert(null)}
                    disabled={isDeletingLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeletingLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* PREMIUM CERTIFICATE LIGHTBOX MODAL */}
        {/* ================================================================= */}
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
                      src={resolveBackendAssetUrl(selectedCert.imageUrl)}
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
