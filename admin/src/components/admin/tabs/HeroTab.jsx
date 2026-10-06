import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ToggleRight, ToggleLeft, Plus, Edit, Trash2, 
  CheckCircle, XCircle, Eye, ArrowRight, Image as ImageIcon,
  Layers, ExternalLink, HelpCircle
} from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';
import HeroSection from '../../sections/HeroSection';
import { getApiUrl, resolveImgUrl } from '../../../api/config';

export default function HeroTab({
  heroConfig = {},
  setHeroConfig,
  sectionsConfig = {},
  setSectionsConfig,
  handleHeroSubmit,
  updateAndSaveHeroToggle,
  showToast,
  adminFetch,
  heroSlides = [],
  setHeroSlides,
  fetchHeroSlides,
  askConfirmation
}) {
  const isHeroEnabled = Number(heroConfig?.hero_enabled) === 1 || heroConfig?.hero_enabled === true;

  // Local state for modal & form
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const initialSlideForm = {
    title_part1: '',
    title_part2: '',
    tagline: '100% Nature pure Essentials',
    description: '',
    cta_text: 'Shop Now',
    cta_link: '/products',
    packaging_img: '',
    jars_img: '',
    script_quote: 'Good Products, Brighter Days.',
    sort_order: (heroSlides?.length || 0) + 1,
    is_active: 1
  };

  const [slideForm, setSlideForm] = useState(initialSlideForm);

  // Keep preview index bounded
  useEffect(() => {
    if (heroSlides && heroSlides.length > 0 && previewSlideIndex >= heroSlides.length) {
      setPreviewSlideIndex(0);
    }
  }, [heroSlides, previewSlideIndex]);

  // Handle Master ON / OFF Toggle
  const handleToggle = () => {
    const nextVal = isHeroEnabled ? 0 : 1;
    if (typeof updateAndSaveHeroToggle === 'function') {
      updateAndSaveHeroToggle(nextVal);
    } else {
      if (setHeroConfig) setHeroConfig(prev => ({ ...prev, hero_enabled: nextVal }));
      if (setSectionsConfig) setSectionsConfig(prev => ({ ...prev, show_hero: nextVal }));
    }
  };

  // Open Create Modal
  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      ...initialSlideForm,
      sort_order: (heroSlides?.length || 0) + 1
    });
    setShowSlideModal(true);
  };

  // Open Edit Modal
  const handleOpenEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      title_part1: slide.title_part1 || '',
      title_part2: slide.title_part2 || '',
      tagline: slide.tagline || '',
      description: slide.description || '',
      cta_text: slide.cta_text || 'Shop Now',
      cta_link: slide.cta_link || '/products',
      packaging_img: slide.packaging_img || '',
      jars_img: slide.jars_img || '',
      script_quote: slide.script_quote || '',
      sort_order: slide.sort_order !== undefined ? Number(slide.sort_order) : 0,
      is_active: slide.is_active !== undefined ? Number(slide.is_active) : 1
    });
    setShowSlideModal(true);
  };

  // Submit Add or Edit Slide
  const handleSlideFormSubmit = async (e) => {
    e.preventDefault();
    if (!slideForm.title_part1) {
      if (showToast) showToast('error', 'Title Required', 'Please enter Headline Part 1.');
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingSlide;
      const url = isEdit
        ? getApiUrl(`/api/admin/hero-slides/${editingSlide.id}`)
        : getApiUrl('/api/admin/hero-slides');
      const method = isEdit ? 'PUT' : 'POST';

      const token = localStorage.getItem('admin_session_token') || '';
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-token': token,
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(slideForm)
      });

      if (res.ok) {
        setShowSlideModal(false);
        if (typeof fetchHeroSlides === 'function') {
          await fetchHeroSlides();
        } else if (setHeroSlides) {
          const updated = await fetch(getApiUrl('/api/admin/hero-slides'), { headers }).then(r => r.json());
          if (Array.isArray(updated)) setHeroSlides(updated);
        }
        if (showToast) {
          showToast('success', isEdit ? 'Slide Updated Live' : 'Slide Created Live', isEdit ? 'Hero slide updated successfully!' : 'New hero slide added to carousel!');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Save Failed', errData.error || 'Failed to save hero slide.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Single Slide Active Status
  const handleToggleSlideActive = async (slide) => {
    const updatedStatus = Number(slide.is_active) === 1 ? 0 : 1;
    try {
      const token = localStorage.getItem('admin_session_token') || '';
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-token': token,
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(getApiUrl(`/api/admin/hero-slides/${slide.id}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...slide, is_active: updatedStatus })
      });

      if (res.ok) {
        if (setHeroSlides) {
          setHeroSlides(prev => prev.map(s => s.id === slide.id ? { ...s, is_active: updatedStatus } : s));
        }
        if (showToast) {
          showToast('success', 'Status Updated', `Slide #${slide.id} is now ${updatedStatus === 1 ? 'ACTIVE' : 'INACTIVE'}.`);
        }
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error', err.message);
    }
  };

  // Delete Slide Handler
  const handleDeleteSlide = (slideId, title) => {
    const doDelete = async () => {
      try {
        const token = localStorage.getItem('admin_session_token') || '';
        const headers = {
          'x-admin-token': token,
          'Authorization': `Bearer ${token}`
        };

        const res = await fetch(getApiUrl(`/api/admin/hero-slides/${slideId}`), {
          method: 'DELETE',
          headers
        });

        if (res.ok) {
          if (setHeroSlides) {
            setHeroSlides(prev => prev.filter(s => s.id !== slideId));
          }
          if (showToast) {
            showToast('info', 'Slide Deleted', 'Hero slide removed from carousel.');
          }
        }
      } catch (err) {
        if (showToast) showToast('error', 'Error', err.message);
      }
    };

    if (typeof askConfirmation === 'function') {
      askConfirmation({
        title: 'Delete Hero Slide?',
        message: `Are you sure you want to delete slide "${title || 'Slide #' + slideId}" from the storefront hero carousel? This action cannot be undone.`,
        confirmText: 'Delete Slide',
        danger: true,
        onConfirm: doDelete
      });
    } else {
      if (window.confirm(`Delete hero slide "${title || 'Slide #' + slideId}"?`)) {
        doDelete();
      }
    }
  };

  return (
    <div className="space-y-6" data-reticle-target="admin-hero-tab">
      {/* TOP HEADER BAR */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <Sparkles className="text-emerald-400" size={20} /> Storefront Hero Carousel Studio
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
              {heroSlides?.length || 0} Slides
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, sort and manage dynamic rotating slides shown on your live homepage. Live preview on right matches storefront 100%.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* MASTER ON / OFF TOGGLE BUTTON */}
          <button 
            type="button"
            onClick={handleToggle}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isHeroEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-1 ring-emerald-400/40' 
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 shadow-rose-950/40'
            }`}
            data-reticle-target="admin-toggle-hero-enabled"
            title="Toggle whether the Hero section is displayed on the homepage"
          >
            {isHeroEnabled ? <ToggleRight size={20} className="text-emerald-300" /> : <ToggleLeft size={20} className="text-rose-400" />}
            <span>{isHeroEnabled ? 'HERO SECTION ON' : 'HERO SECTION OFF'}</span>
          </button>

          {/* ADD NEW SLIDE BUTTON */}
          <button
            type="button"
            onClick={handleOpenAddSlide}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            data-reticle-target="admin-add-hero-slide-btn"
          >
            <Plus size={16} />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* 50-50 SIDE-BY-SIDE SPLIT: CONTROLS & REAL-TIME PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* LEFT COLUMN: HERO SLIDES LIST & CRUD (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* MASTER STATUS CARD */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${isHeroEnabled ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Storefront Visibility: {isHeroEnabled ? 'ACTIVE & VISIBLE' : 'DISABLED & HIDDEN'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isHeroEnabled 
                    ? 'Hero carousel is active on the homepage with automatic 4.5s slide transition.' 
                    : 'Hero section is turned OFF. Homepage visitors will not see the hero section.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0"
            >
              {isHeroEnabled ? 'Turn OFF' : 'Turn ON'}
            </button>
          </div>

          {/* ROTATING SLIDES LIST */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                <Layers size={16} className="text-emerald-400" />
                Rotating Hero Slides ({heroSlides?.length || 0})
              </h4>
              <span className="text-[11px] text-slate-400">
                Sorted by Sort Order
              </span>
            </div>

            {(!heroSlides || heroSlides.length === 0) ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <Sparkles className="mx-auto text-emerald-400" size={32} />
                <p className="text-sm font-bold text-slate-200">No slides found in database</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button below to add your first dynamic rotating slide with custom headline, tagline, and packaging image.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSlide}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus size={14} /> Add First Slide
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {heroSlides.map((slide, idx) => {
                  const isActive = Number(slide.is_active) === 1;
                  const isSelectedForPreview = previewSlideIndex === idx;

                  return (
                    <div 
                      key={slide.id || idx}
                      className={`p-4 bg-slate-950 rounded-xl border transition-all space-y-3 ${
                        isSelectedForPreview 
                          ? 'border-emerald-500 ring-1 ring-emerald-500/30' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Bar: Order, Tagline & Action Buttons */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-xs font-black">
                            {slide.sort_order || idx + 1}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                            {slide.tagline || 'HERO SLIDE'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Active / Inactive toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleSlideActive(slide)}
                            className={`text-[10px] font-black px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              isActive 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                            title="Click to toggle active/inactive status"
                          >
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </button>

                          {/* Preview In Canvas Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewSlideIndex(idx)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelectedForPreview 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                            title="View this slide in the live preview canvas on right"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlide(slide)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                            title="Edit Slide"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id, `${slide.title_part1} ${slide.title_part2 || ''}`)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h5 className="text-sm font-extrabold text-white font-serif">
                          {slide.title_part1}{' '}
                          {slide.title_part2 && (
                            <span className="text-emerald-400 italic font-serif font-normal">
                              {slide.title_part2}
                            </span>
                          )}
                        </h5>
                        {slide.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">
                            {slide.description}
                          </p>
                        )}
                      </div>

                      {/* Image Thumbnails & Info Row */}
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-850">
                        {/* Packaging Image Thumbnail */}
                        <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                          {slide.packaging_img ? (
                            <img 
                              src={resolveImgUrl(slide.packaging_img)} 
                              alt="Packaging" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">No Img</div>
                          )}
                        </div>

                        {/* Floating Jars Image Thumbnail */}
                        {slide.jars_img && (
                          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                            <img 
                              src={resolveImgUrl(slide.jars_img)} 
                              alt="Jars" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="min-w-0 text-[11px] text-slate-400 space-y-0.5 truncate flex-1">
                          <div className="truncate">
                            <strong className="text-slate-300">CTA:</strong> {slide.cta_text || 'Shop Now'} → <span className="font-mono text-[10px] text-slate-500">{slide.cta_link || '/products'}</span>
                          </div>
                          {slide.script_quote && (
                            <div className="italic text-emerald-400/80 truncate font-serif">
                              "{slide.script_quote}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME STOREFRONT PREVIEW CANVAS (6 cols) */}
        <div className="lg:col-span-6 sticky top-6 space-y-3" data-reticle-target="admin-hero-preview-canvas">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                  REAL STOREFRONT HERO PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-extrabold uppercase">
                  100% STOREFRONT MATCH
                </span>
              </div>
            </div>

            {/* SLIDE SWITCHER PILLS FOR PREVIEW */}
            {heroSlides && heroSlides.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Preview Slide:
                </span>
                {heroSlides.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setPreviewSlideIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      previewSlideIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Slide #{idx + 1} {s.title_part1 ? `(${s.title_part1.slice(0, 10)}...)` : ''}
                  </button>
                ))}
              </div>
            )}

            {/* MOCK BROWSER FRAME */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
              {/* BROWSER BAR */}
              <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="bg-slate-900 px-3 py-0.5 rounded-md border border-slate-700 text-slate-300 text-[10px]">
                  {import.meta.env.VITE_STOREFRONT_URL || 'https://valuelifeessentials.com'} (Live Storefront)
                </span>
                <div className="text-[10px] text-emerald-400 font-bold">100% Live Sync</div>
              </div>

              {/* RENDERED REAL STOREFRONT HERO SECTION */}
              <div className="max-h-[620px] overflow-y-auto bg-[#fbf9f5] scrollbar-thin">
                {isHeroEnabled ? (
                  <HeroSection 
                    heroConfig={heroConfig} 
                    sectionsConfig={sectionsConfig} 
                    heroSlides={heroSlides}
                    activeSlideIndex={previewSlideIndex}
                    onSlideChange={setPreviewSlideIndex}
                    navigateTo={() => {}} 
                  />
                ) : (
                  <div className="py-20 px-6 text-center space-y-4 bg-slate-950 text-white">
                    <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                      🚫
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-['Outfit']">
                        Hero Section is Currently Turned OFF
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        This section is currently hidden from your storefront visitors. Turn it ON anytime using the button above.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Turn Hero Section ON
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium">
              💡 The preview above renders the exact storefront hero with real rotating slides from database, kraft packaging imagery, cursive script quote & trust badges!
            </p>
          </div>
        </div>
      </div>

      {/* HERO SLIDE MODAL (CREATE / EDIT) */}
      {showSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" data-reticle-target="admin-hero-slide-modal">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">HERO STUDIO</span>
                <h3 className="font-extrabold text-base text-white font-['Outfit']">
                  {editingSlide ? 'Edit Rotating Hero Slide' : 'Add New Rotating Hero Slide'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowSlideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSlideFormSubmit} className="space-y-4 text-xs">
              {/* Headlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Headline Part 1 *</label>
                  <input 
                    type="text" required
                    value={slideForm.title_part1}
                    onChange={(e) => setSlideForm({ ...slideForm, title_part1: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    placeholder="e.g. Better Choices"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Headline Part 2 (Green Italic)</label>
                  <input 
                    type="text"
                    value={slideForm.title_part2}
                    onChange={(e) => setSlideForm({ ...slideForm, title_part2: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-serif italic"
                    placeholder="e.g. Better Life."
                  />
                </div>
              </div>

              {/* Tagline Pill */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tagline Pill *</label>
                <input 
                  type="text" required
                  value={slideForm.tagline}
                  onChange={(e) => setSlideForm({ ...slideForm, tagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold tracking-wider"
                  placeholder="e.g. 100% Nature pure Essentials"
                />
              </div>

              {/* Description Subtext */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Description Subtext</label>
                <textarea 
                  rows={2}
                  value={slideForm.description}
                  onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  placeholder="Discover natural, healthy and premium products for a smarter, happier everyday life."
                />
              </div>

              {/* CTA Button Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CTA Button Text</label>
                  <input 
                    type="text"
                    value={slideForm.cta_text}
                    onChange={(e) => setSlideForm({ ...slideForm, cta_text: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CTA Target Link</label>
                  <input 
                    type="text"
                    value={slideForm.cta_link}
                    onChange={(e) => setSlideForm({ ...slideForm, cta_link: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="/products"
                  />
                </div>
              </div>

              {/* Script Quote */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Script Quote (Cursive Flourish)</label>
                <input 
                  type="text"
                  value={slideForm.script_quote}
                  onChange={(e) => setSlideForm({ ...slideForm, script_quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-serif italic"
                  placeholder="e.g. Good Products, Brighter Days."
                />
              </div>

              {/* Primary Packaging Image */}
              <ImageUploader 
                label="Primary Product Packaging Image *"
                value={slideForm.packaging_img}
                onChange={(url) => setSlideForm({ ...slideForm, packaging_img: url })}
                placeholder="Upload primary product kraft pouch or paste image URL..."
              />

              {/* Secondary Floating Accent Image */}
              <ImageUploader 
                label="Secondary Floating Visual Image (Optional Accent)"
                value={slideForm.jars_img}
                onChange={(url) => setSlideForm({ ...slideForm, jars_img: url })}
                placeholder="Upload secondary accent image (jars, honey, leaves)..."
              />

              {/* Sort Order & Active Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sort Order</label>
                  <input 
                    type="number"
                    value={slideForm.sort_order}
                    onChange={(e) => setSlideForm({ ...slideForm, sort_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Active Status</label>
                  <select 
                    value={slideForm.is_active}
                    onChange={(e) => setSlideForm({ ...slideForm, is_active: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value={1}>Active (Visible in Carousel)</option>
                    <option value={0}>Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <span>Saving Slide...</span> : <span>{editingSlide ? 'Save & Update Slide' : 'Create Slide Live'}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
