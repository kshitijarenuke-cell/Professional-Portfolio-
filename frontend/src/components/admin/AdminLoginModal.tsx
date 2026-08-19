import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-[24px] border border-white/[0.08] bg-zinc-950/85 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(0,210,255,0.18)] flex flex-col justify-start select-none">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer transition-colors border-0 bg-transparent"
          title="Close"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-full bg-gradient-to-br from-[#00D2FF]/20 to-[#06b6d4]/20 border border-[#00D2FF]/30 items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" className="w-5 h-5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-sora">Admin Gateway</h3>
          <p className="text-xs text-gray-400 font-light mt-1">Authenticate to access CMS controls</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Admin Email (kshitija@gmail.com)"
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#06b6d4] text-white text-xs font-semibold hover:opacity-90 shadow-[0_4px_20px_rgba(0,210,255,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
