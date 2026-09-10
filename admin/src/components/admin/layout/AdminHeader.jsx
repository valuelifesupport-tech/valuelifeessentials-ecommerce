import React from 'react';
import { Menu, LogOut } from 'lucide-react';

export default function AdminHeader({
  activeTab,
  liveUsers = 0,
  onOpenMobileMenu,
  onLogout
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-3 sm:p-4 flex justify-between items-center sticky top-0 z-30" data-reticle-target="admin-header">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button 
          onClick={onOpenMobileMenu} 
          className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-sm shrink-0"
          aria-label="Open Admin Menu"
          data-reticle-target="admin-hamburger-btn"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80 uppercase font-mono tracking-wider hidden xs:inline-block shrink-0">
            {activeTab}
          </span>
          <h1 className="text-sm sm:text-lg font-extrabold text-white truncate max-w-[170px] sm:max-w-none font-['Outfit']">
            Master Admin Panel
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse hidden lg:flex">
          ● Live Users: {liveUsers}
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
          title="Logout Admin Session"
          data-reticle-target="admin-logout-btn"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
          AD
        </div>
      </div>
    </header>
  );
}
