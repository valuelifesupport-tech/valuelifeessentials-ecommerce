import { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../api/config';

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('organic_cart')) || [];
    } catch (e) {
      return [];
    }
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    localStorage.setItem('organic_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let customerUser = null;
    try {
      customerUser = JSON.parse(localStorage.getItem('customerUser'));
    } catch (e) {}

    if (customerUser && customerUser.id) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        fetch(getApiUrl(`/api/cart?user_id=${customerUser.id}`), {
          headers: { 'x-user-id': String(customerUser.id) }
        })
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.items) && data.items.length > 0) {
              setCart(data.items);
            } else if (cart.length > 0) {
              fetch(getApiUrl('/api/cart'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': String(customerUser.id) },
                body: JSON.stringify({ user_id: customerUser.id, items: cart })
              }).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        const timer = setTimeout(() => {
          fetch(getApiUrl('/api/cart'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(customerUser.id) },
            body: JSON.stringify({ user_id: customerUser.id, items: cart })
          }).catch(() => {});
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setCart((prevCart) => {
      const variantId = selectedVariant?.id || null;
      const variantName = selectedVariant?.variant_name || selectedVariant?.title || null;
      const price = selectedVariant?.discount_inr || selectedVariant?.price_inr || product.discount_inr || product.price_inr;

      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.variant_id === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevCart,
        {
          id: product.id,
          product_id: product.id,
          title: product.title,
          slug: product.slug,
          sku: selectedVariant?.sku || product.sku,
          thumbnail: selectedVariant?.image_url || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.image_url) || product.image_url || product.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=300&q=80',
          price,
          quantity,
          variant_id: variantId,
          variant_name: variantName,
          selectedVariant
        }
      ];
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === productId && item.variant_id === variantId))
    );
  };

  const updateQuantity = (productId, variantId = null, delta = 1) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId && item.variant_id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  };
};
