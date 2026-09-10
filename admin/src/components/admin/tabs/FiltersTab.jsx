import React from 'react';
import { Trash2 } from 'lucide-react';

export default function FiltersTab({
  filterGroups = [],
  newGroupForm,
  setNewGroupForm,
  handleAddFilterGroup,
  handleDeleteFilterGroup,
  handleDeleteFilterOption,
  newOptionInputs = {},
  setNewOptionInputs,
  handleAddFilterOption
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-filters-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Dynamic Product Filters Manager</h3>
          <p className="text-xs text-slate-400">Manage storefront catalog filter pills (Form, Dietary, Health Benefit, Price Range, Pack Size).</p>
        </div>
      </div>

      {/* CREATE FILTER GROUP FORM */}
      <form onSubmit={handleAddFilterGroup} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3" data-reticle-target="admin-create-filter-group-form">
        <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">+ Add New Filter Group</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input 
            type="text" required
            placeholder="Filter Group Name (e.g. Health Benefit, Dietary, Form)"
            value={newGroupForm.name}
            onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
            data-reticle-target="admin-filter-group-name-input"
          />
          <input 
            type="text"
            placeholder="Key handle (e.g. benefit, form, dietary)"
            value={newGroupForm.filter_key}
            onChange={(e) => setNewGroupForm({ ...newGroupForm, filter_key: e.target.value })}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
            data-reticle-target="admin-filter-group-key-input"
          />
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs shadow-md cursor-pointer"
            data-reticle-target="admin-submit-filter-group-btn"
          >
            + Create Filter Group
          </button>
        </div>
      </form>

      {/* FILTER GROUPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-reticle-target="admin-filter-groups-grid">
        {filterGroups.map(grp => (
          <div key={grp.id} className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm relative" data-reticle-target={`admin-filter-group-card-${grp.id}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <span className="font-extrabold text-base text-white">{grp.name}</span>
                <span className="ml-2 font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  key: {grp.filter_key}
                </span>
              </div>
              <button 
                onClick={() => handleDeleteFilterGroup(grp.id)}
                className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950/60 rounded border border-rose-900 text-xs cursor-pointer"
                title="Delete Filter Group"
                data-reticle-target={`admin-delete-filter-group-${grp.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* EXISTING FILTER OPTION PILLS */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Active Filter Pills ({grp.options?.length || 0}):</span>
              <div className="flex flex-wrap gap-2">
                {grp.options?.map(opt => (
                  <span key={opt.id} className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                    <span>{opt.label}</span>
                    <button 
                      onClick={() => handleDeleteFilterOption(opt.id)}
                      className="text-slate-400 hover:text-rose-400 text-sm font-black cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ADD NEW OPTION INPUT */}
            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
              <input 
                type="text"
                placeholder={`+ Add option to ${grp.name}...`}
                value={newOptionInputs[grp.id] || ''}
                onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [grp.id]: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFilterOption(grp.id); } }}
                className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                data-reticle-target={`admin-add-option-input-${grp.id}`}
              />
              <button 
                onClick={() => handleAddFilterOption(grp.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs cursor-pointer"
                data-reticle-target={`admin-add-option-btn-${grp.id}`}
              >
                + Add Pill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
