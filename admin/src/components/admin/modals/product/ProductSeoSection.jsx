import React, { useState } from 'react';

export default function ProductSeoSection({ productForm, setProductForm }) {
  const [showSeoFields, setShowSeoFields] = useState(false);

  const pageTitle = productForm.seo_title || productForm.title || 'Product Title';
  const metaDesc = productForm.seo_description || productForm.description || 'Product description for search engine listing...';

  return (
    <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-white text-sm">Search Engine Listing Preview (Google SEO)</h3>
          <p className="text-xs text-slate-400">Preview of how this product will appear in Google search results.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowSeoFields(!showSeoFields)}
          className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
        >
          Edit website SEO {showSeoFields ? '▲' : '▼'}
        </button>
      </div>

      <div className="p-3 bg-white rounded-xl space-y-1 font-sans shadow-sm">
        <div className="text-[11px] text-gray-500 truncate">
          VALUELIFE ESSENTIALS › https://valuelifeessentials.com › products/{productForm.url_handle || (productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        </div>
        <div className="text-sm font-bold text-blue-800 truncate hover:underline cursor-pointer">
          {pageTitle}
        </div>
        <div className="text-xs text-gray-600 line-clamp-2 leading-normal">
          {metaDesc}
        </div>
        <div className="text-xs font-bold text-gray-900 pt-1">
          ₹{productForm.price_inr || productForm.discount_inr || 0}.00 INR
        </div>
      </div>

      {showSeoFields && (
        <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-300">Page title</label>
              <span className="text-[10px] text-slate-400">{pageTitle.length} of 70 characters used</span>
            </div>
            <input 
              type="text"
              value={productForm.seo_title || ''}
              onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
              placeholder={productForm.title || ''}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-300">Meta description</label>
              <span className="text-[10px] text-slate-400">{metaDesc.length} of 160 characters used</span>
            </div>
            <textarea 
              rows={2}
              value={productForm.seo_description || ''}
              onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
              placeholder={productForm.description || ''}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">URL handle</label>
            <input 
              type="text"
              value={productForm.url_handle || ''}
              onChange={(e) => setProductForm({ ...productForm, url_handle: e.target.value })}
              placeholder={`products/${(productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
