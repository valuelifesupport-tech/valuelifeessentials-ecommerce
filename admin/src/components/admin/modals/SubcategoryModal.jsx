import React from 'react';
import { XCircle } from 'lucide-react';

export default function SubcategoryModal({
  showSubcategoryModal,
  setShowSubcategoryModal,
  selectedCatForSubcat,
  subcategoryName = '',
  setSubcategoryName,
  handleSubcategorySubmit,
  editingSubcategory = null
}) {
  if (!showSubcategoryModal || (!selectedCatForSubcat && !editingSubcategory)) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-3 sm:p-4 z-50" data-reticle-target="admin-subcategory-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white">
            {editingSubcategory ? `Edit Subcategory` : `Add Subcategory to ${selectedCatForSubcat?.name}`}
          </h3>
          <button 
            type="button"
            onClick={() => setShowSubcategoryModal(false)} 
            className="cursor-pointer text-slate-400 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={(e) => handleSubcategorySubmit(e, selectedCatForSubcat, editingSubcategory)} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Subcategory Name *</label>
            <input 
              type="text" required placeholder="e.g. Vermicompost or Neem Cake"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer">
            {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
          </button>
        </form>
      </div>
    </div>
  );
}
