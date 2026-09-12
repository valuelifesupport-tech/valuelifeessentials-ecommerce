import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { getApiUrl, resolveImgUrl } from '../../api/config';

export default function BrandStorySection({ navigateTo, sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_brand_story) === 0) return null;

  const [story, setStory] = useState({
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

  useEffect(() => {
    let isMounted = true;
    fetch(getApiUrl('/api/brand-story'))
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && data.heading) {
          setStory(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => {
        console.warn('Could not fetch brand story, using fallback:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  if (story.is_enabled !== undefined && Number(story.is_enabled) === 0) return null;

  const handleLearnMore = () => {
    const target = story.cta_link || '/pages/about-us';
    if (navigateTo) {
      if (target.startsWith('/pages/')) {
        const slug = target.replace('/pages/', '');
        navigateTo(target, { view: 'page', slug });
      } else {
        navigateTo(target, { view: 'all_products' });
      }
    }
  };

  return (
    <section className="py-12 bg-white" data-reticle-target="brand-story-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl overflow-hidden bg-[#faf8f5] border border-gray-200/80 shadow-md">
          
          {/* Left Column: Sprout in Hands Photography (6 cols) */}
          <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[420px] overflow-hidden group">
            <img
              src={resolveImgUrl(story.image_url)}
              alt={story.heading || 'A Healthier Tomorrow Together'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8 sm:p-10">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight max-w-sm drop-shadow-md">
                {story.overlay_title || 'A Healthier'} <br />
                <span className="italic font-normal text-emerald-300">{story.overlay_subtitle || 'Tomorrow Together'}</span>
              </h3>
            </div>
          </div>

          {/* Right Column: Narrative Content & Mission (6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
            {/* Decorative leaf watermark */}
            <Leaf 
              size={180} 
              className="absolute -bottom-8 -right-8 text-emerald-900/5 rotate-12 pointer-events-none" 
            />

            <div className="space-y-6 max-w-lg z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#164e3f] uppercase">
                <span>{story.badge_text || 'WHO WE ARE'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-950">
                {story.heading || 'Our Story'}
              </h2>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-normal">
                {story.description}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLearnMore}
                  className="bg-[#124734] hover:bg-[#0a2e22] text-white px-7 py-3 rounded-full font-bold text-xs tracking-wider shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                  data-reticle-target="brand-story-learn-more-btn"
                >
                  <span>{story.cta_text || 'Learn More'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
