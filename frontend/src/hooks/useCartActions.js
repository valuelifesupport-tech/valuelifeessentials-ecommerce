import { useState, useEffect } from 'react';

export function useCartActions(currency, showToast) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('organic_cart')) || []; } catch (e) { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  
  const openVariantModal = (p) => setVariantModalProduct(p);

  useEffect(() => {
    try { localStorage.setItem('organic_cart', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  const handleAddToCart = (productPayload) => {
    const isINR = currency === 'INR';
    const variants = Array.isArray(productPayload.variants) && productPayload.variants.length > 0 ? productPayload.variants : null;
    const selectedVariant = productPayload.variant || productPayload.selectedVariant || null;

    if (variants && !selectedVariant) {
      setVariantModalProduct(productPayload);
      return;
    }

    const qty = productPayload.quantity || 1;
    const variantId = selectedVariant?.id || productPayload.variant_id || null;
    const variantName = selectedVariant?.variant_name || selectedVariant?.name || productPayload.variant_name || null;

    let itemPriceInr = Number(selectedVariant?.price_inr || selectedVariant?.price || productPayload.price_inr || productPayload.price || 0);
    let itemPriceUsd = Number(selectedVariant?.price_usd || productPayload.price_usd || Math.round(itemPriceInr / 40));
    const activePrice = isINR ? itemPriceInr : itemPriceUsd;
    const cartKey = variantId ? `${productPayload.id}_var_${variantId}` : `${productPayload.id}`;
    const itemThumbnail = selectedVariant?.image_url || productPayload.thumbnail || productPayload.image_url;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartKey === cartKey || (item.id === productPayload.id && item.variant_id === variantId));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
          price: activePrice
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...productPayload,
          cartKey,
          id: productPayload.id,
          variant_id: variantId,
          variant_name: variantName,
          thumbnail: itemThumbnail,
          price: activePrice,
          quantity: qty
        }
      ];
    });

    const displayTitle = variantName ? `${productPayload.title} (${variantName})` : productPayload.title;
    showToast('success', 'Added to Cart', `Added "${displayTitle}" to cart!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) handleRemoveFromCart(cartKey);
    else setCart(prev => prev.map(item => (item.cartKey === cartKey || item.id === cartKey) ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => !(item.cartKey === cartKey || item.id === cartKey)));
  };

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    variantModalProduct,
    setVariantModalProduct,
    openVariantModal,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart
  };
}
