import React from 'react';
import { Plus, Search, Edit, Trash2, Wrench } from 'lucide-react';
import { resolveImgUrl, getProxyImgUrl, DEFAULT_FALLBACK_SVG } from '../../../utils/resolveImgUrl';

export default function ProductsTab({
  categories = [],
  filteredProducts = [],
  productSearchQuery,
  setProductSearchQuery,
  productCategoryFilter,
  setProductCategoryFilter,
  productStatusFilter,
  setProductStatusFilter,
  adminProductPage,
  setAdminProductPage,
  adminItemsPerPage = 10,
  setEditingProduct,
  setProductForm,
  defaultProductForm,
  setShowProductModal,
  setSelectedProductForVariants,
  setDeleteConfirmProduct
}) {
  const totalPages = Math.ceil(filteredProducts.length / adminItemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (adminProductPage - 1) * adminItemsPerPage, 
    adminProductPage * adminItemsPerPage
  );

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-products-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Products, Subcategories, Variants & Specs</h3>
          <p className="text-xs text-slate-400">Edit titles, SKU IDs, images, INR/USD prices, subcategories, and SEO snippet preview.</p>
        </div>

        <button 
          onClick={() => { 
            setEditingProduct(null); 
            setProductForm(defaultProductForm); 
            setShowProductModal(true); 
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          data-reticle-target="admin-create-product-btn"
        >
          <Plus size={16} /> Create Product
        </button>
      </div>

      {/* REAL-TIME SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-850 p-4 rounded-xl border border-slate-800" data-reticle-target="admin-products-filters-bar">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search products by Title, SKU ID, Vendor, or Category..."
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs focus:border-emerald-500 focus:outline-none"
            data-reticle-target="admin-product-search-input"
          />
          {productSearchQuery && (
            <button 
              onClick={() => setProductSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              data-reticle-target="admin-clear-product-search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={productCategoryFilter}
            onChange={(e) => {
              setProductCategoryFilter(e.target.value);
              setAdminProductPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            data-reticle-target="admin-product-category-select"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={productStatusFilter}
            onChange={(e) => {
              setProductStatusFilter(e.target.value);
              setAdminProductPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none font-sans cursor-pointer"
            data-reticle-target="admin-product-status-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-products-table-container">
        <table className="w-full text-left text-xs min-w-[720px]">
          <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
            <tr>
              <th className="p-3">Thumbnail</th>
              <th className="p-3">Title & SKU ID</th>
              <th className="p-3">Base Price INR (₹)</th>
              <th className="p-3">Base Price USD ($)</th>
              <th className="p-3">Variant Pills CRUD</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {paginatedProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/50 transition-colors" data-reticle-target={`admin-product-row-${p.id}`}>
                <td className="p-3">
                  <img 
                    src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                    alt={p.title}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-white" 
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
                  />
                </td>
                <td className="p-3">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>
                      {(() => {
                        let t = (p.title || '').trim();
                        if (!t || t.startsWith('http://') || t.startsWith('https://')) {
                          if (p.description && p.description.trim()) {
                            const clean = p.description.replace(/<[^>]*>?/gm, '').trim();
                            if (clean) return clean.split('.')[0].slice(0, 70).trim();
                          }
                          return 'Organic Essential Product';
                        }
                        return t;
                      })()}
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      SKU: {p.sku || `OB-${p.id}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {p.category_name} {p.subcategory_name ? `➔ ${p.subcategory_name}` : ''} | Vendor: {p.vendor || 'VALUELIFE ESSENTIALS'}
                  </div>
                </td>
                <td className="p-3 font-extrabold text-emerald-400 text-sm">₹{p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : (p.discount_inr || 0)}</td>
                <td className="p-3 font-extrabold text-blue-400 text-sm">${p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : (p.discount_usd || 0)}</td>
                <td className="p-3">
                  <button 
                    onClick={() => setSelectedProductForVariants(p)}
                    className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                    data-reticle-target={`admin-variant-pills-btn-${p.id}`}
                  >
                    <Wrench size={14} /> Variant Pills ({p.variants?.length || 0})
                  </button>
                </td>
                <td className="p-3 flex items-center gap-2">
                  <button 
                    onClick={() => {
                      let safeTitle = (p.title || '').trim();
                      if (!safeTitle || safeTitle.startsWith('http://') || safeTitle.startsWith('https://')) {
                        if (p.description && p.description.trim()) {
                          const clean = p.description.replace(/<[^>]*>?/gm, '').trim();
                          if (clean) safeTitle = clean.split('.')[0].slice(0, 70).trim();
                        }
                        if (!safeTitle || safeTitle.startsWith('http')) safeTitle = 'Organic Essential Product';
                      }

                      setEditingProduct(p);
                      setProductForm({
                        title: safeTitle,
                        sku: p.sku || `OB-${p.id}`,
                        status: p.status || 'Active',
                        vendor: p.vendor || 'VALUELIFE ESSENTIALS',
                        product_type: p.product_type || 'Garden Supplies',
                        tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : p.tags) : ['organic'],
                        collection_ids: p.collection_ids || (Array.isArray(p.collections) ? p.collections.map(c => typeof c === 'object' ? c.id : c) : []),
                        category_id: p.category_id,
                        subcategory_id: p.subcategory_id || '',
                        description: p.description || '',
                        price_inr: p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : '',
                        price_usd: p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : '',
                        discount_inr: p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : '',
                        discount_usd: p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : '',
                        compare_price_inr: p.compare_price_inr !== undefined && p.compare_price_inr !== null ? p.compare_price_inr : '',
                        compare_price_usd: p.compare_price_usd !== undefined && p.compare_price_usd !== null ? p.compare_price_usd : '',
                        cost_per_item_inr: p.cost_per_item_inr !== undefined && p.cost_per_item_inr !== null ? p.cost_per_item_inr : '',
                        cost_per_item_usd: p.cost_per_item_usd !== undefined && p.cost_per_item_usd !== null ? p.cost_per_item_usd : '',
                        barcode: p.barcode || '',
                        stock: p.stock !== undefined ? p.stock : 100,
                        track_inventory: p.track_inventory ?? 1,
                        weight: p.weight || 0.5,
                        hs_code: p.hs_code || '310100',
                        country_of_origin: p.country_of_origin || 'India',
                        is_best_product: p.is_best_product === 1,
                        seo_title: p.seo_title || p.title,
                        seo_description: p.seo_description || p.description,
                        url_handle: `products/${p.slug}`,
                        images: Array.isArray(p.images) && p.images.length > 0 
                          ? p.images 
                          : (p.image_url ? [p.image_url] : (p.thumbnail ? [p.thumbnail] : [])),
                        specs_json: p.specs_json || '{"material":"100% Pure Bio Compost"}',
                        gst_percent: p.gst_percent ?? '',
                        variants: (p.variants && Array.isArray(p.variants)) ? p.variants.map(v => ({ ...v })) : []
                      });
                      setShowProductModal(true);
                    }}
                    className="bg-blue-900/60 text-blue-300 p-1.5 rounded-lg hover:bg-blue-800 border border-blue-700 cursor-pointer"
                    title="Edit Product (Shopify Form)"
                    data-reticle-target={`admin-edit-product-btn-${p.id}`}
                  >
                    <Edit size={16} />
                  </button>

                  <button 
                    onClick={() => setDeleteConfirmProduct(p)}
                    className="bg-rose-900/60 text-rose-300 p-1.5 rounded-lg hover:bg-rose-800 border border-rose-700 transition-colors cursor-pointer"
                    title="Delete Product"
                    data-reticle-target={`admin-delete-product-btn-${p.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADMIN PRODUCTS PAGINATION CONTROLS FOOTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-850 p-4 rounded-xl border border-slate-800 gap-3 text-xs" data-reticle-target="admin-products-pagination">
        <div className="text-slate-400 font-medium">
          Showing <span className="font-extrabold text-white">{filteredProducts.length === 0 ? 0 : (adminProductPage - 1) * adminItemsPerPage + 1}</span> to{' '}
          <span className="font-extrabold text-white">{Math.min(adminProductPage * adminItemsPerPage, filteredProducts.length)}</span> of{' '}
          <span className="font-extrabold text-emerald-400">{filteredProducts.length}</span> Products Total
        </div>

        <div className="flex items-center gap-1.5 font-bold flex-wrap">
          <button
            onClick={() => setAdminProductPage(prev => Math.max(1, prev - 1))}
            disabled={adminProductPage === 1}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              adminProductPage === 1 
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 cursor-pointer'
            }`}
            data-reticle-target="admin-product-prev-page"
          >
            ‹ Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setAdminProductPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                adminProductPage === page
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              data-reticle-target={`admin-product-page-${page}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setAdminProductPage(prev => Math.min(totalPages, prev + 1))}
            disabled={adminProductPage >= totalPages}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              adminProductPage >= totalPages
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 cursor-pointer'
            }`}
            data-reticle-target="admin-product-next-page"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
