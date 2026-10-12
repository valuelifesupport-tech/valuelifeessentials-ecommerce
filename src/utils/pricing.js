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

export function formatBaseWeight(p) {
  if (!p) return null;
  if (p.weight !== undefined && p.weight !== null && p.weight !== '' && parseFloat(p.weight) > 0) {
    const w = parseFloat(p.weight);
    return w >= 1 ? `${w} kg` : `${Math.round(w * 1000)} g`;
  }
  if (p.unit && String(p.unit).trim()) {
    return String(p.unit).trim();
  }
  return null;
}

export function resolveBaseVariant(p, currency = 'INR', targetPrice = null) {
  if (!p) return null;
  const isINR = currency === 'INR';

  let rawVars = Array.isArray(p.variants) ? p.variants : [];
  if (rawVars.length === 0 && typeof p.variants === 'string') {
    try { rawVars = JSON.parse(p.variants) || []; } catch (e) {}
  }
  const activeVars = rawVars.filter(v => v && (!v.status || v.status === 'active'));
  const vList = activeVars.length > 0 ? activeVars : rawVars;
  if (vList.length === 0) return null;

  const getEffPrice = (v) => {
    const base = isINR
      ? Number(v.price_inr || v.price || 0)
      : (Number(v.price_usd) || (Number(v.price_inr || v.price || 0) > 0 ? Number((Number(v.price_inr || v.price || 0) / 95).toFixed(2)) : 0));
    const disc = isINR ? Number(v.discount_inr || 0) : Number(v.discount_usd || 0);
    return (disc > 0 && disc < base) ? disc : base;
  };

  const desiredPrice = (targetPrice !== null && targetPrice !== undefined && Number(targetPrice) > 0)
    ? Number(targetPrice)
    : (isINR ? Number(p.discount_inr || p.price_inr || p.price || 0) : Number(p.discount_usd || p.price_usd || 0));

  if (desiredPrice > 0) {
    const exactMatch = vList.find(v => {
      const eff = getEffPrice(v);
      const raw = isINR ? Number(v.price_inr || v.price || 0) : Number(v.price_usd || 0);
      return Math.abs(eff - desiredPrice) < 0.01 || Math.abs(raw - desiredPrice) < 0.01;
    });
    if (exactMatch) return exactMatch;
  }

  let minPrice = Infinity;
  let chosenVar = vList[0];
  vList.forEach(v => {
    const eff = getEffPrice(v);
    if (eff > 0 && eff < minPrice) {
      minPrice = eff;
      chosenVar = v;
    }
  });
  return chosenVar || vList[0];
}

export function resolveItemOptionLabel(item, matchedProduct = null, currency = 'INR', itemPrice = null) {
  if (!item) return null;

  // 1. If a specific variant/option was explicitly selected, ONLY return that selected option
  const explicit =
    item.variant_name ||
    item.variant?.variant_name ||
    item.variant?.name ||
    item.variant?.title ||
    item.selectedVariant?.variant_name ||
    item.selectedVariant?.name ||
    item.selectedVariant?.title ||
    null;

  if (explicit && String(explicit).trim() && String(explicit).trim().toLowerCase() !== 'standard pack') {
    return String(explicit).trim();
  }

  // 2. If nothing was explicitly selected, resolve the option matching the item's displayed/unit base price
  const hasItemVars = Array.isArray(item.variants) && item.variants.length > 0;
  const sourceProd = hasItemVars ? item : (matchedProduct || item);
  const baseVar = resolveBaseVariant(sourceProd, currency, itemPrice ?? item.price);
  const baseVarName = baseVar?.variant_name || baseVar?.name || baseVar?.title;
  if (baseVarName && String(baseVarName).trim()) {
    return String(baseVarName).trim();
  }

  // 3. Fallback to non-generic pack or base weight
  if (item.pack && String(item.pack).trim() && String(item.pack).trim().toLowerCase() !== 'standard pack') {
    return String(item.pack).trim();
  }
  return formatBaseWeight(item) || formatBaseWeight(matchedProduct) || null;
}
