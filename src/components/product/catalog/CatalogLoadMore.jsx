import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CatalogLoadMore({
  isLoadingMore,
  visibleCount,
  totalProducts,
  onLoadMore
}) {
  if (!totalProducts || totalProducts <= 0) return null;

  return (
    <div className="pt-8 pb-4 text-center space-y-4" data-reticle-target="catalog-load-more-section">
      {isLoadingMore && (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-md" />
          <span className="text-xs font-black text-emerald-800 tracking-wider uppercase animate-pulse">
            🌱 Loading More Organic Products...
          </span>
        </div>
      )}

      {!isLoadingMore && visibleCount < totalProducts && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onLoadMore}
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-2 mx-auto"
            data-reticle-target="catalog-load-more-btn"
          >
            <Sparkles size={16} /> Load More Products ({totalProducts - visibleCount} Remaining)
          </button>
          <p className="text-[11px] text-gray-500 font-semibold">
            Scroll down to auto-load or click button above
          </p>
        </div>
      )}

      {visibleCount >= totalProducts && totalProducts > 0 && (
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold px-5 py-2.5 rounded-full shadow-sm" data-reticle-target="catalog-all-loaded-badge">
          <span>✨ All {totalProducts} Organic Products Loaded!</span>
        </div>
      )}
    </div>
  );
}
