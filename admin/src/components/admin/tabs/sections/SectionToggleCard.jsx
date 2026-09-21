import React from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

export default function SectionToggleCard({ icon, title, description, configKey, value, onToggle, extraActions, children, isTicker = false }) {
  const isOn = value !== 0;

  return (
    <div className={`p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md ${children ? 'space-y-4' : 'space-y-3'}`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${children ? 'border-b border-slate-800 pb-3' : ''}`}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <span className="font-extrabold text-sm text-white block">{title}</span>
            <p className="text-slate-400 text-xs">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {extraActions}
          <button 
            type="button"
            onClick={() => onToggle(configKey, isOn ? 0 : 1)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              isOn
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            data-reticle-target={`admin-toggle-${configKey.replace(/_/g, '-')}`}
          >
            {isOn ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{isOn ? `${isTicker ? 'TICKER' : 'SECTION'} ENABLED (ON)` : `${isTicker ? 'TICKER' : 'SECTION'} DISABLED (OFF)`}</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
