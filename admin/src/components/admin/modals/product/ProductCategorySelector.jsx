import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function ProductCategorySelector({
  categories = [],
  productForm,
  setProductForm,
  setShowCategoryModal
}) {
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSubcatDropdownOpen, setIsSubcatDropdownOpen] = useState(false);

  const selectedCategoryObj = categories.find(c => c.id === Number(productForm.category_id));

  return (
    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 relative">
      <div className="flex justify-between items-center">
        <label className="block font-bold text-slate-200">Category & Subcategory *</label>
        <button 
          type="button"
          onClick={() => setShowCategoryModal(true)}
          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
        >
          + Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-slate-300 font-bold text-xs mb-1">
            Main Category <span className="text-rose-400 font-extrabold">* (Required)</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setIsCatDropdownOpen(!isCatDropdownOpen);
              setIsSubcatDropdownOpen(false);
            }}
            className={`w-full p-2.5 bg-slate-800 hover:bg-slate-750 border rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer ${
              !productForm.category_id 
                ? 'border-rose-500/70 ring-1 ring-rose-500/30' 
                : 'border-slate-700'
            }`}
          >
            <span className="truncate flex items-center gap-1.5">
              {selectedCategoryObj ? (
                <>
                  <span>{selectedCategoryObj.icon || '🌿'}</span>
                  <span className="text-white font-extrabold">{selectedCategoryObj.name}</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal">-- Select Main Category --</span>
              )}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isCatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>

          {isCatDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
              {categories.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs font-semibold">
                  No categories found.
                </div>
              ) : (
                categories.map(c => {
                  const isSelected = String(c.id) === String(productForm.category_id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setProductForm({ ...productForm, category_id: Number(c.id), subcategory_id: '' });
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{c.icon || '🌿'}</span>
                        <span className="font-extrabold">{c.name}</span>
                      </span>
                      {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-slate-400 text-xs mb-1">Subcategory (Optional)</label>
          <button
            type="button"
            onClick={() => {
              setIsSubcatDropdownOpen(!isSubcatDropdownOpen);
              setIsCatDropdownOpen(false);
            }}
            className="w-full p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
          >
            <span className="truncate">
              {selectedCategoryObj?.subcategories?.find(sc => String(sc.id) === String(productForm.subcategory_id))?.name || (
                <span className="text-slate-400 font-normal">-- Choose Subcategory --</span>
              )}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isSubcatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>

          {isSubcatDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
              <button
                type="button"
                onClick={() => {
                  setProductForm({ ...productForm, subcategory_id: '' });
                  setIsSubcatDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                -- None (No Subcategory) --
              </button>
              {selectedCategoryObj?.subcategories?.map(sc => {
                const isSelected = String(sc.id) === String(productForm.subcategory_id);
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setProductForm({ ...productForm, subcategory_id: Number(sc.id) });
                      setIsSubcatDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="font-extrabold">{sc.name}</span>
                    {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
