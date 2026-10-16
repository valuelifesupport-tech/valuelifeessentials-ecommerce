import React from 'react';
import { Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';
import { resolveItemOptionLabel } from '../../utils/pricing';

export default function CartItemCard({
  item,
  allProducts = [],
  currency,
  currencySymbol,
  onUpdateQuantity,
  onRemoveItem
}) {
  const itemKey = item.cartKey || (item.variant_id ? `${item.product_id || item.id}_var_${item.variant_id}` : (item.id || item.product_id));
  const matchedProduct = Array.isArray(allProducts)
    ? allProducts.find(p => Number(p.id) === Number(item.product_id) || Number(p.id) === Number(item.id) || (p.slug && item.slug && p.slug === item.slug))
    : null;

  const matchedVariant = (item.variant_id && matchedProduct?.variants)
    ? matchedProduct.variants.find(v => Number(v.id) === Number(item.variant_id))
    : (item.selectedVariant || item.variant || null);

  let price = item.price !== undefined && item.price !== null && Number(item.price) > 0
    ? Number(item.price)
    : null;

  if (price === null && matchedVariant) {
    const vPrice = currency === 'INR'
      ? (Number(matchedVariant.discount_inr) > 0 ? Number(matchedVariant.discount_inr) : Number(matchedVariant.price_inr || 0))
      : (Number(matchedVariant.discount_usd) > 0 ? Number(matchedVariant.discount_usd) : Number(matchedVariant.price_usd || 0));
    if (vPrice > 0) price = vPrice;
  }

  if (price === null && matchedProduct) {
    const pPrice = currency === 'INR'
      ? (Number(matchedProduct.discount_inr) > 0 ? Number(matchedProduct.discount_inr) : Number(matchedProduct.price_inr || matchedProduct.price || 0))
      : (Number(matchedProduct.discount_usd) > 0 ? Number(matchedProduct.discount_usd) : Number(matchedProduct.price_usd || 0));
    if (pPrice > 0) price = pPrice;
  }

  if (price === null) {
    price = currency === 'INR' ? Number(item.discount_inr || item.price_inr || 0) : Number(item.discount_usd || item.price_usd || 0);
  }

  const displayTitle = (item.title && item.title !== 'Product') 
    ? item.title 
    : (matchedProduct?.title || item.title || 'Product');

  const displayImage = item.thumbnail || item.image_url || matchedVariant?.image_url || matchedProduct?.thumbnail || matchedProduct?.image_url;

  const optionLabel = item.variant_name || matchedVariant?.variant_name || resolveItemOptionLabel(item, matchedProduct, currency, price);
  const effectiveGst = (item.gst_percent !== undefined && item.gst_percent !== null && item.gst_percent !== '')
    ? item.gst_percent
    : ((item.gst_rate !== undefined && item.gst_rate !== null && item.gst_rate !== '')
        ? item.gst_rate
        : (matchedProduct?.gst_percent ?? matchedProduct?.gst_rate ?? null));
  const itemTotal = (price * (Number(item.quantity) || 1)).toFixed(2);

  return (
    <div className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group" data-reticle-target={`cart-item-${item.id}`}>
      <img 
        src={resolveImgUrl(displayImage)} 
        alt={displayTitle} 
        className="w-20 h-20 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
        }}
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 font-['Outfit']">{displayTitle}</h4>
        
        {/* Selected or Default Base Option Badge */}
        {optionLabel && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-block bg-[#f0f7e6] text-[#33691e] border border-[#558b2f]/30 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
              Option: {optionLabel}
            </span>
          </div>
        )}

        {/* Price Per Unit & GST */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-600 font-bold">
            Unit Price: <strong className="text-[#2d6a4f] font-extrabold">{currencySymbol}{price}</strong>
          </span>
          {(effectiveGst !== undefined && effectiveGst !== null && effectiveGst !== '') ? (
            <span className="bg-emerald-50 text-[#2d6a4f] border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
              {effectiveGst}% GST
            </span>
          ) : null}
        </div>

        {/* Quantity Controls & Product Total */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
            <button 
              onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
              className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
              data-reticle-target={`cart-item-qty-minus-${item.id}`}
              title="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 text-xs font-black text-gray-900 font-mono">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
              className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
              data-reticle-target={`cart-item-qty-plus-${item.id}`}
              title="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Item Total</span>
              <span className="text-sm font-black text-emerald-800 font-mono">
                {currencySymbol}{itemTotal}
              </span>
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
    </div>
  );
}
