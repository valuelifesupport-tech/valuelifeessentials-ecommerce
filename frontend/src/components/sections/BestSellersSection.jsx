import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function BestSellersSection({
  products = [],
  currencySymbol = '₹',
  handleAddToCart,
  navigateTo
}) {
  const scrollRef = useRef(null);

  // Curated showcase matching Section 7 of mockup
  const sampleBestSellers = [
    {
      id: 201,
      title: 'Chia Seeds',
      slug: 'chia-seeds',
      pack: '250g',
      price: 259,
      image_url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 202,
      title: 'Organic Almonds',
      slug: 'organic-almonds',
      pack: '250g',
      price: 349,
      image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 203,
      title: 'Multivitamin',
      slug: 'multivitamin',
      pack: '60 Capsules',
      price: 499,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 204,
      title: 'Flax Seeds',
      slug: 'flax-seeds',
      pack: '250g',
      price: 199,
      image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 205,
      title: 'Peanut Butter',
      slug: 'peanut-butter',
      pack: '200g',
      price: 249,
      image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=500&q=80'
    }
  ];

  // If real database products exist, use them
  const displayItems = (products && products.length > 0)
    ? products.slice(0, 5).map((p, idx) => ({
        id: p.id,
        title: p.title,
        slug: p.slug || `product-${p.id}`,
        pack: (p.variants && p.variants[0]?.variant_name) || 'Standard Pack',
        price: p.price_inr || p.price || 249,
        image_url: p.thumbnail || p.image_url || sampleBestSellers[idx % sampleBestSellers.length].image_url
      }))
    : sampleBestSellers;

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-white" data-reticle-target="best-sellers-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Customer favorites loved for purity, taste and guaranteed results
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo && navigateTo('/bestsellers', { view: 'bestsellers' })}
              className="text-xs font-bold text-[#164e3f] hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 scroll-smooth"
        >
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="min-w-[210px] sm:min-w-[225px] flex-1 bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between group hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 relative"
            >
              {/* Bestseller Badge Pill (Mockup Section 7) */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#2e7d32] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Bestseller
                </span>
              </div>

              {/* Product Image */}
              <div 
                onClick={() => navigateTo && navigateTo(`/products/${item.slug}`, { view: 'pdp', slug: item.slug })}
                className="w-full aspect-square rounded-xl overflow-hidden bg-[#faf8f5] mb-3 border border-gray-100 p-2 cursor-pointer"
              >
                <img
                  src={resolveImgUrl(item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=500&q=80';
                  }}
                />
              </div>

              {/* Details */}
              <div className="space-y-1">
                <h3 
                  onClick={() => navigateTo && navigateTo(`/products/${item.slug}`, { view: 'pdp', slug: item.slug })}
                  className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#164e3f] transition-colors cursor-pointer line-clamp-1"
                >
                  {item.title}
                </h3>
                <span className="text-[11px] text-gray-400 font-medium block">
                  {item.pack}
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold text-gray-950">
                    {currencySymbol}{item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart && handleAddToCart({
                      ...item,
                      price_inr: item.price,
                      discount_inr: item.price
                    })}
                    className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-[#164e3f] text-[#164e3f] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
