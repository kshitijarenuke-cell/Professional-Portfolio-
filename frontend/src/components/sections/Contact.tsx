import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, resolveBackendAssetUrl } from '../../api/client';
import type { ContactData } from '../../types';
import { SparkleResumeButton } from '../ui/SparkleResumeButton';

export const Contact: React.FC = () => {
  const { triggerAdminAction, openDashboard, showToast } = useAuth();
  const [contact, setContact] = useState<ContactData | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContact = async () => {
    try {
      const res = await api.get<ContactData>('/contact');
      if (res.data) setContact(res.data);
    } catch (e) {
      console.error('[Contact fetch error]', e);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleEditContactClick = () => {
    triggerAdminAction(() => {
      openDashboard('contact');
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ ${label} Copied`);
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('✗ Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string }>('/messages', {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.data.success) {
        showToast('✓ Message sent successfully!');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        showToast('✗ ' + (res.data.message || 'Failed to send message'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Server Error. Try again.';
      showToast('✗ ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailVal = contact?.email || 'kshitijarenuke@gmail.com';
  const phoneVal = contact?.phone || '+91 8850535352';
  const locationVal = contact?.location || 'Lalbaug, Mumbai';
  const isAvailable = contact?.available !== false;

  return (
    <section id="contact" className="relative pt-16 pb-0 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-start overflow-hidden bg-[#07070A]">
      <div className="absolute top-1/4 left-1/10 w-[600px] h-[600px] bg-[#00D2FF]/5 opacity-60 blur-[140px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/10 w-[600px] h-[600px] bg-[#06b6d4]/3 opacity-40 blur-[140px] pointer-events-none rounded-full"></div>

      <div className="text-center mb-4 z-10">
        <span className="text-sm sm:text-base font-bold tracking-[0.25em] text-[#00D2FF] uppercase border border-cyan-500/20 bg-cyan-500/5 px-3.5 py-1 rounded-full backdrop-blur-md font-display">
          Contact
        </span>
      </div>

      <div className="text-center max-w-3xl mx-auto mb-12 z-10 select-none">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 font-display leading-tight flex flex-col items-center gap-3">
          <span>Let's Build Something</span>
          <span className="bg-gradient-to-r from-[#00D2FF] via-[#06b6d4] to-[#00D2FF] bg-clip-text text-transparent">
            Amazing Together
          </span>
            <button
              onClick={handleEditContactClick}
              className="admin-only edit-contact-btn text-xs text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 px-2.5 py-1 rounded-full hover:bg-cyan-500/10 cursor-pointer transition-all inline-flex items-center gap-1.5"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 11, height: 11 }}>
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Details
            </button>
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-light max-w-md mx-auto leading-relaxed">
          Have a project in mind or want to work together? I'd love to hear from you.
        </p>
      </div>

      {/* Horizontal Contact Cards */}
      <div className="relative w-full max-w-[85%] lg:max-w-[80%] grid grid-cols-1 md:grid-cols-3 gap-4 z-10 mb-8">
        {/* Email Card */}
        <div
          onClick={() => copyToClipboard(emailVal, 'Email')}
          className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group/info"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Email</p>
              <p className="text-xs text-gray-300 font-medium">{emailVal}</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600 group-hover/info:text-cyan-400 transition-colors">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>

        {/* Phone Card */}
        <div
          onClick={() => copyToClipboard(phoneVal, 'Phone')}
          className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group/info"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Phone</p>
              <p className="text-xs text-gray-300 font-medium">{phoneVal}</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600 group-hover/info:text-cyan-400 transition-colors">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>

        {/* Location Card */}
        <div
          onClick={() => copyToClipboard(locationVal, 'Location')}
          className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group/info"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Location</p>
              <p className="text-xs text-gray-300 font-medium">{locationVal}</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600 group-hover/info:text-cyan-400 transition-colors">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>
      </div>

      {/* Main Glass Form Container */}
      <div className="relative w-full max-w-[85%] lg:max-w-[80%] rounded-[24px] border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] z-10 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left info column */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-sora">Professional Profiles</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Connect with me across the platforms where I share my work, experience, and technical projects.
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={contact?.socials?.github || 'https://github.com/kshitijarenuke-cell'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-gray-300 hover:text-[#00D2FF] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <i className="fab fa-github text-sm text-gray-400 group-hover:text-[#00D2FF]" />
                  <span className="text-xs font-medium">GitHub</span>
                </div>
                <span className="text-xs text-[#00D2FF] group-hover:translate-x-1 transition-transform">
                  github.com/kshitijarenuke-cell &rarr;
                </span>
              </a>

              <a
                href={contact?.socials?.linkedin || 'https://www.linkedin.com/in/kshitija-renuke-5596452b4/'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-gray-300 hover:text-[#00D2FF] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <i className="fab fa-linkedin-in text-sm text-gray-400 group-hover:text-[#00D2FF]" />
                  <span className="text-xs font-medium">LinkedIn</span>
                </div>
                <span className="text-xs text-[#00D2FF] group-hover:translate-x-1 transition-transform">
                  linkedin.com/in/kshitija-renuke &rarr;
                </span>
              </a>

              <a
                href="https://twitter.com/kshitijarenuke"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-gray-300 hover:text-[#00D2FF] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <i className="fab fa-x-twitter text-sm text-gray-400 group-hover:text-[#00D2FF]" />
                  <span className="text-xs font-medium">Twitter / X</span>
                </div>
                <span className="text-xs text-[#00D2FF] group-hover:translate-x-1 transition-transform">
                  @kshitijarenuke &rarr;
                </span>
              </a>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Status</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                {isAvailable ? 'Open for Internship Opportunities' : 'Currently fully booked'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{locationVal}</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for hire
              </span>
            </div>

            {/* Resume */}
            <div>
              <div>
                <SparkleResumeButton
                  as="a"
                  pdfUrl={resolveBackendAssetUrl(contact?.resumeUrl || '/resume/Kshitija-Renuke-Resume.pdf')}
                  pdfFileName="Kshitija-Renuke-Resume.pdf"
                  href={resolveBackendAssetUrl(contact?.resumeUrl || '/resume/Kshitija-Renuke-Resume.pdf')}
                  download="Kshitija-Renuke-Resume.pdf"
                  className="text-xs text-[#00D2FF] hover:text-[#06b6d4] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Latest Resume (PDF)</span>
                </SparkleResumeButton>
              </div>
            </div>
          </div>

          {/* Right message form */}
          <div className="lg:col-span-7">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-white mb-2 font-sora">Send a Direct Message</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Feel free to drop a message regarding project inquiries or career opportunities.
              </p>
            </div>
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    placeholder="John Doe"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Project Inquiry"
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell me about your project or inquiry..."
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#06b6d4] text-white text-xs font-semibold hover:opacity-90 shadow-[0_4px_20px_rgba(0,210,255,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
