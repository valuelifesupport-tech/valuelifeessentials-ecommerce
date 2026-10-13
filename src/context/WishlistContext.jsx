import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children, currency = 'INR' }) {
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('organic_wishlist')) || [];
    } catch (e) {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('organic_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const toggleWishlist = useCallback((product, selectedVariant = null) => {
    const isINR = currency === 'INR';
    const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : null;
    const chosenVariant = selectedVariant || (variants ? variants[0] : null);
    const variantId = chosenVariant?.id || null;
    const variantName = chosenVariant?.variant_name || chosenVariant?.name || null;

    const itemPriceInr = Number(chosenVariant?.price_inr || chosenVariant?.price || product.price_inr || product.price || 0);
    const itemPriceUsd = Number(chosenVariant?.price_usd || product.price_usd || Math.round(itemPriceInr / 40));
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
  }, [currency, showToast]);

  const removeFromWishlist = useCallback((id) => {
    setWishlist(prev => prev.filter(item => item.id !== id && item.variant_id !== id));
  }, []);

  const isInWishlist = useCallback((productId, variantId = null) => {
    return wishlist.some(item => (variantId ? (item.id === productId && item.variant_id === variantId) : item.id === productId));
  }, [wishlist]);

  const openWishlist = useCallback(() => setIsWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setIsWishlistOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}

export default WishlistContext;
