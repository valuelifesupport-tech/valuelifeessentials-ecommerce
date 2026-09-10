import React from 'react';
import { ExternalLink, LogOut } from 'lucide-react';
import AdminNavLinks from './AdminNavLinks';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  openSubmenus,
  toggleSubmenu,
  counts,
  fetchAdminData,
  onExitAdmin,
  onLogout
}) {
  return (
    <aside 
      className="w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 hidden md:flex overflow-y-auto custom-scrollbar z-40"
      data-reticle-target="admin-sidebar"
    >
      <div className="space-y-6">
        {/* BRAND LOGO HEADER */}
        <div className="flex items-center justify-between gap-3 px-2 py-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src="/valuelife_logo.png" 
              alt="ValueLife Essentials Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white p-0.5 shadow-lg shrink-0" 
            />
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight font-['Outfit'] truncate uppercase">
                VALUELIFE ESSENTIALS
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block truncate">
                valuelifeessentials.com
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <AdminNavLinks 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSubmenus={openSubmenus}
          toggleSubmenu={toggleSubmenu}
          counts={counts}
          fetchAdminData={fetchAdminData}
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-4 border-t border-slate-800 space-y-2 shrink-0">
        <button 
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          data-reticle-target="admin-exit-storefront-btn"
        >
          <ExternalLink size={16} /> Return to Storefront
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs font-bold py-2.5 rounded-xl border border-rose-800/80 transition-all cursor-pointer shadow-sm"
          data-reticle-target="admin-sidebar-logout-btn"
        >
          <LogOut size={16} /> Logout Admin Session
        </button>
      </div>
    </aside>
  );
}
