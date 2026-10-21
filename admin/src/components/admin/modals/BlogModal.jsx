import React from 'react';
import { XCircle, Image as ImageIcon, BookOpen, User, Tag, Sparkles } from 'lucide-react';

const COMMON_CATEGORIES = [
  'General Wellness',
  'Herbal Science',
  'Ayurvedic Rituals',
  'Diet & Nutrition',
  'Immunity & Vitality',
  'Organic Living',
  'Detox & Cleanse',
  'Mind & Body'
];

export default function BlogModal({
  showBlogModal,
  setShowBlogModal,
  editingBlog,
  blogForm = {},
  setBlogForm,
  handleBlogSubmit
}) {
  if (!showBlogModal) return null;

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setBlogForm(prev => ({
      ...prev,
      title: newTitle,
      slug: prev._editing ? prev.slug : (prev.slug && prev.slug !== prev._autoSlug ? prev.slug : autoSlug),
      _autoSlug: autoSlug
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999]" data-reticle-target="admin-blog-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block flex items-center gap-1.5">
              <Sparkles size={12} /> SHOPIFY-GRADE WELLNESS BLOG BUILDER
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-lg mt-0.5">
              {editingBlog ? `Edit Article: ${editingBlog.title}` : 'Write New Wellness Article'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setShowBlogModal(false)} 
            className="cursor-pointer text-slate-400 hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleBlogSubmit} className="space-y-4 text-xs">
          {/* Section 1: Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Article Title *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 7 Sacred Ayurvedic Herbs for Daily Vitality"
                value={blogForm.title || ''}
                onChange={handleTitleChange}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Slug Handle *</label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 text-slate-400 text-xs">
                <span className="font-mono text-[11px]">/blog/</span>
                <input 
                  type="text" 
                  required
                  placeholder="sacred-ayurvedic-herbs"
                  value={blogForm.slug || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })}
                  className="w-full p-2 bg-transparent text-white font-mono border-0 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Category & Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Category *</label>
              <div className="flex gap-2">
                <select
                  value={COMMON_CATEGORIES.includes(blogForm.category) ? blogForm.category : 'CUSTOM'}
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM') {
                      setBlogForm({ ...blogForm, category: e.target.value });
                    }
                  }}
                  className="w-1/2 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer text-xs"
                >
                  {COMMON_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="CUSTOM">Custom...</option>
                </select>
                <input 
                  type="text"
                  placeholder="Or custom category"
                  value={blogForm.category || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Read Time Estimate</label>
              <input 
                type="text" 
                placeholder="e.g. 5 min read, 8 min read"
                value={blogForm.read_time || ''}
                onChange={(e) => setBlogForm({ ...blogForm, read_time: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 3: Featured Image & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Featured Banner Image URL</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="https://images.unsplash.com/... or media path"
                  value={blogForm.featured_image || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
                  className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500"
                />
                {blogForm.featured_image && (
                  <img 
                    src={blogForm.featured_image} 
                    alt="Preview" 
                    className="w-9 h-9 rounded-lg object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Article Tags (Comma-Separated)</label>
              <input 
                type="text"
                placeholder="Organic, Ayurveda, Herbal, Health, Immunity"
                value={blogForm.tags || ''}
                onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 4: Excerpt */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Summary Excerpt (Teaser for Cards & Search Results)</label>
            <textarea 
              rows={2}
              placeholder="Short engaging 2-3 sentence overview of this article..."
              value={blogForm.excerpt || ''}
              onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs leading-relaxed placeholder-slate-500"
            ></textarea>
          </div>

          {/* Section 5: Body Content */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Article Content (Markdown / HTML Supported) *
            </label>
            <textarea 
              rows={10} 
              required
              placeholder="Write the full wellness article in Markdown (# Heading, ## Subheading, *bullet points*, paragraphs)..."
              value={blogForm.content || ''}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed placeholder-slate-500 custom-scrollbar"
            ></textarea>
          </div>

          {/* Section 6: Author Details */}
          <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
            <span className="font-extrabold text-slate-200 block text-xs flex items-center gap-1.5">
              <User size={13} className="text-emerald-400" /> Author Profile & Byline
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Author Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={blogForm.author_name || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, author_name: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Author Role / Credential</label>
                <input 
                  type="text"
                  placeholder="e.g. Ayurvedic Vaidya, BAMS"
                  value={blogForm.author_role || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, author_role: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Author Avatar URL</label>
                <input 
                  type="text"
                  placeholder="https://... avatar image"
                  value={blogForm.author_avatar || ''}
                  onChange={(e) => setBlogForm({ ...blogForm, author_avatar: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Publishing & Feature Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Visibility Status</label>
              <select 
                value={Number(blogForm.is_published) === 1 ? '1' : '0'}
                onChange={(e) => setBlogForm({ ...blogForm, is_published: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer text-xs"
              >
                <option value="1">PUBLISHED (Live on Website)</option>
                <option value="0">DRAFT (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Spotlight / Featured</label>
              <label className="flex items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer text-slate-200">
                <input 
                  type="checkbox"
                  checked={blogForm.is_featured === 1 || blogForm.is_featured === true}
                  onChange={(e) => setBlogForm({ ...blogForm, is_featured: e.target.checked ? 1 : 0 })}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="font-bold text-[11px]">★ Pin to Featured Hero</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Display Sort Order</label>
              <input 
                type="number"
                min="0"
                placeholder="0 = highest priority"
                value={blogForm.sort_order ?? 0}
                onChange={(e) => setBlogForm({ ...blogForm, sort_order: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Section 8: Exact Real Date & Time, and Live Views */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-3.5 bg-slate-850 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                📅 Exact Publication Date & Time
              </label>
              <input 
                type="datetime-local"
                value={blogForm.created_at ? new Date(blogForm.created_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => setBlogForm({ ...blogForm, created_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Live timestamp shown to customers on storefront</span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                👁️ Live Real View Count
              </label>
              <input 
                type="number"
                min="0"
                placeholder="Real live views"
                value={blogForm.views_count ?? 0}
                onChange={(e) => setBlogForm({ ...blogForm, views_count: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Increments automatically in real-time as visitors read</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBlogModal(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer text-xs"
            >
              {editingBlog ? 'Save & Update Article' : 'Publish Article Live'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
