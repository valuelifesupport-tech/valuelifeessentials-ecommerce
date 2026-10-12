import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, ExternalLink, ArrowRight, ToggleRight, ToggleLeft, Save } from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';
import { resolveImgUrl, DEFAULT_FALLBACK_SVG } from '../../../utils/resolveImgUrl';

export default function EditorialTab({
  adminFetch,
  showToast,
  sectionsConfig,
  updateAndSaveSectionToggle
}) {
  const [promoForm, setPromoForm] = useState({
    badge_text: 'LIMITED TIME OFFER',
    title_part1: 'Pure Products',
    title_part2: 'Happier Lives',
    subtitle: 'Flat 20% Off on Natural Essentials & Certified Organics',
    cta_text: 'Shop the Collection',
    cta_link: '/offers',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    script_quote: 'Nature Nurtures You',
    quote_subtext: '🌿 Handcrafted with Care',
    is_enabled: 1
  });

  const [storyForm, setStoryForm] = useState({
    badge_text: 'WHO WE ARE',
    heading: 'Our Story',
    overlay_title: 'A Healthier',
    overlay_subtitle: 'Tomorrow Together',
    description: 'At ValueLife, we believe in the power of nature to create a healthier, happier world. Our mission is to bring you high-quality, natural and sustainable products for a better everyday life.',
    cta_text: 'Learn More',
    cta_link: '/pages/about-us',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    is_enabled: 1
  });

  const [savingPromo, setSavingPromo] = useState(false);
  const [savingStory, setSavingStory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetcher = adminFetch || fetch;

    fetcher('/api/editorial-promo')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && (data.title_part1 || data.heading)) {
          setPromoForm(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    fetcher('/api/brand-story')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && (data.heading || data.title)) {
          setStoryForm(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [adminFetch]);

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSavingPromo(true);
    try {
      const fetcher = adminFetch || fetch;
      const res = await fetcher('/api/editorial-promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Promo Banner Saved', 'Editorial promo banner updated live on storefront!');
      } else {
        const err = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Save Failed', err.error || 'Server error');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error', err.message);
    } finally {
      setSavingPromo(false);
    }
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    setSavingStory(true);
    try {
      const fetcher = adminFetch || fetch;
      const res = await fetcher('/api/brand-story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Brand Story Saved', 'Our Story section updated live on storefront!');
      } else {
        const err = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Save Failed', err.error || 'Server error');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error', err.message);
    } finally {
      setSavingStory(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl" data-reticle-target="admin-editorial-tab">
      {/* HEADER */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            MARKETING & BRAND NARRATIVE
          </span>
          <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Sparkles size={22} className="text-amber-400" /> Editorial Promo Banner & Brand Story Studio
          </h3>
          <p className="text-xs text-slate-400">
            Manage your high-converting homepage editorial banner and the "Our Story" narrative showcase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 1. EDITORIAL PROMO BANNER FORM */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">SECTION 1</span>
              <h4 className="font-extrabold text-base text-white">Editorial Promo Banner ("Pure Products")</h4>
            </div>
            <button
              type="button"
              onClick={() => setPromoForm(p => ({ ...p, is_enabled: p.is_enabled === 1 ? 0 : 1 }))}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                promoForm.is_enabled === 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {promoForm.is_enabled === 1 ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>{promoForm.is_enabled === 1 ? 'ACTIVE' : 'MUTED'}</span>
            </button>
          </div>

          <form onSubmit={handleSavePromo} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Badge Headline Tag</label>
              <input
                type="text"
                value={promoForm.badge_text || ''}
                onChange={(e) => setPromoForm({ ...promoForm, badge_text: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="e.g. LIMITED TIME OFFER"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title Part 1 (Regular)</label>
                <input
                  type="text"
                  value={promoForm.title_part1 || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, title_part1: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Pure Products"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title Part 2 (Italic/Serif)</label>
                <input
                  type="text"
                  value={promoForm.title_part2 || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, title_part2: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Happier Lives"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Subtitle / Offer Description</label>
              <input
                type="text"
                value={promoForm.subtitle || ''}
                onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="Flat 20% Off on Natural Essentials"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={promoForm.cta_text || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, cta_text: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Shop the Collection"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">CTA Target Link</label>
                <input
                  type="text"
                  value={promoForm.cta_link || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, cta_link: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  placeholder="/offers or /products"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Handwritten Quote</label>
                <input
                  type="text"
                  value={promoForm.script_quote || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, script_quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Nature Nurtures You"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Quote Subtext</label>
                <input
                  type="text"
                  value={promoForm.quote_subtext || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, quote_subtext: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="🌿 Handcrafted with Care"
                />
              </div>
            </div>

            <ImageUploader
              label="Editorial Photography Image *"
              value={promoForm.image_url || ''}
              onChange={(url) => setPromoForm({ ...promoForm, image_url: url })}
              placeholder="Upload or paste photo URL..."
            />

            <button
              type="submit"
              disabled={savingPromo}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Save size={16} />
              <span>{savingPromo ? 'Saving Changes...' : 'Save Editorial Promo Banner Live'}</span>
            </button>
          </form>
        </div>

        {/* 2. BRAND STORY (OUR STORY) FORM */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">SECTION 2</span>
              <h4 className="font-extrabold text-base text-white">Brand Story Showcase ("Our Story")</h4>
            </div>
            <button
              type="button"
              onClick={() => setStoryForm(s => ({ ...s, is_enabled: s.is_enabled === 1 ? 0 : 1 }))}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                storyForm.is_enabled === 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {storyForm.is_enabled === 1 ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>{storyForm.is_enabled === 1 ? 'ACTIVE' : 'MUTED'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveStory} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={storyForm.badge_text || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, badge_text: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="WHO WE ARE"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={storyForm.heading || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, heading: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Our Story"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Overlay Title Line 1</label>
                <input
                  type="text"
                  value={storyForm.overlay_title || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, overlay_title: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="A Healthier"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Overlay Title Line 2</label>
                <input
                  type="text"
                  value={storyForm.overlay_subtitle || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, overlay_subtitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Tomorrow Together"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Narrative Description</label>
              <textarea
                rows={4}
                value={storyForm.description || ''}
                onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white leading-relaxed"
                placeholder="At ValueLife, we believe..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Button Text</label>
                <input
                  type="text"
                  value={storyForm.cta_text || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, cta_text: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={storyForm.cta_link || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, cta_link: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  placeholder="/pages/about-us"
                />
              </div>
            </div>

            <ImageUploader
              label="Brand Story Image (Plant / Sustainability) *"
              value={storyForm.image_url || ''}
              onChange={(url) => setStoryForm({ ...storyForm, image_url: url })}
              placeholder="Upload or paste image URL..."
            />

            <button
              type="submit"
              disabled={savingStory}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Save size={16} />
              <span>{savingStory ? 'Saving Changes...' : 'Save Brand Story Live'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
