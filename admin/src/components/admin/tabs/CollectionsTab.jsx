import React from 'react';
import { Plus } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function CollectionsTab({
  collections = [],
  setCollections,
  setEditingCollection,
  setCollectionForm,
  setShowCollectionModal,
  adminFetch,
  fetchAdminData,
  showToast
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-collections-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Collections Manager & Category/Product Mapping</h3>
          <p className="text-xs text-slate-400">Create collections, map parent categories, and assign products.</p>
        </div>

        <button 
          onClick={() => {
            setEditingCollection(null);
            setCollectionForm({ name: '', description: '', image_url: '', category_id: '', show_in_navbar: 0, product_ids: [] });
            setShowCollectionModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          data-reticle-target="admin-create-collection-btn"
        >
          <Plus size={16} /> Create New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="p-8 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-2" data-reticle-target="admin-empty-collections">
          <p className="text-sm font-bold text-slate-300">No Custom Collections Created Yet</p>
          <p className="text-xs text-slate-400">Click "+ Create New Collection" above to create product collections & map items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map(col => (
            <div key={col.id} className="p-4 border border-slate-800 rounded-xl bg-slate-850 space-y-3" data-reticle-target={`admin-collection-card-${col.id}`}>
              <div className="relative h-32 rounded-lg overflow-hidden border border-slate-700">
                {col.image_url ? (
                  <img 
                    src={resolveImgUrl(col.image_url)} 
                    alt={col.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-emerald-950 to-slate-900 flex items-center justify-center border border-slate-700">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">No Banner Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/60 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                      /collection/{col.slug}
                    </span>
                    {col.show_in_navbar === 1 && (
                      <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow">
                        🌿 SHOW IN NAVBAR
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-base">{col.name}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-300">{col.description}</p>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Top Navbar Link:</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const isCurrentlyOn = col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1';
                      const newStatus = isCurrentlyOn ? 0 : 1;
                      const res = await adminFetch(`/api/collections/${col.id}/navbar-toggle`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ show_in_navbar: newStatus })
                      });
                      if (res.ok) {
                        setCollections(prev => prev.map(c => c.id === col.id ? { ...c, show_in_navbar: newStatus } : c));
                        if (showToast) showToast('success', 'Navbar Visibility Updated', `Collection '${col.name}' navbar link turned ${newStatus === 1 ? 'ON' : 'OFF'}.`);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all border ${
                      (col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1')
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                    data-reticle-target={`admin-collection-navbar-toggle-${col.id}`}
                  >
                    {(col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1') ? '🟢 SHOW IN NAVBAR (ON)' : '⚪ HIDDEN FROM NAVBAR (OFF)'}
                  </button>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Attached Products:</span>
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{col.product_count || 0} Products</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setEditingCollection(col);
                    setCollectionForm({
                      name: col.name,
                      description: col.description || '',
                      image_url: col.image_url || '',
                      category_id: col.category_id || '',
                      show_in_navbar: col.show_in_navbar !== undefined ? col.show_in_navbar : 0,
                      product_ids: col.product_ids || []
                    });
                    setShowCollectionModal(true);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs border border-slate-700 cursor-pointer"
                  data-reticle-target={`admin-edit-collection-btn-${col.id}`}
                >
                  Edit Collection
                </button>

                <button 
                  onClick={async () => {
                    if (window.confirm(`Delete collection "${col.name}"?`)) {
                      await adminFetch(`/api/collections/${col.id}`, { method: 'DELETE' });
                      fetchAdminData();
                      if (showToast) showToast('info', 'Collection Deleted', 'Collection deleted successfully.');
                    }
                  }}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-2 rounded-lg text-xs border border-red-500/30 cursor-pointer"
                  data-reticle-target={`admin-delete-collection-btn-${col.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
