import { getApiUrl } from '../../api/config';
import React from 'react';
import { Eye, Heart, ShoppingBag } from 'lucide-react';

const resolveImgUrl = (url, fallback = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80') => {
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

export default function ProductCard({ 
  product, 
  currency = 'INR', 
  currencySymbol = '₹', 
  viewMode = 'grid', 
  cardStyle = 'VALUELIFE_ESSENTIALS',
  isWishlisted = false,
  onNavigate, 
  onAddToCart, 
  onToggleWishlist 
}) {
  const p = product;
  const isINR = currency === 'INR';
  const rawPrice = isINR ? (Number(p.price_inr) || 0) : (Number(p.price_usd) || 0);
  const rawDiscount = isINR 
    ? (p.discount_inr !== undefined && p.discount_inr !== null && Number(p.discount_inr) > 0 && Number(p.discount_inr) < rawPrice ? Number(p.discount_inr) : null)
    : (p.discount_usd !== undefined && p.discount_usd !== null && Number(p.discount_usd) > 0 && Number(p.discount_usd) < rawPrice ? Number(p.discount_usd) : null);
  const rawCompare = isINR
    ? (p.compare_price_inr !== undefined && p.compare_price_inr !== null && Number(p.compare_price_inr) > 0 ? Number(p.compare_price_inr) : null)
    : (p.compare_price_usd !== undefined && p.compare_price_usd !== null && Number(p.compare_price_usd) > 0 ? Number(p.compare_price_usd) : null);

  let pPrice = rawPrice;
  if (rawDiscount !== null && rawDiscount > 0 && rawDiscount < rawPrice) {
    pPrice = rawDiscount;
  }

  let pOriginal = pPrice;
  if (rawCompare !== null && rawCompare > pPrice) {
    pOriginal = rawCompare;
  } else if (rawDiscount !== null && rawDiscount > 0 && rawPrice > pPrice) {
    pOriginal = rawPrice;
  }

  const pct = pOriginal > pPrice ? Math.round(((pOriginal - pPrice) / pOriginal) * 100) : 0;

  // 1. LIST VIEW CARD (Horizontal 2-Column Layout matching Screenshot 2)
  if (viewMode === 'list') {
    return (
      <div className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all flex flex-row items-center p-3.5 gap-4 group relative">
        {/* LEFT IMAGE BOX WITH FLOATING QUICK VIEW BUTTON */}
        <div 
          onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
          className="w-36 sm:w-44 h-36 sm:h-44 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center p-2 border border-gray-200/80"
        >
          <img 
            src={resolveImgUrl(p.image_url || p.thumbnail || p.images?.[0])} 
            alt={p.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'; }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null });
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow border border-gray-200 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
          >
            <Eye size={12} className="text-[#3b6e14]" /> QUICK VIEW
          </button>
        </div>

        {/* RIGHT DETAILS COLUMN */}
        <div className="flex-1 space-y-2 flex flex-col justify-between py-1 min-w-0">
          <div className="space-y-1">
            <h3 
              onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
              className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#3b6e14] cursor-pointer line-clamp-2 leading-snug hover:underline"
            >
              {p.title}
            </h3>

            <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
              <span>★★★★★</span>
              <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 5).toFixed(2)}</span>
              <span className="text-gray-400 font-medium">| {p.review_count || 56}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
                {pOriginal > pPrice && (
                  <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
                )}
                {pct > 0 && (
                  <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{pct}% Off
                  </span>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0 ${
                  isWishlisted ? 'bg-rose-600 text-white' : 'bg-[#f87171] hover:bg-rose-600 text-white'
                }`}
                title="Wishlist"
              >
                <Heart size={14} fill="currentColor" color="white" />
              </button>
            </div>
          </div>

          {/* BUTTON STYLE DRIVEN BY ADMIN CARD STYLE SETTING */}
          {cardStyle === 'CLASSIC_SPLIT' ? (
            <div className="flex gap-1.5 pt-1">
              <button 
                onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
                className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0"
              >
                Details
              </button>
              <button 
                onClick={() => onAddToCart(p)}
                className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0"
              >
                + Add
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onAddToCart(p)}
              className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-1 cursor-pointer"
            >
              <ShoppingBag size={15} /> ADD TO CART
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. GRID VIEW CARD (Vertical Card Layout matching Screenshot 1)
  return (
    <div className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col group p-3 space-y-3">
      <div 
        onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
        className="w-full h-52 sm:h-60 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-2"
      >
        <img 
          src={resolveImgUrl(p.image_url || p.thumbnail || p.images?.[0])} 
          alt={p.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'; }}
        />
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
        <div className="space-y-1">
          <h3 
            onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
            className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#3b6e14] cursor-pointer line-clamp-1 leading-snug"
          >
            {p.title}
          </h3>

          <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
            <span>★★★★★</span>
            <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 5).toFixed(2)}</span>
            <span className="text-gray-400 font-medium">| {p.review_count || 24}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
              {pOriginal > pPrice && (
                <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
              )}
              {pct > 0 && (
                <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{pct}% Off
                </span>
              )}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0 ${
                isWishlisted ? 'bg-rose-600 text-white' : 'bg-[#f87171] hover:bg-rose-600 text-white'
              }`}
              title="Wishlist"
            >
              <Heart size={14} fill="currentColor" color="white" />
            </button>
          </div>
        </div>

        {/* BUTTON STYLE DRIVEN BY ADMIN CARD STYLE SETTING */}
        {cardStyle === 'CLASSIC_SPLIT' ? (
          <div className="flex gap-1.5 pt-1">
            <button 
              onClick={() => onNavigate(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
              className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0"
            >
              Details
            </button>
            <button 
              onClick={() => onAddToCart(p)}
              className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0"
            >
              + Add
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onAddToCart(p)}
            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer"
          >
            <ShoppingBag size={15} /> ADD TO CART
          </button>
        )}
      </div>
    </div>
  );
}
