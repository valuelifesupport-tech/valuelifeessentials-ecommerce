export function getProductPricing(p, currency = 'INR') {
  if (!p) return { pPrice: 0, pOriginal: 0, pct: 0, hasVariants: false, minPrice: 0, maxPrice: 0, isRange: false };
  const isINR = currency === 'INR';

  // Variant resolution
  let vList = Array.isArray(p.variants) ? p.variants : [];
  if (vList.length === 0 && typeof p.variants === 'string') {
    try { vList = JSON.parse(p.variants) || []; } catch(e) {}
  }

  if (vList.length > 0) {
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let chosenVar = vList[0];

    vList.forEach(v => {
      const vPrice = isINR 
        ? Number(v.price_inr || v.price || 0) 
        : (Number(v.price_usd) || (Number(v.price_inr || v.price || 0) > 0 ? Number((Number(v.price_inr || v.price || 0) / 95).toFixed(2)) : 0));
      const vDisc = isINR ? Number(v.discount_inr || 0) : Number(v.discount_usd || 0);
      const effectivePrice = (vDisc > 0 && vDisc < vPrice) ? vDisc : vPrice;
      
      if (effectivePrice > 0 && effectivePrice < minPrice) {
        minPrice = effectivePrice;
        chosenVar = v;
      }
      if (effectivePrice > maxPrice) {
        maxPrice = effectivePrice;
      }
    });

    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === -Infinity) maxPrice = minPrice;

    const vBase = isINR ? (Number(chosenVar?.price_inr || chosenVar?.price || minPrice)) : (Number(chosenVar?.price_usd) || minPrice);
    const vComp = isINR ? Number(chosenVar?.compare_price_inr || 0) : Number(chosenVar?.compare_price_usd || 0);
    const pOriginal = vComp > minPrice ? vComp : (vBase > minPrice ? vBase : minPrice);
    const pct = pOriginal > minPrice ? Math.round(((pOriginal - minPrice) / pOriginal) * 100) : 0;

    return { 
      pPrice: minPrice, 
      pOriginal, 
      pct, 
      hasVariants: true, 
      variantCount: vList.length,
      minPrice, 
      maxPrice, 
      isRange: minPrice !== maxPrice,
      startingVariant: chosenVar 
    };
  }

  const basePrice = isINR 
    ? (Number(p.price_inr) > 0 ? Number(p.price_inr) : (Number(p.price) || 0))
    : (Number(p.price_usd) > 0 ? Number(p.price_usd) : 0);
  const rawCompare = isINR ? Number(p.compare_price_inr || 0) : Number(p.compare_price_usd || 0);
  const rawDiscount = isINR ? Number(p.discount_inr || 0) : Number(p.discount_usd || 0);

  let pPrice = (rawDiscount > 0 && rawDiscount < basePrice) ? rawDiscount : basePrice;
  let pOriginal = (rawCompare > pPrice) ? rawCompare : pPrice;
  const pct = pOriginal > pPrice ? Math.round(((pOriginal - pPrice) / pOriginal) * 100) : 0;
  return { pPrice, pOriginal, pct, hasVariants: false, minPrice: pPrice, maxPrice: pPrice, isRange: false };
}
