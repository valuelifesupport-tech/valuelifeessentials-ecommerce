import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { resolveBaseVariant, resolveItemOptionLabel } from '../utils/pricing';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children, currency = 'INR', products = [] }) {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

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
              setCart(data.items);
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
  }, [cart, currentUser]);

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
