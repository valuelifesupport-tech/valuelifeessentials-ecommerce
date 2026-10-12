import { useState, useEffect } from 'react';
import { resolveBaseVariant, resolveItemOptionLabel } from '../utils/pricing';

export function useCartActions(currency, showToast, products = []) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('organic_cart')) || []; } catch (e) { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  
  const openVariantModal = (p) => setVariantModalProduct(p);

  useEffect(() => {
    try { localStorage.setItem('organic_cart', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  // Enrich any existing cart items that were added without a resolved option or GST rate
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0 || cart.length === 0) return;
    let changed = false;
    const nextCart = cart.map(item => {
      const hasValidOption = item.variant_name && String(item.variant_name).trim() && String(item.variant_name).trim().toLowerCase() !== 'standard pack';
      const hasGst = (item.gst_percent !== undefined && item.gst_percent !== null && item.gst_percent !== '') || (item.gst_rate !== undefined && item.gst_rate !== null && item.gst_rate !== '');
      if (hasValidOption && hasGst) return item;

      const matched = products.find(p => Number(p.id) === Number(item.id) || (p.slug && item.slug && p.slug === item.slug));
      if (!matched) return item;

      const baseVar = !hasValidOption ? resolveBaseVariant(matched, currency, item.price) : null;
      const resolvedLabel = hasValidOption
        ? item.variant_name
        : (baseVar?.variant_name || baseVar?.name || baseVar?.title || resolveItemOptionLabel(item, matched, currency, item.price));
      const resolvedVarId = item.variant_id || baseVar?.id || null;
      const resolvedGst = hasGst ? (item.gst_percent ?? item.gst_rate) : (matched.gst_percent ?? matched.gst_rate ?? null);

      if (resolvedLabel !== item.variant_name || resolvedVarId !== item.variant_id || resolvedGst !== item.gst_percent) {
        changed = true;
        return {
          ...item,
          variant_id: resolvedVarId,
          variant_name: resolvedLabel || null,
          gst_percent: resolvedGst,
          gst_rate: resolvedGst
        };
      }
      return item;
    });
    if (changed) setCart(nextCart);
  }, [products, currency]);

  const handleAddToCart = (productPayload) => {
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

    // Use explicitly selected variant, or automatically resolve the base variant matching the displayed base price
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
