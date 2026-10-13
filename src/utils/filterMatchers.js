/**
 * Catalog Filter Matchers & Product Weight Parsers
 * Separates catalog filtering algorithms and keyword matchers from UI components.
 */

export const FILTER_MATCHERS = {
  // 1. Form & Texture
  'fine-powder': ['powder', 'churna', 'flour', 'atta', 'choornam', 'bhasma'],
  'whole-seeds': ['seed', 'seeds', 'grain', 'grains', 'millet', 'millets', 'flax', 'chia', 'methi', 'mustard', 'sesame'],
  'raw-roots-bark': ['root', 'roots', 'bark', 'stem', 'leaf', 'leaves', 'dry fruit', 'raw'],
  'whole-split-pulses': ['dal', 'pulse', 'pulses', 'lentil', 'lentils', 'gram', 'urad', 'moong', 'chana', 'toor', 'rajma', 'beans'],
  'crystals': ['salt', 'crystal', 'crystals', 'rock salt', 'sendha', 'kala namak', 'mineral'],
  'tea-cut-leafs': ['leaf', 'leaves', 'tea', 'tisane', 'tulsi', 'moringa', 'senna'],
  'stoneground-flour': ['flour', 'atta', 'ground', 'besan'],
  'resins-gums': ['resin', 'gum', 'gond', 'hing', 'dhoop', 'sambrani', 'camphor'],

  // 2. Organic Certification & Purity
  '100-certified-organic': ['organic', 'certified', 'natural', 'pure', 'authentic'],
  'naturally-grown-heirloom': ['heirloom', 'desi', 'traditional', 'native', 'natural', 'raw'],
  'chemical-pesticide-free': ['chemical free', 'pesticide free', 'unpolished', 'raw', 'pure', 'preservative'],
  'wild-harvested-himalayan': ['wild', 'himalayan', 'forest', 'natural', 'harvested', 'mountain'],

  // 3. Pack Size
  '100g': ['100g', '100 g', '100gm', '100 gm', '100gms'],
  '250g': ['250g', '250 g', '250gm', '250 gm', '250gms', '200g', '200 g'],
  '500g': ['500g', '500 g', '500gm', '500 gm', '500gms', '490g', '490 g', '400g'],
  '1kg': ['1kg', '1 kg', '1000g', '990g', '900g', '1 kilo'],
  '5kg-eco-pack': ['2kg', '2 kg', '3kg', '5kg', '5 kg', 'bulk', 'eco pack'],

  // 4. Dietary & Health
  'immunity-booster': ['immunity', 'immune', 'vitality', 'antioxidant', 'ayush', 'strength', 'ojas'],
  'high-protein-fiber': ['protein', 'fiber', 'fibre', 'energy', 'superfood', 'nutrient'],
  'diabetic-friendly': ['diabetic', 'diabetes', 'blood sugar', 'sugar control', 'karela', 'jamun', 'methi', 'fenugreek'],
  'gluten-free': ['gluten free', 'gluten-free', 'millet', 'quinoa', 'ragi', 'jowar', 'bajra', 'flax'],
  'digestive-care': ['digestive', 'digestion', 'gut', 'triphala', 'isabgol', 'constipation', 'gastric', 'acidity', 'ajwain', 'saunf', 'jeera']
};

/**
 * Extracts normalized weight in grams from strings like "500g", "1 kg", "250 ml", etc.
 */
export const parseWeightGrams = (str) => {
  if (!str) return 0;
  const s = String(str);
  const kg = s.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilogram)/i);
  if (kg) return parseFloat(kg[1]) * 1000;
  const gm = s.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)/i);
  if (gm) return parseFloat(gm[1]);
  const ltr = s.match(/(\d+(?:\.\d+)?)\s*(?:l|ltr|litre|liter)/i);
  if (ltr) return parseFloat(ltr[1]) * 1000;
  const ml = s.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter)/i);
  if (ml) return parseFloat(ml[1]);
  return 0;
};

/**
 * Computes the minimum packaging weight in grams for a given product or its variants.
 */
export const getProductWeight = (p) => {
  if (!p) return 0;
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const list = p.variants.map(v => parseWeightGrams(v.variant_name || v.title || v.sku)).filter(w => w > 0);
    if (list.length > 0) return Math.min(...list);
  }
  return parseWeightGrams(p.title || p.name || '');
};

/**
 * Filters a product array based on selected filter facets.
 */
export const filterProducts = (products = [], selectedFilters = {}, getProductPricing) => {
  if (!Array.isArray(products)) return [];
  const activeKeys = Object.entries(selectedFilters).filter(([_, val]) => Boolean(val));
  if (activeKeys.length === 0) return products;

  return products.filter(p => {
    for (const [key, val] of activeKeys) {
      if (key === 'price_range' && typeof getProductPricing === 'function') {
        const { pPrice } = getProductPricing(p);
        if (val === 'under_200' && pPrice >= 200) return false;
        if (val === '200_500' && (pPrice < 200 || pPrice > 500)) return false;
        if (val === '500_1000' && (pPrice < 500 || pPrice > 1000)) return false;
        if (val === 'above_1000' && pPrice <= 1000) return false;
        continue;
      }

      const vText = Array.isArray(p.variants)
        ? p.variants.map(v => `${v.variant_name || ''} ${v.sku || ''}`).join(' ')
        : '';
      const fullText = `${p.title || ''} ${p.tags || ''} ${p.description || ''} ${vText}`.toLowerCase();

      const matchKeywords = FILTER_MATCHERS[val];
      if (matchKeywords && matchKeywords.length > 0) {
        const matches = matchKeywords.some(kw => fullText.includes(kw.toLowerCase()));
        if (!matches) return false;
      } else {
        const cleanVal = String(val).replace(/[-_]/g, ' ').toLowerCase();
        if (!fullText.includes(cleanVal) && !fullText.includes(String(val).toLowerCase())) return false;
      }
    }
    return true;
  });
};

/**
 * Sorts products by price, weight, or name.
 */
export const sortProducts = (products = [], sortBy = 'default', getProductPricing) => {
  if (!Array.isArray(products)) return [];
  const list = [...products];

  return list.sort((a, b) => {
    if (sortBy === 'low_high' && typeof getProductPricing === 'function') {
      return getProductPricing(a).pPrice - getProductPricing(b).pPrice;
    }
    if (sortBy === 'high_low' && typeof getProductPricing === 'function') {
      return getProductPricing(b).pPrice - getProductPricing(a).pPrice;
    }
    if (sortBy === 'weight_low_high') {
      return getProductWeight(a) - getProductWeight(b);
    }
    if (sortBy === 'weight_high_low') {
      return getProductWeight(b) - getProductWeight(a);
    }
    if (sortBy === 'name_az') {
      return (a.title || a.name || '').localeCompare(b.title || b.name || '');
    }
    if (sortBy === 'name_za') {
      return (b.title || b.name || '').localeCompare(a.title || a.name || '');
    }
    return (b.id || 0) - (a.id || 0);
  });
};
