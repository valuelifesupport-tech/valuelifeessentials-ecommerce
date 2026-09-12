import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';

export default function NewsletterBanner({ sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_newsletter) === 0) return null;

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <section className="bg-[#0e382b] text-white py-12 sm:py-16 relative overflow-hidden" data-reticle-target="newsletter-banner-section">
      {/* Botanical Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Stay in the ValueLife Loop
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
              Get exclusive offers, herbal health tips, fresh harvest drops and wellness recipes.
            </p>
          </div>

          {/* Right Subscription Form */}
          <div className="w-full max-w-md">
            {isSubscribed ? (
              <div className="bg-emerald-900/80 border border-emerald-500/50 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-200 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Thank you for subscribing! Welcome to the ValueLife family. 🌿</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-full border border-white/20 shadow-lg">
                <div className="pl-3 text-emerald-300">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-white placeholder-emerald-200/70 focus:outline-none px-2 font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#164e3f] hover:bg-[#124734] border border-emerald-400/30 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all flex items-center gap-1.5 shrink-0 shadow cursor-pointer active:scale-95"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
