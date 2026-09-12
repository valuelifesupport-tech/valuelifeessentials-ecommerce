import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../api/config';
import { Search, Calendar, Clock, User, ArrowRight, BookOpen, Sparkles, Filter, ChevronRight } from 'lucide-react';

export default function BlogListingView({ navigateTo, showToast }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/blogs'));
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading blogs:', err);
      if (showToast) showToast('error', 'Error', 'Failed to load blog articles');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(blogs.map(b => b.category).filter(Boolean))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesCat = selectedCategory === 'All' || blog.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      blog.title.toLowerCase().includes(q) || 
      (blog.excerpt && blog.excerpt.toLowerCase().includes(q)) ||
      (blog.tags && blog.tags.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const featuredBlog = blogs.find(b => b.is_featured) || blogs[0];
  const listBlogs = searchQuery || selectedCategory !== 'All' 
    ? filteredBlogs 
    : filteredBlogs.filter(b => b.id !== featuredBlog?.id);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently published';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently published';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 pb-20">
      
      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button 
            onClick={() => navigateTo('/', { view: 'store' })} 
            className="hover:text-emerald-700 transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-bold">Wellness Journal</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-gradient-to-br from-[#12382b] via-[#1a4a39] to-[#0d271e] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ValueLife Knowledge Base & Journal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Science-Backed Wisdom for Pure, Conscious Living
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-2xl">
              Deep dives into ancient Ayurvedic botany, modern nutritional research, farm-to-table traceability, and 100% certified chemical-free lifestyle guides.
            </p>

            {/* SEARCH BAR */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, herbs, superfoods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder:text-emerald-200/60 pl-11 pr-4 py-3 rounded-2xl border border-white/20 backdrop-blur-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* CATEGORIES PILLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pl-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 space-y-4">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-200/80 shadow-sm space-y-4">
            <BookOpen className="w-12 h-12 text-emerald-600 mx-auto opacity-40" />
            <h3 className="text-xl font-black text-slate-800">No articles found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery ? `No articles matched "${searchQuery}". Try a different search term or category.` : 'Check back soon for fresh health & wellness insights!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* FEATURED STORY SPOTLIGHT (Shown when no search query and All categories) */}
            {!searchQuery && selectedCategory === 'All' && featuredBlog && (
              <div 
                onClick={() => navigateTo(`/blog/${featuredBlog.slug}`, { view: 'blog_detail', slug: featuredBlog.slug })}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto overflow-hidden relative">
                  <img
                    src={featuredBlog.featured_image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80'}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-900/90 backdrop-blur-md text-emerald-200 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    ★ Featured Story
                  </div>
                </div>
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {featuredBlog.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {featuredBlog.read_time || '5 min read'}
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredBlog.created_at)}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                      {featuredBlog.title}
                    </h2>

                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {featuredBlog.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      {featuredBlog.author_avatar ? (
                        <img src={featuredBlog.author_avatar} alt={featuredBlog.author_name} className="w-9 h-9 rounded-full object-cover border border-emerald-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {featuredBlog.author_name?.charAt(0) || 'V'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-black text-slate-900">{featuredBlog.author_name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{featuredBlog.author_role || 'Editorial Desk'}</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ARTICLES GRID */}
            <div className="space-y-4">
              {!searchQuery && selectedCategory === 'All' && (
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">Latest Wellness Articles</h3>
                  <span className="text-xs text-slate-500 font-medium">{listBlogs.length} articles</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {listBlogs.map((blog) => (
                  <article
                    key={blog.id}
                    onClick={() => navigateTo(`/blog/${blog.slug}`, { view: 'blog_detail', slug: blog.slug })}
                    className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* THUMBNAIL */}
                    <div className="h-48 sm:h-52 overflow-hidden relative bg-slate-100">
                      <img
                        src={blog.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        {blog.category}
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" /> {blog.read_time || '5 min'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(blog.created_at)}</span>
                        </div>

                        <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h4>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* FOOTER */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {blog.author_avatar ? (
                            <img src={blog.author_avatar} alt={blog.author_name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                              {blog.author_name?.charAt(0) || 'V'}
                            </div>
                          )}
                          <span className="font-bold text-slate-700 text-[11px] truncate max-w-[110px]">{blog.author_name}</span>
                        </div>

                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NEWSLETTER CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Join the Organic Movement</span>
          <h3 className="text-2xl sm:text-3xl font-black">Stay Inspired with Weekly Wellness Insights</h3>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-lg mx-auto">
            Get seasonal ayurvedic recipes, clinical nutrition updates, and exclusive organic farm discounts straight to your inbox.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-white/10 text-white placeholder:text-emerald-200/60 px-4 py-3 rounded-xl border border-white/20 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={() => showToast && showToast('success', 'Subscribed!', 'Welcome to ValueLife Wellness Newsletter!')}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-6 py-3 rounded-xl whitespace-nowrap transition-colors"
            >
              Subscribe Free
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
