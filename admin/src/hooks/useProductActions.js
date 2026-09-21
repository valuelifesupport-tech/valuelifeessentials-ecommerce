import React, { useState, useEffect, useMemo } from 'react';
import { getApiUrl } from '../api/config';
import { uploadFilesWithFallback, convertFileToBase64 } from '../utils/fileUpload';

const defaultProductForm = {
  title: '', sku: '', description: '', category_id: '', subcategory_id: '',
  price_inr: '', price_usd: '', discount_inr: '', discount_usd: '',
  compare_price_inr: '', compare_price_usd: '',
  cost_per_item_inr: '', cost_per_item_usd: '',
  gst_percent: '',
  stock: 100, status: 'Active', product_type: '', vendor: '',
  images: [], tags: '', collection_ids: [], variants: [],
  seo_title: '', seo_description: '', url_handle: '',
  cross_sell_ids: [], upsell_ids: []
};

/**
 * Product-specific state, filtering, media handlers, tags, and CRUD actions.
 */
export default function useProductActions({ adminFetch, products, setProducts, categories, fetchAdminData, showToast, setShowProductModal, editingProduct, setEditingProduct, setDeleteConfirmProduct, setDeletingProductId, setIsCatDropdownOpen }) {
  // Form state
  const [productForm, setProductForm] = useState({ ...defaultProductForm });
  const [newVariantForm, setNewVariantForm] = useState({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });

  // Filters & pagination
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [adminProductPage, setAdminProductPage] = useState(1);
  const adminItemsPerPage = 12;

  // Media state
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [isDraggingOverArea, setIsDraggingOverArea] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState(null);
  const [isCatDropdownOpen, setIsCatDropdownOpenLocal] = useState(false);
  const [isSubcatDropdownOpen, setIsSubcatDropdownOpen] = useState(false);

  // Pagination reset
  useEffect(() => {
    setAdminProductPage(1);
  }, [productSearchQuery, productCategoryFilter, productStatusFilter]);

  // ------ Media handlers ------
  const handleAddImage = () => {
    if (!imageUrlInput) return;
    setProductForm(prev => ({ ...prev, images: [...(prev.images || []), imageUrlInput] }));
    setImageUrlInput('');
  };

  const handleProductMediaFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls = await uploadFilesWithFallback(files, adminFetch, { imageOnly: true });
    if (urls.length > 0) {
      setProductForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      if (showToast) showToast('success', 'Images Uploaded', `${urls.length} image(s) added.`);
    }
  };

  const handleFileUpload = handleProductMediaFileUpload;

  const processFilesForUpload = async (filesList) => {
    const urls = await uploadFilesWithFallback(filesList, adminFetch, { imageOnly: true });
    if (urls.length > 0) {
      setProductForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      if (showToast) showToast('success', 'Images Uploaded', `${urls.length} image(s) added via drag & drop.`);
    }
  };

  const handleDropFilesOnArea = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverArea(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesForUpload(e.dataTransfer.files);
    }
  };

  const handleDragOverArea = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOverArea) setIsDraggingOverArea(true);
  };

  const handleDragLeaveArea = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverArea(false);
  };

  // Thumbnail reordering
  const handleThumbnailDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedImageIndex(index);
  };

  const handleThumbnailDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverImageIndex !== index) setDragOverImageIndex(index);
  };

  const handleThumbnailDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndex = draggedImageIndex !== null ? draggedImageIndex : Number(e.dataTransfer.getData('text/plain'));

    if (sourceIndex === null || sourceIndex === undefined || isNaN(sourceIndex) || sourceIndex === dropIndex) {
      setDraggedImageIndex(null);
      setDragOverImageIndex(null);
      return;
    }

    const newImages = [...(productForm.images || [])];
    const [movedItem] = newImages.splice(sourceIndex, 1);
    newImages.splice(dropIndex, 0, movedItem);

    setProductForm(prev => ({ ...prev, images: newImages }));
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
    if (showToast) showToast('info', 'Images Reordered', sourceIndex === 0 || dropIndex === 0 ? 'Primary product image updated!' : 'Product gallery order updated.');
  };

  const handleRemoveImage = (index) => {
    const updated = productForm.images.filter((_, idx) => idx !== index);
    setProductForm({ ...productForm, images: updated });
  };

  // ------ Tags ------
  const handleAddTag = () => {
    if (!tagInput) return;
    const cleanTag = tagInput.trim().toLowerCase();
    const currentTags = Array.isArray(productForm.tags)
      ? productForm.tags
      : typeof productForm.tags === 'string'
        ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    if (!currentTags.includes(cleanTag)) {
      setProductForm({ ...productForm, tags: [...currentTags, cleanTag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentTags = Array.isArray(productForm.tags)
      ? productForm.tags
      : typeof productForm.tags === 'string'
        ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    setProductForm({ ...productForm, tags: currentTags.filter(t => t !== tagToRemove) });
  };

  const handleToggleCollection = (colId) => {
    const targetId = Number(colId);
    const current = (productForm.collection_ids || []).map(id => Number(id)).filter(id => !isNaN(id));
    const updated = current.includes(targetId) ? current.filter(id => id !== targetId) : [...current, targetId];
    setProductForm({ ...productForm, collection_ids: updated });
  };

  // ------ SKU validation ------
  const isDuplicateSku = useMemo(() => {
    if (!productForm.sku || !productForm.sku.trim()) return false;
    const cleanSku = productForm.sku.trim().toUpperCase();
    const targetId = editingProduct?.id || productForm?.id;
    return products.some(p => {
      if (targetId && (p.id === targetId || String(p.id) === String(targetId) || Number(p.id) === Number(targetId))) return false;
      return (p.sku?.toUpperCase() === cleanSku || p.variants?.some(v => v.sku?.toUpperCase() === cleanSku));
    });
  }, [productForm.sku, productForm.id, editingProduct, products]);

  // ------ Product CRUD ------
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.category_id) {
      if (showToast) showToast('error', 'Category Required', 'Main Category select karna mandatory (required) hai. Please select a Main Category.');
      setIsCatDropdownOpenLocal(true);
      return;
    }

    let finalSku = productForm.sku;
    if (isDuplicateSku || !finalSku || !finalSku.trim()) {
      const titleSlug = (productForm.title || 'PROD').trim().replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 10).toUpperCase().replace(/(^-|-$)+/g, '');
      finalSku = `VLE-${titleSlug || 'PROD'}-${Math.floor(100 + Math.random() * 900)}`;
    }

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? getApiUrl(`/api/products/${editingProduct.id}`) : getApiUrl('/api/products');
      const method = isEdit ? 'PUT' : 'POST';

      const cleanFormImages = (productForm.images || [])
        .map(img => (typeof img === 'object' && img?.image_url) ? img.image_url : img)
        .filter(Boolean);

      // Auto-commit pending variant form inputs
      let mergedVariants = [...(productForm.variants || [])];
      if (newVariantForm && newVariantForm.variant_name && newVariantForm.variant_name.trim()) {
        const vPrice = Number(newVariantForm.price_inr || productForm.price_inr || 0);
        const vPriceUsd = newVariantForm.price_usd !== '' && Number(newVariantForm.price_usd) > 0 ? Number(newVariantForm.price_usd) : Number((vPrice / 95).toFixed(2));
        const vCompInr = Number(newVariantForm.compare_price_inr || 0);
        const vCompUsd = newVariantForm.compare_price_usd !== '' && Number(newVariantForm.compare_price_usd) > 0 ? Number(newVariantForm.compare_price_usd) : (vCompInr > 0 ? Number((vCompInr / 95).toFixed(2)) : 0);
        const vStock = Number(newVariantForm.stock || 100);
        mergedVariants.push({
          id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          variant_name: newVariantForm.variant_name.trim(),
          price_inr: vPrice,
          price: vPrice,
          discount_inr: vPrice,
          price_usd: vPriceUsd,
          discount_usd: vPriceUsd,
          compare_price_inr: vCompInr || null,
          compare_price_usd: vCompUsd || null,
          stock: vStock,
          sku: `OB-VAR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          image_url: productForm.images && productForm.images.length > 0 ? (typeof productForm.images[0] === 'object' ? productForm.images[0].image_url : productForm.images[0]) : null
        });
      }

      const cleanFormVariants = mergedVariants.map(v => {
        const vPriceInr = Number(v.price_inr !== undefined && v.price_inr !== '' ? v.price_inr : (v.price || productForm.price_inr || 0));
        const vPriceUsd = (v.price_usd !== undefined && v.price_usd !== '' && Number(v.price_usd) > 0) ? Number(v.price_usd) : (vPriceInr > 0 ? Number((vPriceInr / 95).toFixed(2)) : 0);
        const vCompInr = (v.compare_price_inr !== undefined && v.compare_price_inr !== '' && Number(v.compare_price_inr) > 0) ? Number(v.compare_price_inr) : null;
        const vCompUsd = (v.compare_price_usd !== undefined && v.compare_price_usd !== '' && Number(v.compare_price_usd) > 0) ? Number(v.compare_price_usd) : (vCompInr ? Number((vCompInr / 95).toFixed(2)) : null);
        return {
          ...v,
          variant_name: v.variant_name || v.name || 'Standard Pack',
          price_inr: vPriceInr,
          price_usd: vPriceUsd,
          discount_inr: vPriceInr,
          discount_usd: vPriceUsd,
          compare_price_inr: vCompInr,
          compare_price_usd: vCompUsd,
          stock: Number(v.stock !== undefined && v.stock !== '' ? v.stock : 50),
          image_url: typeof v.image_url === 'object' ? v.image_url?.image_url : (v.image_url || cleanFormImages[0] || null)
        };
      });

      // Fallback base price from variants
      let submitPriceInr = productForm.price_inr !== '' && productForm.price_inr !== undefined ? Number(productForm.price_inr) : 0;
      let submitPriceUsd = productForm.price_usd !== '' && productForm.price_usd !== undefined ? Number(productForm.price_usd) : 0;
      let submitDiscInr = productForm.discount_inr !== '' && productForm.discount_inr !== undefined ? Number(productForm.discount_inr) : submitPriceInr;
      let submitDiscUsd = productForm.discount_usd !== '' && productForm.discount_usd !== undefined ? Number(productForm.discount_usd) : submitPriceUsd;

      if (submitPriceInr === 0 && cleanFormVariants.length > 0) {
        submitPriceInr = cleanFormVariants[0].price_inr;
        submitPriceUsd = cleanFormVariants[0].price_usd;
        submitDiscInr = cleanFormVariants[0].discount_inr || submitPriceInr;
        submitDiscUsd = cleanFormVariants[0].discount_usd || submitPriceUsd;
      }

      const payload = {
        ...productForm,
        price_inr: submitPriceInr,
        price_usd: submitPriceUsd,
        discount_inr: submitDiscInr,
        discount_usd: submitDiscUsd,
        images: cleanFormImages,
        variants: cleanFormVariants,
        tags: Array.isArray(productForm.tags) ? productForm.tags.join(', ') : productForm.tags,
        sku: finalSku
      };
      if (!isEdit) delete payload.id;

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        setNewVariantForm({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });
        await fetchAdminData();
        if (showToast) showToast('success', 'Product Saved', isEdit ? 'Product updated!' : 'New product created!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Save Product Error', errorData.error || `Server returned HTTP status ${res.status}`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', err.message || 'Could not connect to backend server');
    }
  };

  const handleConfirmDeleteProduct = async (deleteConfirmProduct) => {
    if (!deleteConfirmProduct) return;
    setDeletingProductId(deleteConfirmProduct.id);
    try {
      const res = await adminFetch(`/api/products/${deleteConfirmProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('success', 'Product Deleted 🗑️', `Product "${deleteConfirmProduct.title}" was deleted.`);
        fetchAdminData();
      } else {
        if (showToast) showToast('error', 'Delete Failed', 'Could not delete product from server.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error', err.message);
    } finally {
      setDeletingProductId(null);
      setDeleteConfirmProduct(null);
    }
  };

  // ------ Computed values ------
  const filteredProducts = products.filter(p => {
    const query = productSearchQuery.toLowerCase().trim();
    const matchesQuery = !query ||
      p.title?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.vendor?.toLowerCase().includes(query) ||
      p.category_name?.toLowerCase().includes(query) ||
      p.subcategory_name?.toLowerCase().includes(query);

    const matchesStatus = productStatusFilter === 'ALL' || (p.status || 'Active') === productStatusFilter;
    const matchesCategory = productCategoryFilter === 'ALL' || p.category_id === Number(productCategoryFilter);

    return matchesQuery && matchesStatus && matchesCategory;
  });

  return {
    defaultProductForm,
    productForm, setProductForm,
    newVariantForm, setNewVariantForm,
    productSearchQuery, setProductSearchQuery,
    productStatusFilter, setProductStatusFilter,
    productCategoryFilter, setProductCategoryFilter,
    adminProductPage, setAdminProductPage,
    adminItemsPerPage,
    imageUrlInput, setImageUrlInput,
    tagInput, setTagInput,
    showSeoFields, setShowSeoFields,
    isDraggingOverArea, setIsDraggingOverArea,
    draggedImageIndex, setDraggedImageIndex,
    dragOverImageIndex, setDragOverImageIndex,
    isCatDropdownOpen, setIsCatDropdownOpen: setIsCatDropdownOpenLocal,
    isSubcatDropdownOpen, setIsSubcatDropdownOpen,
    isDuplicateSku,
    filteredProducts,
    // Handlers
    handleAddImage,
    handleProductMediaFileUpload,
    handleFileUpload,
    handleDropFilesOnArea,
    handleDragOverArea,
    handleDragLeaveArea,
    handleThumbnailDragStart,
    handleThumbnailDragOver,
    handleThumbnailDrop,
    handleRemoveImage,
    handleAddTag,
    handleRemoveTag,
    handleToggleCollection,
    handleProductSubmit,
    handleConfirmDeleteProduct
  };
}
