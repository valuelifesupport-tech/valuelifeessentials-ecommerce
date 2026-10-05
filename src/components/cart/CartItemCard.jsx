import React from 'react';
import { Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function CartItemCard({
  item,
  currency,
  currencySymbol,
  onUpdateQuantity,
  onRemoveItem
}) {
  const price = item.price !== undefined && item.price !== null 
    ? Number(item.price) 
    : (currency === 'INR' ? (item.discount_inr || item.price_inr || 0) : (item.discount_usd || item.price_usd || 0));
  const itemKey = item.cartKey || item.id;
  const variantName = item.variant_name || item.variant?.variant_name || item.variant?.name || null;

  return (
    <div className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group" data-reticle-target={`cart-item-${item.id}`}>
      <img 
        src={resolveImgUrl(item.thumbnail || item.image_url || item.selectedVariant?.image_url)} 
        alt={item.title} 
        className="w-20 h-20 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
        }}
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 font-['Outfit']">{item.title}</h4>
        
        {/* Variant & Unit/Weight Badges */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {variantName && (
            <span className="inline-block bg-[#f0f7e6] text-[#33691e] border border-[#558b2f]/30 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
              Option: {variantName}
            </span>
          )}
          {item.weight && (
            <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-md">
              ⚖️ Weight: {parseFloat(item.weight) >= 1 ? `${parseFloat(item.weight)} kg` : `${Math.round(parseFloat(item.weight) * 1000)} g`}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-700 mt-1.5 pt-1.5 border-t border-gray-100">
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Unit Price: </span>
            <span className="font-extrabold text-[#2d6a4f]">{currencySymbol}{price.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Total: </span>
            <span className="font-black text-gray-900 text-sm">{currencySymbol}{(price * item.quantity).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
            <button 
              onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
              className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
              data-reticle-target={`cart-item-qty-minus-${item.id}`}
            >
              -
            </button>
            <span className="px-3 text-xs font-black text-gray-900 font-mono">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
              className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
              data-reticle-target={`cart-item-qty-plus-${item.id}`}
            >
              +
            </button>
          </div>

          <button 
            onClick={() => onRemoveItem(itemKey)}
            className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Remove item from cart"
            data-reticle-target={`cart-item-remove-${item.id}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
