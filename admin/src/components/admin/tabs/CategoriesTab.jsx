import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesTab({
  categories = [],
  setEditingCategory,
  setCategoryForm,
  setShowCategoryModal,
  setSelectedCatForSubcat,
  setShowSubcategoryModal,
  setDeleteConfirmCategory,
  adminFetch,
  fetchAdminData
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-categories-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Categories & Subcategories Manager</h3>
          <p className="text-xs text-slate-400">Add categories and attach custom subcategories.</p>
        </div>

        <button 
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '', icon: '', image_url: '' });
            setShowCategoryModal(true);
          }} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          data-reticle-target="admin-add-category-btn"
        >
          <Plus size={16} /> Add New Main Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div 
            key={cat.id ? `cat-${cat.id}-${idx}` : `cat-${idx}`} 
            className="p-4 border border-slate-800 rounded-xl bg-slate-850 space-y-3"
            data-reticle-target={`admin-category-card-${cat.id}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>{cat.icon || '🌿'}</span> <span>{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedCatForSubcat(cat); setShowSubcategoryModal(true); }}
                  className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-1 rounded text-[11px] font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
                  data-reticle-target={`admin-add-subcat-btn-${cat.id}`}
                >
                  + Subcategory
                </button>
                <button 
                  onClick={() => {
                    setEditingCategory(cat);
                    setCategoryForm({
                      name: cat.name,
                      icon: cat.icon || '🌿',
                      description: cat.description || '',
                      image_url: cat.image_url || ''
                    });
                    setShowCategoryModal(true);
                  }} 
                  className="bg-blue-900/60 text-blue-300 p-1.5 rounded-lg hover:bg-blue-800 border border-blue-700 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Edit Category"
                  data-reticle-target={`admin-edit-category-btn-${cat.id}`}
                >
                  <Edit size={14} /> Edit
                </button>
                <button 
                  onClick={() => setDeleteConfirmCategory(cat)} 
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 border border-red-500/30 transition-colors cursor-pointer"
                  title="Delete Category"
                  data-reticle-target={`admin-delete-category-btn-${cat.id}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">{cat.description}</p>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-400">Subcategories ({cat.subcategories?.length || 0}):</span>
              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories?.map(sub => (
                  <span key={sub.id} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-700">
                    {sub.name}
                    <button 
                      onClick={async () => { 
                        await adminFetch(`/api/subcategories/${sub.id}`, { method: 'DELETE' }); 
                        fetchAdminData(); 
                      }} 
                      className="text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
