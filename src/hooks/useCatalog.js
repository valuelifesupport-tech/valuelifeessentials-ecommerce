import { useMemo, useCallback, useEffect } from 'react';
import { filterProducts, sortProducts } from '../utils/filterMatchers';
import { useShop } from '../context/ShopContext';
import { useRouter } from './useRouter';

export function useCatalog(passedRoute) {
  const router = useRouter();
  const route = passedRoute || router?.route || {};

  const {
    products = [],
    categories = [],
    collections = [],
    selectedFilters = {},
    setSelectedFilters,
    sortBy = 'default',
    setSortBy,
    searchQuery = '',
    setSearchQuery,
    visibleCount = 12,
    setVisibleCount,
    isLoadingMore = false,
    setIsLoadingMore,
    getProductPricing
  } = useShop();

  const navigateTo = router?.navigateTo || (() => {});

  // 1. Multi-Stage Filter: Category -> Collection -> View -> Search -> Facet Pills
  const filteredProducts = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    // Stage A: Filter by Category (slug, id, or name)
    if (route?.category) {
      const target = String(route.category).trim().toLowerCase();
      const matchedCat = (categories || []).find(c => 
        String(c.id) === target || 
        (c.slug && c.slug.toLowerCase() === target) || 
        (c.name && c.name.toLowerCase() === target)
      );
      const targetSlug = matchedCat ? matchedCat.slug.toLowerCase() : target;
      const targetId = matchedCat ? Number(matchedCat.id) : (Number(target) || null);
      const targetName = matchedCat ? matchedCat.name.toLowerCase() : target.replace(/[-_]/g, ' ');

      list = list.filter(p => {
        if (targetId && Number(p.category_id) === targetId) return true;
        if (p.category_slug && p.category_slug.toLowerCase() === targetSlug) return true;
        if (p.category_name && p.category_name.toLowerCase() === targetName) return true;
        if (p.category && String(p.category).toLowerCase() === targetName) return true;
        if (p.category_slug && p.category_slug.toLowerCase() === target.replace(/\s+/g, '-')) return true;
        return false;
      });
    }

    // Stage B: Filter by Collection
    if (route?.collection) {
      const targetCol = String(route.collection).trim().toLowerCase();
      const matchedCol = (collections || []).find(c =>
        String(c.id) === targetCol ||
        (c.slug && c.slug.toLowerCase() === targetCol) ||
        (c.name && c.name.toLowerCase() === targetCol)
      );
      const colId = matchedCol ? Number(matchedCol.id) : (Number(targetCol) || null);
      const colSlug = matchedCol ? matchedCol.slug.toLowerCase() : targetCol;

      list = list.filter(p => {
        if (Array.isArray(p.collection_ids) && colId && p.collection_ids.includes(colId)) return true;
        if (Array.isArray(p.collections) && p.collections.some(c => String(c.id) === String(colId) || c.slug === colSlug)) return true;
        if (colSlug === 'offers') {
          const { pct } = typeof getProductPricing === 'function' ? getProductPricing(p) : { pct: 0 };
          return pct > 0 || (p.discount_inr && Number(p.discount_inr) > 0) || (p.compare_price_inr && Number(p.compare_price_inr) > Number(p.price_inr));
        }
        if (colSlug === 'bestsellers') {
          return Boolean(p.is_best_product);
        }
        return false;
      });
    }

    // Stage C: Filter by Specialized View Modes
    if (route?.view === 'offers') {
      list = list.filter(p => {
        const { pct } = typeof getProductPricing === 'function' ? getProductPricing(p) : { pct: 0 };
        return pct > 0 || (p.discount_inr && Number(p.discount_inr) > 0) || (p.compare_price_inr && Number(p.compare_price_inr) > Number(p.price_inr));
      });
    } else if (route?.view === 'bestsellers') {
      list = list.filter(p => Boolean(p.is_best_product));
    }

    // Stage D: Filter by Search Query
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const title = (p.title || p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const tags = (p.tags || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const cat = (p.category_name || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || tags.includes(q) || sku.includes(q) || cat.includes(q);
      });
    }

    // Stage E: Filter by Selected Facet Pills (pack size, form, certification, price range)
    return filterProducts(list, selectedFilters, getProductPricing);
  }, [products, categories, collections, route?.category, route?.collection, route?.view, searchQuery, selectedFilters, getProductPricing]);

  // 2. Sort products
  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortBy, getProductPricing);
  }, [filteredProducts, sortBy, getProductPricing]);

  // 3. Reset visible count when route, search, or filters change
  useEffect(() => {
    if (typeof setVisibleCount === 'function') {
      setVisibleCount(12);
    }
  }, [route?.category, route?.collection, route?.view, searchQuery, selectedFilters, sortBy, setVisibleCount]);

  // 4. Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || visibleCount >= sortedProducts.length) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 500) {
        if (typeof setIsLoadingMore === 'function') setIsLoadingMore(true);
        setTimeout(() => {
          if (typeof setVisibleCount === 'function') {
            setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length));
          }
          if (typeof setIsLoadingMore === 'function') setIsLoadingMore(false);
        }, 300);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, sortedProducts.length, isLoadingMore, setIsLoadingMore, setVisibleCount]);

  // 5. Clear all filters
  const handleClearFilters = useCallback(() => {
    if (typeof setSearchQuery === 'function') setSearchQuery('');
    if (typeof setSortBy === 'function') setSortBy('default');
    if (typeof setSelectedFilters === 'function') setSelectedFilters({});
    if (typeof setVisibleCount === 'function') setVisibleCount(12);
    navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null });
  }, [navigateTo, setSearchQuery, setSelectedFilters, setSortBy, setVisibleCount]);

  return {
    filteredProducts,
    sortedProducts,
    handleClearFilters
  };
}

export default useCatalog;
