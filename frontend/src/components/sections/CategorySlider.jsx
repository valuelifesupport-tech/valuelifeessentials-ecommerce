import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function CategorySlider({ categories = [], navigateTo, sectionTitle, sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_categories_slider) === 0) return null;
  const scrollRef = useRef(null);

  // Fallback curated categories if empty or to ensure high quality visual presentation
  const fallbackCategories = [
    {
      id: 'cat-grocery',
      name: 'Grocery & Staples',
      slug: 'cereals-flours-and-food-starches',
      image_url: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'cat-health',
      name: 'Health & Wellness',
      slug: 'edible-seeds',
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'cat-herbs',
      name: 'Herbs & Teas',
      slug: 'herbs-teas',
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'cat-personal',
      name: 'Personal Care',
      slug: 'other-home-essentials',
      image_url: 'https://images.unsplash.com/photo-1608248597359-bb51cb7e44be?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'cat-spices',
      name: 'Spices & Seasoning',
      slug: 'spices-seasoning',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'cat-home',
      name: 'Home & Living',
      slug: 'other-home-essentials',
      image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
    }
  ];

  // Merge database categories with visual images
  const displayCategories = (categories && categories.length > 0)
    ? categories.map((cat, idx) => ({
        ...cat,
        image_url: cat.image_url || fallbackCategories[idx % fallbackCategories.length].image_url
      }))
    : fallbackCategories;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat) => {
    if (navigateTo) {
      navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', slug: null, category: cat.slug || cat.id, collection: null });
    }
  };

  return (
    <section className="py-12 bg-white" data-reticle-target="category-slider-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              {sectionTitle || 'Shop by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Explore our wide range of pure organic and natural essentials
            </p>
          </div>

          {/* Navigation Arrow */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
              title="Previous Categories"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-[#164e3f] hover:bg-[#0f382c] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
              title="Next Categories"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Categories Cards Carousel */}
        <div 
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 scroll-smooth"
        >
          {displayCategories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              onClick={() => handleCategoryClick(cat)}
              className="min-w-[170px] sm:min-w-[190px] max-w-[200px] flex-1 bg-white border border-gray-200/90 rounded-2xl p-4 text-center group hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between"
              data-reticle-target={`category-card-${cat.slug}`}
            >
              {/* Image Circle/Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#faf8f5] mb-3 border border-gray-100 p-1 group-hover:scale-105 transition-transform">
                <img
                  src={resolveImgUrl(cat.image_url)}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>

              {/* Category Name */}
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#164e3f] transition-colors leading-tight line-clamp-2">
                {cat.name}
              </h3>

              {cat.subcategories && cat.subcategories.length > 0 && (
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {cat.subcategories.length} Sub-items
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
