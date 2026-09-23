import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function PagesTab({
  pages = [],
  setEditingPage,
  setPageForm,
  setShowPageModal,
  handleDeletePage
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-pages-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Custom Pages CMS Manager</h3>
          <p className="text-xs text-slate-400">Create, edit, and publish custom store pages (About Us, Contact Us, Policies, FAQ).</p>
        </div>

        <button 
          onClick={() => {
            setEditingPage(null);
            setPageForm({ title: '', slug: '', content: '', seo_title: '', seo_description: '', status: 'PUBLISHED' });
            setShowPageModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          data-reticle-target="admin-create-page-btn"
        >
          <Plus size={16} /> + Create Custom Page
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-pages-table-container">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
            <tr>
              <th className="p-3">Page Title</th>
              <th className="p-3">URL Handle</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {pages.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/50" data-reticle-target={`admin-page-row-${p.id}`}>
                <td className="p-3">
                  <div className="font-extrabold text-white text-sm">{p.title}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">SEO: {p.seo_title || p.title}</div>
                </td>
                <td className="p-3 font-mono text-slate-400 bg-slate-850 px-2 py-1 rounded w-fit">
                  /pages/{p.slug}
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                    p.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{new Date(p.updated_at || Date.now()).toLocaleDateString()}</td>
                <td className="p-3 flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingPage(p);
                      setPageForm({ 
                        title: p.title, 
                        slug: p.slug, 
                        content: p.content, 
                        seo_title: p.seo_title || '', 
                        seo_description: p.seo_description || '', 
                        status: p.status || 'PUBLISHED',
                        _editing: p
                      });
                      setShowPageModal(true);
                    }}
                    className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                    data-reticle-target={`admin-edit-page-btn-${p.id}`}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePage(p.id)}
                    className="bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                    data-reticle-target={`admin-delete-page-btn-${p.id}`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
