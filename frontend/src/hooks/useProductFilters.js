import { useState, useEffect, useMemo } from 'react';

/**
 * Product filtering, sorting, and infinite scroll hook.
 */
export function useProductFilters(products, getProductPricing, navigateTo, route, searchQuery, setSearchQuery) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter & Sort
  const FILTER_MATCHERS = {
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

  const filteredProducts = products.filter(p => {
    for (const [key, val] of Object.entries(selectedFilters)) {
      if (!val) continue;
      if (key === 'price_range') {
        const { pPrice } = getProductPricing(p);
        if (val === 'under_200' && pPrice >= 200) return false;
        if (val === '200_500' && (pPrice < 200 || pPrice > 500)) return false;
        if (val === '500_1000' && (pPrice < 500 || pPrice > 1000)) return false;
        if (val === 'above_1000' && pPrice <= 1000) return false;
        continue;
      }
      const vText = Array.isArray(p.variants) ? p.variants.map(v => `${v.variant_name || ''} ${v.sku || ''}`).join(' ') : '';
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPricing(a).pPrice;
    const priceB = getProductPricing(b).pPrice;
    if (sortBy === 'low_high') return priceA - priceB;
    if (sortBy === 'high_low') return priceB - priceA;
    return 0;
  });

  // Reset visible count when filters/route/search/sort change
  useEffect(() => {
    setVisibleCount(12);
  }, [route, selectedFilters, searchQuery, sortBy]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || visibleCount >= sortedProducts.length) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 500) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length));
          setIsLoadingMore(false);
        }, 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, sortedProducts.length, isLoadingMore]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setSelectedFilters({});
    navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null });
  };

  return {
    selectedFilters,
    setSelectedFilters,
    activeFilterDropdown,
    setActiveFilterDropdown,
    sortBy,
    setSortBy,
    mobileViewMode,
    setMobileViewMode,
    visibleCount,
    setVisibleCount,
    isLoadingMore,
    sortedProducts,
    handleClearFilters
  };
}
