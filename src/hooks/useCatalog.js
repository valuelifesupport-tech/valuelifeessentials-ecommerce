import { useMemo, useCallback, useEffect } from 'react';
import { filterProducts, sortProducts } from '../utils/filterMatchers';
import { useShop } from '../context/ShopContext';
import { useRouter } from './useRouter';

export function useCatalog() {
  const {
    products,
    selectedFilters,
    setSelectedFilters,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    visibleCount,
    setVisibleCount,
    isLoadingMore,
    setIsLoadingMore,
    getProductPricing
  } = useShop();

  const { navigateTo } = useRouter();

  // 1. Filter products
  const filteredProducts = useMemo(() => {
    return filterProducts(products, selectedFilters, getProductPricing);
  }, [products, selectedFilters, getProductPricing]);

  // 2. Sort products
  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortBy, getProductPricing);
  }, [filteredProducts, sortBy, getProductPricing]);

  // 3. Infinite scroll handler
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
  }, [visibleCount, sortedProducts.length, isLoadingMore, setIsLoadingMore, setVisibleCount]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy('default');
    setSelectedFilters({});
    navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null });
  }, [navigateTo, setSearchQuery, setSelectedFilters, setSortBy]);

  return {
    filteredProducts,
    sortedProducts,
    handleClearFilters
  };
}

export default useCatalog;
