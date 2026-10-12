import React from 'react';
import { Plus, Edit, Trash2, ExternalLink, Sparkles, Instagram, ToggleRight, ToggleLeft } from 'lucide-react';
import { resolveImgUrl, DEFAULT_FALLBACK_SVG } from '../../../utils/resolveImgUrl';

export default function InstagramTab({
  instagramPosts = [],
  setInstagramPosts,
  setShowInstagramModal,
  setEditingInstagramPost,
  setInstagramForm,
  handleDeleteInstagramPost,
  handleToggleInstagramActive,
  sectionsConfig,
  updateAndSaveSectionToggle,
  settings,
  adminFetch,
  showToast
}) {
  const storeInstagramUrl = settings?.instagram_url || 'https://www.instagram.com/valuelife_essentials/?hl=en';

  const handleOpenAdd = () => {
    setEditingInstagramPost(null);
    setInstagramForm({
      title: '',
      image_url: '',
      post_url: storeInstagramUrl,
      sort_order: instagramPosts.length + 1,
      is_active: 1
    });
    setShowInstagramModal(true);
  };

  const handleOpenEdit = (post) => {
    setEditingInstagramPost(post);
    setInstagramForm({
      title: post.title || '',
      image_url: post.image_url || '',
      post_url: post.post_url || storeInstagramUrl,
      sort_order: post.sort_order ?? 1,
      is_active: post.is_active !== undefined ? Number(post.is_active) : 1
    });
    setShowInstagramModal(true);
  };

  const isSectionEnabled = sectionsConfig?.show_instagram_feed === 1 || sectionsConfig?.show_instagram_feed === undefined;

  return (
    <div className="space-y-6 w-full" data-reticle-target="admin-instagram-tab">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest block">
            MARKETING & SOCIAL PROOF
          </span>
          <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            📸 Instagram Feed & Gallery Studio ({instagramPosts.length} Posts)
          </h3>
          <p className="text-xs text-slate-400">
            Manage your storefront 6-grid Instagram showcase. Posts link directly to your Instagram reels & photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {updateAndSaveSectionToggle && (
            <button
              type="button"
              onClick={() => updateAndSaveSectionToggle('show_instagram_feed', isSectionEnabled ? 0 : 1)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isSectionEnabled 
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Instagram Feed display on homepage"
            >
              {isSectionEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>Storefront Section: {isSectionEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            data-reticle-target="admin-add-instagram-post-btn"
          >
            <Plus size={16} />
            <span>Add New Post</span>
          </button>
        </div>
      </div>

      {/* STORE PROFILE LINK CARD */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl text-white shadow-md">
            <Instagram size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Connected Storefront Profile</span>
              <span className="text-[10px] bg-pink-950 text-pink-300 px-2 py-0.5 rounded-full border border-pink-800 font-extrabold">
                Live Link
              </span>
            </div>
            <a 
              href={storeInstagramUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 font-mono"
            >
              <span>{storeInstagramUrl}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 max-w-sm">
          💡 The storefront displays the latest 6 active posts in a clean grid. Clicking on each image takes users directly to your Instagram post.
        </span>
      </div>

      {/* POSTS GRID */}
      {instagramPosts.length === 0 ? (
        <div className="p-16 text-center bg-slate-900 rounded-2xl border border-dashed border-slate-800 space-y-4">
          <div className="p-4 bg-slate-800/80 w-fit mx-auto rounded-2xl border border-slate-700/60 text-pink-400 shadow-md">
            <Instagram size={36} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No Instagram Posts Added Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Add your Instagram photos, reels, or product lifestyle imagery here. They will automatically be featured in the 6-Grid section on the storefront homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            <span>Add First Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, idx) => (
            <div 
              key={post.id || idx}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md group flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
              data-reticle-target={`admin-instagram-card-${post.id}`}
            >
              {/* IMAGE WRAPPER */}
              <div className="relative aspect-square overflow-hidden bg-slate-950">
                <img 
                  src={resolveImgUrl(post.image_url)} 
                  alt={post.title || 'Instagram Post'} 
                  onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(post)}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Post"
                    data-reticle-target={`admin-edit-ig-${post.id}`}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteInstagramPost(post.id, post.title)}
                    className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Post"
                    data-reticle-target={`admin-delete-ig-${post.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-sm text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    #{post.sort_order || idx + 1}
                  </span>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-white block truncate" title={post.title}>
                    {post.title || 'Instagram Post'}
                  </span>
                  <a 
                    href={post.post_url || storeInstagramUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-emerald-400 hover:underline truncate block flex items-center gap-1 mt-1 font-mono"
                    title={post.post_url || storeInstagramUrl}
                  >
                    <ExternalLink size={10} className="flex-shrink-0" />
                    <span className="truncate">Instagram Link</span>
                  </a>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 mt-2">
                  <span className="text-[10px] text-slate-500 font-medium">Status</span>
                  <button
                    type="button"
                    onClick={() => handleToggleInstagramActive(post)}
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      Number(post.is_active) === 1 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {Number(post.is_active) === 1 ? 'ACTIVE' : 'HIDDEN'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
