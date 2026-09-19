import React, { useState } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function CartCrossSell({
  cartItems,
  allProducts = [],
  currency,
  currencySymbol,
  onAddToCart,
  onOpenVariantModal
}) {
  const [addedSuggestions, setAddedSuggestions] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});

  const suggestedProducts = (allProducts && allProducts.length > 0)
    ? allProducts.filter(p => !cartItems.some(item => item.id === p.id))
    : [];

  if (!cartItems || cartItems.length === 0 || suggestedProducts.length === 0) {
    return null;
  }

  const handleAddSuggestion = (prod) => {
    const isINR = currency === 'INR';
    const activeVariants = Array.isArray(prod.variants) && prod.variants.length > 0
      ? prod.variants.filter(v => !v.status || v.status === 'active')
      : [];
    
    // Pick user-selected variant or default to first active variant
    const chosenVariant = selectedVariants[prod.id] || (activeVariants.length > 0 ? activeVariants[0] : null);

    if (typeof onAddToCart === 'function') {
      const itemPriceInr = Number(chosenVariant?.price_inr || chosenVariant?.price || prod.discount_inr || prod.price_inr || prod.price || 0);
      const itemPriceUsd = Number(chosenVariant?.price_usd || prod.discount_usd || prod.price_usd || Math.round(itemPriceInr / 40));
      const activePrice = isINR ? itemPriceInr : itemPriceUsd;

      onAddToCart({
        ...prod,
        variant: chosenVariant,
        selectedVariant: chosenVariant,
        variant_id: chosenVariant?.id || null,
        variant_name: chosenVariant?.variant_name || chosenVariant?.name || null,
        price: activePrice,
        thumbnail: chosenVariant?.image_url || prod.thumbnail || prod.image_url,
        quantity: 1
      });

      setAddedSuggestions(prev => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedSuggestions(prev => ({ ...prev, [prod.id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="pt-3 border-t border-gray-200/80 space-y-2.5" data-reticle-target="cart-cross-sell-section">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-black text-gray-900 font-['Outfit'] flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span>Frequently Bought Together</span>
        </span>
        <span className="text-[10px] font-extrabold text-[#2d6a4f] bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
          ⚡ Popular Add-ons
        </span>
      </div>

      <div className="space-y-2.5">
        {suggestedProducts.slice(0, 3).map((sp) => {
          const isINR = currency === 'INR';
          const activeVariants = Array.isArray(sp.variants) && sp.variants.length > 0
            ? sp.variants.filter(v => !v.status || v.status === 'active')
            : [];
          const hasVariants = activeVariants.length > 0;
          const chosenVariant = selectedVariants[sp.id] || (hasVariants ? activeVariants[0] : null);

          const itemPriceInr = Number(chosenVariant?.price_inr || chosenVariant?.price || sp.discount_inr || sp.price_inr || 0);
          const itemPriceUsd = Number(chosenVariant?.price_usd || sp.discount_usd || sp.price_usd || Math.round(itemPriceInr / 40));
          const displayPrice = isINR ? itemPriceInr : itemPriceUsd;
          const displayImage = chosenVariant?.image_url || sp.thumbnail || sp.image_url;

          const isAdded = addedSuggestions[sp.id];

          return (
            <div 
              key={sp.id} 
              className="p-3 bg-white rounded-2xl border border-emerald-100/90 shadow-xs hover:border-emerald-300 transition-all space-y-2" 
              data-reticle-target={`cart-suggestion-${sp.id}`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div 
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => onOpenVariantModal ? onOpenVariantModal(sp) : null}
                  title="Click to view details or full options"
                >
                  <img 
                    src={resolveImgUrl(displayImage)} 
                    alt={sp.title} 
                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-extrabold text-xs text-gray-900 truncate font-['Outfit'] hover:text-[#2d6a4f] transition-colors">
                      {sp.title}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-[#2d6a4f]">
                        {currencySymbol}{displayPrice}
                      </span>
                      {chosenVariant && (
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          {chosenVariant.variant_name || chosenVariant.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSuggestion(sp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                    isAdded 
                      ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400' 
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-800/20'
                  }`}
                  data-reticle-target={`cart-add-suggestion-btn-${sp.id}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="stroke-[3]" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>

              {/* VARIANT SELECTOR PILLS IF MULTIPLE VARIANTS EXIST */}
              {hasVariants && activeVariants.length > 1 && (
                <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                  <span className="text-[10px] uppercase font-black text-gray-400 shrink-0">Variant:</span>
                  <div className="flex items-center gap-1">
                    {activeVariants.map(v => {
                      const isSelected = (chosenVariant?.id || activeVariants[0]?.id) === v.id;
                      const vPrice = isINR ? (v.price_inr || v.price) : (v.price_usd || Math.round((v.price_inr || 0) / 40));
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [sp.id]: v }))}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#1b4332] text-white shadow-xs ring-1 ring-[#1b4332]'
                              : 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100'
                          }`}
                        >
                          {v.variant_name || v.name} ({currencySymbol}{vPrice})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
