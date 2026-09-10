import React, { useState } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function CartCrossSell({
  cartItems,
  allProducts = [],
  currency,
  currencySymbol,
  onAddToCart
}) {
  const [addedSuggestions, setAddedSuggestions] = useState({});

  const suggestedProducts = (allProducts && allProducts.length > 0)
    ? allProducts.filter(p => !cartItems.some(item => item.id === p.id))
    : [];

  if (!cartItems || cartItems.length === 0 || suggestedProducts.length === 0) {
    return null;
  }

  const handleAddSuggestion = (prod) => {
    if (typeof onAddToCart === 'function') {
      onAddToCart(prod);
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

      <div className="space-y-2">
        {suggestedProducts.slice(0, 3).map((sp) => {
          const spPrice = currency === 'INR' ? (sp.discount_inr || sp.price_inr) : (sp.discount_usd || sp.price_usd);
          const isAdded = addedSuggestions[sp.id];

          return (
            <div key={sp.id} className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between gap-2.5 hover:border-emerald-300 transition-all" data-reticle-target={`cart-suggestion-${sp.id}`}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img 
                  src={resolveImgUrl(sp.thumbnail || sp.image_url)} 
                  alt={sp.title} 
                  className="w-11 h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h5 className="font-extrabold text-xs text-gray-900 truncate font-['Outfit']">{sp.title}</h5>
                  <span className="text-xs font-black text-[#2d6a4f] block">{currencySymbol}{spPrice}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddSuggestion(sp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                  isAdded 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'bg-emerald-50 hover:bg-[#2d6a4f] text-[#2d6a4f] hover:text-white border border-emerald-200/80'
                }`}
                data-reticle-target={`cart-add-suggestion-btn-${sp.id}`}
              >
                {isAdded ? (
                  <>
                    <Check size={13} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    <span>+ Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
