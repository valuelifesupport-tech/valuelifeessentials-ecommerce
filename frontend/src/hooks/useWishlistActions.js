import { useState } from 'react';

export function useWishlistActions(currency, showToast) {
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const handleToggleWishlist = (product, selectedVariant = null) => {
    const isINR = currency === 'INR';
    const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : null;
    const chosenVariant = selectedVariant || (variants ? variants[0] : null);
    const variantId = chosenVariant?.id || null;
    const variantName = chosenVariant?.variant_name || chosenVariant?.name || null;

    let itemPriceInr = Number(chosenVariant?.price_inr || chosenVariant?.price || product.price_inr || product.price || 0);
    let itemPriceUsd = Number(chosenVariant?.price_usd || product.price_usd || Math.round(itemPriceInr / 40));
    const activePrice = isINR ? itemPriceInr : itemPriceUsd;
    const itemThumbnail = chosenVariant?.image_url || product.thumbnail || product.image_url;

    setWishlist(prev => {
      const exists = prev.some(item => (variantId ? (item.id === product.id && item.variant_id === variantId) : item.id === product.id));
      if (exists) {
        showToast('info', 'Wishlist', `Removed "${product.title}" from wishlist.`);
        return prev.filter(item => !(variantId ? (item.id === product.id && item.variant_id === variantId) : item.id === product.id));
      }
      const displayTitle = variantName ? `${product.title} (${variantName})` : product.title;
      showToast('success', 'Wishlist', `Saved "${displayTitle}" to wishlist!`);
      return [...prev, {
        ...product,
        variant_id: variantId,
        variant_name: variantName,
        variant: chosenVariant,
        thumbnail: itemThumbnail,
        price: activePrice
      }];
    });
  };

  return {
    wishlist,
    setWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    handleToggleWishlist
  };
}
