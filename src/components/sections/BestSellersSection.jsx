import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function BestSellersSection({ 
  products = [], 
  onAddToCart, 
  navigateTo,
  currencySymbol = '₹',
  sectionsConfig
}) {
  const scrollRef = useRef(null);

  // Real products from database only
  const displayItems = (products && products.length > 0)
    ? products.map((p) => ({
        id: p.id,
        title: p.title || p.name,
        slug: p.slug || `product-${p.id}`,
        pack: (p.variants && p.variants[0]?.variant_name) || 'Standard Pack',
        price: Number(p.price_inr || p.price || 0),
        image_url: resolveImgUrl(p.thumbnail || p.image_url),
        rawProduct: p
      }))
    : [];

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };


  if (sectionsConfig && Number(sectionsConfig.show_bestsellers) === 0) return null;
  if (displayItems.length === 0) return null;

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo && navigateTo('/bestsellers', { view: 'bestsellers' })}
              className="text-xs font-bold text-[#164e3f] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
        >
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="min-w-[210px] sm:min-w-[220px] max-w-[220px] bg-white border border-gray-200/80 hover:border-emerald-500/50 rounded-2xl p-3 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#faf8f5] mb-2.5">
                <span className="absolute top-2 left-2 z-10 bg-emerald-800 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Bestseller
                </span>
                <img
                  src={item.image_url}
                  alt={item.title}
                  onClick={() => navigateTo && navigateTo(`/product/${item.slug}`, { view: 'product', slug: item.slug })}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
              </div>

              <div>
                <h3 
                  onClick={() => navigateTo && navigateTo(`/product/${item.slug}`, { view: 'product', slug: item.slug })}
                  className="font-bold text-xs text-gray-900 line-clamp-1 hover:text-[#164e3f] cursor-pointer transition-colors"
                >
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.pack}</p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                  <span className="text-sm font-extrabold text-gray-950 font-mono">
                    {currencySymbol}{item.price}
                  </span>

                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item.rawProduct || item)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-[#164e3f] hover:bg-[#164e3f] hover:text-white transition-colors cursor-pointer"
                    aria-label="Add to Cart"
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
