import React from 'react';

export default function SelectedItemsPills({ items, onRemove, labelKey }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {items.map(item => {
        let displayLabel = item.name || item.title;
        if (labelKey === 'customer') {
          displayLabel = `👤 ${item.name} (${item.email})`;
        } else if (labelKey && item[labelKey]) {
          displayLabel = item[labelKey];
        }
        
        return (
          <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>{displayLabel}</span>
            <button 
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-emerald-400 hover:text-rose-400 font-bold"
            >
              ✕
            </button>
          </span>
        );
      })}
    </div>
  );
}
