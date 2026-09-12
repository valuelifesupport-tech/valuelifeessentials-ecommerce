import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../api/config';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function BlogSection({ sectionsConfig, navigateTo }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch('/api/blogs?limit=3')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch(err => console.error('BlogSection fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (sectionsConfig?.show_blog_section === 0) return null;
  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#faf8f5]" data-reticle-target="home-blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Wellness & Organic Journal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Wisdom for a Healthier You
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Explore science-backed nutritional insights, ancient Ayurvedic remedies, and guides to chemical-free organic living.
            </p>
          </div>

          <button
            onClick={() => navigateTo('/blog', { view: 'blog' })}
            className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-sm group shrink-0"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map(post => (
              <article
                key={post.id}
                onClick={() => navigateTo(`/blog/${post.slug}`, { view: 'blog_detail', slug: post.slug })}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="h-52 overflow-hidden relative bg-slate-100">
                  <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{post.read_time || '5 min read'}</span>
                      <span>•</span>
                      <span>By {post.author_name}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-800">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
