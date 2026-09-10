import { getApiUrl } from '../../api/config';
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const resolveImgUrl = (url, fallback = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80') => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  let clean = url.trim();

  if (clean.startsWith('data:')) return clean;

  if (clean.includes('/uploads/')) {
    const filename = clean.split('/uploads/').pop();
    return getApiUrl(`/api/media/file/${filename}`);
  }

  if (clean.includes('/images/')) {
    const relative = clean.split('/images/').pop();
    return `/images/${relative}`;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return getApiUrl(path);
};

export default function CategorySlider({ categories, navigateTo, sectionTitle, sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_categories_slider) === 0) return null;
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
    const dotIndex = Math.min(2, Math.floor(progress * 3));
    setActiveIndex(dotIndex);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;

    if (direction === 'right') {
      if (scrollLeft + 15 >= maxScroll) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    } else {
      if (scrollLeft <= 15) {
        scrollRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const autoScrollTimer = setInterval(() => {
      scroll('right');
    }, 3500);
    return () => clearInterval(autoScrollTimer);
  }, [categories]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 relative group/slider">
      {/* SECTION TITLE & HEADER (Matching Screenshot 1) */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-['Outfit']">
          {sectionTitle || 'Shop By Categories'}
        </h2>
        <div className="w-16 h-1 bg-emerald-700 mx-auto rounded-full opacity-80" />
      </div>

      {/* SLIDER CONTAINER WITH FLOATING ARROWS */}
      <div className="relative">
        {/* LEFT NAV ARROW */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200 flex items-center justify-center hover:bg-[#1b4332] hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95"
          aria-label="Previous Categories"
        >
          <ChevronLeft size={20} />
        </button>

        {/* HORIZONTAL SWIPEABLE CAROUSEL */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo(`/category/${cat.slug}`, { view: 'catalog', slug: null, category: cat.slug, collection: null })}
              className="shrink-0 snap-center flex flex-col items-center cursor-pointer group w-32 sm:w-44 text-center transition-transform hover:-translate-y-1"
            >
              {/* CIRCULAR CATEGORY IMAGE CONTAINER (Exact Screenshot 1 aesthetic) */}
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border-2 border-emerald-900/15 p-1 bg-white shadow-md group-hover:shadow-2xl group-hover:border-[#2d6a4f] transition-all duration-300 relative overflow-hidden flex items-center justify-center">
                <img
                  src={resolveImgUrl(cat.image_url)}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'; }}
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              </div>

              {/* CATEGORY TITLE BELOW CIRCLE */}
              <span className="mt-3 text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#2d6a4f] tracking-tight font-['Outfit'] transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium group-hover:text-emerald-700">
                Explore Items →
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT NAV ARROW */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200 flex items-center justify-center hover:bg-[#1b4332] hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95"
          aria-label="Next Categories"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* PAGINATION INDICATOR DOTS (Matching Screenshot 1) */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {[0, 1, 2].map((dotIndex) => (
          <div
            key={dotIndex}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === dotIndex
                ? 'w-6 h-2 bg-[#2d6a4f]'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
