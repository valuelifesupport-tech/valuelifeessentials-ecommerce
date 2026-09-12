import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../api/config';
import { ChevronRight, Clock, Calendar, Eye, Share2, Check, ArrowLeft, Bookmark, ShoppingBag, MessageCircle, Link2 } from 'lucide-react';
import { TwitterIcon, FacebookIcon, WhatsAppIcon } from '../layout/SocialIcons';

export default function BlogDetailView({ slug, navigateTo, showToast }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBlogDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/api/blogs/${slug}`));
      if (!res.ok) throw new Error('Article not found');
      const data = await res.json();
      setBlog(data);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || 'ValueLife Wellness Article';

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      if (showToast) showToast('success', 'Link Copied!', 'Article link copied to your clipboard.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently published';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently published';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-700 font-bold animate-pulse">
          <div className="w-6 h-6 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Article...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-5xl">🌿</div>
        <h2 className="text-2xl font-black text-slate-800">Article Not Found</h2>
        <p className="text-sm text-slate-500">The wellness article you are looking for has been moved or updated.</p>
        <button
          onClick={() => navigateTo('/blog', { view: 'blog' })}
          className="bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wellness Journal
        </button>
      </div>
    );
  }

  const tagsList = (blog.tags || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 pb-24">
      
      {/* HEADER BREADCRUMB & BACK */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => navigateTo('/blog', { view: 'blog' })}
            className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-bold transition-colors bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Articles
          </button>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <button onClick={() => navigateTo('/', { view: 'store' })} className="hover:text-emerald-700">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigateTo('/blog', { view: 'blog' })} className="hover:text-emerald-700">Journal</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-800 font-bold truncate max-w-[200px]">{blog.category}</span>
          </div>
        </div>
      </div>

      {/* ARTICLE HERO BANNER */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* METADATA HEADER */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-emerald-800 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {blog.category}
            </span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" /> {blog.read_time || '5 min read'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> {formatDate(blog.created_at)}
            </span>
            {blog.views_count > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {blog.views_count} views
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-emerald-600 pl-4 py-1">
              {blog.excerpt}
            </p>
          )}

          {/* AUTHOR BYLINE */}
          <div className="flex items-center justify-between pt-4 pb-4 border-y border-slate-200/80">
            <div className="flex items-center gap-3">
              {blog.author_avatar ? (
                <img src={blog.author_avatar} alt={blog.author_name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-sm shadow-md">
                  {blog.author_name?.charAt(0) || 'V'}
                </div>
              )}
              <div>
                <div className="font-black text-sm text-slate-900">{blog.author_name}</div>
                <div className="text-xs text-emerald-800 font-semibold">{blog.author_role || 'ValueLife Wellness Expert'}</div>
              </div>
            </div>

            {/* SHARE BUTTONS */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleShare('whatsapp')}
                title="Share on WhatsApp"
                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors border border-emerald-200"
              >
                <WhatsAppIcon size={14} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                title="Share on Twitter / X"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
              >
                <TwitterIcon size={14} />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
              >
                <FacebookIcon size={14} />
              </button>
              <button
                onClick={() => handleShare('copy')}
                title="Copy Link"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-700 hover:text-white flex items-center justify-center transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* FEATURED IMAGE */}
        {blog.featured_image && (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 max-h-[500px]">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* RICH ARTICLE CONTENT */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm">
          <div 
            className="prose prose-emerald lg:prose-lg max-w-none text-slate-700 leading-relaxed
              [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-4
              [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-slate-800 [&>h3]:mt-6 [&>h3]:mb-3
              [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-4
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:mb-6
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:mb-6
              [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-emerald-900 [&>blockquote]:bg-emerald-50/50 [&>blockquote]:py-2 [&>blockquote]:my-6 [&>blockquote]:rounded-r-xl
              [&>table]:w-full [&>table]:border [&>table]:border-slate-200 [&>table]:my-6 [&>table]:rounded-xl [&>table]:overflow-hidden
              [&>table_th]:bg-slate-50 [&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:font-bold [&>table_th]:border-b
              [&>table_td]:p-3 [&>table_td]:border-b [&>table_td]:border-slate-100"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* TAGS */}
          {tagsList.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Tags:</span>
              {tagsList.map(tag => (
                <span
                  key={tag}
                  className="bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
                  onClick={() => navigateTo('/blog', { view: 'blog' })}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AUTHOR BIO CARD */}
        <div className="bg-gradient-to-br from-emerald-50 to-[#e8f4ec] rounded-3xl p-6 sm:p-8 border border-emerald-100 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {blog.author_avatar ? (
            <img src={blog.author_avatar} alt={blog.author_name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-md shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
              {blog.author_name?.charAt(0) || 'V'}
            </div>
          )}
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Verified Wellness Contributor
            </span>
            <h4 className="text-lg font-black text-slate-900">{blog.author_name}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contributing author at ValueLife Essentials. Dedicated to evidence-based holistic wellness, Ayurvedic botanicals, and clean non-toxic nutrition.
            </p>
          </div>
        </div>

        {/* RELATED ARTICLES */}
        {blog.related_posts && blog.related_posts.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Recommended Reading</h3>
              <button
                onClick={() => navigateTo('/blog', { view: 'blog' })}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                View all articles →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {blog.related_posts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => navigateTo(`/blog/${rel.slug}`, { view: 'blog_detail', slug: rel.slug })}
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={rel.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{rel.category}</span>
                      <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mt-1">
                        {rel.title}
                      </h5>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100 inline-flex items-center gap-1">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM CTA: SHOP ORGANIC ESSENTIALS */}
        <div className="bg-emerald-950 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-black">Experience Nature's Purest Essentials</h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-lg mx-auto">
            Ready to upgrade your daily rituals? Explore our 100% certified organic groceries, raw honey, cold-pressed oils, and Himalayan superfoods.
          </p>
          <button
            onClick={() => navigateTo('/products', { view: 'all_products' })}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Organic Catalog Now
          </button>
        </div>

      </article>
    </div>
  );
}
