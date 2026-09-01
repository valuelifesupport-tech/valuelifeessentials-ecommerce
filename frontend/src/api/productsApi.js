import { fetchApi } from './apiClient';

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await fetchApi(`/products${query ? `?${query}` : ''}`);
};

export const getProductBySlug = async (slug) => {
  return await fetchApi(`/products/${slug}`);
};

export const getBestSellers = async () => {
  return await fetchApi('/products?best=1');
};

export const getSuggestedBundle = async (productId) => {
  return await fetchApi(`/products/${productId}/suggested-bundle`);
};
