import { useState } from 'react';
import { getApiUrl } from '../api/config';
import { safeFetchJson } from '../utils/adminApi';

/**
 * Catalog CRUD for categories, collections, subcategories, banners, coupons,
 * variants, stock updates, users, pages, and filter groups.
 */
export default function useCatalogActions({
  adminFetch, fetchAdminData, showToast, askConfirmation,
  // Entity setters
  setProducts, setCategories, setCollections, setBanners, setCoupons, setPages, setFilterGroups,
  // Modal setters
  setShowCategoryModal, setShowCollectionModal, setShowSubcategoryModal, setShowBannerModal, setShowCouponModal, setShowPageModal,
  setEditingCategory, setEditingCollection, setEditingPage,
  setDeleteConfirmCategory, setDeletingCategoryId,
  // Product variants
  selectedProductForVariants, setSelectedProductForVariants,
  // User dossier
  setSelectedUserDossier, setLoadingUserDossier, setUsers
}) {
  const sf = (url) => safeFetchJson(adminFetch, url);

  // ------ Form states ------
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '', icon: '' });
  const [collectionForm, setCollectionForm] = useState({ name: '', description: '', image_url: '', category_id: '', product_ids: [] });
  const [subcategoryName, setSubcategoryName] = useState('');
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '/products' });
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'PERCENT', discount_value: 15, min_spend_inr: 300, min_spend_usd: 10, max_uses: 0, one_per_customer: 0, start_date: '', end_date: '', description: '', buy_qty: 1, get_qty: 1, get_discount_type: 'FREE' });
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [variantForm, setVariantForm] = useState({ variant_name: '', price_inr: 149, price_usd: 4, discount_inr: 99, discount_usd: 3, stock: 50 });
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', seo_title: '', seo_description: '', status: 'published' });

  // Filter groups
  const [newGroupForm, setNewGroupForm] = useState({ name: '', filter_key: '' });
  const [newOptionInputs, setNewOptionInputs] = useState({});

  // Review filters
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewProductFilter, setReviewProductFilter] = useState('ALL');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
  const [reviewPage, setReviewPage] = useState(1);
  const reviewItemsPerPage = 10;

  // User filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const userItemsPerPage = 10;

  // Inventory filters
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('ALL');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryItemsPerPage, setInventoryItemsPerPage] = useState(15);

  // Admin profile
  const [adminProfileForm, setAdminProfileForm] = useState({ name: '', email: '', currentPass: '', newPass: '', confirmPass: '' });

  // Media states
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('ALL');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaCacheBuster, setMediaCacheBuster] = useState(Date.now());

  // ------ Category CRUD ------
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const editingCategory = categoryForm._editing;
      const isEdit = Boolean(editingCategory);
      const url = isEdit ? getApiUrl(`/api/categories/${editingCategory.id}`) : getApiUrl('/api/categories');
      const method = isEdit ? 'PUT' : 'POST';

      const { _editing, ...formData } = categoryForm;
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '', image_url: '', icon: '' });
        const fresh = await sf('/api/categories');
        if (fresh) setCategories(fresh);
        if (showToast) showToast('success', isEdit ? 'Category Updated' : 'Category Created', `Category "${formData.name}" saved successfully.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Category Save Failed', errData.error || `Server returned error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Category Save Failed', err.message);
    }
  };

  const handleConfirmDeleteCategory = async (deleteConfirmCategory) => {
    if (!deleteConfirmCategory) return;
    setDeletingCategoryId(deleteConfirmCategory.id);
    try {
      const res = await adminFetch(`/api/categories/${deleteConfirmCategory.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('success', 'Category Deleted 🗑️', `Category "${deleteConfirmCategory.name}" was deleted.`);
        const fresh = await sf('/api/categories');
        if (fresh) setCategories(fresh);
      } else {
        if (showToast) showToast('error', 'Delete Failed', 'Could not delete category.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Delete Failed', err.message);
    } finally {
      setDeletingCategoryId(null);
      setDeleteConfirmCategory(null);
    }
  };

  // ------ Collection CRUD ------
  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const editingCollection = collectionForm._editing;
      const isEdit = Boolean(editingCollection);
      const url = isEdit
        ? getApiUrl(`/api/collections/${editingCollection.id}`)
        : getApiUrl('/api/collections');
      const method = isEdit ? 'PUT' : 'POST';

      const { _editing, ...formData } = collectionForm;
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const savedCol = await res.json().catch(() => null);
        setShowCollectionModal(false);
        setEditingCollection(null);
        setCollectionForm({ name: '', description: '', image_url: '', category_id: '', product_ids: [] });
        if (savedCol && savedCol.id) {
          setCollections(prev => {
            const exists = prev.some(c => c.id === savedCol.id);
            if (exists) {
              return prev.map(c => c.id === savedCol.id ? { ...c, ...savedCol, image_url: savedCol.image_url || formData.image_url } : c);
            }
            return [savedCol, ...prev];
          });
        }
        const fresh = await sf('/api/collections');
        if (fresh) setCollections(fresh);
        if (showToast) showToast('success', isEdit ? 'Collection Updated' : 'Collection Created', `Collection "${formData.name}" saved successfully.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Failed to Save Collection', errData.error || `Server returned error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Failed to Save Collection', err.message);
    }
  };

  // ------ Subcategory ------
  const handleSubcategorySubmit = async (e, selectedCatForSubcat, editingSubcategory = null) => {
    e.preventDefault();
    if (!selectedCatForSubcat && !editingSubcategory) return;
    try {
      const url = editingSubcategory ? `/api/subcategories/${editingSubcategory.id}` : '/api/subcategories';
      const method = editingSubcategory ? 'PUT' : 'POST';
      const payload = editingSubcategory
        ? { name: subcategoryName }
        : { category_id: selectedCatForSubcat.id, name: subcategoryName };
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowSubcategoryModal(false);
        setSubcategoryName('');
        fetchAdminData();
        if (showToast) showToast('success', editingSubcategory ? 'Subcategory Updated' : 'Subcategory Created', editingSubcategory ? 'Subcategory updated successfully.' : `Added subcategory to ${selectedCatForSubcat.name}`);
      }
    } catch (err) {}
  };

  // ------ Banner ------
  const handleBannerSubmit = async (e, editingBanner = null) => {
    e.preventDefault();
    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm)
      });
      if (res.ok) {
        setShowBannerModal(false);
        setBannerForm({ title: '', subtitle: '', image_url: '', link_url: '/products' });
        const fresh = await sf('/api/banners');
        if (fresh) setBanners(fresh);
        if (showToast) showToast('success', 'Banner Saved', editingBanner ? 'Banner updated.' : 'New banner created.');
      }
    } catch (err) {}
  };

  // ------ Coupon ------
  const handleCouponSubmit = async (e, { selectedDiscountType, browseTargetType, discountSelections, limitTotalUses, limitTotalUsesVal, limitOnePerCustomer }) => {
    e.preventDefault();
    try {
      const isFreeShip = selectedDiscountType?.id === 'free_shipping';
      const isBxGy = selectedDiscountType?.id === 'buy_x_get_y';
      const isProdOff = selectedDiscountType?.id === 'amount_off_products';

      let targetIds = [];
      if (isBxGy) {
        targetIds = (discountSelections.buys || []).map(i => i.id);
      } else if (isProdOff) {
        targetIds = (discountSelections.applies_to || []).map(i => i.id);
      }

      const payload = {
        ...couponForm,
        discount_value: isFreeShip ? 0 : Number(couponForm.discount_value) || 0,
        coupon_category: selectedDiscountType?.id || 'amount_off_order',
        applies_to_type: browseTargetType,
        target_ids: targetIds,
        max_uses: limitTotalUses ? Number(limitTotalUsesVal) || 0 : 0,
        one_per_customer: limitOnePerCustomer ? 1 : 0
      };

      const url = editingCouponId ? `/api/coupons/${editingCouponId}` : '/api/coupons';
      const method = editingCouponId ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowCouponModal(false);
        setEditingCouponId(null);
        const fresh = await sf('/api/coupons');
        if (fresh) setCoupons(fresh);
        if (showToast) showToast('success', editingCouponId ? 'Coupon Updated' : 'Coupon Created', `Code ${couponForm.code} ${editingCouponId ? 'updated' : 'active'}.`);
        setCouponForm({ code: '', discount_type: 'PERCENT', discount_value: 15, min_spend_inr: 300, min_spend_usd: 10, max_uses: 0, one_per_customer: 0, start_date: '', end_date: '', description: '', buy_qty: 1, get_qty: 1, get_discount_type: 'FREE' });
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Error', errData.error || 'Failed to save coupon');
      }
    } catch (err) {}
  };

  // ------ Variants & Stock ------
  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!selectedProductForVariants) return;
    try {
      const res = await adminFetch(`/api/products/${selectedProductForVariants.id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantForm)
      });
      if (res.ok) {
        setVariantForm({ variant_name: '', price_inr: 149, price_usd: 4, discount_inr: 99, discount_usd: 3, stock: 50 });
        const updatedProds = await sf('/api/products?includeDrafts=true');
        if (updatedProds) {
          setProducts(updatedProds);
          const found = updatedProds.find(p => p.id === selectedProductForVariants.id);
          if (found) setSelectedProductForVariants(found);
        }
        if (showToast) showToast('success', 'Variant Created', 'Added new variant pill.');
      }
    } catch (err) {}
  };

  const handleUpdateProductStock = async (productId, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: val } : p));
    try {
      const res = await adminFetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: val })
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Stock Updated Live', `Product stock updated to ${val} units.`);
      } else {
        const err = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Update Failed', err.error || `Server error (${res.status})`);
        fetchAdminData();
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
      fetchAdminData();
    }
  };

  const handleUpdateVariantStock = async (variantId, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setProducts(prev => prev.map(p => {
      if (p.variants && p.variants.some(v => v.id === variantId)) {
        return {
          ...p,
          variants: p.variants.map(v => v.id === variantId ? { ...v, stock: val } : v)
        };
      }
      return p;
    }));
    try {
      const res = await adminFetch(`/api/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: val })
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Variant Stock Updated', `Variant stock updated to ${val} units.`);
      } else {
        const err = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Update Failed', err.error || `Server error (${res.status})`);
        fetchAdminData();
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
      fetchAdminData();
    }
  };

  const handleDeleteVariant = async (id) => {
    await adminFetch(`/api/variants/${id}`, { method: 'DELETE' });
    const updatedProds = await sf('/api/products?includeDrafts=true');
    if (updatedProds) {
      setProducts(updatedProds);
      const found = updatedProds.find(p => p.id === selectedProductForVariants?.id);
      if (found) setSelectedProductForVariants(found);
    }
    if (showToast) showToast('info', 'Variant Deleted', 'Variant deleted.');
  };

  // ------ Users ------
  const fetchUsersData = async () => {
    const u = await sf('/api/admin/users');
    if (u) setUsers(u);
  };

  const handleViewUserDetails = async (user) => {
    setLoadingUserDossier(true);
    try {
      const res = await adminFetch(`/api/admin/users/${user.id}/details`);
      if (res.ok) {
        const dossier = await res.json();
        setSelectedUserDossier(dossier);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoadingUserDossier(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await adminFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        if (showToast) showToast('success', 'Role Updated', `User role changed to ${newRole}.`);
      } else {
        if (showToast) showToast('error', 'Update Failed', 'Could not update user role.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Error', err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    askConfirmation({
      title: 'Delete Customer Account?',
      message: `Are you sure you want to permanently delete user "${userName || 'User #' + userId}"? This cannot be undone.`,
      confirmText: 'Delete User',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
          if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            if (showToast) showToast('success', 'User Deleted', `User "${userName}" account deleted.`);
          } else {
            if (showToast) showToast('error', 'Delete Failed', 'Could not delete user.');
          }
        } catch (err) {
          if (showToast) showToast('error', 'Delete Error', err.message);
        }
      }
    });
  };

  const handleDownloadUsersCSV = () => {
    const token = localStorage.getItem('admin_session_token');
    window.open(getApiUrl(`/api/admin/users/export?token=${token}`), '_blank');
  };

  // ------ Pages ------
  const handlePageSubmit = async (e) => {
    e.preventDefault();
    try {
      const editingPage = pageForm._editing;
      const isEdit = !!editingPage;
      const url = isEdit ? getApiUrl(`/api/admin/pages/${editingPage.id}`) : getApiUrl('/api/admin/pages');
      const method = isEdit ? 'PUT' : 'POST';

      const { _editing, ...formData } = pageForm;
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowPageModal(false);
        setEditingPage(null);
        fetchAdminData();
        const freshPages = await sf('/api/pages');
        if (freshPages) setPages(freshPages);
        if (showToast) showToast('success', 'Page Saved', isEdit ? 'Custom page updated!' : 'New custom page created!');
      }
    } catch (err) {}
  };

  const handleDeletePage = async (id, title) => {
    askConfirmation({
      title: 'Delete Custom Page?',
      message: `Are you sure you want to permanently delete custom page "${title || 'Page #' + id}"? This action cannot be undone.`,
      confirmText: 'Delete Page',
      danger: true,
      onConfirm: async () => {
        await adminFetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
        setPages(prev => prev.filter(p => p.id !== id));
        if (showToast) showToast('info', 'Page Deleted', 'Custom page deleted.');
      }
    });
  };

  // ------ Filter Groups ------
  const handleAddFilterGroup = async (e) => {
    e.preventDefault();
    if (!newGroupForm.name || !newGroupForm.name.trim()) return;
    try {
      const res = await adminFetch('/api/admin/filter-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroupForm)
      });
      const data = await res.json();
      if (res.ok) {
        setNewGroupForm({ name: '', filter_key: '' });
        const flts = await sf('/api/filter-groups');
        if (flts && Array.isArray(flts)) setFilterGroups(flts);
        if (showToast) showToast('success', 'Filter Group Added', 'New product filter group created!');
      } else {
        if (showToast) showToast('error', 'Creation Failed', data.error || 'Could not create filter group.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Creation Error', err.message);
    }
  };

  const handleDeleteFilterGroup = async (id, name) => {
    askConfirmation({
      title: 'Delete Filter Group?',
      message: `Are you sure you want to delete filter group "${name || 'Group #' + id}" and all its options?`,
      confirmText: 'Delete Group',
      danger: true,
      onConfirm: async () => {
        await adminFetch(`/api/admin/filter-groups/${id}`, { method: 'DELETE' });
        const flts = await sf('/api/filter-groups');
        if (flts && Array.isArray(flts)) setFilterGroups(flts);
        if (showToast) showToast('info', 'Filter Group Deleted', 'Filter group removed.');
      }
    });
  };

  const handleAddFilterOption = async (groupId) => {
    const label = newOptionInputs[groupId];
    if (!label || !label.trim()) return;
    try {
      const res = await adminFetch('/api/admin/filter-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, label: label.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setNewOptionInputs(prev => ({ ...prev, [groupId]: '' }));
        const flts = await sf('/api/filter-groups');
        if (flts && Array.isArray(flts)) setFilterGroups(flts);
        if (showToast) showToast('success', 'Option Added', 'Filter pill option added!');
      } else {
        if (showToast) showToast('error', 'Option Failed', data.error || 'Could not add option.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Option Error', err.message);
    }
  };

  const handleDeleteFilterOption = async (optId, label) => {
    askConfirmation({
      title: 'Remove Filter Option?',
      message: `Are you sure you want to remove filter option "${label || 'Option #' + optId}"?`,
      confirmText: 'Remove Option',
      danger: true,
      onConfirm: async () => {
        await adminFetch(`/api/admin/filter-options/${optId}`, { method: 'DELETE' });
        const flts = await sf('/api/filter-groups');
        if (flts && Array.isArray(flts)) setFilterGroups(flts);
        if (showToast) showToast('info', 'Option Removed', 'Filter option deleted.');
      }
    });
  };

  return {
    // Form states
    categoryForm, setCategoryForm,
    collectionForm, setCollectionForm,
    subcategoryName, setSubcategoryName,
    bannerForm, setBannerForm,
    couponForm, setCouponForm,
    editingCouponId, setEditingCouponId,
    variantForm, setVariantForm,
    pageForm, setPageForm,
    newGroupForm, setNewGroupForm,
    newOptionInputs, setNewOptionInputs,
    adminProfileForm, setAdminProfileForm,
    // Review filters
    reviewSearchQuery, setReviewSearchQuery,
    reviewProductFilter, setReviewProductFilter,
    reviewStatusFilter, setReviewStatusFilter,
    reviewRatingFilter, setReviewRatingFilter,
    reviewPage, setReviewPage,
    reviewItemsPerPage,
    // User filters
    userSearchQuery, setUserSearchQuery,
    userRoleFilter, setUserRoleFilter,
    userPage, setUserPage,
    userItemsPerPage,
    // Inventory filters
    inventorySearchQuery, setInventorySearchQuery,
    inventoryStockFilter, setInventoryStockFilter,
    inventoryCategoryFilter, setInventoryCategoryFilter,
    inventoryPage, setInventoryPage,
    inventoryItemsPerPage, setInventoryItemsPerPage,
    // Media
    mediaSearch, setMediaSearch,
    mediaFilter, setMediaFilter,
    mediaUploading, setMediaUploading,
    mediaCacheBuster, setMediaCacheBuster,
    // Handlers
    handleCategorySubmit,
    handleConfirmDeleteCategory,
    handleCollectionSubmit,
    handleSubcategorySubmit,
    handleBannerSubmit,
    handleCouponSubmit,
    handleAddVariant,
    handleUpdateProductStock,
    handleUpdateVariantStock,
    handleDeleteVariant,
    fetchUsersData,
    handleViewUserDetails,
    handleUpdateUserRole,
    handleDeleteUser,
    handleDownloadUsersCSV,
    handlePageSubmit,
    handleDeletePage,
    handleAddFilterGroup,
    handleDeleteFilterGroup,
    handleAddFilterOption,
    handleDeleteFilterOption
  };
}
