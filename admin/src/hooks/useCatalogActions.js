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
  setProducts, setCategories, setCollections, setBanners, setCoupons, setPages, setBlogs, setInstagramPosts, setFilterGroups,
  // Modal setters
  setShowCategoryModal, setShowCollectionModal, setShowSubcategoryModal, setShowBannerModal, setShowCouponModal, setShowPageModal, setShowBlogModal, setShowInstagramModal,
  setEditingCategory, setEditingCollection, setEditingPage, setEditingBlog, setEditingInstagramPost,
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
  const [instagramForm, setInstagramForm] = useState({
    title: '',
    image_url: '',
    post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en',
    sort_order: 1,
    is_active: 1
  });
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'General Wellness',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: 'ValueLife Editorial',
    author_avatar: '',
    author_role: 'Ayurvedic Specialist',
    read_time: '5 min read',
    tags: 'Organic, Wellness, Ayurveda',
    is_published: 1,
    is_featured: 0,
    sort_order: 0
  });

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
  const [adminProfileForm, setAdminProfileForm] = useState({ name: 'Master Admin Owner', email: 'admin@valuelifeessentials.com', currentPass: '', newPass: '', confirmPass: '' });

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
        if (fresh && typeof setCategories === 'function') setCategories(fresh);
        if (typeof fetchAdminData === 'function') fetchAdminData();
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
        if (fresh && typeof setCategories === 'function') setCategories(fresh);
        if (typeof fetchAdminData === 'function') fetchAdminData();
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
        if (savedCol && savedCol.id && typeof setCollections === 'function') {
          setCollections(prev => {
            const exists = prev.some(c => c.id === savedCol.id);
            if (exists) {
              return prev.map(c => c.id === savedCol.id ? { ...c, ...savedCol, image_url: savedCol.image_url || formData.image_url } : c);
            }
            return [savedCol, ...prev];
          });
        }
        const fresh = await sf('/api/collections');
        if (fresh && typeof setCollections === 'function') setCollections(fresh);
        if (typeof fetchAdminData === 'function') fetchAdminData();
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
        if (typeof fetchAdminData === 'function') fetchAdminData();
        if (showToast) showToast('success', editingSubcategory ? 'Subcategory Updated' : 'Subcategory Created', editingSubcategory ? 'Subcategory updated successfully.' : `Added subcategory to ${selectedCatForSubcat?.name || 'Category'}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Subcategory Save Failed', errData.error || `Server error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Subcategory Save Failed', err.message);
    }
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
        if (fresh && typeof setBanners === 'function') setBanners(fresh);
        if (typeof fetchAdminData === 'function') fetchAdminData();
        if (showToast) showToast('success', 'Banner Saved', editingBanner ? 'Banner updated.' : 'New banner created.');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Banner Save Failed', errData.error || `Server error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Banner Save Failed', err.message);
    }
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
        free_shipping: isFreeShip ? 1 : 0,
        applies_to_type: browseTargetType,
        target_ids: targetIds,
        specific_ids: targetIds,
        applies_to: browseTargetType === 'products' ? 'SPECIFIC_PRODUCTS' : browseTargetType === 'categories' ? 'SPECIFIC_CATEGORIES' : 'ALL',
        max_uses: limitTotalUses ? Number(limitTotalUsesVal) || 0 : 0,
        usage_limit: limitTotalUses ? Number(limitTotalUsesVal) || 0 : 0,
        one_per_customer: limitOnePerCustomer ? 1 : 0,
        min_spend: Number(couponForm.min_spend_inr) || 0,
        expiry_date: couponForm.end_date || null
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
        if (fresh && typeof setCoupons === 'function') setCoupons(fresh);
        if (typeof fetchAdminData === 'function') fetchAdminData();
        if (showToast) showToast('success', editingCouponId ? 'Coupon Updated' : 'Coupon Created', `Code ${couponForm.code} ${editingCouponId ? 'updated' : 'active'}.`);
        setCouponForm({ code: '', discount_type: 'PERCENT', discount_value: 15, min_spend_inr: 300, min_spend_usd: 10, max_uses: 0, one_per_customer: 0, start_date: '', end_date: '', description: '', buy_qty: 1, get_qty: 1, get_discount_type: 'FREE' });
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Coupon Save Failed', errData.error || `Server error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Coupon Save Failed', err.message);
    }
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
          if (typeof setProducts === 'function') setProducts(updatedProds);
          const found = updatedProds.find(p => p.id === selectedProductForVariants.id);
          if (found) setSelectedProductForVariants(found);
        }
        if (showToast) showToast('success', 'Variant Created', 'Added new variant pill.');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Variant Creation Failed', errData.error || `Server error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Variant Creation Failed', err.message);
    }
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
    if (u && typeof setUsers === 'function') setUsers(u);
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
        if (typeof setUsers === 'function') setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
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
            if (typeof setUsers === 'function') setUsers(prev => prev.filter(u => u.id !== userId));
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

  const handleDownloadUsersCSV = async () => {
    const token = localStorage.getItem('admin_session_token') || '';
    try {
      const res = await adminFetch(`/api/admin/users/export?token=${token}&admin_token=${token}`);
      if (res.ok) {
        const csvText = await res.text();
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (showToast) showToast('success', 'Users CSV Downloaded', 'User directory CSV exported successfully.');
        return;
      }
    } catch (e) {}
    window.open(getApiUrl(`/api/admin/users/export?token=${token}&admin_token=${token}`), '_blank');
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
        if (freshPages && typeof setPages === 'function') setPages(freshPages);
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
        if (typeof setPages === 'function') setPages(prev => prev.filter(p => p.id !== id));
        if (showToast) showToast('info', 'Page Deleted', 'Custom page deleted.');
      }
    });
  };

  // ------ Blogs ------
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const editingBlog = blogForm._editing;
      const isEdit = !!editingBlog;
      const url = isEdit ? getApiUrl(`/api/admin/blogs/${editingBlog.id}`) : getApiUrl('/api/admin/blogs');
      const method = isEdit ? 'PUT' : 'POST';

      const { _editing, ...formData } = blogForm;
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowBlogModal(false);
        setEditingBlog(null);
        fetchAdminData();
        const freshBlogs = await sf('/api/admin/blogs');
        if (freshBlogs && typeof setBlogs === 'function') setBlogs(freshBlogs);
        if (showToast) showToast('success', 'Blog Saved', isEdit ? 'Article updated successfully!' : 'New article published!');
      } else {
        if (showToast) showToast('error', 'Blog Error', resData.error || 'Failed to save blog post');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Blog Error', err.message);
    }
  };

  const handleDeleteBlog = async (id, title) => {
    askConfirmation({
      title: 'Delete Blog Article?',
      message: `Are you sure you want to permanently delete article "${title || 'Post #' + id}"? This action cannot be undone.`,
      confirmText: 'Delete Article',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
          if (res.ok) {
            if (typeof setBlogs === 'function') setBlogs(prev => prev.filter(b => b.id !== id));
            if (showToast) showToast('info', 'Article Deleted', 'Blog article permanently deleted.');
          } else {
            const data = await res.json().catch(() => ({}));
            if (showToast) showToast('error', 'Delete Failed', data.error || 'Could not delete article.');
          }
        } catch (err) {
          if (showToast) showToast('error', 'Delete Error', err.message);
        }
      }
    });
  };

  const handleToggleBlogPublish = async (blog) => {
    const newStatus = blog.is_published ? 0 : 1;
    try {
      const res = await adminFetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: newStatus })
      });
      if (res.ok) {
        if (typeof setBlogs === 'function') setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_published: newStatus } : b));
        if (showToast) showToast('success', newStatus ? 'Article Published' : 'Article Hidden', `"${blog.title}" is now ${newStatus ? 'live' : 'draft'}.`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Status Update Failed', err.message);
    }
  };

  const handleToggleBlogFeatured = async (blog) => {
    const newFeatured = blog.is_featured ? 0 : 1;
    try {
      const res = await adminFetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: newFeatured })
      });
      if (res.ok) {
        if (typeof setBlogs === 'function') setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_featured: newFeatured } : b));
        if (showToast) showToast('success', newFeatured ? 'Marked as Featured' : 'Removed from Featured', `"${blog.title}" ${newFeatured ? 'is now spotlighted' : 'is standard'}.`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Featured Update Failed', err.message);
    }
  };

  // ------ Instagram Posts CRUD ------
  const handleInstagramSubmit = async (e, editingInstagramPost = null) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingInstagramPost);
      const url = isEdit
        ? `/api/admin/instagram-posts/${editingInstagramPost.id}`
        : '/api/admin/instagram-posts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instagramForm)
      });

      if (res.ok) {
        if (setShowInstagramModal) setShowInstagramModal(false);
        if (setEditingInstagramPost) setEditingInstagramPost(null);
        setInstagramForm({
          title: '',
          image_url: '',
          post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en',
          sort_order: 1,
          is_active: 1
        });
        const fresh = await sf('/api/admin/instagram-posts');
        if (fresh && Array.isArray(fresh) && setInstagramPosts) setInstagramPosts(fresh);
        if (showToast) showToast('success', isEdit ? 'Post Updated' : 'Post Published', `Instagram post "${instagramForm.title}" saved live!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Failed to Save', errData.error || 'Server error occurred.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error', err.message);
    }
  };

  const handleDeleteInstagramPost = async (id, title) => {
    askConfirmation({
      title: 'Delete Instagram Post?',
      message: `Are you sure you want to remove "${title || 'Post #' + id}" from your storefront Instagram gallery?`,
      confirmText: 'Delete Post',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/instagram-posts/${id}`, { method: 'DELETE' });
          if (res.ok) {
            if (setInstagramPosts) setInstagramPosts(prev => prev.filter(p => p.id !== id));
            if (showToast) showToast('info', 'Post Deleted', 'Instagram post removed.');
          } else {
            const data = await res.json().catch(() => ({}));
            if (showToast) showToast('error', 'Delete Failed', data.error || 'Could not delete post.');
          }
        } catch (err) {
          if (showToast) showToast('error', 'Delete Error', err.message);
        }
      }
    });
  };

  const handleToggleInstagramActive = async (post) => {
    const updatedStatus = Number(post.is_active) === 1 ? 0 : 1;
    try {
      const res = await adminFetch(`/api/admin/instagram-posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          image_url: post.image_url,
          post_url: post.post_url,
          sort_order: post.sort_order,
          is_active: updatedStatus
        })
      });
      if (res.ok) {
        if (setInstagramPosts) setInstagramPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_active: updatedStatus } : p));
        if (showToast) showToast('success', updatedStatus ? 'Post Active' : 'Post Hidden', `"${post.title || 'Instagram Post'}" is now ${updatedStatus ? 'visible' : 'hidden'}.`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Status Update Failed', err.message);
    }
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
        if (flts && Array.isArray(flts) && typeof setFilterGroups === 'function') setFilterGroups(flts);
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
        if (flts && Array.isArray(flts) && typeof setFilterGroups === 'function') setFilterGroups(flts);
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
        if (flts && Array.isArray(flts) && typeof setFilterGroups === 'function') setFilterGroups(flts);
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
        if (flts && Array.isArray(flts) && typeof setFilterGroups === 'function') setFilterGroups(flts);
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
    blogForm, setBlogForm,
    instagramForm, setInstagramForm,
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
    handleBlogSubmit,
    handleDeleteBlog,
    handleToggleBlogPublish,
    handleToggleBlogFeatured,
    handleInstagramSubmit,
    handleDeleteInstagramPost,
    handleToggleInstagramActive,
    handleAddFilterGroup,
    handleDeleteFilterGroup,
    handleAddFilterOption,
    handleDeleteFilterOption
  };
}
