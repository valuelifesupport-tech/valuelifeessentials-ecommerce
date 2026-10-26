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
  const [blogs, setBlogs] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);

  // Tab lazy-loading
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  const sf = (url) => safeFetchJson(adminFetch, url);

  const fetchHeroSlides = async () => {
    const s = await sf('/api/admin/hero-slides');
    if (s && Array.isArray(s)) setHeroSlides(s);
    return s;
  };

  const fetchSubscribers = async () => {
    const subs = await sf('/api/admin/newsletter/subscribers');
    if (subs && Array.isArray(subs)) setSubscribers(subs);
    return subs;
  };

  // ------ Fetchers ------
  const fetchAnalytics = async () => {
    const data = await sf('/api/admin/analytics');
    if (data) setAnalytics(data);
  };

  const fetchAdminData = async () => {
    try {
      const [
        prods, cats, cols, ords, setts, revs, slides, blgs, igs, subs,
        media, filters, usrList, bans, coups, pgs
      ] = await Promise.all([
        sf('/api/products?includeDrafts=true'),
        sf('/api/categories'),
        sf('/api/collections'),
        sf('/api/admin/orders'),
        sf('/api/settings'),
        sf('/api/admin/reviews'),
        sf('/api/admin/hero-slides'),
        sf('/api/admin/blogs'),
        sf('/api/admin/instagram-posts'),
        sf('/api/admin/newsletter/subscribers'),
        sf('/api/admin/media'),
        sf('/api/filter-groups'),
        sf('/api/admin/users'),
        sf('/api/banners'),
        sf('/api/coupons'),
        sf('/api/pages')
      ]);
      if (prods) setProducts(prods);
      if (cats) setCategories(cats);
      if (cols) setCollections(cols);
      if (ords) setOrders(ords);
      if (setts) setSettings(setts);
      if (revs) setReviews(revs);
      if (slides && Array.isArray(slides)) setHeroSlides(slides);
      if (blgs && Array.isArray(blgs)) setBlogs(blgs);
      if (igs && Array.isArray(igs)) setInstagramPosts(igs);
      if (subs && Array.isArray(subs)) setSubscribers(subs);
      if (media && Array.isArray(media)) setMediaFiles(media);
      if (filters && Array.isArray(filters)) setFilterGroups(filters);
      if (usrList && Array.isArray(usrList)) setUsers(usrList);
      if (bans && Array.isArray(bans)) setBanners(bans);
      if (coups && Array.isArray(coups)) setCoupons(coups);
      if (pgs && Array.isArray(pgs)) setPages(pgs);
    } catch (err) {
      console.error('fetchAdminData error:', err);
    }
  };

  const fetchTabData = async (tab) => {
    if (loadedTabs.has(tab) && tab !== 'reviews') return;
    setLoadedTabs(prev => new Set([...prev, tab]));

    try {
      switch (tab) {
        case 'hero': {
          const s = await sf('/api/admin/hero-slides');
          if (s && Array.isArray(s)) setHeroSlides(s);
          break;
        }
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
          const r = await sf('/api/admin/reviews');
          if (r) setReviews(r);
          break;
        }
        case 'pages': {
          const p = await sf('/api/pages');
          if (p) setPages(p);
          break;
        }
        case 'blogs': {
          const b = await sf('/api/admin/blogs');
          if (b) setBlogs(b);
          break;
        }
        case 'instagram': {
          const ig = await sf('/api/admin/instagram-posts');
          if (ig && Array.isArray(ig)) setInstagramPosts(ig);
          break;
        }
        case 'subscribers': {
          await fetchSubscribers();
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
    blogs, setBlogs,
    instagramPosts, setInstagramPosts,
    subscribers, setSubscribers,
    mediaFiles, setMediaFiles,
    filterGroups, setFilterGroups,
    heroSlides, setHeroSlides,
    loadedTabs,
    // Fetchers
    fetchAnalytics,
    fetchAdminData,
    fetchTabData,
    fetchHeroSlides,
    fetchSubscribers,
    sf
  };
}
