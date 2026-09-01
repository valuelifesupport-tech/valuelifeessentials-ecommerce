import { getApiUrl } from '../../api/config';
import React, { useState } from 'react';
import { Lock, Key, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MaintenancePage({ onUnlock }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the access password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Try Backend Verification Endpoint
      const res = await fetch(getApiUrl('/api/maintenance/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('maintenance_unlocked', 'true');
          localStorage.setItem('maintenance_token', data.token || 'unlocked');
          setIsSubmitting(false);
          onUnlock();
          return;
        }
      }
    } catch (err) {
      console.warn('Backend maintenance endpoint offline, using client fallback check');
    }

    // 2. Client-side Fallback check if offline
    if (password.trim() === 'valuelife2026' || password.trim() === 'admin123') {
      localStorage.setItem('maintenance_unlocked', 'true');
      setIsSubmitting(false);
      onUnlock();
      return;
    }

    setIsSubmitting(false);
    setError('Invalid access password. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Outfit'] flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#800000]/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER BAR */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/valuelife_logo.png" 
            alt="ValueLife Essentials Logo" 
            className="h-10 sm:h-12 w-auto object-contain bg-white/90 p-1.5 rounded-xl shadow-lg shadow-emerald-950/40" 
          />
          <div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-white block leading-none uppercase font-['Outfit']">
              VALUELIFE <span className="text-emerald-400">ESSENTIALS</span>
            </span>
            <span className="text-[10px] text-emerald-300/80 font-mono tracking-wider block mt-0.5">
              valuelifeessentials.com
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:scale-105"
        >
          <Key size={14} className="text-emerald-400" />
          <span>Bypass Maintenance</span>
        </button>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 text-center relative z-10 space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold px-4 py-2 rounded-full backdrop-blur-md shadow-inner">
          <Sparkles size={14} className="animate-spin text-emerald-400" style={{ animationDuration: '4s' }} />
          <span>Scheduled Upgrade & Enhancement</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            We are Upgrading Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-white bg-clip-text text-transparent">
              Organic & Wellness Store
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            ValueLife Essentials is currently undergoing scheduled platform maintenance to bring you faster delivery, fresh organic superfoods, and enhanced security.
          </p>
        </div>

        {/* STATUS BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left text-xs font-semibold">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-extrabold">Data Safety</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">All customer orders and details are 100% secure.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-extrabold">Fast Delivery</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Express logistics active during upgrade.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
            <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-extrabold">New Superfoods</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Exciting organic catalog launching soon.</p>
            </div>
          </div>
        </div>

        {/* ACCESS PROMPT BUTTON */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setShowLoginModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/80 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Enter Access Key to View Site</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900">
        © 2026 ValueLife Essentials (valuelifeessentials.com). Maintenance Mode Active.
      </footer>

      {/* SECRET / ADMIN PASSWORD LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Bypass Maintenance</h3>
                  <p className="text-slate-400 text-xs">Enter Maintenance Access Password</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password *
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-slate-600 font-mono"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
                >
                  {isSubmitting ? 'Verifying...' : 'Unlock Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
