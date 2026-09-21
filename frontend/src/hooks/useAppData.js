import { useState, useEffect } from 'react';
import { getApiUrl } from '../api/config';
import { getProductPricing as getCalcProductPricing } from '../utils/pricing';

export function useAppData(route, searchQuery) {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isMaintenanceUnlocked, setIsMaintenanceUnlocked] = useState(() => {
    return sessionStorage.getItem('maintenance_unlocked') === 'true';
  });

  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [banners, setBanners] = useState([]);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [settings, setSettings] = useState({ enable_multi_currency: 0 });
  const [heroConfig, setHeroConfig] = useState(null);
  const [themeConfig, setThemeConfig] = useState({
    active_preset: 'EMERALD',
    card_style: 'VALUELIFE_ESSENTIALS'
  });
  const [sectionsConfig, setSectionsConfig] = useState(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(getApiUrl('/api/settings')).then(r => r.ok ? r.json() : null).then(d => d && setSettings(d)).catch(() => {});
    fetch(getApiUrl('/api/filter-groups')).then(r => r.ok ? r.json() : null).then(d => d && setFilterGroups(d)).catch(() => {});
    fetch(getApiUrl('/api/hero-config')).then(r => r.ok ? r.json() : null).then(d => d && setHeroConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/theme-config')).then(r => r.ok ? r.json() : null).then(d => d && setThemeConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/sections-config')).then(r => r.ok ? r.json() : null).then(d => d && setSectionsConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/maintenance/status'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const active = Boolean(d?.maintenance_mode || d?.mode);
        setIsMaintenanceActive(active);
        if (active && sessionStorage.getItem('maintenance_unlocked') !== 'true') {
          setIsMaintenanceUnlocked(false);
          localStorage.removeItem('maintenance_unlocked');
        }
      })
      .catch(() => {});
    fetch(getApiUrl('/api/currency/detect')).then(r => r.ok ? r.json() : null).then(d => { if (d?.currency) { setCurrency(d.currency); setCurrencySymbol(d.symbol); } }).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrencySymbol(currency === 'INR' ? '₹' : '$');
  }, [currency]);

  const getProductPricing = (p, curr = currency) => getCalcProductPricing(p, curr);

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const params = new URLSearchParams();
      if (route.category) params.append('category', route.category);
      if (route.collection) params.append('collection', route.collection);
      if (searchQuery) params.append('search', searchQuery);
      const url = getApiUrl('/api/products') + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);
      if (!res.ok) return;
      const rawData = await res.json();
      let data = Array.isArray(rawData) ? rawData : (rawData?.products || []);

      if (route.view === 'offers') {
        data = data.filter(p => getProductPricing(p).pct > 0);
      } else if (route.view === 'bestsellers') {
        data = data.filter(p => p && p.is_best_product === 1);
      } else if (route.view === 'new_arrivals') {
        data = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      }
      setProducts(data);
      setBestProducts(data.filter(p => p && p.is_best_product === 1));
    } catch (err) {
      setProducts([]);
      setBestProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    fetch(getApiUrl('/api/banners')).then(r => r.json()).then(d => setBanners(d || [])).catch(() => {});
    fetch(getApiUrl('/api/categories')).then(r => r.json()).then(d => setCategories(d || [])).catch(() => {});
    fetch(getApiUrl('/api/collections')).then(r => r.json()).then(d => setCollections(d || [])).catch(() => {});
    fetchProducts();
  }, [route, searchQuery]);

  return {
    currency,
    setCurrency,
    currencySymbol,
    banners,
    categories,
    collections,
    products,
    bestProducts,
    filterGroups,
    settings,
    heroConfig,
    themeConfig,
    sectionsConfig,
    isAppLoading,
    isProductsLoading,
    isMaintenanceActive,
    isMaintenanceUnlocked,
    setIsMaintenanceUnlocked,
    getProductPricing
  };
}
