import React from 'react';
import { XCircle } from 'lucide-react';

export default function PageModal({
  showPageModal,
  setShowPageModal,
  editingPage,
  pageForm = {},
  setPageForm,
  handlePageSubmit
}) {
  if (!showPageModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999]" data-reticle-target="admin-page-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">SHOPIFY-GRADE CMS PAGE BUILDER</span>
            <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-md">{editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Custom Page'}</h3>
          </div>
          <button 
            type="button"
            onClick={() => setShowPageModal(false)} 
            className="cursor-pointer text-slate-400 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handlePageSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Page Title *</label>
              <input 
                type="text" required
                placeholder="e.g. About Us, Contact Us, FAQ"
                value={pageForm.title || ''}
                onChange={(e) => setPageForm({ 
                  ...pageForm, 
                  title: e.target.value,
                  slug: pageForm.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Slug Handle *</label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 text-slate-400 text-xs">
                <span>/pages/</span>
                <input 
                  type="text" required
                  placeholder="about-us"
                  value={pageForm.slug || ''}
                  onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="w-full p-2 bg-transparent text-white font-mono border-0 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Page Body Content (Markdown / Rich Text) *</label>
            <textarea 
              rows={8} required
              placeholder="Enter full page content in Markdown or HTML text..."
              value={pageForm.content || ''}
              onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed"
            ></textarea>
          </div>

          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
            <span className="font-extrabold text-slate-200 block text-xs">Search Engine Optimization (SEO) Metadata</span>
            
            <div>
              <label className="block text-slate-400 mb-1">SEO Title Tag</label>
              <input 
                type="text"
                placeholder="Page title as displayed on Google search results"
                value={pageForm.seo_title || ''}
                onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SEO Meta Description</label>
              <textarea 
                rows={2}
                placeholder="Short description snippet for search engines..."
                value={pageForm.seo_description || ''}
                onChange={(e) => setPageForm({ ...pageForm, seo_description: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Visibility Status</label>
              <select 
                value={pageForm.status || 'PUBLISHED'}
                onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
              >
                <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-all cursor-pointer">
                {editingPage ? 'Save & Update Page' : 'Publish Page Live'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
