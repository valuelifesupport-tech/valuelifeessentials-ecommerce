import React from 'react';
import { Search } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function BrowseModal({
  showBrowseModal,
  setShowBrowseModal,
  browseTargetType = 'products',
  setBrowseTargetType,
  browseSearchQuery = '',
  setBrowseSearchQuery,
  browseTargetField,
  discountSelections = {},
  setDiscountSelections,
  productForm = {},
  setProductForm,
  products = [],
  collections = [],
  categories = [],
  users = []
}) {
  if (!showBrowseModal) return null;

  return (
        <div data-reticle-target="admin-browse-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[10000]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Select Real {browseTargetType.toUpperCase()}</h3>
                <p className="text-xs text-slate-400">Choose items from your store's live database.</p>
              </div>
              <button onClick={() => setShowBrowseModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {/* TARGET TYPE TABS */}
            <div className="flex gap-2 p-1 bg-slate-850 rounded-xl border border-slate-800">
              <button 
                onClick={() => setBrowseTargetType('products')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'products' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Products ({products.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('collections')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'collections' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Collections ({collections.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('categories')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'categories' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Categories ({categories.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('customers')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'customers' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Customers ({users.length})
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Search real ${browseTargetType}...`} 
                value={browseSearchQuery}
                onChange={(e) => setBrowseSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>

            {/* REAL DATA ITEMS LIST WITH CHECKBOXES */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {browseTargetType === 'products' && (
                products
                  .filter(p => p.title.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(p => {
                    const isSelected = browseTargetField === 'frequently_bought' 
                      ? (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).includes(p.id.toString())
                      : discountSelections[browseTargetField]?.some(i => i.id === p.id);
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          if (browseTargetField === 'frequently_bought') {
                            const currentIds = (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                            const newIds = currentIds.includes(p.id.toString())
                              ? currentIds.filter(id => id !== p.id.toString())
                              : [...currentIds, p.id.toString()];
                            setProductForm({ ...productForm, frequently_bought_ids: newIds.join(',') });
                          } else {
                            setDiscountSelections(prev => {
                              const currentList = prev[browseTargetField] || [];
                              const exists = currentList.some(i => i.id === p.id);
                              const updated = exists ? currentList.filter(i => i.id !== p.id) : [...currentList, p];
                              return { ...prev, [browseTargetField]: updated };
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=100'; }} className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-white line-clamp-1">{p.title}</div>
                            <div className="text-[10px] text-emerald-400 font-mono">₹{p.discount_inr || p.price_inr} • Stock: {p.stock}</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'collections' && (
                collections
                  .filter(c => c.name.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(c => {
                    const isSelected = browseTargetField === 'related_collections'
                      ? (productForm.related_collection_ids || '').split(',').map(n => n.trim()).includes(c.id.toString())
                      : discountSelections[browseTargetField]?.some(i => i.id === c.id);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          if (browseTargetField === 'related_collections') {
                            const currentIds = (productForm.related_collection_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                            const newIds = currentIds.includes(c.id.toString())
                              ? currentIds.filter(id => id !== c.id.toString())
                              : [...currentIds, c.id.toString()];
                            setProductForm({ ...productForm, related_collection_ids: newIds.join(',') });
                          } else {
                            setDiscountSelections(prev => {
                              const currentList = prev[browseTargetField] || [];
                              const exists = currentList.some(i => i.id === c.id);
                              const updated = exists ? currentList.filter(i => i.id !== c.id) : [...currentList, c];
                              return { ...prev, [browseTargetField]: updated };
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">🏷️</span>
                          <div>
                            <div className="font-bold text-xs text-white">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.product_count || 0} products included</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'categories' && (
                categories
                  .filter(cat => cat.name.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(cat => {
                    const isSelected = discountSelections[browseTargetField]?.some(i => i.id === cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => {
                          setDiscountSelections(prev => {
                            const currentList = prev[browseTargetField] || [];
                            const exists = currentList.some(i => i.id === cat.id);
                            const updated = exists ? currentList.filter(i => i.id !== cat.id) : [...currentList, cat];
                            return { ...prev, [browseTargetField]: updated };
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">{cat.icon || '🌿'}</span>
                          <div>
                            <div className="font-bold text-xs text-white">{cat.name}</div>
                            <div className="text-[10px] text-slate-400">{cat.subcategories?.length || 0} subcategories</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'customers' && (
                users
                  .filter(u => u.name.toLowerCase().includes(browseSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(u => {
                    const isSelected = discountSelections[browseTargetField]?.some(i => i.id === u.id);
                    return (
                      <div 
                        key={u.id} 
                        onClick={() => {
                          setDiscountSelections(prev => {
                            const currentList = prev[browseTargetField] || [];
                            const exists = currentList.some(i => i.id === u.id);
                            const updated = exists ? currentList.filter(i => i.id !== u.id) : [...currentList, u];
                            return { ...prev, [browseTargetField]: updated };
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">👤</span>
                          <div>
                            <div className="font-bold text-xs text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email} • {u.phone || 'No phone'}</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">
                {discountSelections[browseTargetField]?.length || 0} items selected
              </span>

              <button 
                onClick={() => setShowBrowseModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg"
              >
                Apply Selection ✓
              </button>
            </div>
          </div>
        </div>
  );
}
