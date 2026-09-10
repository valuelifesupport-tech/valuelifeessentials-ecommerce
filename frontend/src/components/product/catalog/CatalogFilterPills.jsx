import React from 'react';

export default function CatalogFilterPills({
  filterGroups = [],
  selectedFilters = {},
  setSelectedFilters,
  activeFilterDropdown,
  setActiveFilterDropdown
}) {
  if (!filterGroups || filterGroups.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-gray-700 pt-2 relative z-20" data-reticle-target="catalog-filter-pills">
      {filterGroups.map(grp => {
        const activeVal = selectedFilters[grp.filter_key];
        const selectedOpt = grp.options?.find(o => o.value === activeVal);

        return (
          <div key={grp.id} className="relative">
            <button 
              onClick={() => setActiveFilterDropdown(activeFilterDropdown === grp.id ? null : grp.id)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${
                activeVal 
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600'
              }`}
              data-reticle-target={`filter-group-${grp.filter_key}`}
            >
              <span>{selectedOpt ? `${grp.name}: ${selectedOpt.label}` : `${grp.name}`}</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>

            {/* DROPDOWN OPTIONS */}
            {activeFilterDropdown === grp.id && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 text-xs font-medium space-y-1">
                <button 
                  onClick={() => {
                    const newSel = { ...selectedFilters };
                    delete newSel[grp.filter_key];
                    setSelectedFilters(newSel);
                    setActiveFilterDropdown(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[11px] font-bold cursor-pointer"
                >
                  All {grp.name} (Clear)
                </button>
                {grp.options?.map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      setSelectedFilters({ ...selectedFilters, [grp.filter_key]: opt.value });
                      setActiveFilterDropdown(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      activeVal === opt.value 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {activeVal === opt.value && <span className="text-emerald-600 font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {Object.keys(selectedFilters).length > 0 && (
        <button 
          onClick={() => setSelectedFilters({})}
          className="px-3 py-1 rounded-full text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 font-bold text-xs cursor-pointer shadow-sm"
          data-reticle-target="clear-filter-pills-btn"
        >
          Clear All Filters ✕
        </button>
      )}
    </div>
  );
}
