import { useState, useEffect, useRef } from 'react';
import { safeFetchJson } from '../utils/adminApi';

/**
 * Core entity collections, data fetching, tab lazy-loading, and analytics polling.
 */
export default function useAdminData({ adminFetch, isAuthLocked }) {
  // Primary entity collections
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);

  // Content & media
  const [pages, setPages] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);

  // Tab lazy-loading
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  const sf = (url) => safeFetchJson(adminFetch, url);

  // ------ Fetchers ------
  const fetchAnalytics = async () => {
    const data = await sf('/api/admin/analytics');
    if (data) setAnalytics(data);
  };

  const fetchAdminData = async () => {
    try {
      const [prods, cats, cols, ords, setts, revs] = await Promise.all([
        sf('/api/products?includeDrafts=true'),
        sf('/api/categories'),
        sf('/api/collections'),
        sf('/api/admin/orders'),
        sf('/api/settings'),
        sf('/api/reviews')
      ]);
      if (prods) setProducts(prods);
      if (cats) setCategories(cats);
      if (cols) setCollections(cols);
      if (ords) setOrders(ords);
      if (setts) setSettings(setts);
      if (revs) setReviews(revs);
    } catch (err) {
      console.error('fetchAdminData error:', err);
    }
  };

  const fetchTabData = async (tab) => {
    if (loadedTabs.has(tab) && tab !== 'reviews') return;
    setLoadedTabs(prev => new Set([...prev, tab]));

    try {
      switch (tab) {
        case 'media': {
          const m = await sf('/api/admin/media');
          if (m) setMediaFiles(m);
          break;
        }
        case 'users': {
          const u = await sf('/api/admin/users');
          if (u) setUsers(u);
          break;
        }
        case 'banners': {
          const b = await sf('/api/banners');
          if (b) setBanners(b);
          break;
        }
        case 'coupons': {
          const c = await sf('/api/coupons');
          if (c) setCoupons(c);
          break;
        }
        case 'reviews': {
          const r = await sf('/api/reviews');
          if (r) setReviews(r);
          break;
        }
        case 'pages': {
          const p = await sf('/api/pages');
          if (p) setPages(p);
          break;
        }
        case 'filters': {
          const f = await sf('/api/filter-groups');
          if (f && Array.isArray(f)) setFilterGroups(f);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error(`fetchTabData(${tab}) error:`, err);
    }
  };

  // ------ Effects ------
  // Initial data + analytics polling
  useEffect(() => {
    if (isAuthLocked) return;
    fetchAnalytics();
    fetchAdminData();
    const interval = setInterval(fetchAnalytics, 6000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLocked]);

  return {
    // Entity state
    analytics, setAnalytics,
    products, setProducts,
    categories, setCategories,
    collections, setCollections,
    orders, setOrders,
    reviews, setReviews,
    banners, setBanners,
    coupons, setCoupons,
    users, setUsers,
    settings, setSettings,
    pages, setPages,
    mediaFiles, setMediaFiles,
    filterGroups, setFilterGroups,
    loadedTabs,
    // Fetchers
    fetchAnalytics,
    fetchAdminData,
    fetchTabData,
    sf
  };
}
