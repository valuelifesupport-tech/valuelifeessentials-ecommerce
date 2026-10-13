import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

const DEFAULT_CATEGORY_IMAGES = {
  'Herbs & Teas': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'Cereals & Grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  'Herbal Supplements': 'https://images.unsplash.com/photo-1617957743097-0d20ab242224?auto=format&fit=crop&w=600&q=80',
  'Legumes & Pulses': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  'Nuts & Seeds': 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?auto=format&fit=crop&w=600&q=80',
  'Spices & Seasoning': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'Flours & Starches': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'Fruits & Snacks': 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80',
  'Grocery & Food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'Health & Personal Care': 'https://images.unsplash.com/photo-1608248597262-838198f12c1c?auto=format&fit=crop&w=600&q=80',
  'Skin & Body Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  'Home & Garden': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'
};

export default function CategorySlider({ categories = [], navigateTo, sectionTitle, sectionsConfig }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef(null);

  const getCatImgUrl = (cat) => {
    if (cat.image_url && !cat.image_url.includes('179162')) {
      return resolveImgUrl(cat.image_url);
    }
    return DEFAULT_CATEGORY_IMAGES[cat.name] || (cat.image_url ? resolveImgUrl(cat.image_url) : null);
  };

  // Real database categories only
  const displayCategories = categories || [];

  // Auto-scroll loop effect
  useEffect(() => {
    if (isPaused || displayCategories.length <= 3) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      // If reached the end, smoothly scroll back to beginning
      if (scrollLeft + clientWidth >= scrollWidth - 25) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll forward by one card step
        scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, displayCategories.length]);

  const handleManualScroll = (direction) => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }

    // Resume auto-slide after 4 seconds of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  if (sectionsConfig && Number(sectionsConfig.show_categories_slider) === 0) return null;
  if (displayCategories.length === 0) return null;

  return (
    <section 
      className="py-12 bg-[#faf9f6]" 
      data-reticle-target="category-slider-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              {sectionTitle || 'Shop by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Explore our wide range of pure organic and natural essentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-600 hover:bg-[#164e3f] hover:text-white transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="w-9 h-9 rounded-full bg-[#164e3f] text-white shadow-md flex items-center justify-center hover:bg-[#0f382d] transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
        >
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo && navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug || cat.id })}
              className="group min-w-[170px] sm:min-w-[190px] max-w-[190px] bg-white border border-gray-200/70 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f4efe8] flex items-center justify-center mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300 relative">
                {getCatImgUrl(cat) ? (
                  <img 
                    src={getCatImgUrl(cat)} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const defImg = DEFAULT_CATEGORY_IMAGES[cat.name];
                      if (defImg && e.currentTarget.src !== defImg) {
                        e.currentTarget.src = defImg;
                        return;
                      }
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.cat-emoji-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`cat-emoji-fallback text-3xl sm:text-4xl ${getCatImgUrl(cat) ? 'hidden' : 'flex'} items-center justify-center select-none`}>
                  {cat.icon || '🌿'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#164e3f] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {cat.subcategories.length} Sub-items
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
