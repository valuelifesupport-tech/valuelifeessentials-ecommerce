import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Heart, ExternalLink, Star } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function SelectVariantModal({
  isOpen,
  onClose,
  product,
  currency = 'INR',
  currencySymbol = '₹',
  onAddToCart,
  onAddToWishlist,
  navigateTo,
  isWishlisted = false
}) {
  if (!isOpen || !product) return null;

  const isINR = currency === 'INR';
  const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [];
  const activeVariants = variants.filter(v => !v.status || v.status === 'active');
  const variantList = activeVariants.length > 0 ? activeVariants : variants;

  const [selectedVariant, setSelectedVariant] = useState(variantList[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Sync when product changes
  useEffect(() => {
    if (variantList.length > 0) {
      setSelectedVariant(variantList[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
  }, [product]);

  // Compute pricing based on selected variant
  const activeItem = selectedVariant || product;
  const itemPriceInr = Number(activeItem.price_inr || activeItem.price || 0);
  const itemPriceUsd = Number(activeItem.price_usd || (itemPriceInr > 0 ? Number((itemPriceInr / 95).toFixed(2)) : 0));
  const rawPrice = isINR ? itemPriceInr : itemPriceUsd;

  const itemDiscInr = Number(activeItem.discount_inr || 0);
  const itemDiscUsd = Number(activeItem.discount_usd || 0);
  const rawDiscount = isINR ? itemDiscInr : itemDiscUsd;

  const itemCompInr = Number(activeItem.compare_price_inr || 0);
  const itemCompUsd = Number(activeItem.compare_price_usd || 0);
  const rawCompare = isINR ? itemCompInr : itemCompUsd;

  const currentPrice = (rawDiscount > 0 && rawDiscount < rawPrice) ? rawDiscount : rawPrice;
  const originalPrice = rawCompare > currentPrice ? rawCompare : (rawPrice > currentPrice ? rawPrice : currentPrice);
  const discountPct = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Active image (variant-specific or product primary)
  const displayImage = selectedVariant?.image_url || product.thumbnail || product.image_url || product.images?.[0];

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart({
        ...product,
        variant: selectedVariant,
        variant_id: selectedVariant?.id || null,
        variant_name: selectedVariant?.variant_name || selectedVariant?.name || null,
        price: currentPrice,
        price_inr: isINR ? currentPrice : Math.round(currentPrice * 95),
        price_usd: isINR ? Number((currentPrice / 95).toFixed(2)) : currentPrice,
        thumbnail: displayImage,
        quantity
      });
    }
    onClose();
  };

  const handleAddToWishlistClick = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product, selectedVariant);
    }
  };

  const handleViewDetails = () => {
    if (navigateTo && product.slug) {
      onClose();
      navigateTo(`/products/${product.slug}`, { view: 'pdp', slug: product.slug, category: null, collection: null });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      data-reticle-target="select-variant-modal-backdrop"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative max-h-[92vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        data-reticle-target="select-variant-modal"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#fbfaf5]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3b6e14] bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Select Variant
            </span>
            <h3 className="text-base sm:text-lg font-black text-gray-900 line-clamp-1 mt-1 font-['Outfit']">
              {product.title}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-200/80 rounded-full text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            data-reticle-target="variant-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* PRODUCT HIGHLIGHT ROW */}
          <div className="flex gap-4 items-center bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src={resolveImgUrl(displayImage)} 
                alt={product.title} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
                }}
              />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-extrabold">
                <div className="flex items-center gap-0.5">
                  <Star size={13} fill="currentColor" />
                  <span>{Number(product.avg_rating || 5).toFixed(1)}</span>
                </div>
                <span className="text-gray-400 font-normal">({product.review_count || 32} reviews)</span>
              </div>

              {/* DYNAMIC PRICE DISPLAY */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#2d6a4f]" data-reticle-target="variant-modal-current-price">
                  {currencySymbol}{currentPrice}.00
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through font-bold">
                    {currencySymbol}{originalPrice}.00
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="bg-[#3b6e14] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    -{discountPct}% Off
                  </span>
                )}
              </div>

              <div className="text-[11px] font-semibold text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                In Stock ({selectedVariant?.stock || product.stock || 100} available)
              </div>
            </div>
          </div>

          {/* VARIANT OPTIONS LIST */}
          {variantList.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                Available Options ({variantList.length})
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" data-reticle-target="variant-modal-options-grid">
                {variantList.map((v, idx) => {
                  const isSelected = selectedVariant && (String(selectedVariant.id) === String(v.id) || selectedVariant.variant_name === v.variant_name);
                  const vPrice = isINR ? Number(v.price_inr || v.price || 0) : Number(v.price_usd || 0);
                  const vDisc = isINR ? Number(v.discount_inr || 0) : Number(v.discount_usd || 0);
                  const effectiveVPrice = (vDisc > 0 && vDisc < vPrice) ? vDisc : vPrice;

                  return (
                    <button
                      key={v.id || idx}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-2 border-[#2d6a4f] bg-emerald-50/70 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-emerald-400 bg-white text-gray-700 hover:bg-emerald-50/20'
                      }`}
                      data-reticle-target={`variant-modal-option-${v.id || idx}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs sm:text-sm truncate">
                          {v.variant_name || v.name || `Option ${idx + 1}`}
                        </div>
                        <div className="text-xs font-bold text-[#2d6a4f] mt-0.5">
                          {currencySymbol}{effectiveVPrice > 0 ? effectiveVPrice : currentPrice}.00
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#2d6a4f] text-white' : 'border border-gray-300'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUANTITY PICKER */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider block">Quantity</span>
              <span className="text-[11px] text-gray-400">Total: {currencySymbol}{currentPrice * quantity}.00</span>
            </div>

            <div className="inline-flex items-center border border-gray-200 rounded-2xl bg-gray-50/80 p-1">
              <button 
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs cursor-pointer"
                data-reticle-target="variant-modal-qty-minus"
              >
                -
              </button>
              <span className="w-10 text-center font-black text-sm text-gray-900 font-mono">
                {quantity}
              </span>
              <button 
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs cursor-pointer"
                data-reticle-target="variant-modal-qty-plus"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#fbfaf5] space-y-2.5">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleAddToWishlistClick}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                isWishlisted 
                  ? 'bg-rose-50 border-rose-300 text-rose-600' 
                  : 'bg-white border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600'
              }`}
              title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              data-reticle-target="variant-modal-wishlist-btn"
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={handleAddToCartClick}
              className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-800/20 transition-all cursor-pointer"
              data-reticle-target="variant-modal-add-to-cart-btn"
            >
              <ShoppingBag size={17} /> ADD TO CART • {currencySymbol}{currentPrice * quantity}.00
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleViewDetails}
              className="text-xs font-extrabold text-[#3b6e14] hover:underline inline-flex items-center gap-1 cursor-pointer"
              data-reticle-target="variant-modal-pdp-link"
            >
              View Full Product Details & Reviews <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
