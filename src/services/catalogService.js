import { apiClient } from './apiClient';

/**
 * Catalog & Storefront Data Service
 * Abstracts backend network interactions for products, categories, collections, and banners.
 */
export const catalogService = {
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.collection) searchParams.append('collection', params.collection);
    if (params.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return apiClient(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getProductBySlug: (slug) => {
    return apiClient(`/api/products/slug/${encodeURIComponent(slug)}`);
  },

  getProductById: (id) => {
    return apiClient(`/api/products/${id}`);
  },

  getCategories: () => {
    return apiClient('/api/categories');
  },

  getCollections: () => {
    return apiClient('/api/collections');
  },

  getBanners: () => {
    return apiClient('/api/banners');
  },

  getFilterGroups: () => {
    return apiClient('/api/filter-groups');
  },

  getSettings: () => {
    return apiClient('/api/settings');
  },

  getHeroConfig: () => {
    return apiClient('/api/hero-config');
  },

  getThemeConfig: () => {
    return apiClient('/api/theme-config');
  },

  getSectionsConfig: () => {
    return apiClient('/api/sections-config');
  },

  getMaintenanceStatus: () => {
    return apiClient('/api/maintenance/status');
  }
};

export default catalogService;
