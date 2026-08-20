import { fetchApi } from './apiClient';

export const getCategories = async () => {
  return await fetchApi('/categories');
};

export const getCategoriesTree = async () => {
  return await fetchApi('/categories/tree');
};
