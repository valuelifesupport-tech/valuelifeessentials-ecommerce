import React from 'react';
import { Search, Grid } from 'lucide-react';
import { resolveImgUrl, getProxyImgUrl, DEFAULT_FALLBACK_SVG } from '../../../utils/resolveImgUrl';

export default function InventoryTab({
  products = [],
  categories = [],
  inventorySearchQuery,
  setInventorySearchQuery,
  inventoryStockFilter,
  setInventoryStockFilter,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  inventoryPage,
  setInventoryPage,
  inventoryItemsPerPage,
  setInventoryItemsPerPage,
  handleUpdateProductStock,
  handleUpdateVariantStock,
  setEditingProduct,
  setProductForm,
  setShowProductModal
}) {
  const filteredProducts = products.filter(p => {
    const query = inventorySearchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.variants && p.variants.some(v => v.variant_name?.toLowerCase().includes(query) || v.sku?.toLowerCase().includes(query)));

    let matchesStock = true;
    if (inventoryStockFilter === 'IN_STOCK') matchesStock = (p.stock || 0) >= 50;
    else if (inventoryStockFilter === 'LOW_STOCK') matchesStock = (p.stock || 0) > 0 && (p.stock || 0) < 50;
    else if (inventoryStockFilter === 'OUT_OF_STOCK') matchesStock = (p.stock || 0) === 0;

    let matchesCategory = true;
    if (inventoryCategoryFilter !== 'ALL') {
      matchesCategory = String(p.category_id) === String(inventoryCategoryFilter) || p.category_name?.toLowerCase() === inventoryCategoryFilter.toLowerCase();
    }

    return matchesSearch && matchesStock && matchesCategory;
  });

  const totalInventoryPages = Math.ceil(filteredProducts.length / inventoryItemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((inventoryPage - 1) * inventoryItemsPerPage, inventoryPage * inventoryItemsPerPage);

  return (
    <div className="space-y-6" data-reticle-target="admin-inventory-tab">
      {/* TOP HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">REALTIME INVENTORY CONTROL</span>
          <h3 className="text-xl font-black text-white font-['Outfit']">Stock Status & Variant Inventory Manager</h3>
          <p className="text-xs text-slate-400">Manage available stock quantities for all products and their specific variants in real time.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-850 px-4 py-2 rounded-xl border border-slate-800 text-center min-w-28">
            <span className="text-[11px] text-slate-400 block font-bold">Total Catalog</span>
            <span className="text-lg font-black text-white">{products.length} Products</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl text-center min-w-28">
            <span className="text-[11px] text-emerald-400 block font-bold">In Stock Units</span>
            <span className="text-lg font-black text-emerald-300">
              {products.reduce((sum, p) => sum + (p.stock || 0) + (p.variants?.reduce((vSum, v) => vSum + (v.stock || 0), 0) || 0), 0)} Units
            </span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/60 px-4 py-2 rounded-xl text-center min-w-28">
            <span className="text-[11px] text-amber-400 block font-bold">Low Stock (&lt;50)</span>
            <span className="text-lg font-black text-amber-300">
              {products.filter(p => (p.stock || 0) < 50).length + products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) < 50).length || 0), 0)} Alerts
            </span>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 px-4 py-2 rounded-xl text-center min-w-28">
            <span className="text-[11px] text-rose-400 block font-bold">Out of Stock (0)</span>
            <span className="text-lg font-black text-rose-300">
              {products.filter(p => (p.stock || 0) === 0).length + products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) === 0).length || 0), 0)} Items
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md" data-reticle-target="admin-inventory-filters">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* SEARCH INPUT */}
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Product Name, SKU ID, or Variant..."
              value={inventorySearchQuery}
              onChange={(e) => setInventorySearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
              data-reticle-target="admin-inventory-search-input"
            />
          </div>

          {/* STOCK STATUS FILTER */}
          <div>
            <select 
              value={inventoryStockFilter}
              onChange={(e) => setInventoryStockFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-inventory-stock-filter"
            >
              <option value="ALL">All Stock Levels ({products.length})</option>
              <option value="IN_STOCK">In Stock (≥50 Units)</option>
              <option value="LOW_STOCK">Low Stock Alert (&lt;50 Units)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0 Units)</option>
            </select>
          </div>

          {/* CATEGORY FILTER */}
          <div>
            <select 
              value={inventoryCategoryFilter}
              onChange={(e) => setInventoryCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-inventory-category-filter"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(inventorySearchQuery || inventoryStockFilter !== 'ALL' || inventoryCategoryFilter !== 'ALL') && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-emerald-400 font-bold">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching criteria
            </span>
            <button 
              onClick={() => {
                setInventorySearchQuery('');
                setInventoryStockFilter('ALL');
                setInventoryCategoryFilter('ALL');
              }}
              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              data-reticle-target="admin-reset-inventory-filters"
            >
              Reset All Inventory Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* INVENTORY TABLE CARD */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md space-y-4 p-5" data-reticle-target="admin-inventory-table-card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm font-black text-white flex items-center gap-2">
            <Grid size={18} className="text-amber-400" />
            <span>Variant & Product Inventory Matrix</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
              <span>Items per page:</span>
              <select 
                value={inventoryItemsPerPage}
                onChange={(e) => setInventoryItemsPerPage(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-bold bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 hidden md:block">
              Click <span className="text-emerald-400 font-extrabold">+</span> or <span className="text-rose-400 font-extrabold">-</span> buttons or edit numbers to adjust stock
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-850 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Product / Variant Name</th>
                <th className="p-3.5">SKU ID</th>
                <th className="p-3.5">Price (₹)</th>
                <th className="p-3.5 text-center">Available Stock (Qty)</th>
                <th className="p-3.5">Status Badge</th>
                <th className="p-3.5 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">
                    No products match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <React.Fragment key={p.id}>
                    {/* MAIN PRODUCT ROW */}
                    <tr className="bg-slate-900 hover:bg-slate-850/60 transition-colors" data-reticle-target={`admin-inventory-row-${p.id}`}>
                      <td className="p-3.5 flex items-center gap-3 font-extrabold text-white">
                        <img 
                          src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                          alt={p.title} 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const raw = p.thumbnail || p.image_url || p.images?.[0];
                            if (raw && !e.target.dataset.triedProxy) {
                              e.target.dataset.triedProxy = 'true';
                              e.target.src = getProxyImgUrl(raw);
                              return;
                            }
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FALLBACK_SVG;
                          }}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-white shrink-0" 
                        />
                        <div>
                          <span className="text-sm font-black text-white block">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Category: {p.category_name || 'Organic'}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-emerald-400 font-bold">{p.sku || `OB-${p.id}`}</td>

                      <td className="p-3.5 font-extrabold text-slate-200">
                        ₹{p.discount_inr || p.price_inr}
                      </td>

                      {/* INLINE EDITABLE STOCK WITH - / + BUTTONS */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5 max-w-40 mx-auto">
                          <button 
                            type="button"
                            onClick={() => handleUpdateProductStock(p.id, Math.max(0, (p.stock || 0) - 1))}
                            className="w-7 h-7 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-lg border border-slate-700 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input 
                            type="number"
                            value={p.stock !== undefined ? p.stock : 100}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                              handleUpdateProductStock(p.id, val);
                            }}
                            className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-center font-extrabold text-white text-xs"
                            data-reticle-target={`admin-stock-input-${p.id}`}
                          />
                          <button 
                            type="button"
                            onClick={() => handleUpdateProductStock(p.id, (p.stock || 0) + 1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 rounded-lg border border-slate-700 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 space-y-1">
                        <div>
                          {p.status === 'Draft' ? (
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                              Draft
                            </span>
                          ) : p.status === 'Archived' ? (
                            <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                              Archived
                            </span>
                          ) : (
                            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                              Active
                            </span>
                          )}
                        </div>

                        <div>
                          {(p.stock || 0) === 0 ? (
                            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              OUT OF STOCK
                            </span>
                          ) : (p.stock || 0) < 50 ? (
                            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              LOW STOCK ({p.stock})
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              IN STOCK ({p.stock})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => {
                            setEditingProduct(p);
                            const rawImages = Array.isArray(p.images) && p.images.length > 0 
                              ? p.images 
                              : (p.image_url ? [p.image_url] : (p.thumbnail ? [p.thumbnail] : []));
                            const pImages = rawImages.map(img => (typeof img === 'object' && img?.image_url) ? img.image_url : img).filter(Boolean);
                            const pVariants = (p.variants || []).map(v => ({
                              ...v,
                              variant_name: v.variant_name || v.name || 'Standard Pack',
                              price_inr: Number(v.price_inr || v.price || p.price_inr || 0),
                              stock: Number(v.stock !== undefined ? v.stock : 50),
                              image_url: typeof v.image_url === 'object' ? v.image_url?.image_url : (v.image_url || pImages[0] || null)
                            }));
                            setProductForm({ ...p, images: pImages, variants: pVariants });
                            setShowProductModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg border border-slate-700 text-xs shadow-sm cursor-pointer"
                          data-reticle-target={`admin-edit-inventory-product-${p.id}`}
                        >
                          Edit Product & Variants
                        </button>
                      </td>
                    </tr>

                    {/* VARIANT SUB-ROWS */}
                    {p.variants?.map((v) => (
                      <tr key={`var-${v.id}`} className="bg-slate-950/70 hover:bg-slate-850/40 transition-colors border-l-4 border-emerald-600" data-reticle-target={`admin-inventory-variant-row-${v.id}`}>
                        <td className="p-3 pl-8 flex items-center gap-2.5 font-bold text-slate-300">
                          <span className="text-slate-500 font-mono text-xs">↳</span>
                          <img 
                            src={resolveImgUrl(v.image_url || p.thumbnail || p.images?.[0])} 
                            alt={v.variant_name || 'Variant'} 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const raw = v.image_url || p.thumbnail || p.images?.[0];
                              if (raw && !e.target.dataset.triedProxy) {
                                e.target.dataset.triedProxy = 'true';
                                e.target.src = getProxyImgUrl(raw);
                                return;
                              }
                              e.target.onerror = null;
                              e.target.src = DEFAULT_FALLBACK_SVG;
                            }}
                            className="w-8 h-8 object-cover rounded border border-slate-700 bg-white shrink-0" 
                          />
                          <div>
                            <span className="text-xs font-bold text-emerald-300">{v.variant_name}</span>
                            <span className="text-[10px] text-slate-500 block">Variant Pill</span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-400 text-[11px]">{v.sku || `OB-VAR-${v.id}`}</td>

                        <td className="p-3 font-bold text-emerald-400 text-xs">₹{v.price_inr}</td>

                        {/* INLINE EDITABLE VARIANT STOCK */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1 max-w-36 mx-auto">
                            <button 
                              type="button"
                              onClick={() => handleUpdateVariantStock(v.id, Math.max(0, (v.stock || 0) - 1))}
                              className="w-6 h-6 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded border border-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              value={v.stock !== undefined ? v.stock : 50}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                handleUpdateVariantStock(v.id, val);
                              }}
                              className="w-14 p-1 bg-slate-800 border border-slate-700 rounded text-center font-bold text-white text-xs"
                              data-reticle-target={`admin-variant-stock-input-${v.id}`}
                            />
                            <button 
                              type="button"
                              onClick={() => handleUpdateVariantStock(v.id, (v.stock || 0) + 1)}
                              className="w-6 h-6 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 rounded border border-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-3">
                          {(v.stock || 0) === 0 ? (
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              OUT OF STOCK
                            </span>
                          ) : (v.stock || 0) < 50 ? (
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              LOW ({v.stock})
                            </span>
                          ) : (
                            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              IN STOCK ({v.stock})
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right font-mono text-[10px] text-slate-400">
                          Variant ID #{v.id}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* INVENTORY PAGINATION FOOTER */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400" data-reticle-target="admin-inventory-pagination">
            <div>
              Showing <strong className="text-white">{(inventoryPage - 1) * inventoryItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(inventoryPage * inventoryItemsPerPage, filteredProducts.length)}</strong> of <strong className="text-emerald-400">{filteredProducts.length}</strong> products
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button 
                onClick={() => setInventoryPage(prev => Math.max(prev - 1, 1))}
                disabled={inventoryPage === 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                data-reticle-target="admin-inventory-prev-page"
              >
                Previous
              </button>

              {Array.from({ length: totalInventoryPages }).map((_, i) => {
                const pg = i + 1;
                if (
                  pg === 1 || 
                  pg === totalInventoryPages || 
                  (pg >= inventoryPage - 2 && pg <= inventoryPage + 2)
                ) {
                  return (
                    <button 
                      key={pg}
                      onClick={() => setInventoryPage(pg)}
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        inventoryPage === pg 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      data-reticle-target={`admin-inventory-page-${pg}`}
                    >
                      {pg}
                    </button>
                  );
                }
                if (pg === inventoryPage - 3 || pg === inventoryPage + 3) {
                  return <span key={pg} className="px-1 text-slate-600">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => setInventoryPage(prev => Math.min(prev + 1, totalInventoryPages))}
                disabled={inventoryPage >= totalInventoryPages}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                data-reticle-target="admin-inventory-next-page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
