import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { resolveBaseVariant, resolveItemOptionLabel } from '../utils/pricing';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';

const CartContext = createContext(null);

export function CartProvider({ children, currency: propCurrency, products: propProducts }) {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  // Safely consume ShopContext since CartProvider is inside ShopProvider in App.jsx
  let shopContext = null;
  try {
    shopContext = useShop();
  } catch (e) {
    shopContext = null;
  }
  const products = propProducts || shopContext?.products || [];
  const currency = propCurrency || shopContext?.currency || 'INR';

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('organic_cart')) || [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('organic_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Sync with server for logged-in users
  useEffect(() => {
    if (currentUser && currentUser.id) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        fetch(getApiUrl(`/api/cart?user_id=${currentUser.id}`), {
          headers: { 'x-user-id': String(currentUser.id) }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && Array.isArray(data.items) && data.items.length > 0) {
              setCart(prevLocalCart => {
                // Reconcile server items with local items and shop products
                return data.items.map(sItem => {
                  const sPid = Number(sItem.product_id || sItem.id);
                  const sVid = sItem.variant_id ? Number(sItem.variant_id) : null;

                  // Find if local cart had richer cached data
                  const matchingLocal = prevLocalCart.find(l => 
                    (l.cartKey && sItem.cartKey && l.cartKey === sItem.cartKey) ||
                    (Number(l.id || l.product_id) === sPid && 
                     (sVid ? Number(l.variant_id) === sVid : !l.variant_id))
                  );

                  // Find in catalog products
                  const matchingProd = Array.isArray(products)
                    ? products.find(p => Number(p.id) === sPid)
                    : null;

                  const matchingVar = (sVid && matchingProd?.variants)
                    ? matchingProd.variants.find(v => Number(v.id) === sVid)
                    : null;

                  const resolvedTitle = (sItem.title && sItem.title !== 'Product')
                    ? sItem.title 
                    : (matchingLocal?.title || matchingProd?.title || sItem.title || 'Product');

                  const resolvedThumb = sItem.thumbnail || sItem.image_url || matchingLocal?.thumbnail || matchingProd?.thumbnail || matchingProd?.image_url || '';

                  let resolvedPrice = Number(sItem.price || 0);
                  if (resolvedPrice <= 0) {
                    if (matchingLocal?.price && Number(matchingLocal.price) > 0) {
                      resolvedPrice = Number(matchingLocal.price);
                    } else if (matchingVar) {
                      const vPrice = currency === 'INR'
                        ? (Number(matchingVar.discount_inr) > 0 ? Number(matchingVar.discount_inr) : Number(matchingVar.price_inr || 0))
                        : (Number(matchingVar.discount_usd) > 0 ? Number(matchingVar.discount_usd) : Number(matchingVar.price_usd || 0));
                      if (vPrice > 0) resolvedPrice = vPrice;
                    } else if (matchingProd) {
                      const pPrice = currency === 'INR'
                        ? (Number(matchingProd.discount_inr) > 0 ? Number(matchingProd.discount_inr) : Number(matchingProd.price_inr || matchingProd.price || 0))
                        : (Number(matchingProd.discount_usd) > 0 ? Number(matchingProd.discount_usd) : Number(matchingProd.price_usd || 0));
                      if (pPrice > 0) resolvedPrice = pPrice;
                    }
                  }

                  const cartKey = sItem.cartKey || (sVid ? `${sPid}_var_${sVid}` : (sItem.variant_name ? `${sPid}_opt_${sItem.variant_name}` : `${sPid}`));

                  return {
                    ...(matchingProd || {}),
                    ...(matchingLocal || {}),
                    ...sItem,
                    id: sPid,
                    product_id: sPid,
                    cartKey,
                    title: resolvedTitle,
                    thumbnail: resolvedThumb,
                    image_url: resolvedThumb,
                    price: resolvedPrice,
                    quantity: Math.max(1, Number(sItem.quantity) || Number(matchingLocal?.quantity) || 1)
                  };
                });
              });
            } else if (cart.length > 0) {
              fetch(getApiUrl('/api/cart'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': String(currentUser.id) },
                body: JSON.stringify({ user_id: currentUser.id, items: cart })
              }).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        const timer = setTimeout(() => {
          fetch(getApiUrl('/api/cart'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(currentUser.id) },
            body: JSON.stringify({ user_id: currentUser.id, items: cart })
          }).catch(() => {});
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [cart, currentUser, products, currency]);

  // Auto-heal any cart items missing title, thumbnail, or price once products catalog loads
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0 || !Array.isArray(cart) || cart.length === 0) return;

    let needsHeal = false;
    const healed = cart.map(item => {
      const isMissingTitle = !item.title || item.title === 'Product';
      const isMissingPrice = item.price === undefined || item.price === null || Number(item.price) <= 0;
      const isMissingThumb = !item.thumbnail && !item.image_url;

      if (!isMissingTitle && !isMissingPrice && !isMissingThumb && item.cartKey) {
        return item;
      }

      const prodId = Number(item.product_id || item.id);
      const matchedProd = products.find(p => Number(p.id) === prodId || (p.slug && item.slug && p.slug === item.slug));
      if (!matchedProd) return item;

      needsHeal = true;
      const matchedVar = (item.variant_id && matchedProd.variants)
        ? matchedProd.variants.find(v => Number(v.id) === Number(item.variant_id))
        : null;

      const varName = item.variant_name || matchedVar?.variant_name || null;
      const cartKey = item.cartKey || (item.variant_id ? `${matchedProd.id}_var_${item.variant_id}` : (varName ? `${matchedProd.id}_opt_${varName}` : `${matchedProd.id}`));

      let activePrice = Number(item.price || 0);
      if (activePrice <= 0) {
        if (matchedVar) {
          activePrice = currency === 'INR'
            ? (Number(matchedVar.discount_inr) > 0 ? Number(matchedVar.discount_inr) : Number(matchedVar.price_inr || 0))
            : (Number(matchedVar.discount_usd) > 0 ? Number(matchedVar.discount_usd) : Number(matchedVar.price_usd || 0));
        } else {
          activePrice = currency === 'INR'
            ? (Number(matchedProd.discount_inr) > 0 ? Number(matchedProd.discount_inr) : Number(matchedProd.price_inr || matchedProd.price || 0))
            : (Number(matchedProd.discount_usd) > 0 ? Number(matchedProd.discount_usd) : Number(matchedProd.price_usd || 0));
        }
      }

      const thumb = item.thumbnail || item.image_url || matchedVar?.image_url || matchedProd.thumbnail || matchedProd.image_url;

      return {
        ...matchedProd,
        ...item,
        id: matchedProd.id,
        product_id: matchedProd.id,
        cartKey,
        title: matchedProd.title,
        thumbnail: thumb,
        image_url: thumb,
        price: activePrice,
        variant_name: varName,
        variant: matchedVar || item.variant,
        selectedVariant: matchedVar || item.selectedVariant
      };
    });

    if (needsHeal) {
      setCart(healed);
    }
  }, [products, currency]);

  const addToCart = useCallback((productPayload) => {
    const isINR = currency === 'INR';
    const matchedProd = Array.isArray(products)
      ? products.find(p => Number(p.id) === Number(productPayload.id) || (p.slug && productPayload.slug && p.slug === productPayload.slug))
      : null;

    const fullProduct = {
      ...(matchedProd || {}),
      ...productPayload,
      variants: (Array.isArray(productPayload.variants) && productPayload.variants.length > 0)
        ? productPayload.variants
        : (matchedProd?.variants || [])
    };

    const explicitVariant = productPayload.variant || productPayload.selectedVariant || null;
    const selectedVariant = explicitVariant || resolveBaseVariant(fullProduct, currency, productPayload.price || productPayload.discount_inr || productPayload.price_inr);

    const qty = productPayload.quantity || 1;
    const variantId = selectedVariant?.id || productPayload.variant_id || null;
    const variantName =
      selectedVariant?.variant_name ||
      selectedVariant?.name ||
      selectedVariant?.title ||
      productPayload.variant_name ||
      resolveItemOptionLabel(fullProduct, matchedProd, currency, productPayload.price) ||
      null;

    const rawVarPriceInr = Number(selectedVariant?.price_inr || selectedVariant?.price || fullProduct.price_inr || fullProduct.price || 0);
    const rawVarDiscInr = Number(selectedVariant?.discount_inr || 0);
    const itemPriceInr = (rawVarDiscInr > 0 && rawVarDiscInr < rawVarPriceInr)
      ? rawVarDiscInr
      : (rawVarPriceInr > 0 ? rawVarPriceInr : Number(productPayload.price || 0));

    const itemPriceUsd = Number(selectedVariant?.price_usd || fullProduct.price_usd || Math.round(itemPriceInr / 40));
    const activePrice = isINR ? itemPriceInr : itemPriceUsd;
    const cartKey = variantId ? `${fullProduct.id}_var_${variantId}` : (variantName ? `${fullProduct.id}_opt_${variantName}` : `${fullProduct.id}`);
    const itemThumbnail = selectedVariant?.image_url || fullProduct.thumbnail || fullProduct.image_url;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartKey === cartKey || (item.id === fullProduct.id && item.variant_id === variantId && (item.variant_name || null) === (variantName || null)));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          variant_id: variantId,
          variant_name: variantName,
          quantity: updated[existingIndex].quantity + qty,
          price: activePrice
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...fullProduct,
          cartKey,
          id: fullProduct.id,
          variant: selectedVariant,
          variant_id: variantId,
          variant_name: variantName,
          thumbnail: itemThumbnail,
          price: activePrice,
          quantity: qty
        }
      ];
    });

    const displayTitle = variantName ? `${fullProduct.title} (${variantName})` : fullProduct.title;
    showToast('success', 'Added to Cart', `Added "${displayTitle}" to cart!`);
    setIsCartOpen(true);
  }, [currency, products, showToast]);

  const updateQuantity = useCallback((cartKey, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => !(item.cartKey === cartKey || item.id === cartKey)));
    } else {
      setCart(prev => prev.map(item => (item.cartKey === cartKey || item.id === cartKey) ? { ...item, quantity: newQty } : item));
    }
  }, []);

  const removeFromCart = useCallback((cartKey) => {
    setCart(prev => prev.filter(item => !(item.cartKey === cartKey || item.id === cartKey)));
    showToast('info', 'Cart Updated', 'Item removed from your cart.');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

export default CartContext;
