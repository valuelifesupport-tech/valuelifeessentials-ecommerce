import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { getProductPricing as getCalcProductPricing } from '../utils/pricing';
import { useRouter } from '../hooks/useRouter';

const ShopContext = createContext(null);

export function ShopProvider({ children, currentRoute: propRoute }) {
  const router = useRouter();
  const currentRoute = propRoute || router?.route;
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Maintenance Gatekeeper
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isMaintenanceUnlocked, setIsMaintenanceUnlocked] = useState(() => {
    return sessionStorage.getItem('maintenance_unlocked') === 'true';
  });

  // Global Store Entities
  const [settings, setSettings] = useState({ enable_multi_currency: 0 });
  const [filterGroups, setFilterGroups] = useState([]);
  const [heroConfig, setHeroConfig] = useState(null);
  const [themeConfig, setThemeConfig] = useState({
    active_preset: 'EMERALD',
    card_style: 'VALUELIFE_ESSENTIALS'
  });
  const [sectionsConfig, setSectionsConfig] = useState(null);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);

  // Catalog Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);

  // Variant Modal State
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const openVariantModal = useCallback((p) => setVariantModalProduct(p), []);
  const closeVariantModal = useCallback(() => setVariantModalProduct(null), []);

  const getProductPricing = useCallback((p, curr = currency) => {
    return getCalcProductPricing(p, curr);
  }, [currency]);

  // Currency symbol update
  useEffect(() => {
    setCurrencySymbol(currency === 'INR' ? '₹' : '$');
  }, [currency]);

  // Initial App Load & Metadata Fetch
  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 300);

    fetch(getApiUrl('/api/settings')).then(r => r.ok ? r.json() : null).then(d => d && setSettings(d)).catch(() => {});
    fetch(getApiUrl('/api/filter-groups')).then(r => r.ok ? r.json() : null).then(d => d && setFilterGroups(d)).catch(() => {});
    fetch(getApiUrl('/api/hero-config')).then(r => r.ok ? r.json() : null).then(d => d && setHeroConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/theme-config')).then(r => r.ok ? r.json() : null).then(d => d && setThemeConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/sections-config')).then(r => r.ok ? r.json() : null).then(d => d && setSectionsConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/currency/detect')).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.currency) {
        setCurrency(d.currency);
        setCurrencySymbol(d.symbol || (d.currency === 'INR' ? '₹' : '$'));
      }
    }).catch(() => {});

    fetch(getApiUrl('/api/maintenance/status'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const active = Boolean(d?.maintenance_mode || d?.mode);
        setIsMaintenanceActive(active);
        if (active && sessionStorage.getItem('maintenance_unlocked') !== 'true') {
          setIsMaintenanceUnlocked(false);
          localStorage.removeItem('maintenance_unlocked');
        }
      })
      .catch(() => {});

    return () => clearTimeout(timer);
  }, []);

  // Fetch Banners, Categories, Collections & Products
  const fetchProducts = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const url = getApiUrl('/api/products');
      const res = await fetch(url);
      const rawData = await res.json();
      let data = Array.isArray(rawData) ? rawData : (rawData?.products || []);

      setProducts(data);
      setBestProducts(data.filter(p => p && p.is_best_product === 1));
    } catch (err) {
      setProducts([]);
      setBestProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(getApiUrl('/api/banners')).then(r => r.ok ? r.json() : null).then(d => setBanners(d || [])).catch(() => {});
    fetch(getApiUrl('/api/categories')).then(r => r.ok ? r.json() : null).then(d => setCategories(d || [])).catch(() => {});
    fetch(getApiUrl('/api/collections')).then(r => r.ok ? r.json() : null).then(d => setCollections(d || [])).catch(() => {});
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setVisibleCount(12);
  }, [currentRoute, selectedFilters, searchQuery, sortBy]);

  const unlockMaintenance = useCallback(() => {
    setIsMaintenanceUnlocked(true);
    sessionStorage.setItem('maintenance_unlocked', 'true');
  }, []);

  return (
    <ShopContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol,
        isAppLoading,
        isProductsLoading,
        isMaintenanceActive,
        isMaintenanceUnlocked,
        unlockMaintenance,
        settings,
        filterGroups,
        heroConfig,
        themeConfig,
        sectionsConfig,
        banners,
        categories,
        collections,
        products,
        bestProducts,
        fetchProducts,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        mobileViewMode,
        setMobileViewMode,
        visibleCount,
        setVisibleCount,
        isLoadingMore,
        setIsLoadingMore,
        selectedFilters,
        setSelectedFilters,
        activeFilterDropdown,
        setActiveFilterDropdown,
        variantModalProduct,
        openVariantModal,
        closeVariantModal,
        getProductPricing
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
}

export default ShopContext;
