import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, uploadFile } from '../../api/client';
import type { DashboardStats, MessageData, Project, TechItem, AboutData, ContactData } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { isDashboardOpen, closeDashboard, activeDashTab, setActiveDashTab, logout, showToast } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ projects: 0, skills: 0, messages: 0 });
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [techList, setTechList] = useState<TechItem[]>([]);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);

  // Form states for About Tab
  const [aboutHeading, setAboutHeading] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [aboutStat1, setAboutStat1] = useState('');
  const [aboutStat2, setAboutStat2] = useState('');
  const [aboutStat3, setAboutStat3] = useState('');

  // Form states for Contact Tab
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [contactAvailable, setContactAvailable] = useState(true);
  const [socialGithub, setSocialGithub] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialLeetcode, setSocialLeetcode] = useState('');

  // Form states for Skills Tab
  const [newTechName, setNewTechName] = useState('');
  const [newTechCategory, setNewTechCategory] = useState('Frontend');
  const [newTechIcon] = useState('fas fa-cubes');

  const loadStats = async () => {
    try {
      const res = await api.get<{ success: boolean; stats: DashboardStats; recentMessages: MessageData[] }>('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.get<MessageData[]>('/messages');
      if (res.data) setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.get<Project[]>('/projects');
      if (res.data) setProjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTech = async () => {
    try {
      const res = await api.get<TechItem[]>('/techstack');
      if (res.data) setTechList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAbout = async () => {
    try {
      const res = await api.get<AboutData>('/about');
      if (res.data) {
        setAboutData(res.data);
        setAboutHeading(res.data.heading || '');
        setAboutDesc(res.data.description || '');
        setAboutStat1(res.data.stats?.[0]?.value || '');
        setAboutStat2(res.data.stats?.[1]?.value || '');
        setAboutStat3(res.data.stats?.[2]?.value || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadContact = async () => {
    try {
      const res = await api.get<ContactData>('/contact');
      if (res.data) {
        setContactData(res.data);
        setContactEmail(res.data.email || '');
        setContactPhone(res.data.phone || '');
        setContactLocation(res.data.location || '');
        setContactAvailable(res.data.available !== false);
        setSocialGithub(res.data.socials?.github || '');
        setSocialLinkedin(res.data.socials?.linkedin || '');
        setSocialInstagram(res.data.socials?.instagram || '');
        setSocialLeetcode(res.data.socials?.leetcode || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isDashboardOpen) {
      loadStats();
      if (activeDashTab === 'messages') loadMessages();
      if (activeDashTab === 'projects') loadProjects();
      if (activeDashTab === 'skills') loadTech();
      if (activeDashTab === 'about') loadAbout();
      if (activeDashTab === 'contact') loadContact();
    }
  }, [isDashboardOpen, activeDashTab]);

  if (!isDashboardOpen) return null;

  const handleSaveAbout = async () => {
    try {
      const res = await api.put<{ success: boolean; data: AboutData }>('/about', {
        heading: aboutHeading,
        description: aboutDesc,
        stats: [
          { label: 'Experience', value: aboutStat1 },
          { label: 'Projects', value: aboutStat2 },
          { label: 'Skills', value: aboutStat3 },
        ],
      });
      if (res.data.success) {
        showToast('✓ About section updated');
      } else {
        showToast('✗ Update failed');
      }
    } catch (e) {
      showToast('✗ Update failed');
    }
  };

  const handleSaveContact = async () => {
    try {
      const res = await api.put<{ success: boolean; data: ContactData }>('/contact', {
        email: contactEmail,
        phone: contactPhone,
        location: contactLocation,
        available: contactAvailable,
        socials: {
          github: socialGithub,
          linkedin: socialLinkedin,
          instagram: socialInstagram,
          leetcode: socialLeetcode,
        },
      });
      if (res.data.success) {
        showToast('✓ Contact details saved');
      } else {
        showToast('✗ Save failed');
      }
    } catch (e) {
      showToast('✗ Save failed');
    }
  };

  const handleAddTechFromDash = async () => {
    if (!newTechName.trim()) return;
    try {
      const res = await api.post<{ success: boolean; data: TechItem }>('/techstack', {
        name: newTechName.trim(),
        category: newTechCategory,
        icon: newTechIcon.trim() || 'fas fa-cubes',
      });
      if (res.data.success) {
        setTechList((prev) => [...prev, res.data.data]);
        setNewTechName('');
        showToast('✓ Skill added');
      }
    } catch (e) {
      showToast('✗ Skill add failed');
    }
  };

  const handleDeleteTechFromDash = async (id: string) => {
    try {
      const res = await api.delete<{ success: boolean }>(`/techstack/${id}`);
      if (res.data.success) {
        setTechList((prev) => prev.filter((t) => t.id !== id));
        showToast('✓ Skill deleted');
      }
    } catch (e) {
      showToast('✗ Delete failed');
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await api.get('/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('✓ Backup exported successfully');
    } catch (e) {
      showToast('✗ Export failed');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const payload = JSON.parse(ev.target?.result as string);
        const res = await api.post<{ success: boolean; message: string }>('/admin/import', payload);
        if (res.data.success) {
          showToast('✓ Portfolio data imported successfully');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('✗ Import failed: ' + res.data.message);
        }
      } catch (err) {
        showToast('✗ Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleResumeReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast('Uploading Resume PDF...');
    const url = await uploadFile(file);
    if (url) {
      await api.put('/about', { ...aboutData, resumeUrl: url });
      await api.put('/contact', { ...contactData, resumeUrl: url });
      showToast('✓ Resume updated successfully');
      loadAbout();
      loadContact();
    } else {
      showToast('✗ Resume upload failed');
    }
  };

  return (
    <div id="admin-dashboard-overlay" className="fixed inset-0 z-[1900] flex bg-[#07070A] flex-row select-none overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="dash-sidebar flex flex-col justify-between p-7 border-r border-white/10 w-64 bg-zinc-950/80">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D2FF] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-sm font-sora">
              A
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">Admin Control</h4>
              <p className="text-[8px] text-cyan-400 font-light uppercase tracking-wider">Management Console</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 3h7v9H3zm11 0h7v5h-7zm0 9h7v9h-7zM3 16h7v5H3z' },
              { id: 'about', label: 'About Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
              { id: 'skills', label: 'Skills Manager', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { id: 'contact', label: 'Contact Info', icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' },
              { id: 'messages', label: 'Messages', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
              { id: 'projects', label: 'Projects List', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
              { id: 'backup', label: 'Backup & Restore', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' },
            ].map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveDashTab(tab.id)}
                className={`dash-menu-item ${activeDashTab === tab.id ? 'active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-6 border-t border-white/10">
          <button
            onClick={closeDashboard}
            type="button"
            className="w-full py-2 px-3 rounded-lg border border-white/10 text-xs text-gray-300 hover:bg-white/5 transition-all text-left flex items-center gap-2 cursor-pointer bg-transparent"
          >
            <i className="fas fa-eye"></i> View Website
          </button>
          <button
            onClick={logout}
            type="button"
            className="w-full py-2 px-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition-all text-left flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-right-from-bracket"></i> Logout Admin
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dash-content flex-1 p-8 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeDashTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-sora">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-white font-sora">{stats.projects}</p>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Tech Stack Skills</p>
                <p className="text-3xl font-bold text-white font-sora">{stats.skills}</p>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Messages Received</p>
                <p className="text-3xl font-bold text-white font-sora">{stats.messages}</p>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeDashTab === 'about' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white font-sora">Edit About Section</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Heading Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  value={aboutHeading}
                  onChange={(e) => setAboutHeading(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Biography Description</label>
                <textarea
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                  value={aboutDesc}
                  onChange={(e) => setAboutDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Stat 1 (Exp)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    value={aboutStat1}
                    onChange={(e) => setAboutStat1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Stat 2 (Projects)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    value={aboutStat2}
                    onChange={(e) => setAboutStat2(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Stat 3 (Skills)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    value={aboutStat3}
                    onChange={(e) => setAboutStat3(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveAbout}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all cursor-pointer border-0"
              >
                Save About Section
              </button>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeDashTab === 'skills' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white font-sora">Manage Tech Stack</h3>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add New Skill</h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Skill name e.g. React"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                />
                <select
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  value={newTechCategory}
                  onChange={(e) => setNewTechCategory(e.target.value)}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Languages">Languages</option>
                  <option value="Tools">Tools</option>
                  <option value="Deployment">Deployment</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddTechFromDash}
                  className="bg-cyan-600 text-white rounded-xl text-xs font-bold py-2 px-4 hover:bg-cyan-700 transition-all cursor-pointer border-0"
                >
                  Add Skill
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {techList.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <i className={`${tech.icon} text-cyan-400`}></i>
                    <span className="font-bold text-white">{tech.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase">({tech.category})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTechFromDash(tech.id)}
                    className="text-red-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeDashTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white font-sora">Edit Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Location</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Availability Status</label>
                <select
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  value={contactAvailable ? 'true' : 'false'}
                  onChange={(e) => setContactAvailable(e.target.value === 'true')}
                >
                  <option value="true">Available (Green badge)</option>
                  <option value="false">Busy (Amber badge)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">GitHub URL</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    value={socialGithub}
                    onChange={(e) => setSocialGithub(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveContact}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all cursor-pointer border-0"
              >
                Save Contact Info
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeDashTab === 'messages' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-sora">Contact Form Messages</h3>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">
                      {msg.name} ({msg.email})
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-medium">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#00D2FF] font-bold">{msg.subject}</p>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
              {messages.length === 0 && <div className="text-xs text-gray-500 py-4">No messages received yet.</div>}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeDashTab === 'projects' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-sora">Projects Directory</h3>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-md truncate">{p.description}</p>
                  </div>
                  <div className="text-xs text-cyan-400 font-bold">{p.technologies?.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BACKUP & RESTORE TAB */}
        {activeDashTab === 'backup' && (
          <div className="space-y-6 max-w-lg">
            <h3 className="text-xl font-bold text-white font-sora">Database Backup &amp; Restore</h3>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Export Database Backup</h4>
                <p className="text-xs text-gray-400 mb-3">Download a JSON snapshot of all PostgreSQL tables.</p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all cursor-pointer border-0"
                >
                  <i className="fas fa-download mr-1.5"></i> Export Backup JSON
                </button>
              </div>
              <hr className="border-white/10" />
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Import Database Backup</h4>
                <p className="text-xs text-gray-400 mb-3">Upload a JSON backup file to restore database state.</p>
                <label className="px-4 py-2 rounded-xl bg-zinc-800 border border-white/20 text-white text-xs font-bold hover:bg-zinc-700 transition-all cursor-pointer inline-block">
                  <i className="fas fa-upload mr-1.5"></i> Select Backup File
                  <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
                </label>
              </div>
              <hr className="border-white/10" />
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Upload/Replace Resume PDF</h4>
                <label className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer inline-block">
                  <i className="fas fa-file-pdf mr-1.5"></i> Select Resume PDF
                  <input type="file" accept=".pdf" className="hidden" onChange={handleResumeReplace} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
