import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, ExternalLink, Search, BookOpen, 
  Sparkles, Eye, CheckCircle2, XCircle, Tag, Filter, User, Clock
} from 'lucide-react';

export default function BlogsTab({
  blogs = [],
  setEditingBlog,
  setBlogForm,
  setShowBlogModal,
  handleDeleteBlog,
  handleToggleBlogPublish,
  handleToggleBlogFeatured
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Extract unique categories from blogs
  const categories = useMemo(() => {
    const set = new Set();
    blogs.forEach(b => {
      if (b.category && b.category.trim()) set.add(b.category.trim());
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.slug && b.slug.toLowerCase().includes(q)) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
        (b.author_name && b.author_name.toLowerCase().includes(q)) ||
        (b.tags && b.tags.toLowerCase().includes(q));

      const matchCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || 
        (selectedStatus === 'PUBLISHED' && (b.is_published === 1 || b.is_published === true)) ||
        (selectedStatus === 'DRAFT' && (!b.is_published || b.is_published === 0));

      return matchQuery && matchCategory && matchStatus;
    });
  }, [blogs, searchQuery, selectedCategory, selectedStatus]);

  // Metrics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter(b => b.is_published === 1 || b.is_published === true).length;
  const draftCount = totalCount - publishedCount;
  const featuredCount = blogs.filter(b => b.is_featured === 1 || b.is_featured === true).length;

  const handleOpenCreateModal = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'General Wellness',
      excerpt: '',
      content: '',
      featured_image: '',
      author_name: 'ValueLife Editorial',
      author_avatar: '',
      author_role: 'Ayurvedic Specialist',
      read_time: '5 min read',
      tags: 'Organic, Wellness, Ayurveda',
      is_published: 1,
      is_featured: 0,
      sort_order: 0,
      created_at: new Date().toISOString().slice(0, 16),
      views_count: 0
    });
    setShowBlogModal(true);
  };

  const handleOpenEditModal = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'General Wellness',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featured_image: blog.featured_image || '',
      author_name: blog.author_name || 'ValueLife Editorial',
      author_avatar: blog.author_avatar || '',
      author_role: blog.author_role || 'Ayurvedic Specialist',
      read_time: blog.read_time || '5 min read',
      tags: blog.tags || '',
      is_published: blog.is_published === 1 || blog.is_published === true ? 1 : 0,
      is_featured: blog.is_featured === 1 || blog.is_featured === true ? 1 : 0,
      sort_order: blog.sort_order || 0,
      created_at: blog.created_at ? new Date(blog.created_at).toISOString().slice(0, 16) : '',
      views_count: Number(blog.views_count) || 0,
      _editing: blog
    });
    setShowBlogModal(true);
  };

  return (
    <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-blogs-tab">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <BookOpen size={20} />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Blog & Wellness Journal CMS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create, curate, and publish search-optimized Ayurvedic articles and wellness stories.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/50 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          data-reticle-target="admin-create-blog-btn"
        >
          <Plus size={16} /> Write New Article
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Articles</span>
            <span className="text-xl font-black text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <BookOpen size={18} />
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">Live / Published</span>
            <span className="text-xl font-black text-emerald-300 mt-1 block">{publishedCount}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">Drafts / Hidden</span>
            <span className="text-xl font-black text-amber-300 mt-1 block">{draftCount}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <XCircle size={18} />
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-400 block uppercase tracking-wider">Spotlighted</span>
            <span className="text-xl font-black text-purple-300 mt-1 block">{featuredCount}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by article title, slug, excerpt, tags, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-850 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600 transition-colors"
            data-reticle-target="admin-blogs-search-input"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Status</option>
              <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">Published</option>
              <option value="DRAFT" className="bg-slate-900 text-amber-400">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-blogs-table-container">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
            <tr>
              <th className="p-3">Article Details</th>
              <th className="p-3">Category & Tags</th>
              <th className="p-3">Author & Read Time</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-center">Views</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <span className="text-3xl block">🌿</span>
                    <p className="font-extrabold text-sm text-white">No Blog Articles Found</p>
                    <p className="text-xs text-slate-500">
                      {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                        ? 'No articles match your current search/filter criteria.'
                        : 'Your wellness journal has no articles yet. Create your first post!'}
                    </p>
                    {(!searchQuery && selectedCategory === 'ALL' && selectedStatus === 'ALL') && (
                      <button 
                        onClick={handleOpenCreateModal}
                        className="mt-2 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-md"
                      >
                        <Plus size={14} /> + Create First Article
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredBlogs.map(b => {
                const isPub = b.is_published === 1 || b.is_published === true;
                const isFeat = b.is_featured === 1 || b.is_featured === true;

                return (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition-colors" data-reticle-target={`admin-blog-row-${b.id}`}>
                    {/* Article Details */}
                    <td className="p-3 max-w-xs">
                      <div className="flex items-start gap-3">
                        {b.featured_image ? (
                          <img 
                            src={b.featured_image} 
                            alt={b.title} 
                            className="w-14 h-11 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-14 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 flex-shrink-0">
                            <BookOpen size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-extrabold text-white text-sm line-clamp-1">{b.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <span>/blog/{b.slug}</span>
                          </div>
                          {b.excerpt && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {b.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="p-3">
                      <span className="inline-block bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {b.category || 'General Wellness'}
                      </span>
                      {b.tags && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 flex-wrap">
                          <Tag size={10} className="flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{b.tags}</span>
                        </div>
                      )}
                    </td>

                    {/* Author & Read Time */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {b.author_avatar ? (
                          <img 
                            src={b.author_avatar} 
                            alt={b.author_name} 
                            className="w-6 h-6 rounded-full object-cover border border-slate-700"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            {b.author_name ? b.author_name.charAt(0).toUpperCase() : 'V'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-200 text-xs">{b.author_name || 'ValueLife'}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{b.read_time || '5 min read'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleBlogPublish(b)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-all cursor-pointer ${
                          isPub 
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900/80' 
                            : 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                        }`}
                        title="Click to toggle publish status"
                        data-reticle-target={`admin-blog-toggle-publish-${b.id}`}
                      >
                        {isPub ? '● Live' : '○ Draft'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleBlogFeatured(b)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                          isFeat 
                            ? 'bg-purple-950/80 text-purple-300 border-purple-700 hover:bg-purple-900/80' 
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                        title="Click to toggle featured status"
                        data-reticle-target={`admin-blog-toggle-featured-${b.id}`}
                      >
                        {isFeat ? '★ Featured' : '☆ Normal'}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 font-mono text-xs">
                        <Eye size={12} className="text-slate-500" />
                        <span>{b.views_count || 0}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Preview on live site"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button 
                          onClick={() => handleOpenEditModal(b)}
                          className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          data-reticle-target={`admin-edit-blog-btn-${b.id}`}
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(b.id, b.title)}
                          className="bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          data-reticle-target={`admin-delete-blog-btn-${b.id}`}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
