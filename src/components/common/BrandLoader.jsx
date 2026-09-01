import React from 'react';

export default function BrandLoader({ text = 'Loading ValueLife Essentials...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center animate-fadeIn">
      {/* ANIMATED LOGO CONTAINER WITH ELEGANT GLOW AND PULSE EFFECT */}
      <div className="relative flex items-center justify-center">
        {/* Soft glowing ambient aura behind logo */}
        <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
        
        {/* Subtle rotating leaves accent ring */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-emerald-600/40 animate-spin" style={{ animationDuration: '8s' }}></div>
        
        {/* BRAND LOGO IMAGE WITH SMOOTH SCALE PULSE */}
        <img 
          src="/valuelife_logo.png" 
          alt="ValueLife Essentials Logo Loader" 
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10 drop-shadow-md animate-pulse transition-transform duration-700"
        />
      </div>

      {/* TYPOGRAPHY & ELEGANT SPINNER DOTS */}
      <div className="space-y-1 z-10">
        <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm sm:text-base text-gray-800 tracking-tight font-['Outfit']">
          <span>{text}</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
        <p className="text-[11px] font-bold text-emerald-800/80 uppercase tracking-widest">
          100% Pure & Organic Essentials
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex items-center justify-center">
      {content}
    </div>
  );
}
