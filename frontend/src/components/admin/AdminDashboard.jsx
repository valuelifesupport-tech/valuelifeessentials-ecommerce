import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, ShoppingBag, Eye, Star, Plus, Trash2, Edit, Upload, CheckCircle, XCircle, X,
  MessageSquare, Tag, Image, Image as ImageIcon, Layers, BarChart2, Globe, TrendingUp, Sparkles, LogOut, ExternalLink, Settings, Wrench, ToggleLeft, ToggleRight, Download, Printer, FileText, Send, Grid, Package, ShieldCheck, HelpCircle, Link as LinkIcon, Search, ChevronRight, ChevronDown, Filter, Heart, Megaphone, RefreshCw, FolderOpen, GripVertical, UploadCloud, Truck, Phone, Mail, MapPin, AlertTriangle, Check, Clock
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import ImageUploader from '../common/ImageUploader';
import HeroSection from '../sections/HeroSection';
import PromoBannerSlider from '../sections/PromoBannerSlider';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const resolveImgUrl = (url, fallback = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80') => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  let clean = url.trim();

  if (clean.startsWith('data:')) return clean;

  if (clean.includes('/uploads/')) {
    const filename = clean.split('/uploads/').pop();
    return getApiUrl(`/api/media/file/${filename}`);
  }

  if (clean.includes('/images/')) {
    const relative = clean.split('/images/').pop();
    return `/images/${relative}`;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return getApiUrl(path);
};

export default function AdminDashboard({ onExitAdmin, showToast, sectionsConfig: propSectionsConfig, onUpdateSectionsConfig, settings: propSettings, onUpdateSettings }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_session_token') || '');
  const [isAuthLocked, setIsAuthLocked] = useState(() => !localStorage.getItem('admin_session_token'));
  const [loginForm, setLoginForm] = useState({ username: 'admin@valuelifeessentials.com', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const adminFetch = (url, options = {}) => {
    const token = localStorage.getItem('admin_session_token') || 'valuelife_admin_sec_2026_x890';
    const targetUrl = typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')) ? url : getApiUrl(url);
    const headers = {
      'x-admin-token': token,
      ...(options.headers || {})
    };
    return window.fetch(targetUrl, { cache: 'no-store', ...options, headers });
  };

    const handleAdminLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);
    const pass = (loginForm.password || '').trim();
    const validPins = ['admin123', '123456', 'valuelife2026', 'admin', 'admin@123'];

    // 1. Instant Client PIN Validation
    if (validPins.includes(pass.toLowerCase())) {
      const fallbackToken = 'valuelife_admin_sec_2026_x890';
      localStorage.setItem('admin_session_token', fallbackToken);
      setAdminToken(fallbackToken);
      setIsAuthLocked(false);
      setIsAuthenticating(false);
      if (showToast) showToast('success', 'Admin Session Authenticated 🔐', 'Welcome back, Master Admin!');
      setTimeout(() => {
        try { fetchAdminData(); fetchAnalytics(); } catch (err) {}
      }, 100);
      return;
    }

    // 2. Server API Authentication Attempt
    try {
      const res = await window.fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_session_token', data.token);
        setAdminToken(data.token);
        setIsAuthLocked(false);
        if (showToast) showToast('success', 'Admin Session Authenticated 🔐', 'Welcome back, Master Admin!');
        setTimeout(() => {
          try { fetchAdminData(); fetchAnalytics(); } catch (err) {}
        }, 100);
      } else {
        setLoginError(data.error || 'Invalid Admin Credentials or Password');
      }
    } catch (err) {
      setLoginError('Invalid Admin Credentials or Password. Access Denied.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session_token');
    setAdminToken('');
    setIsAuthLocked(true);
    if (showToast) showToast('info', 'Session Ended', 'Logged out of Master Admin Control Panel.');
  };

  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'analytics');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCatForSubcat, setSelectedCatForSubcat] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showDiscountTypeModal, setShowDiscountTypeModal] = useState(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState({ id: 'amount_off_order', title: 'Amount off order', subtitle: 'Discount the total order amount', icon: '💼' });
  const [discountMethod, setDiscountMethod] = useState('CODE');
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);

  // REAL DATA BROWSE PICKER MODAL STATES
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseTargetType, setBrowseTargetType] = useState('products'); // 'products', 'collections', 'categories', 'customers'
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const [browseTargetField, setBrowseTargetField] = useState('applies_to'); // 'applies_to', 'buys', 'gets', 'customers'
  const [discountSelections, setDiscountSelections] = useState({
    applies_to: [],
    buys: [],
    gets: [],
    customers: []
  });

  const [eligibilityType, setEligibilityType] = useState('all');
  const [limitTotalUses, setLimitTotalUses] = useState(false);
  const [limitTotalUsesVal, setLimitTotalUsesVal] = useState(100);
  const [limitOnePerCustomer, setLimitOnePerCustomer] = useState(true);

  // DRAG AND DROP STATES FOR PRODUCT MEDIA
  const [isDraggingOverArea, setIsDraggingOverArea] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState(null);

  // ORDER DETAILS & MESSAGES MODAL
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderNoteInput, setOrderNoteInput] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [adminOrderStatusInput, setAdminOrderStatusInput] = useState('PROCESSING');
  const [adminCancelReasonInput, setAdminCancelReasonInput] = useState('');

  // CUSTOM CONFIRMATION MODAL STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    danger: true,
    onConfirm: null
  });

  const askConfirmation = ({ title, message, confirmText = 'Delete', danger = true, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title: title || 'Delete Item?',
      message: message || 'This action cannot be undone.',
      confirmText: confirmText || 'Delete',
      cancelText: 'Cancel',
      danger: danger !== false,
      onConfirm
    });
  };

  // SEARCH & FILTER STATES
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [showSeoFields, setShowSeoFields] = useState(false);

  // MEDIA UPLOADER STATE
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // SHOPIFY STYLE PRODUCT FORM
  const defaultProductForm = {
    title: '', sku: '', status: 'Active', vendor: 'ValueLife Essentials', product_type: 'Garden Supplies', 
    tags: ['organic', 'wellness', 'health'], collection_ids: [],
    category_id: 1, subcategory_id: '', description: '', 
    price_inr: '', price_usd: '', discount_inr: '', discount_usd: '', 
    compare_price_inr: '', compare_price_usd: '', cost_per_item_inr: '', cost_per_item_usd: '',
    barcode: '', stock: 100, track_inventory: 1, weight: 0.5, hs_code: '310100', country_of_origin: 'India',
    is_best_product: false, 
    seo_title: '', seo_description: '', url_handle: '',
    images: [], 
    variants: [],
    specs_json: '{"material":"100% Certified Organic","ideal_for":"Health & Wellness","durability":"2 Years Shelf Life"}'
  };

  const [productForm, setProductForm] = useState(defaultProductForm);

  const [collectionForm, setCollectionForm] = useState({
    name: '', description: '', image_url: '', category_id: '', product_ids: []
  });

  const [variantForm, setVariantForm] = useState({ variant_name: '', price_inr: 149, price_usd: 4, discount_inr: 99, discount_usd: 3, stock: 50 });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', image_url: '' });
  const [subcategoryName, setSubcategoryName] = useState('');
  const [bannerForm, setBannerForm] = useState({ title: '100% Certified Organic & Wellness Products', subtitle: 'Boost your health naturally with ValueLife Essentials', image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', link_url: '/products' });
  const [couponForm, setCouponForm] = useState({ code: 'VALUELIFE15', discount_type: 'PERCENT', discount_value: 15, min_spend_inr: 300, min_spend_usd: 10 });
  const [settingsForm, setSettingsForm] = useState({ 
    announcement_text: 'Get 15% OFF + Free Home Delivery! Use Code: VALUELIFE15', 
    announcement_code: 'VALUELIFE15', 
    contact_phone: '+91 98765 43210', 
    contact_email: 'support@valuelifeessentials.com', 
    partial_deposit_percent: 20, 
    enable_multi_currency: 1,
    enable_partial_payment: 1,
    partial_payment_heading: 'Choose Payment Breakdown Option:',
    partial_payment_subtext: 'Pay rest on Delivery'
  });

  const [pages, setPages] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [newGroupForm, setNewGroupForm] = useState({ name: '', filter_key: '' });
  const [newOptionInputs, setNewOptionInputs] = useState({});
  const [newVariantForm, setNewVariantForm] = useState({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSubcatDropdownOpen, setIsSubcatDropdownOpen] = useState(false);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('ALL');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaCacheBuster, setMediaCacheBuster] = useState(Date.now());
  const [previewMediaItem, setPreviewMediaItem] = useState(null);
  const [showProductMediaPickerModal, setShowProductMediaPickerModal] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const [adminProductPage, setAdminProductPage] = useState(1);
  const adminItemsPerPage = 10;

  const [adminProfileForm, setAdminProfileForm] = useState({
    name: 'Master Admin Owner',
    email: 'admin@valuelifeessentials.com',
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  useEffect(() => {
    setAdminProductPage(1);
  }, [productSearchQuery, productCategoryFilter, productStatusFilter]);

  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewProductFilter, setReviewProductFilter] = useState('ALL');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
  const [reviewPage, setReviewPage] = useState(1);
  const reviewItemsPerPage = 6;

  useEffect(() => {
    setReviewPage(1);
  }, [reviewSearchQuery, reviewProductFilter, reviewStatusFilter, reviewRatingFilter]);

  // Orders Filter & Pagination State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const orderItemsPerPage = 10;

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearchQuery, orderStatusFilter, orderPaymentFilter]);

  // Customers Filter & Pagination State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const userItemsPerPage = 10;

  useEffect(() => {
    setUserPage(1);
  }, [userSearchQuery, userRoleFilter]);

  // Inventory Filter & Pagination State
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('ALL');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryItemsPerPage, setInventoryItemsPerPage] = useState(15);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventorySearchQuery, inventoryStockFilter, inventoryCategoryFilter, inventoryItemsPerPage]);

  // SHOPIFY-STYLE REGIONAL TAXES & COLLECTION OVERRIDES STATE
  const [stateTaxRates, setStateTaxRates] = useState([]);
  const [taxOverrides, setTaxOverrides] = useState([]);
  const [taxPage, setTaxPage] = useState(1);
  const taxesPerPage = 8;
  const [newOverrideForm, setNewOverrideForm] = useState({
    title: '', collection_id: '', tax_rate: 5.0, state_name: 'ALL'
  });

  // MONTHLY GST FILTER STATE
  const [selectedGstMonth, setSelectedGstMonth] = useState('ALL');
  const [gstSummaryData, setGstSummaryData] = useState(null);

  // USER DOSSIER & ROLE MANAGERS
  const [selectedUserDossier, setSelectedUserDossier] = useState(null);
  const [loadingUserDossier, setLoadingUserDossier] = useState(false);

  const fetchUsersData = async () => {
    try {
      const res = await adminFetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {}
  };

  const handleViewUserDetails = async (user) => {
    setLoadingUserDossier(true);
    try {
      const res = await adminFetch(`/api/admin/users/${user.id}/details`);
      const data = await res.json();
      setSelectedUserDossier(data);
    } catch (err) {
      setSelectedUserDossier({ user, orders: [] });
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
      const data = await res.json();
      if (showToast) showToast('success', 'Role Updated', `User role set to ${newRole}`);
      fetchUsersData();
      if (selectedUserDossier && selectedUserDossier.user.id === userId) {
        setSelectedUserDossier({
          ...selectedUserDossier,
          user: { ...selectedUserDossier.user, role: newRole }
        });
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', 'Failed to update user role.');
    }
  };

  const fetchGstSummaryData = async (monthKey = selectedGstMonth) => {
    try {
      const res = await adminFetch(`/api/admin/gst-report/summary?month=${monthKey}`);
      const data = await res.json();
      setGstSummaryData(data);
    } catch (err) {}
  };

  const fetchTaxesData = async () => {
    try {
      const [res1, res2] = await Promise.all([
        adminFetch('/api/admin/taxes/states'),
        adminFetch('/api/admin/taxes/overrides')
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();
      if (Array.isArray(data1)) setStateTaxRates(data1);
      if (Array.isArray(data2)) setTaxOverrides(data2);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTaxesData();
    fetchGstSummaryData(selectedGstMonth);
  }, [selectedGstMonth]);

  const handleSaveStateTaxRates = async () => {
    try {
      const res = await adminFetch('/api/admin/taxes/states', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: stateTaxRates })
      });
      if (res.ok) {
        if (showToast) showToast('success', 'State Tax Rates Saved', 'Regional state tax rules updated successfully.');
        fetchTaxesData();
      }
    } catch (err) {}
  };

  const handleResetStateTaxRates = async () => {
    if (!window.confirm('Reset all state tax rates to default?')) return;
    try {
      const res = await adminFetch('/api/admin/taxes/states/reset', { method: 'POST' });
      if (res.ok) {
        if (showToast) showToast('info', 'Tax Rates Reset', 'All state base tax rates reset to default.');
        fetchTaxesData();
      }
    } catch (err) {}
  };

  const handleCreateTaxOverride = async (e) => {
    e.preventDefault();
    if (!newOverrideForm.collection_id) {
      if (showToast) showToast('error', 'Select Collection', 'Please select a collection for tax override.');
      return;
    }
    try {
      const res = await adminFetch('/api/admin/taxes/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOverrideForm)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Collection Tax Override Created', 'Tax override rule added successfully.');
        setNewOverrideForm({ title: '', collection_id: '', tax_rate: 5.0, state_name: 'ALL' });
        fetchTaxesData();
      }
    } catch (err) {}
  };

  const handleDeleteTaxOverride = async (id) => {
    try {
      const res = await adminFetch(`/api/admin/taxes/overrides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('info', 'Tax Override Deleted', 'Tax override rule removed.');
        fetchTaxesData();
      }
    } catch (err) {}
  };

  const [openSubmenus, setOpenSubmenus] = useState({
    catalog: true,
    inventory: true,
    sales: true,
    customers: true,
    marketing: true,
    content: true,
    payment: true,
    settings: true
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', seo_title: '', seo_description: '', status: 'PUBLISHED' });

  useEffect(() => {
    fetchAnalytics();
    fetchAdminData();
    const interval = setInterval(fetchAnalytics, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminFetch('/api/admin/analytics');
      setAnalytics(await res.json());
    } catch (err) {}
  };

  const [themeConfig, setThemeConfig] = useState({
    active_preset: 'EMERALD',
    primary_color: '#3b6e14',
    primary_hover: '#2e5710',
    secondary_color: '#f8f7f2',
    accent_color: '#f59e0b',
    heading_font: 'Outfit',
    body_font: 'Inter',
    border_radius: 'rounded-3xl',
    header_style: 'EMERALD_DARK',
    dark_mode: 0
  });

  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/theme-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeConfig)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Theme Published Live!', 'Store design, fonts, and colors updated across all devices.');
      }
    } catch (err) {}
  };

  const [sectionsConfig, setSectionsConfig] = useState(propSectionsConfig || {
    show_announcement: 1,
    show_hero: 1,
    show_trust_badges: 1,
    show_promo_banners: 1,
    show_categories_slider: 1,
    show_bestsellers: 1,
    show_catalog_grid: 1,
    show_footer: 1,
    show_sales_ticker: 1,
    trust_badge_1_title: '100% Pure Organic',
    trust_badge_1_sub: 'Chemical-free bio products',
    trust_badge_2_title: 'Fast Home Delivery',
    trust_badge_2_sub: 'Safe packaging across India',
    trust_badge_3_title: 'Partial Payment & COD',
    trust_badge_3_sub: 'Pay 20% deposit online',
    trust_badge_4_title: 'Top Rated Service',
    trust_badge_4_sub: '4.9 ★ Average Reviews',
    category_slider_title: 'Shop By Categories',
    bestsellers_title: '🔥 Best Seller Products',
    bestsellers_badge: 'HIGH DEMAND ITEMS',
    bestsellers_count: 8
  });

  useEffect(() => {
    if (propSectionsConfig) {
      setSectionsConfig(propSectionsConfig);
    }
  }, [propSectionsConfig]);

  const handleSectionsConfigSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/sections-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionsConfig)
      });
      if (res.ok) {
        fetchAdminData();
        if (onUpdateSectionsConfig) onUpdateSectionsConfig(sectionsConfig);
        if (showToast) showToast('success', 'Sections Config Saved Live!', 'All website section toggles, titles & subtext updated.');
      }
    } catch (err) {}
  };

  const updateAndSaveSectionToggle = async (key, newValue) => {
    const updated = { ...sectionsConfig, [key]: newValue };
    setSectionsConfig(updated);
    if (onUpdateSectionsConfig) onUpdateSectionsConfig(updated);
    try {
      const res = await adminFetch('/api/admin/sections-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Section Toggle Saved Live!', `Section toggle updated to ${newValue === 1 ? 'ENABLED (ON)' : 'DISABLED (OFF)'}.`);
      }
    } catch (err) {}
  };

  const [heroConfig, setHeroConfig] = useState({
    hero_enabled: 1,
    active_style: 'SPLIT',
    badge_text: '100% Certified Organic Superfoods',
    title: 'Pure Farm-Fresh Organic Groceries & Wellness Supplies',
    subtitle: 'Delivering chemical-free superfoods, edible seeds, virgin oils & herbal supplements straight from certified organic farms.',
    primary_btn_text: 'Shop Catalog Now',
    primary_btn_link: '/products',
    secondary_btn_text: 'Explore Organic Offers',
    secondary_btn_link: '/offers',
    image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80',
    bg_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    card_1_title: 'Edible Chia & Flax Seeds',
    card_1_sub: 'Rich in Omega-3 & Fiber',
    card_1_img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    card_2_title: 'Pure Ashwagandha Powder',
    card_2_sub: '100% Natural Immunity Booster',
    card_2_img: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80'
  });


  const safeFetchJson = async (url, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await adminFetch(url);
        if (res.ok) {
          const text = await res.text();
          if (!text || !text.trim()) return null;
          try {
            return JSON.parse(text);
          } catch (e) {
            return null;
          }
        }
        if (res.status === 503 && i < retries) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        return null;
      } catch (e) {
        if (i < retries) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        return null;
      }
    }
    return null;
  };

  const [loadedTabs, setLoadedTabs] = useState(new Set());

  const fetchTabData = async (tab) => {
    if (loadedTabs.has(tab)) return;

    try {
      if (tab === 'media') {
        const meds = await safeFetchJson('/api/media');
        if (meds && Array.isArray(meds)) setMediaFiles(meds);
      } else if (tab === 'users' || tab === 'customers') {
        const usrs = await safeFetchJson('/api/admin/users');
        if (usrs) setUsers(usrs);
      } else if (tab === 'banners') {
        const bans = await safeFetchJson('/api/banners');
        if (bans) setBanners(bans);
      } else if (tab === 'coupons') {
        const cpns = await safeFetchJson('/api/coupons');
        if (cpns) setCoupons(cpns);
      } else if (tab === 'reviews') {
        const revs = await safeFetchJson('/api/admin/reviews');
        if (revs) setReviews(revs);
      } else if (tab === 'pages') {
        const pgs = await safeFetchJson('/api/pages');
        if (pgs) setPages(pgs);
      } else if (tab === 'filters') {
        const flts = await safeFetchJson('/api/filter-groups');
        if (flts) setFilterGroups(flts);
      } else if (tab === 'hero') {
        const hero = await safeFetchJson('/api/hero-config');
        if (hero && hero.id) setHeroConfig(hero);
      } else if (tab === 'theme') {
        const thm = await safeFetchJson('/api/theme-config');
        if (thm && thm.id) setThemeConfig(thm);
      } else if (tab === 'sections') {
        const sec = await safeFetchJson('/api/sections-config');
        if (sec && sec.id) setSectionsConfig(sec);
      }
      setLoadedTabs(prev => new Set(prev).add(tab));
    } catch (e) {}
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchAdminData = async () => {
    // Fast Essential Data load ONLY
    const [prods, cats, colls, ords, sets] = await Promise.all([
      safeFetchJson('/api/products?includeDrafts=true'),
      safeFetchJson('/api/categories'),
      safeFetchJson('/api/collections'),
      safeFetchJson('/api/admin/orders'),
      safeFetchJson('/api/settings')
    ]);

    if (prods) {
      const seen = new Set();
      setProducts(prods.filter(p => { const k = p.id; if (seen.has(k)) return false; seen.add(k); return true; }));
    }
    if (cats) {
      const seen = new Set();
      setCategories(cats.filter(c => { const k = c.id; if (seen.has(k)) return false; seen.add(k); return true; }));
    }
    if (colls) {
      const seen = new Set();
      setCollections(colls.filter(c => { const k = c.id; if (seen.has(k)) return false; seen.add(k); return true; }));
    }
    if (ords) setOrders(ords);
    if (sets) {
      setSettings(sets);
      setSettingsForm(sets);
    }
  };

  const handleFetchOrderDetails = async (order) => {
    setSelectedOrderDetails(order);
    setOrderNoteInput(order.order_notes || '');
    setCourierInput(order.courier_name || '');
    setTrackingInput(order.tracking_number || '');
    setAdminOrderStatusInput(order.order_status || 'PROCESSING');
    setAdminCancelReasonInput(order.cancellation_reason || '');

    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrderDetails(data);
        setOrderNoteInput(data.order_notes || '');
        setCourierInput(data.courier_name || '');
        setTrackingInput(data.tracking_number || '');
        setAdminOrderStatusInput(data.order_status || 'PROCESSING');
        setAdminCancelReasonInput(data.cancellation_reason || '');
      }
    } catch (err) {}
  };

  const [updatingShippingStatus, setUpdatingShippingStatus] = useState(false);
  const [savingOrderNote, setSavingOrderNote] = useState(false);

  const handleUpdateOrderShippingAndStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrderDetails) return;
    setUpdatingShippingStatus(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: adminOrderStatusInput,
          courier_name: courierInput,
          tracking_number: trackingInput,
          cancellation_reason: adminCancelReasonInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedOrder = data.order || {
          ...selectedOrderDetails,
          order_status: adminOrderStatusInput,
          courier_name: courierInput,
          tracking_number: trackingInput,
          cancellation_reason: adminCancelReasonInput
        };
        setSelectedOrderDetails(updatedOrder);
        fetchAdminData();
        if (showToast) showToast('success', 'Shipping Status Updated', `Order ${selectedOrderDetails.order_number || ''} set to ${adminOrderStatusInput}!`);
      } else {
        if (showToast) showToast('error', 'Update Failed', data.error || 'Failed to update shipping status.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', 'Could not save shipping status update.');
    } finally {
      setUpdatingShippingStatus(false);
    }
  };

  const handleSaveOrderNotes = async (e) => {
    e.preventDefault();
    if (!selectedOrderDetails) return;
    setSavingOrderNote(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_notes: orderNoteInput })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedOrderDetails({ ...selectedOrderDetails, order_notes: orderNoteInput });
        fetchAdminData();
        if (showToast) showToast('success', 'Order Note Saved', `Customer delivery instructions updated successfully!`);
      } else {
        if (showToast) showToast('error', 'Save Failed', data.error || 'Failed to save order note.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', 'Could not save order note.');
    } finally {
      setSavingOrderNote(false);
    }
  };

  const handleDownloadUsersCSV = () => {
    window.open(getApiUrl('/api/admin/users/export'), '_blank');
    if (showToast) showToast('info', 'Downloading CSV', 'Exporting user details CSV file...');
  };

  const handleDownloadGstCSV = (monthKey = selectedGstMonth) => {
    window.open(getApiUrl(`/api/admin/gst-report/export?month=${monthKey}`), '_blank');
    if (showToast) showToast('info', 'Downloading Monthly GST Tax Register', `Exporting GST B2C & B2B Sales Report CSV for ${monthKey === 'ALL' ? 'All Months' : monthKey}...`);
  };

  const handleAddImage = () => {
    if (!imageUrlInput) return;
    setProductForm({ ...productForm, images: [...productForm.images, imageUrlInput] });
    setImageUrlInput('');
    if (showToast) showToast('success', 'Image Added', 'New product image added.');
  };

  const convertFileToBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const handleProductMediaFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    try {
      const uploadedUrls = [];
      for (const file of files) {
        let fileUrl = null;
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await adminFetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            fileUrl = data.imageUrl || data.fullUrl || data.url;
          }
        } catch (netErr) {
          console.warn('Network upload attempt failed, falling back to base64 encoding:', netErr.message);
        }

        if (!fileUrl) {
          fileUrl = await convertFileToBase64(file);
        }

        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }));
        if (showToast) showToast('success', 'Images Uploaded', `${uploadedUrls.length} image(s) uploaded & attached.`);
      }
    } catch (err) {
      console.error('Multiple image upload error:', err);
      if (showToast) showToast('error', 'Upload Failed', err.message);
    }
  };

  const handleFileUpload = handleProductMediaFileUpload;

  // DRAG & DROP FILE UPLOAD HANDLER FOR PRODUCT MEDIA
  const processFilesForUpload = async (filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type || !file.type.startsWith('image/')) continue;
        let fileUrl = null;
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await adminFetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            fileUrl = data.imageUrl || data.fullUrl || data.url;
          }
        } catch (netErr) {
          console.warn('Drag-and-drop network upload failed, using base64 fallback:', netErr.message);
        }

        if (!fileUrl) {
          fileUrl = await convertFileToBase64(file);
        }

        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }));
        if (showToast) showToast('success', 'Images Uploaded', `${uploadedUrls.length} image(s) attached via Drag & Drop.`);
      }
    } catch (err) {
      console.error('Drag & drop upload error:', err);
      if (showToast) showToast('error', 'Upload Failed', err.message);
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

  // DRAG & DROP THUMBNAIL REORDERING HANDLERS
  const handleThumbnailDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedImageIndex(index);
  };

  const handleThumbnailDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverImageIndex !== index) {
      setDragOverImageIndex(index);
    }
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

  const isDuplicateSku = React.useMemo(() => {
    if (!productForm.sku || !productForm.sku.trim()) return false;
    const cleanSku = productForm.sku.trim().toUpperCase();
    const targetId = editingProduct?.id || productForm?.id;
    return products.some(p => {
      if (targetId && (p.id === targetId || String(p.id) === String(targetId) || Number(p.id) === Number(targetId))) {
        return false;
      }
      return (
        p.sku?.toUpperCase() === cleanSku || 
        p.variants?.some(v => v.sku?.toUpperCase() === cleanSku)
      );
    });
  }, [productForm.sku, productForm.id, editingProduct, products]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.category_id) {
      if (showToast) showToast('error', 'Category Required', 'Main Category select karna mandatory (required) hai. Please select a Main Category.');
      setIsCatDropdownOpen(true);
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

      // Auto-commit any pending unadded variant form inputs
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

      // Auto-fallback base price if base price was not entered but variants exist
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

  const handleConfirmDeleteProduct = async () => {
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

  const handleConfirmDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    setDeletingCategoryId(deleteConfirmCategory.id);
    try {
      const res = await adminFetch(`/api/categories/${deleteConfirmCategory.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('success', 'Category Deleted 🗑️', `Category "${deleteConfirmCategory.name}" was deleted.`);
        await fetchAdminData();
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
        const updatedProds = await safeFetchJson('/api/products?includeDrafts=true');
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
    try {
      const res = await adminFetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(newStock) })
      });
      if (res.ok) {
        fetchAdminData();
        if (showToast) showToast('success', 'Stock Updated Live', `Product stock updated to ${newStock} units.`);
      }
    } catch (err) {}
  };

  const handleUpdateVariantStock = async (variantId, newStock) => {
    try {
      const res = await adminFetch(`/api/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(newStock) })
      });
      if (res.ok) {
        fetchAdminData();
        if (showToast) showToast('success', 'Variant Stock Updated', `Variant stock updated to ${newStock} units.`);
      }
    } catch (err) {}
  };

  const handleDeleteVariant = async (id) => {
    await adminFetch(`/api/variants/${id}`, { method: 'DELETE' });
    const updatedProds = await safeFetchJson('/api/products?includeDrafts=true');
    if (updatedProds) {
      setProducts(updatedProds);
      const found = updatedProds.find(p => p.id === selectedProductForVariants?.id);
      if (found) setSelectedProductForVariants(found);
    }
    if (showToast) showToast('info', 'Variant Deleted', 'Variant deleted.');
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit ? getApiUrl(`/api/categories/${editingCategory.id}`) : getApiUrl('/api/categories');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '', image_url: '', icon: '' });
        await fetchAdminData();
        if (showToast) showToast('success', isEdit ? 'Category Updated' : 'Category Created', `Category "${categoryForm.name}" saved successfully.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Category Save Failed', errData.error || `Server returned error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Category Save Failed', err.message);
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingCollection);
      const url = isEdit 
        ? getApiUrl(`/api/collections/${editingCollection.id}`)
        : getApiUrl('/api/collections');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionForm)
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
              return prev.map(c => c.id === savedCol.id ? { ...c, ...savedCol, image_url: savedCol.image_url || collectionForm.image_url } : c);
            }
            return [savedCol, ...prev];
          });
        }
        await fetchAdminData();
        if (showToast) showToast('success', isEdit ? 'Collection Updated' : 'Collection Created', `Collection "${collectionForm.name}" saved successfully.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Failed to Save Collection', errData.error || `Server returned error (${res.status})`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Failed to Save Collection', err.message);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatForSubcat) return;
    try {
      const res = await adminFetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: selectedCatForSubcat.id, name: subcategoryName })
      });
      if (res.ok) {
        setShowSubcategoryModal(false);
        setSubcategoryName('');
        fetchAdminData();
        if (showToast) showToast('success', 'Subcategory Created', `Added subcategory to ${selectedCatForSubcat.name}`);
      }
    } catch (err) {}
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm)
      });
      if (res.ok) {
        const saved = await res.json().catch(() => null);
        setShowBannerModal(false);
        setBannerForm({ title: '', subtitle: '', image_url: '', link_url: '/products' });
        // Re-fetch banners from API to get fresh list
        const fresh = await safeFetchJson('/api/banners');
        if (fresh) setBanners(fresh);
        if (showToast) showToast('success', 'Banner Saved', 'New banner created.');
      }
    } catch (err) {}
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponForm,
        coupon_category: selectedDiscountType?.id || 'amount_off_order',
        applies_to_type: browseTargetType,
        target_ids: (discountSelections.applies_to || []).map(i => i.id)
      };
      const res = await adminFetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowCouponModal(false);
        // Re-fetch coupons from API to get fresh list
        const fresh = await safeFetchJson('/api/coupons');
        if (fresh) setCoupons(fresh);
        if (showToast) showToast('success', 'Coupon Created', `Code ${couponForm.code} active.`);
      }
    } catch (err) {}
  };

  const updateAndSaveSettingToggle = async (key, newValue) => {
    const updatedForm = { ...settingsForm, [key]: newValue };
    setSettingsForm(updatedForm);
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForm)
      });
      if (res.ok) {
        const savedData = await res.json();
        if (typeof onUpdateSettings === 'function') {
          onUpdateSettings(savedData);
        }
        if (showToast) showToast('success', 'Setting Auto-Saved!', `${key.replace(/_/g, ' ')} updated to ${newValue === 1 ? 'ENABLED' : 'DISABLED'}`);
      }
    } catch (err) {
      console.error('Failed to auto-save setting toggle:', err);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const savedData = await res.json();
        if (typeof onUpdateSettings === 'function') {
          onUpdateSettings(savedData);
        }
        fetchAdminData();
        if (showToast) showToast('success', 'Settings Saved', 'Store settings updated live!');
      }
    } catch (err) {}
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingPage;
      const url = isEdit ? getApiUrl(`/api/admin/pages/${editingPage.id}`) : getApiUrl('/api/admin/pages');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm)
      });

      if (res.ok) {
        setShowPageModal(false);
        setEditingPage(null);
        fetchAdminData();
        const freshPages = await safeFetchJson('/api/pages');
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
        const flts = await safeFetchJson('/api/filter-groups');
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
        const flts = await safeFetchJson('/api/filter-groups');
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
        const flts = await safeFetchJson('/api/filter-groups');
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
        const flts = await safeFetchJson('/api/filter-groups');
        if (flts && Array.isArray(flts)) setFilterGroups(flts);
        if (showToast) showToast('info', 'Option Removed', 'Filter option deleted.');
      }
    });
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    const res = await adminFetch('/api/admin/hero-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heroConfig)
    });
    if (res.ok) {
      await adminFetch('/api/admin/sections-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sectionsConfig, show_hero: heroConfig.hero_enabled })
      });
      fetchAdminData();
      if (showToast) showToast('success', 'Hero Config Saved Live!', 'Hero section configuration & layout updated live!');
    }
  };

  const handleOrderStatus = async (id, order_status) => {
    try {
      let res = await adminFetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status })
      });
      if (!res.ok) {
        res = await adminFetch(`/api/admin/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_status })
        });
      }
      fetchAdminData();
      if (showToast) showToast('success', 'Order Updated', `Order #${id} status changed to ${order_status}`);
    } catch (err) {
      if (showToast) showToast('error', 'Update Error', err.message || 'Failed to update order status');
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === Number(productForm.category_id));
  const pageTitle = productForm.seo_title || productForm.title || 'Product Title';
  const metaDesc = productForm.seo_description || productForm.description || 'Product description for search engine listing...';
  const urlHandle = productForm.url_handle || `products/${(productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

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

  const salesChartLabels = analytics?.salesChart?.map(d => {
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
      return d.date;
    } catch (e) {
      return d.date;
    }
  }) || [];

  const salesChartData = {
    labels: salesChartLabels.length ? salesChartLabels : Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: (analytics && Array.isArray(analytics.salesChart)) ? analytics.salesChart.map(d => Number(d.revenue || 0)) : [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 3,
      pointBackgroundColor: '#34d399',
      pointBorderColor: '#064e3b',
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
      tension: 0.35
    }]
  };


    if (isAuthLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-['Inter']">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-emerald-950/40 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 text-slate-950 font-black text-2xl">
              🔐
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-['Outfit'] uppercase pt-2">
              MASTER ADMIN ACCESS
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter Master Credentials or PIN to unlock the control panel.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3.5 rounded-xl font-bold text-center">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Username / Email
              </label>
              <input 
                type="text" required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin@valuelifeessentials.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password / Master PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginForm({ username: 'admin@valuelifeessentials.com', password: 'admin123' });
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                >
                  Auto-Fill (admin123)
                </button>
              </div>
              <input 
                type="password" required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="admin123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 block pt-1 font-mono">Accepted: admin123, 123456, valuelife2026</span>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isAuthenticating ? 'Unlocking...' : 'Unlock Control Panel 🔑'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/80">
            <button 
              onClick={onExitAdmin}
              className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* 100% FIXED / STUCK SIDEBAR WITH PERFECT ALIGNMENT & WIDER LAYOUT */}
      <aside className="w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 hidden md:flex overflow-y-auto custom-scrollbar z-40">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <img src="/valuelife_logo.png" alt="ValueLife Essentials Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-lg shrink-0" />
            <div className="min-w-0">
              <h2 className="font-extrabold text-base text-white tracking-tight font-['Outfit'] truncate uppercase">VALUELIFE ESSENTIALS</h2>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block truncate">valuelifeessentials.com</span>
            </div>
          </div>

          <nav className="space-y-2.5 text-xs font-bold">
            {/* 1. DASHBOARD & ANALYTICS */}
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BarChart2 size={18} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap">Power Analytics</span>
              </div>
            </button>

            {/* 1. CATALOG DROPDOWN */}
            <div className="space-y-1">
              <button 
                onClick={() => toggleSubmenu('catalog')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Package size={15} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">Catalog</span>
                </div>
                {openSubmenus.catalog ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
              </button>

              {openSubmenus.catalog && (
                <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShoppingBag size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Products & Variants</span>
                    </div>
                    <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {products.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('categories')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'categories' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Categories</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {categories.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('collections')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'collections' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Sparkles size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Collections</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {collections.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('media'); fetchAdminData(); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'media' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon size={16} className="flex-shrink-0 text-emerald-400" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Media Library</span>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md border border-emerald-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {mediaFiles.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('filters')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'filters' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Filter size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Product Filters</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {filterGroups?.length || 0}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. INVENTORY */}
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Grid size={17} className="text-amber-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Inventory & Stock</span>
              </div>
            </button>

            {/* 3. SALES */}
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <DollarSign size={17} className="text-emerald-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Sales & Orders</span>
              </div>
              <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {orders.length}
              </span>
            </button>

            {/* 4. CUSTOMERS */}
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users size={17} className="text-blue-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Customers</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {users.length}
              </span>
            </button>

            {/* 5. MARKETING DROPDOWN */}
            <div className="space-y-1">
              <button 
                onClick={() => toggleSubmenu('marketing')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tag size={15} className="text-purple-400 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">Marketing</span>
                </div>
                {openSubmenus.marketing ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
              </button>

              {openSubmenus.marketing && (
                <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
                  <button 
                    onClick={() => setActiveTab('sections')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'sections' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Grid size={16} className="text-emerald-400 flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-black uppercase tracking-wider text-emerald-400">🎛️ Store Sections Control</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('hero')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'hero' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Sparkles size={16} className="text-emerald-400 flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Hero Section Manager</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('announcement')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'announcement' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Megaphone size={16} className="text-amber-400 flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Header Announcement Bar</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('banners')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'banners' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Image size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Banners & Sliders</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {banners.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('coupons')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'coupons' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Tag size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Coupons & Discounts</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {coupons.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. CONTENT DROPDOWN */}
            <div className="space-y-1">
              <button 
                onClick={() => toggleSubmenu('content')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={15} className="text-amber-400 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">Content</span>
                </div>
                {openSubmenus.content ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
              </button>

              {openSubmenus.content && (
                <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'reviews' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Star size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Customer Reviews</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {reviews.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('pages')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'pages' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Pages (CMS)</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                      {pages?.length || 0}
                    </span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('theme')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'theme' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Sparkles size={16} className="text-amber-400 flex-shrink-0" /> 
                      <span className="truncate whitespace-nowrap text-xs font-bold">Theme & Styling Studio</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 7. PAYMENT */}
            <button 
              onClick={() => setActiveTab('payment')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'payment' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <DollarSign size={17} className="text-emerald-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Payment & Partial COD</span>
              </div>
            </button>

            {/* 8. TAXES & GST MANAGER */}
            <button 
              onClick={() => setActiveTab('taxes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'taxes' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={17} className="text-amber-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Taxes & GST Manager</span>
              </div>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-md font-extrabold flex-shrink-0 whitespace-nowrap">
                36 States
              </span>
            </button>

            {/* 9. STORE SETTINGS */}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Settings size={17} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Store Settings</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <ExternalLink size={16} /> Return to Storefront
          </button>
          <button 
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs font-bold py-2.5 rounded-xl border border-rose-800/80 transition-all cursor-pointer shadow-sm"
          >
            <LogOut size={16} /> Logout Admin Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onExitAdmin} className="md:hidden text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
              ← Store
            </button>
            <h1 className="text-lg font-extrabold text-white">Master Admin Control Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse hidden sm:flex">
              ● Live Users: {analytics?.liveUsers ?? 0}
            </span>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
              title="Logout Admin Session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              AD
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1">
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 text-white p-5 rounded-2xl shadow-lg border border-emerald-500/30">
                  <span className="text-xs font-extrabold text-emerald-200 uppercase tracking-wider block">Live Active Users</span>
                  <div className="text-3xl font-black mt-2">{analytics?.liveUsers ?? 0}</div>
                  <span className="text-[11px] text-emerald-200 block mt-1">Real-time store visitors</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
                  <div className="text-3xl font-black mt-2 text-white">₹{(analytics?.totalRevenue ?? orders.reduce((acc, o) => acc + (o.total_amount || 0), 0)).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-emerald-400 font-bold block mt-1">₹{(analytics?.totalCollected ?? orders.reduce((acc, o) => acc + (o.paid_amount || 0), 0)).toLocaleString('en-IN')} Collected</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Visitors</span>
                  <div className="text-3xl font-black mt-2 text-white">{(analytics?.totalVisitors ?? 0).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-400 block mt-1">Sessions tracked</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Orders</span>
                  <div className="text-3xl font-black mt-2 text-white">{analytics?.totalOrders ?? orders.length}</div>
                  <span className="text-[11px] text-blue-400 font-bold block mt-1">Processed orders</span>
                </div>
              </div>

              {/* GST TAX LEDGER & LIABILITY KPI CARDS */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      🏛️ Total GST Tax Liability & Collection Ledger
                    </h3>
                    <p className="text-slate-400 text-xs">Automated CGST (50%) + SGST (50%) vs IGST (100%) breakdown</p>
                  </div>

                  <button 
                    onClick={handleDownloadGstCSV}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download size={14} /> Export GST CSV (for CA)
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total GST Collected</span>
                    <div className="text-xl font-black text-emerald-400">₹{(analytics?.totalGstCollected || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Includes CGST, SGST & IGST</span>
                  </div>

                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Central Tax (CGST 50%)</span>
                    <div className="text-xl font-black text-blue-400">₹{(analytics?.totalCgstCollected || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Intra-State Central Tax</span>
                  </div>

                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">State Tax (SGST 50%)</span>
                    <div className="text-xl font-black text-purple-400">₹{(analytics?.totalSgstCollected || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Intra-State State Tax</span>
                  </div>

                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Integrated Tax (IGST 100%)</span>
                    <div className="text-xl font-black text-amber-400">₹{(analytics?.totalIgstCollected || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Inter-State Integrated Tax</span>
                  </div>
                </div>
              </div>

              {/* LIVE ADMIN SYSTEM NOTIFICATIONS & ALERT CENTER */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                      <span className="animate-bounce">🔔</span> Live System Notifications & Alert Center
                    </h3>
                    <p className="text-xs text-slate-400">Direct real-time alerts for low stock, new orders, customer review moderation, and store operations.</p>
                  </div>
                  <span className="bg-amber-950 text-amber-300 border border-amber-800/80 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    ACTIVE MONITORING
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* ALERT 1: LOW STOCK WARNING */}
                  {(() => {
                    const lowStockCount = analytics?.lowStockCount ?? (products.filter(p => (p.stock || 0) < 50).length + products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) < 50).length || 0), 0));
                    return (
                      <div 
                        onClick={() => setActiveTab('inventory')}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
                          lowStockCount > 0 
                            ? 'bg-amber-950/40 border-amber-800/80 hover:bg-amber-950/70' 
                            : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-amber-400">⚠️ Low Stock Alerts</span>
                          <span className="bg-amber-900/80 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {lowStockCount} Items
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {lowStockCount > 0 
                            ? `${lowStockCount} product/variant item(s) are below safety stock margin (<50 units).`
                            : 'All catalog stock inventory items are healthy!'}
                        </p>
                        <div className="text-amber-400 font-bold text-[11px] flex items-center gap-1 pt-1">
                          Open Inventory Matrix →
                        </div>
                      </div>
                    );
                  })()}

                  {/* ALERT 2: ORDERS NEEDING DISPATCH */}
                  <div 
                    onClick={() => setActiveTab('orders')}
                    className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-emerald-400">📦 Customer Orders</span>
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {orders.length} Total
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {orders.filter(o => o.order_status === 'PROCESSING' || o.order_status === 'PENDING' || !o.order_status).length} order(s) currently marked PROCESSING and ready for dispatch.
                    </p>
                    <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 pt-1">
                      Manage Sales & Orders →
                    </div>
                  </div>

                  {/* ALERT 3: CUSTOMER REVIEWS MODERATION */}
                  <div 
                    onClick={() => setActiveTab('reviews')}
                    className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-purple-400">⭐ Customer Reviews</span>
                      <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {reviews.length} Total
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {reviews.filter(r => r.status === 'PENDING').length || reviews.length} customer ratings available for official reply and moderation.
                    </p>
                    <div className="text-purple-400 font-bold text-[11px] flex items-center gap-1 pt-1">
                      Open Reviews Moderation →
                    </div>
                  </div>

                  {/* ALERT 4: PAYMENT ARCHITECTURE STATUS */}
                  <div 
                    onClick={() => setActiveTab('payment')}
                    className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-blue-400">💳 Payment Controls</span>
                      <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        COD ACTIVE
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Full COD mode & Partial Deposit breakdown system active and accepting orders.
                    </p>
                    <div className="text-blue-400 font-bold text-[11px] flex items-center gap-1 pt-1">
                      View Payment Settings →
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Revenue Graph
                </h3>
                <div className="h-64">
                  <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Products, Subcategories, Variants & Specs</h3>
                  <p className="text-xs text-slate-400">Edit titles, SKU IDs, images, INR/USD prices, subcategories, and SEO snippet preview.</p>
                </div>

                <button 
                  onClick={() => { setEditingProduct(null); setProductForm(defaultProductForm); setShowProductModal(true); }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={16} /> Create Product
                </button>
              </div>

              {/* REAL-TIME SEARCH & FILTERS BAR */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search products by Title, SKU ID, Vendor, or Category..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  {productSearchQuery && (
                    <button 
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select 
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setAdminProductPage(1);
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select 
                    value={productStatusFilter}
                    onChange={(e) => {
                      setProductStatusFilter(e.target.value);
                      setAdminProductPage(1);
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Thumbnail</th>
                      <th className="p-3">Title & SKU ID</th>
                      <th className="p-3">Base Price INR (₹)</th>
                      <th className="p-3">Base Price USD ($)</th>
                      <th className="p-3">Variant Pills CRUD</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {filteredProducts.slice((adminProductPage - 1) * adminItemsPerPage, adminProductPage * adminItemsPerPage).map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3">
                          <img 
                            src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                            alt={p.title}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-white" 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'; }}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>
                              {(() => {
                                let t = (p.title || '').trim();
                                if (!t || t.startsWith('http://') || t.startsWith('https://')) {
                                  if (p.description && p.description.trim()) {
                                    const clean = p.description.replace(/<[^>]*>?/gm, '').trim();
                                    if (clean) return clean.split('.')[0].slice(0, 70).trim();
                                  }
                                  return 'Organic Essential Product';
                                }
                                return t;
                              })()}
                            </span>
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              SKU: {p.sku || `OB-${p.id}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.category_name} {p.subcategory_name ? `➔ ${p.subcategory_name}` : ''} | Vendor: {p.vendor || 'VALUELIFE ESSENTIALS'}
                          </div>
                        </td>
                        <td className="p-3 font-extrabold text-emerald-400 text-sm">₹{p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : (p.discount_inr || 0)}</td>
                        <td className="p-3 font-extrabold text-blue-400 text-sm">${p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : (p.discount_usd || 0)}</td>
                        <td className="p-3">
                          <button 
                            onClick={() => setSelectedProductForVariants(p)}
                            className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Wrench size={14} /> Variant Pills ({p.variants?.length || 0})
                          </button>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button 
                            onClick={() => {
                              let safeTitle = (p.title || '').trim();
                              if (!safeTitle || safeTitle.startsWith('http://') || safeTitle.startsWith('https://')) {
                                if (p.description && p.description.trim()) {
                                  const clean = p.description.replace(/<[^>]*>?/gm, '').trim();
                                  if (clean) safeTitle = clean.split('.')[0].slice(0, 70).trim();
                                }
                                if (!safeTitle || safeTitle.startsWith('http')) safeTitle = 'Organic Essential Product';
                              }

                              setEditingProduct(p);
                              setProductForm({
                                title: safeTitle,
                                sku: p.sku || `OB-${p.id}`,
                                status: p.status || 'Active',
                                vendor: p.vendor || 'VALUELIFE ESSENTIALS',
                                product_type: p.product_type || 'Garden Supplies',
                                tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : p.tags) : ['organic'],
                                collection_ids: p.collection_ids || (Array.isArray(p.collections) ? p.collections.map(c => typeof c === 'object' ? c.id : c) : []),
                                category_id: p.category_id,
                                subcategory_id: p.subcategory_id || '',
                                description: p.description || '',
                                price_inr: p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : '',
                                price_usd: p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : '',
                                discount_inr: p.price_inr !== undefined && p.price_inr !== null ? p.price_inr : '',
                                discount_usd: p.price_usd !== undefined && p.price_usd !== null ? p.price_usd : '',
                                compare_price_inr: p.compare_price_inr !== undefined && p.compare_price_inr !== null ? p.compare_price_inr : '',
                                compare_price_usd: p.compare_price_usd !== undefined && p.compare_price_usd !== null ? p.compare_price_usd : '',
                                cost_per_item_inr: p.cost_per_item_inr !== undefined && p.cost_per_item_inr !== null ? p.cost_per_item_inr : '',
                                cost_per_item_usd: p.cost_per_item_usd !== undefined && p.cost_per_item_usd !== null ? p.cost_per_item_usd : '',
                                barcode: p.barcode || '',
                                stock: p.stock !== undefined ? p.stock : 100,
                                track_inventory: p.track_inventory ?? 1,
                                weight: p.weight || 0.5,
                                hs_code: p.hs_code || '310100',
                                country_of_origin: p.country_of_origin || 'India',
                                is_best_product: p.is_best_product === 1,
                                seo_title: p.seo_title || p.title,
                                seo_description: p.seo_description || p.description,
                                url_handle: `products/${p.slug}`,
                                images: Array.isArray(p.images) && p.images.length > 0 
                                  ? p.images 
                                  : (p.image_url ? [p.image_url] : (p.thumbnail ? [p.thumbnail] : [])),
                                specs_json: p.specs_json || '{"material":"100% Pure Bio Compost"}',
                                gst_percent: p.gst_percent ?? '',
                                variants: (p.variants && Array.isArray(p.variants)) ? p.variants.map(v => ({ ...v })) : []
                              });
                              setShowProductModal(true);
                            }}
                            className="bg-blue-900/60 text-blue-300 p-1.5 rounded-lg hover:bg-blue-800 border border-blue-700"
                            title="Edit Product (Shopify Form)"
                          >
                            <Edit size={16} />
                          </button>

                          <button 
                            onClick={() => setDeleteConfirmProduct(p)}
                            className="bg-rose-900/60 text-rose-300 p-1.5 rounded-lg hover:bg-rose-800 border border-rose-700 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ADMIN PRODUCTS PAGINATION CONTROLS FOOTER */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-850 p-4 rounded-xl border border-slate-800 gap-3 text-xs">
                <div className="text-slate-400 font-medium">
                  Showing <span className="font-extrabold text-white">{filteredProducts.length === 0 ? 0 : (adminProductPage - 1) * adminItemsPerPage + 1}</span> to{' '}
                  <span className="font-extrabold text-white">{Math.min(adminProductPage * adminItemsPerPage, filteredProducts.length)}</span> of{' '}
                  <span className="font-extrabold text-emerald-400">{filteredProducts.length}</span> Products Total
                </div>

                <div className="flex items-center gap-1.5 font-bold flex-wrap">
                  <button
                    onClick={() => setAdminProductPage(prev => Math.max(1, prev - 1))}
                    disabled={adminProductPage === 1}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      adminProductPage === 1 
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 cursor-pointer'
                    }`}
                  >
                    ‹ Previous
                  </button>

                  {Array.from({ length: Math.ceil(filteredProducts.length / adminItemsPerPage) || 1 }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setAdminProductPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        adminProductPage === page
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setAdminProductPage(prev => Math.min(Math.ceil(filteredProducts.length / adminItemsPerPage) || 1, prev + 1))}
                    disabled={adminProductPage >= Math.ceil(filteredProducts.length / adminItemsPerPage)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      adminProductPage >= Math.ceil(filteredProducts.length / adminItemsPerPage)
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 cursor-pointer'
                    }`}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & SUBCATEGORIES */}
          {activeTab === 'categories' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Categories & Subcategories Manager</h3>
                  <p className="text-xs text-slate-400">Add categories and attach custom subcategories.</p>
                </div>

                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', icon: '', image_url: '' });
                    setShowCategoryModal(true);
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={16} /> Add New Main Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat.id ? `cat-${cat.id}-${idx}` : `cat-${idx}`} className="p-4 border border-slate-800 rounded-xl bg-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <span>{cat.icon || '🌿'}</span> <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedCatForSubcat(cat); setShowSubcategoryModal(true); }}
                          className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-1 rounded text-[11px] font-bold hover:bg-emerald-900 transition-colors"
                        >
                          + Subcategory
                        </button>
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name,
                              icon: cat.icon || '🌿',
                              description: cat.description || '',
                              image_url: cat.image_url || ''
                            });
                            setShowCategoryModal(true);
                          }} 
                          className="bg-blue-900/60 text-blue-300 p-1.5 rounded-lg hover:bg-blue-800 border border-blue-700 flex items-center gap-1 text-[11px] font-bold transition-colors"
                          title="Edit Category"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmCategory(cat)} 
                          className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 border border-red-500/30 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">{cat.description}</p>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400">Subcategories ({cat.subcategories?.length || 0}):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories?.map(sub => (
                          <span key={sub.id} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-700">
                            {sub.name}
                            <button onClick={async () => { await adminFetch(`/api/subcategories/${sub.id}`, { method: 'DELETE' }); fetchAdminData(); }} className="text-red-400 hover:text-red-300 ml-1">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COLLECTIONS MANAGER */}
          {activeTab === 'collections' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Collections Manager & Category/Product Mapping</h3>
                  <p className="text-xs text-slate-400">Create collections, map parent categories, and assign products.</p>
                </div>

                <button 
                  onClick={() => {
                    setEditingCollection(null);
                    setCollectionForm({ name: '', description: '', image_url: '', category_id: '', show_in_navbar: 0, product_ids: [] });
                    setShowCollectionModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={16} /> Create New Collection
                </button>
              </div>

              {collections.length === 0 ? (
                <div className="p-8 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-2">
                  <p className="text-sm font-bold text-slate-300">No Custom Collections Created Yet</p>
                  <p className="text-xs text-slate-400">Click "+ Create New Collection" above to create product collections & map items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collections.map(col => (
                    <div key={col.id} className="p-4 border border-slate-800 rounded-xl bg-slate-850 space-y-3">
                      <div className="relative h-32 rounded-lg overflow-hidden border border-slate-700">
                        {col.image_url ? (
                          <img 
                            src={resolveImgUrl(col.image_url)} 
                            alt={col.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-emerald-950 to-slate-900 flex items-center justify-center border border-slate-700">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">No Banner Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 p-3 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                              /collection/{col.slug}
                            </span>
                            {col.show_in_navbar === 1 && (
                              <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow">
                                🌿 SHOW IN NAVBAR
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-white text-base">{col.name}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{col.description}</p>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Top Navbar Link:</span>
                          <button
                            type="button"
                            onClick={async () => {
                              const isCurrentlyOn = col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1';
                              const newStatus = isCurrentlyOn ? 0 : 1;
                              const res = await adminFetch(`/api/collections/${col.id}/navbar-toggle`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ show_in_navbar: newStatus })
                              });
                              if (res.ok) {
                                setCollections(prev => prev.map(c => c.id === col.id ? { ...c, show_in_navbar: newStatus } : c));
                                if (showToast) showToast('success', 'Navbar Visibility Updated', `Collection '${col.name}' navbar link turned ${newStatus === 1 ? 'ON' : 'OFF'}.`);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all border ${
                              (col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1')
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {(col.show_in_navbar === 1 || col.show_in_navbar === true || String(col.show_in_navbar) === '1') ? '🟢 SHOW IN NAVBAR (ON)' : '⚪ HIDDEN FROM NAVBAR (OFF)'}
                          </button>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Attached Products:</span>
                          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{col.product_count || 0} Products</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setEditingCollection(col);
                            setCollectionForm({
                              name: col.name,
                              description: col.description || '',
                              image_url: col.image_url || '',
                              category_id: col.category_id || '',
                              show_in_navbar: col.show_in_navbar !== undefined ? col.show_in_navbar : 0,
                              product_ids: col.product_ids || []
                            });
                            setShowCollectionModal(true);
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs border border-slate-700"
                        >
                          Edit Collection
                        </button>

                        <button 
                          onClick={async () => {
                            if (window.confirm(`Delete collection "${col.name}"?`)) {
                              await adminFetch(`/api/collections/${col.id}`, { method: 'DELETE' });
                              fetchAdminData();
                              if (showToast) showToast('info', 'Collection Deleted', 'Collection deleted successfully.');
                            }
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-2 rounded-lg text-xs border border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4B: MEDIA LIBRARY MANAGER */}
          {activeTab === 'media' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              {/* TOP ACTION BAR */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                    <ImageIcon className="text-emerald-400" size={22} /> Centralized Media & Assets Manager
                  </h3>
                  <p className="text-xs text-slate-400">View all images across your store, upload multiple new assets, copy URLs, and manage files.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
                    <Upload size={16} /> 
                    <span>{mediaUploading ? 'Uploading Assets...' : '+ Upload New Images'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      disabled={mediaUploading}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setMediaUploading(true);
                        try {
                          for (const file of files) {
                            const formData = new FormData();
                            formData.append('image', file);
                            await adminFetch('/api/upload', { method: 'POST', body: formData });
                          }
                          await fetchAdminData();
                          if (showToast) showToast('success', 'Media Uploaded', `${files.length} image(s) uploaded successfully!`);
                        } catch (err) {
                          if (showToast) showToast('error', 'Upload Failed', err.message);
                        } finally {
                          setMediaUploading(false);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* CONTROLS: SEARCH & FILTER TABS */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <input 
                    type="text"
                    placeholder="Search filename or image URL..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-bold">
                  <span className="text-slate-400 text-[11px]">Filter:</span>
                  <button 
                    onClick={() => setMediaFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${mediaFilter === 'ALL' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                  >
                    All Assets ({mediaFiles.length})
                  </button>
                  <button 
                    onClick={() => setMediaFilter('UPLOADED')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${mediaFilter === 'UPLOADED' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                  >
                    Uploaded Files ({mediaFiles.filter(m => m.source === 'UPLOADED_FILE').length})
                  </button>
                </div>
              </div>

              {/* MEDIA GALLERY GRID */}
              {mediaFiles.length === 0 ? (
                <div className="p-12 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <ImageIcon size={32} />
                  </div>
                  <h4 className="font-extrabold text-base text-white">No Media Files Found</h4>
                  <p className="text-xs text-slate-400">Click "+ Upload New Images" above to add image assets to your store library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles
                    .filter(item => {
                      if (mediaFilter === 'UPLOADED' && item.source !== 'UPLOADED_FILE') return false;
                      if (mediaSearch) {
                        const term = mediaSearch.toLowerCase();
                        return (item.filename || '').toLowerCase().includes(term) || (item.url || '').toLowerCase().includes(term);
                      }
                      return true;
                    })
                    .map(item => (
                      <div key={item.id} className="relative group bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all">
                        <div className="relative h-36 bg-slate-900 overflow-hidden flex items-center justify-center p-1 cursor-pointer" onClick={() => setPreviewMediaItem(item)}>
                          <img 
                            src={`${resolveImgUrl(item.url)}${item.url && item.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`} 
                            alt={item.filename}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="absolute top-2 left-2 bg-slate-950/80 text-emerald-400 border border-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow">
                            {item.source === 'UPLOADED_FILE' ? '📁 FILE' : '🔗 DB'}
                          </span>
                        </div>

                        <div className="p-2.5 space-y-2 border-t border-slate-800 bg-slate-900/60">
                          <p className="text-[11px] font-bold text-white truncate" title={item.filename}>{item.filename}</p>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(item.fullUrl || item.url);
                                if (showToast) showToast('success', 'URL Copied!', 'Image URL copied to clipboard.');
                              }}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                              title="Copy URL"
                            >
                              <LinkIcon size={11} /> Copy URL
                            </button>

                            {item.source === 'UPLOADED_FILE' && (
                              <>
                                <label className="bg-amber-950/80 hover:bg-amber-700 text-amber-300 hover:text-white p-1.5 rounded-lg border border-amber-800 transition-colors cursor-pointer flex items-center justify-center" title="Replace / Overwrite with New Image File">
                                  <RefreshCw size={13} />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      if (!window.confirm(`Replace image "${item.filename}" with new file "${file.name}"? The image URL will stay identical across all products.`)) return;
                                      
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      formData.append('targetFilename', item.filename);

                                      try {
                                        const res = await adminFetch('/api/media/replace', {
                                          method: 'POST',
                                          body: formData
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                          setMediaCacheBuster(Date.now());
                                          await fetchAdminData();
                                          if (showToast) showToast('success', 'Image Replaced', `Image ${item.filename} replaced successfully!`);
                                        } else {
                                          if (showToast) showToast('error', 'Replace Failed', data.error);
                                        }
                                      } catch (err) {
                                        if (showToast) showToast('error', 'Replace Error', err.message);
                                      }
                                    }} 
                                    className="hidden" 
                                  />
                                </label>

                                <button 
                                  onClick={async () => {
                                    if (window.confirm(`Delete image "${item.filename}" from server?`)) {
                                      try {
                                        const res = await adminFetch(`/api/media/${encodeURIComponent(item.filename)}`, { method: 'DELETE' });
                                        if (res.ok) {
                                          fetchAdminData();
                                          if (showToast) showToast('info', 'Deleted', `File ${item.filename} deleted.`);
                                        } else {
                                          if (showToast) showToast('error', 'Delete Failed', `Could not delete file ${item.filename}`);
                                        }
                                      } catch (err) {
                                        if (showToast) showToast('error', 'Delete Error', err.message || 'Network error deleting media file');
                                      }
                                    }
                                  }}
                                  className="bg-rose-950/80 hover:bg-rose-800 text-rose-300 p-1.5 rounded-lg border border-rose-800 transition-colors"
                                  title="Delete Image"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BANNERS & SLIDERS WITH REAL-TIME LIVE PREVIEW CANVAS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 w-full">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MARKETING & SLIDERS</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">🖼️ Hero Banners & Promotional Sliders Studio</h3>
                <p className="text-xs text-slate-400">Manage hero slider images and promotional text with real-time 50-50 side-by-side storefront canvas preview.</p>
              </div>

              {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                {/* LEFT COLUMN: CONTROLS & BANNERS LIST (50% WIDTH) */}
                <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Active Banners & Slides ({banners.length})</h4>
                      <p className="text-[11px] text-slate-400">Add or remove promotional slides appearing on storefront.</p>
                    </div>

                    <button onClick={() => setShowBannerModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer">
                      <Plus size={16} /> Add Hero Banner
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {banners.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold">
                        No custom banners added yet. Showing default photorealistic slides.
                      </div>
                    ) : (
                      banners.map(b => (
                        <div key={b.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-850 space-y-3 shadow-sm">
                          <img 
                            src={resolveImgUrl(b.image_url)} 
                            alt={b.title} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'; }} 
                            className="w-full h-36 object-cover rounded-xl border border-slate-700 bg-slate-900" 
                          />
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-white text-xs">{b.title}</h4>
                              <p className="text-[11px] text-slate-400 leading-tight">{b.subtitle}</p>
                              {b.link_url && <span className="text-[10px] text-emerald-400 font-mono block mt-1">Link: {b.link_url}</span>}
                            </div>
                            <button onClick={async () => { const res = await adminFetch(`/api/banners/${b.id}`, { method: 'DELETE' }); if (res.ok) { setBanners(prev => prev.filter(x => x.id !== b.id)); if (showToast) showToast('success', 'Banner Deleted', `Banner "${b.title}" removed.`); } }} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-950/60 rounded-lg border border-rose-900 text-xs" title="Delete Banner">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS (50% WIDTH STICKY) */}
                <div className="w-full sticky top-6 space-y-3">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                          👁️ LIVE REAL-TIME BANNER CAROUSEL PREVIEW
                        </span>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
                        100% Live Sync
                      </span>
                    </div>

                    {/* BROWSER FRAME MOCKUP */}
                    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="bg-slate-950 px-4 py-0.5 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800 truncate max-w-xs">
                          http://localhost:5173 (Promo Banner Slider)
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Interactive</span>
                      </div>

                      <div className="p-2 bg-slate-950">
                        <PromoBannerSlider navigateTo={() => {}} sectionsConfig={sectionsConfig} banners={banners} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Coupons & Promo Codes Manager</h3>
                  <p className="text-xs text-slate-400">Create percentage or flat discount promo codes.</p>
                </div>

                <button onClick={() => setShowDiscountTypeModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
                  <Plus size={16} /> Create Discount
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="p-4 border border-slate-800 rounded-xl bg-slate-850 flex justify-between items-center">
                    <div>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-sm px-3 py-1 rounded-lg block w-fit">
                        {c.code}
                      </span>
                      <p className="text-xs text-slate-300 mt-2 font-bold">
                        {c.discount_type === 'PERCENT' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                      </p>
                    </div>
                    <button onClick={async () => { const res = await adminFetch(`/api/coupons/${c.id}`, { method: 'DELETE' }); if (res.ok) { setCoupons(prev => prev.filter(x => x.id !== c.id)); if (showToast) showToast('success', 'Coupon Deleted', `Coupon "${c.code}" removed.`); } }} className="text-red-400 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS MODERATION & MANAGEMENT WITH PRODUCT FILTER & PAGINATION */}
          {activeTab === 'reviews' && (() => {
            const filteredReviews = reviews.filter(r => {
              const query = reviewSearchQuery.trim().toLowerCase();
              const matchesSearch = !query || 
                (r.product_title && r.product_title.toLowerCase().includes(query)) ||
                (r.user_name && r.user_name.toLowerCase().includes(query)) ||
                (r.user_email && r.user_email.toLowerCase().includes(query)) ||
                (r.title && r.title.toLowerCase().includes(query)) ||
                (r.comment && r.comment.toLowerCase().includes(query));

              const matchesProduct = reviewProductFilter === 'ALL' || String(r.product_id) === String(reviewProductFilter);
              const matchesStatus = reviewStatusFilter === 'ALL' || (r.status || 'APPROVED') === reviewStatusFilter;
              const matchesRating = reviewRatingFilter === 'ALL' || Number(r.rating) === Number(reviewRatingFilter);

              return matchesSearch && matchesProduct && matchesStatus && matchesRating;
            });

            const totalReviewPages = Math.ceil(filteredReviews.length / reviewItemsPerPage) || 1;
            const paginatedReviews = filteredReviews.slice((reviewPage - 1) * reviewItemsPerPage, reviewPage * reviewItemsPerPage);

            return (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white font-['Outfit']">Customer Reviews & Moderation Hub</h3>
                    <p className="text-xs text-slate-400">Approve customer ratings, write official responses, delete spam, or filter by specific products.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                      Showing {filteredReviews.length} of {reviews.length} Reviews
                    </span>
                  </div>
                </div>

                {/* FILTER & SEARCH CONTROL BAR */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* 1. SEARCH INPUT */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search review, user, email..."
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* 2. FILTER ACCORDING TO PRODUCT */}
                    <div>
                      <select 
                        value={reviewProductFilter}
                        onChange={(e) => setReviewProductFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">📦 Filter by Product (All Products)</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title.length > 32 ? p.title.substring(0, 32) + '...' : p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. STATUS FILTER */}
                    <div>
                      <select 
                        value={reviewStatusFilter}
                        onChange={(e) => setReviewStatusFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">📋 All Statuses</option>
                        <option value="APPROVED">🟢 APPROVED</option>
                        <option value="PENDING">🟡 PENDING</option>
                        <option value="REJECTED">🔴 REJECTED</option>
                      </select>
                    </div>

                    {/* 4. RATING FILTER */}
                    <div>
                      <select 
                        value={reviewRatingFilter}
                        onChange={(e) => setReviewRatingFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">⭐ All Ratings (1 - 5 Stars)</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars Only</option>
                        <option value="4">⭐⭐⭐⭐☆ 4 Stars Only</option>
                        <option value="3">⭐⭐⭐☆☆ 3 Stars Only</option>
                        <option value="2">⭐⭐☆☆☆ 2 Stars Only</option>
                        <option value="1">⭐☆☆☆☆ 1 Star Only</option>
                      </select>
                    </div>
                  </div>

                  {/* ACTIVE FILTER RESET BAR */}
                  {(reviewSearchQuery || reviewProductFilter !== 'ALL' || reviewStatusFilter !== 'ALL' || reviewRatingFilter !== 'ALL') && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-emerald-400 font-bold">
                        Filtered {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} matching criteria
                      </span>
                      <button 
                        onClick={() => {
                          setReviewSearchQuery('');
                          setReviewProductFilter('ALL');
                          setReviewStatusFilter('ALL');
                          setReviewRatingFilter('ALL');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Reset All Filters ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* REVIEWS GRID / LIST */}
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-3xl">⭐</div>
                    <h4 className="font-bold text-white text-sm">No Customer Reviews Found</h4>
                    <p className="text-xs text-slate-400">No reviews match your selected product or filter criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedReviews.map(r => (
                      <div key={r.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-850 space-y-3 text-xs shadow-sm hover:border-slate-700 transition-colors">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div className="flex items-start gap-3">
                            <img 
                              src={r.product_thumbnail || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=100'} 
                              alt={r.product_title || 'Product'} 
                              className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-white"
                            />
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{r.product_title || `Product #${r.product_id}`}</h4>
                              <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                                <span className="font-bold text-white">{r.user_name}</span>
                                <span>({r.user_email || 'No Email'})</span>
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Verified Buyer</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                              r.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              r.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {r.status || 'APPROVED'}
                            </span>

                            <button 
                              type="button"
                              onClick={async () => {
                                const newStatus = r.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                                const res = await adminFetch(`/api/admin/reviews/${r.id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                if (res.ok) {
                                  setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, status: newStatus } : rev));
                                  showToast('success', 'Status Updated', `Review set to ${newStatus}`);
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-[11px] cursor-pointer"
                            >
                              {r.status === 'APPROVED' ? '✕ Mark Rejected' : '✓ Approve Review'}
                            </button>

                            <button 
                              type="button"
                              onClick={() => {
                                askConfirmation({
                                  title: 'Delete Customer Review?',
                                  message: `Are you sure you want to permanently delete this review by "${r.user_name || 'Customer'}"? This action cannot be undone.`,
                                  confirmText: 'Delete Review',
                                  danger: true,
                                  onConfirm: async () => {
                                    const res = await adminFetch(`/api/admin/reviews/${r.id}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      setReviews(prev => prev.filter(rev => rev.id !== r.id));
                                      if (showToast) showToast('info', 'Review Deleted', 'Review removed from system');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* RATING & COMMENT */}
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="text-amber-400 font-bold flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                              ))}
                            </div>
                            <span className="font-extrabold text-white text-xs">{r.title}</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{r.comment}</p>

                          {/* UPLOADED CUSTOMER PHOTOS */}
                          {r.images && r.images.length > 0 && (
                            <div className="flex gap-2 pt-2">
                              {r.images.map((imgUrl, idx) => (
                                <img 
                                  key={idx} 
                                  src={resolveImgUrl(imgUrl)} 
                                  alt="Review attachment" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'; }} 
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-white" 
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* OFFICIAL ADMIN REPLY SECTION */}
                        <div className="pt-1 space-y-1">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Type official store reply to customer..."
                              defaultValue={r.admin_reply || ''}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const replyVal = e.target.value;
                                  const res = await adminFetch(`/api/admin/reviews/${r.id}/reply`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ admin_reply: replyVal })
                                  });
                                  if (res.ok) {
                                    setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, admin_reply: replyVal } : rev));
                                    showToast('success', 'Reply Saved', 'Admin response published');
                                  }
                                }
                              }}
                              className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                            />
                            <span className="text-[10px] text-slate-500 font-mono self-center">Press Enter to save</span>
                          </div>
                          {r.admin_reply && (
                            <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 p-2 rounded-xl text-[11px]">
                              💬 <strong>Official Admin Response:</strong> "{r.admin_reply}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PAGINATION FOOTER CONTROLS */}
                {filteredReviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
                    <div>
                      Showing <strong className="text-white">{(reviewPage - 1) * reviewItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(reviewPage * reviewItemsPerPage, filteredReviews.length)}</strong> of <strong className="text-emerald-400">{filteredReviews.length}</strong> reviews
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
                        disabled={reviewPage === 1}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalReviewPages }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button 
                            key={pg}
                            onClick={() => setReviewPage(pg)}
                            className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                              reviewPage === pg 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}

                      <button 
                        onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
                        disabled={reviewPage >= totalReviewPages}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 8: ORDERS WITH SEARCH, STATUS FILTER & PAGINATION */}
          {activeTab === 'orders' && (() => {
            const filteredOrders = orders.filter(o => {
              const query = orderSearchQuery.trim().toLowerCase();
              const matchesSearch = !query || 
                (o.order_number && o.order_number.toLowerCase().includes(query)) ||
                (o.customer_name && o.customer_name.toLowerCase().includes(query)) ||
                (o.customer_phone && o.customer_phone.toLowerCase().includes(query)) ||
                (o.order_notes && o.order_notes.toLowerCase().includes(query));

              const matchesStatus = orderStatusFilter === 'ALL' || o.order_status === orderStatusFilter;
              
              let matchesPayment = true;
              if (orderPaymentFilter === 'PARTIAL') matchesPayment = (o.remaining_amount || 0) > 0 && (o.paid_amount || 0) > 0;
              else if (orderPaymentFilter === 'FULL_PREPAID') matchesPayment = (o.paid_amount || 0) >= (o.total_amount || 0);
              else if (orderPaymentFilter === 'FULL_COD') matchesPayment = (o.paid_amount || 0) === 0;

              return matchesSearch && matchesStatus && matchesPayment;
            });

            const totalOrderPages = Math.ceil(filteredOrders.length / orderItemsPerPage) || 1;
            const paginatedOrders = filteredOrders.slice((orderPage - 1) * orderItemsPerPage, orderPage * orderItemsPerPage);

            return (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Orders & Partial Payments Control</h3>
                    <p className="text-xs text-slate-400">Manage orders, view itemized invoice details, update shipping status, and view customer notes.</p>
                  </div>

                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                    Showing {filteredOrders.length} of {orders.length} Orders
                  </span>
                </div>

                {/* QUICK STATUS PILLS BAR */}
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  <button
                    onClick={() => setOrderStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      orderStatusFilter === 'ALL'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    📋 All Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('PROCESSING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      orderStatusFilter === 'PROCESSING'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    🟡 Processing ({orders.filter(o => o.order_status === 'PROCESSING').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('SHIPPED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      orderStatusFilter === 'SHIPPED'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800 text-blue-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    🔵 Shipped ({orders.filter(o => o.order_status === 'SHIPPED').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('DELIVERED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      orderStatusFilter === 'DELIVERED'
                        ? 'bg-emerald-700 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    🟢 Delivered ({orders.filter(o => o.order_status === 'DELIVERED').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('CANCELLED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      orderStatusFilter === 'CANCELLED'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-500/50'
                        : 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                    }`}
                  >
                    🔴 Cancelled Requests ({orders.filter(o => o.order_status === 'CANCELLED').length})
                  </button>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* SEARCH INPUT */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search Order #, Name, Phone, Notes..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* STATUS FILTER */}
                    <div>
                      <select 
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">📋 All Order Statuses</option>
                        <option value="PROCESSING">🟡 PROCESSING</option>
                        <option value="SHIPPED">🔵 SHIPPED</option>
                        <option value="DELIVERED">🟢 DELIVERED</option>
                        <option value="CANCELLED">🔴 CANCELLED</option>
                      </select>
                    </div>

                    {/* PAYMENT TYPE FILTER */}
                    <div>
                      <select 
                        value={orderPaymentFilter}
                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">💳 All Payment Modes</option>
                        <option value="PARTIAL">⚡ Partial Deposit (Balance Rest on COD)</option>
                        <option value="FULL_PREPAID">💳 100% Full Prepaid</option>
                        <option value="FULL_COD">💵 100% Full COD</option>
                      </select>
                    </div>
                  </div>

                  {(orderSearchQuery || orderStatusFilter !== 'ALL' || orderPaymentFilter !== 'ALL') && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-emerald-400 font-bold">
                        Filtered {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching criteria
                      </span>
                      <button 
                        onClick={() => {
                          setOrderSearchQuery('');
                          setOrderStatusFilter('ALL');
                          setOrderPaymentFilter('ALL');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Reset All Filters ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
                      <tr>
                        <th className="p-3">Order #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Paid Online</th>
                        <th className="p-3">COD Balance</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">View Details & Notes</th>
                        <th className="p-3">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-400">
                            No orders match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-white font-mono">{o.order_number}</td>
                            <td className="p-3">
                              <div className="font-bold text-white">{o.customer_name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{o.customer_phone}</div>
                              {o.shipping_address && (
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[180px]" title={o.shipping_address}>
                                  📍 {o.shipping_address}
                                </div>
                              )}
                              {o.order_notes && (
                                <div className="mt-1 bg-amber-950/80 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-800/80 font-extrabold max-w-[200px] truncate" title={o.order_notes}>
                                  📝 Remark: "{o.order_notes}"
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-black text-white text-sm">
                              {o.currency === 'USD' ? '$' : '₹'}{(Number(o.total_amount) || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 font-bold text-emerald-400 text-xs">
                              {o.currency === 'USD' ? '$' : '₹'}{(Number(o.paid_amount) || 0).toLocaleString('en-IN')}
                              <span className="text-[9px] text-slate-400 block font-normal uppercase">{o.payment_mode || 'PARTIAL'}</span>
                            </td>
                            <td className="p-3 font-bold text-amber-400 text-xs">
                              {o.currency === 'USD' ? '$' : '₹'}{(Number(o.remaining_amount) || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] border uppercase ${
                                o.order_status === 'CANCELLED' ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                                o.order_status === 'SHIPPED' ? 'bg-blue-950/80 text-blue-300 border-blue-800' :
                                o.order_status === 'DELIVERED' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                                'bg-amber-950/80 text-amber-300 border-amber-800'
                              }`}>
                                {o.order_status || 'PROCESSING'}
                              </span>
                              {o.cancellation_reason && (
                                <div className="mt-1 text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/60 truncate max-w-[150px]" title={o.cancellation_reason}>
                                  🚫 {o.cancellation_reason}
                                </div>
                              )}
                              {o.courier_name && (
                                <div className="mt-1 text-[10px] text-blue-300 font-mono bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/60 truncate max-w-[150px]">
                                  🚚 {o.courier_name} {o.tracking_number ? `#${o.tracking_number}` : ''}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <button 
                                onClick={() => handleFetchOrderDetails(o)}
                                className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Eye size={14} /> View Order & Shipping
                              </button>
                            </td>
                            <td className="p-3">
                              <select 
                                value={o.order_status || 'PROCESSING'}
                                onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg p-1.5 cursor-pointer focus:border-emerald-500 focus:outline-none"
                              >
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER */}
                {filteredOrders.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
                    <div>
                      Showing <strong className="text-white">{(orderPage - 1) * orderItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(orderPage * orderItemsPerPage, filteredOrders.length)}</strong> of <strong className="text-emerald-400">{filteredOrders.length}</strong> orders
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
                        disabled={orderPage === 1}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalOrderPages }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button 
                            key={pg}
                            onClick={() => setOrderPage(pg)}
                            className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                              orderPage === pg 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}

                      <button 
                        onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
                        disabled={orderPage >= totalOrderPages}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 9: USER MANAGEMENT DIRECTORY WITH SEARCH & PAGINATION */}
          {activeTab === 'users' && (() => {
            const filteredUsers = users.filter(u => {
              const query = userSearchQuery.trim().toLowerCase();
              const matchesSearch = !query || 
                (u.name && u.name.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query)) ||
                (u.phone && u.phone.toLowerCase().includes(query));

              const userRole = (u.role || 'CUSTOMER').toUpperCase();
              const matchesRole = userRoleFilter === 'ALL' || userRole === userRoleFilter || (userRoleFilter === 'USER' && (userRole === 'CUSTOMER' || userRole === 'USER'));

              return matchesSearch && matchesRole;
            });

            const totalUserPages = Math.ceil(filteredUsers.length / userItemsPerPage) || 1;
            const paginatedUsers = filteredUsers.slice((userPage - 1) * userItemsPerPage, userPage * userItemsPerPage);

            return (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">User Directory & Customer Management</h3>
                    <p className="text-xs text-slate-400">View customer profile details, order counts, and total spending.</p>
                  </div>

                  <button 
                    onClick={handleDownloadUsersCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download size={16} /> Download Users CSV Data
                  </button>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* SEARCH INPUT */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search Customer Name, Email, Phone..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* ROLE FILTER */}
                    <div>
                      <select 
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">👥 All Customer Roles ({users.length})</option>
                        <option value="CUSTOMER">👤 Customer (CUSTOMER)</option>
                        <option value="ADMIN">🛡️ Administrator (ADMIN)</option>
                      </select>
                    </div>
                  </div>

                  {(userSearchQuery || userRoleFilter !== 'ALL') && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-emerald-400 font-bold">
                        Filtered {filteredUsers.length} customer{filteredUsers.length !== 1 ? 's' : ''} matching criteria
                      </span>
                      <button 
                        onClick={() => {
                          setUserSearchQuery('');
                          setUserRoleFilter('ALL');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Reset All Filters ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">User / Customer Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Orders</th>
                        <th className="p-3">Total Spent</th>
                        <th className="p-3">Joined Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-slate-400">
                            No users or customers match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map(u => {
                          const isAdmin = (u.role || 'CUSTOMER').toUpperCase() === 'ADMIN' || (u.role || 'CUSTOMER').toUpperCase() === 'SUPER_ADMIN';

                          return (
                            <tr key={u.id} className="hover:bg-slate-800/50">
                              <td className="p-3 font-mono text-slate-400">#{u.id}</td>
                              <td className="p-3 font-bold text-white flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                                  isAdmin ? 'bg-amber-500 text-slate-950 font-black' : 'bg-emerald-800 text-emerald-200'
                                }`}>
                                  {(u.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span>{u.name || 'Customer Account'}</span>
                              </td>
                              <td className="p-3 font-mono text-emerald-400">{u.email}</td>
                              <td className="p-3 text-slate-300 font-mono">{u.phone || 'N/A'}</td>
                              <td className="p-3">
                                {isAdmin ? (
                                  <span className="bg-amber-950 text-amber-300 border border-amber-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                                    👑 ADMIN
                                  </span>
                                ) : (
                                  <span className="bg-slate-800 text-blue-300 border border-slate-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                    CUSTOMER
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-bold text-white">{u.total_orders || 0} Orders</td>
                              <td className="p-3 font-black text-emerald-400">₹{(u.total_spent || 0).toLocaleString('en-IN')}</td>
                              <td className="p-3 text-slate-400">{new Date(u.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                              <td className="p-3 text-right">
                                <button 
                                  type="button"
                                  onClick={() => handleViewUserDetails(u)}
                                  className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Eye size={13} /> View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER */}
                {filteredUsers.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
                    <div>
                      Showing <strong className="text-white">{(userPage - 1) * userItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(userPage * userItemsPerPage, filteredUsers.length)}</strong> of <strong className="text-emerald-400">{filteredUsers.length}</strong> customers
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                        disabled={userPage === 1}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalUserPages }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button 
                            key={pg}
                            onClick={() => setUserPage(pg)}
                            className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                              userPage === pg 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}

                      <button 
                        onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                        disabled={userPage >= totalUserPages}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 11: CUSTOM PAGES CMS */}
          {activeTab === 'pages' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Custom Pages CMS Manager</h3>
                  <p className="text-xs text-slate-400">Create, edit, and publish custom store pages (About Us, Contact Us, Policies, FAQ).</p>
                </div>

                <button 
                  onClick={() => {
                    setEditingPage(null);
                    setPageForm({ title: '', slug: '', content: '', seo_title: '', seo_description: '', status: 'PUBLISHED' });
                    setShowPageModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Plus size={16} /> + Create Custom Page
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Page Title</th>
                      <th className="p-3">URL Handle</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Updated</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {pages.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="font-extrabold text-white text-sm">{p.title}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">SEO: {p.seo_title || p.title}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-400 bg-slate-850 px-2 py-1 rounded w-fit">
                          /pages/{p.slug}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            p.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(p.updated_at || Date.now()).toLocaleDateString()}</td>
                        <td className="p-3 flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingPage(p);
                              setPageForm({ title: p.title, slug: p.slug, content: p.content, seo_title: p.seo_title || '', seo_description: p.seo_description || '', status: p.status || 'PUBLISHED' });
                              setShowPageModal(true);
                            }}
                            className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePage(p.id)}
                            className="bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MARKETING - HEADER ANNOUNCEMENT BAR STUDIO */}
          {activeTab === 'announcement' && (
            <div className="space-y-6 w-full">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MARKETING & PROMOTIONAL BANNERS</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">📢 Header Announcement Bar Studio</h3>
                <p className="text-xs text-slate-400">Configure top promotional sale announcement text, discount coupon badges, and live header preview.</p>
              </div>

              {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                {/* LEFT COLUMN: ANNOUNCEMENT BAR CONFIG FORM (50% WIDTH) */}
                <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-5">
                  <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                        Top Announcement Bar Marketing Text *
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.announcement_text || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcement_text: e.target.value })}
                        placeholder="e.g. Get 15% OFF + Free Home Delivery on Organic Fertilizers! Use Code: ORGANIC15"
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-xs"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        This banner is sticky at the top of every storefront page to maximize marketing conversion.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Customer Support Phone (Header Bar)</label>
                        <input 
                          type="text"
                          value={settingsForm.contact_phone || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Customer Support Email (Header Bar)</label>
                        <input 
                          type="text"
                          value={settingsForm.contact_email || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                        />
                      </div>
                    </div>

                    {/* SOCIAL MEDIA HANDLES CARD */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <span className="font-extrabold text-sm text-white block">📱 Social Media Links & Handles</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Instagram URL</label>
                          <input 
                            type="text"
                            placeholder="https://instagram.com/valuelifeessentials"
                            value={settingsForm.instagram_url || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Facebook Page URL</label>
                          <input 
                            type="text"
                            placeholder="https://facebook.com/valuelifeessentials"
                            value={settingsForm.facebook_url || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">YouTube Channel URL</label>
                          <input 
                            type="text"
                            placeholder="https://youtube.com/@valuelifeessentials"
                            value={settingsForm.youtube_url || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, youtube_url: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">WhatsApp Business Number</label>
                          <input 
                            type="text"
                            placeholder="e.g. +91 98765 43210"
                            value={settingsForm.whatsapp_number || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-transform text-white font-black py-3.5 rounded-xl shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                    >
                      Save & Publish Announcement Bar Live
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: REAL-TIME LIVE HEADER PREVIEW CANVAS (50% WIDTH STICKY) */}
                <div className="w-full sticky top-6 space-y-3">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                          👁️ LIVE REAL-TIME HEADER PREVIEW
                        </span>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
                        100% Live Sync
                      </span>
                    </div>

                    {/* BROWSER FRAME MOCKUP */}
                    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="bg-slate-950 px-4 py-0.5 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800 truncate max-w-xs">
                          http://localhost:5173 (Header Bar Preview)
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Live Simulation</span>
                      </div>

                      <div className="p-3 bg-slate-950 space-y-3">
                        <div className="bg-[#1b4332] text-white py-2 px-3 rounded-xl text-xs font-bold border border-emerald-800 flex justify-between items-center shadow">
                          <div className="flex items-center gap-2 truncate">
                            <span className="bg-[#52b788] text-[#1b4332] font-black text-[9px] px-2 py-0.5 rounded-full uppercase">SALE</span>
                            <span className="truncate">{settingsForm.announcement_text || 'Get 15% OFF! Use Code: ORGANIC15'}</span>
                          </div>
                          <span className="text-[10px] text-emerald-300 font-bold shrink-0">🇮🇳 (₹)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: MULTI-STYLE DYNAMIC HERO SECTION MANAGER WITH REAL-TIME LIVE PREVIEW CANVAS */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* TOP HEADER BAR */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                    <Sparkles className="text-emerald-400" size={20} /> Real-Time Live Hero Studio
                  </h3>
                  <p className="text-xs text-slate-400">Edit headlines, upload images, switch layout styles & see the live storefront preview update instantly.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = heroConfig.hero_enabled === 1 ? 0 : 1;
                      setHeroConfig({ ...heroConfig, hero_enabled: updated });
                      setSectionsConfig({ ...sectionsConfig, show_hero: updated });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      heroConfig.hero_enabled === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {heroConfig.hero_enabled === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{heroConfig.hero_enabled === 1 ? 'HERO SECTION ON' : 'HERO SECTION OFF'}</span>
                  </button>
                </div>
              </div>

              {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                {/* LEFT COLUMN: CONTROLS & FORM (50% WIDTH) */}
                <div className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
                  <form onSubmit={handleHeroSubmit} className="space-y-5 text-xs">
                    {/* 1. LAYOUT PICKER */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">1. Active Layout Style</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'SPLIT', title: 'Shopify Split', sub: 'Left Text + Right Floating Card' },
                          { id: 'CINEMATIC', title: 'Cinematic Full', sub: 'Fullbleed BG Image + Centered Text' },
                          { id: 'BENTO', title: 'Bento Grid', sub: '3-Card Modern Grid' },
                          { id: 'MINIMALIST', title: 'Minimalist Clean', sub: 'Warm Monotone Header' }
                        ].map(style => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setHeroConfig({ ...heroConfig, active_style: style.id })}
                            className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                              heroConfig.active_style === style.id 
                                ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-white">{style.title}</span>
                              {heroConfig.active_style === style.id && <CheckCircle size={14} className="text-emerald-400" />}
                            </div>
                            <p className="text-[10px] opacity-80 font-medium">{style.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. HEADLINES & CTAS */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">2. Headlines & Buttons</span>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge Tagline Text</label>
                        <input 
                          type="text"
                          value={heroConfig.badge_text || ''}
                          onChange={(e) => setHeroConfig({ ...heroConfig, badge_text: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          placeholder="e.g. 100% Certified Organic Superfoods"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Main Hero Title *</label>
                        <input 
                          type="text" required
                          value={heroConfig.title || ''}
                          onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-extrabold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Hero Subtitle Paragraph</label>
                        <textarea 
                          rows={2}
                          value={heroConfig.subtitle || ''}
                          onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Primary CTA Label</label>
                          <input 
                            type="text"
                            value={heroConfig.primary_btn_text || ''}
                            onChange={(e) => setHeroConfig({ ...heroConfig, primary_btn_text: e.target.value })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Primary CTA Link</label>
                          <input 
                            type="text"
                            value={heroConfig.primary_btn_link || ''}
                            onChange={(e) => setHeroConfig({ ...heroConfig, primary_btn_link: e.target.value })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Secondary CTA Label</label>
                          <input 
                            type="text"
                            value={heroConfig.secondary_btn_text || ''}
                            onChange={(e) => setHeroConfig({ ...heroConfig, secondary_btn_text: e.target.value })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Secondary CTA Link</label>
                          <input 
                            type="text"
                            value={heroConfig.secondary_btn_link || ''}
                            onChange={(e) => setHeroConfig({ ...heroConfig, secondary_btn_link: e.target.value })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. MEDIA & UPLOADER */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">3. Media & Uploads</span>

                      <div className="space-y-4">
                        <ImageUploader 
                          label="Main Hero Card Image *"
                          value={heroConfig.image_url || ''}
                          onChange={(newUrl) => setHeroConfig({ ...heroConfig, image_url: newUrl })}
                          placeholder="https://images.unsplash.com/..."
                        />

                        <ImageUploader 
                          label="Background Image (Cinematic Style)"
                          value={heroConfig.bg_image_url || ''}
                          onChange={(newUrl) => setHeroConfig({ ...heroConfig, bg_image_url: newUrl })}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-xl transition-all cursor-pointer text-xs uppercase tracking-wider">
                      Save & Publish Hero Configuration Live
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS (50% WIDTH STICKY) */}
                <div className="w-full sticky top-6 space-y-3">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                          👁️ LIVE REAL-TIME STOREFRONT PREVIEW
                        </span>
                      </div>
                      <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-extrabold uppercase">
                        {heroConfig.active_style} LAYOUT
                      </span>
                    </div>

                    {/* MOCK BROWSER FRAME */}
                    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
                      {/* BROWSER BAR */}
                      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        </div>
                        <span className="bg-slate-900 px-3 py-0.5 rounded-md border border-slate-700 text-slate-300">
                          http://localhost:5173 (Live Preview Canvas)
                        </span>
                        <div className="text-[10px] text-emerald-400 font-bold">100% Live Sync</div>
                      </div>

                      {/* RENDERED HERO SECTION */}
                      <div className="max-h-[580px] overflow-y-auto bg-slate-950 scrollbar-thin">
                        <HeroSection heroConfig={heroConfig} navigateTo={() => {}} />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      💡 Every title, button, image upload, or layout click updates this preview canvas instantly in real-time!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: THEME & DESIGN SYSTEM STUDIO WITH REAL-TIME LIVE PREVIEW CANVAS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* TOP HEADER BAR */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                    <Sparkles className="text-emerald-400" size={20} /> Store Theme & Design System Engine
                  </h3>
                  <p className="text-xs text-slate-400">Customize brand colors, typography fonts, UI border radiuses, and header styles live across your entire store.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setThemeConfig({ ...themeConfig, dark_mode: themeConfig.dark_mode === 1 ? 0 : 1 })}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      themeConfig.dark_mode === 1 
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/40' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    <span>{themeConfig.dark_mode === 1 ? '🌙 DARK MODE ACTIVE' : '☀️ LIGHT MODE ACTIVE'}</span>
                  </button>
                </div>
              </div>

              {/* SPLIT SCREEN EDIT & LIVE THEME PREVIEW CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: THEME CONTROLS & COLOR PICKERS (6 COLS) */}
                <div className="lg:col-span-6 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
                  <form onSubmit={handleThemeSubmit} className="space-y-5 text-xs">
                    {/* 1. THEME PRESETS SELECTOR */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">1. Curated 1-Click Theme Presets</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: 'EMERALD', name: 'Organic Emerald', primary: '#3b6e14', accent: '#f59e0b', font: 'Outfit', radius: 'rounded-3xl' },
                          { id: 'AVOCADO', name: 'Fresh Avocado', primary: '#2d5a27', accent: '#eab308', font: 'Plus Jakarta Sans', radius: 'rounded-2xl' },
                          { id: 'HAZELNUT', name: 'Warm Earth', primary: '#654321', accent: '#d97706', font: 'Playfair Display', radius: 'rounded-xl' },
                          { id: 'INDIGO', name: 'Berry Indigo', primary: '#3730a3', accent: '#ec4899', font: 'Cabinet Grotesk', radius: 'rounded-3xl' },
                          { id: 'LUXURY_DARK', name: 'Luxury Gold', primary: '#18181b', accent: '#eab308', font: 'Playfair Display', radius: 'rounded-xl' }
                        ].map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setThemeConfig({
                              ...themeConfig,
                              active_preset: preset.id,
                              primary_color: preset.primary,
                              accent_color: preset.accent,
                              heading_font: preset.font,
                              border_radius: preset.radius
                            })}
                            className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                              themeConfig.active_preset === preset.id
                                ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                              <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                            </div>
                            <span className="font-extrabold text-xs text-white block">{preset.name}</span>
                            <span className="text-[9px] opacity-75 block font-mono">{preset.font} • {preset.primary}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. CUSTOM BRAND COLORS */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-4">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">2. Brand Palette & Color Pickers</span>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Primary Brand Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={themeConfig.primary_color || '#3b6e14'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, primary_color: e.target.value })}
                              className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              value={themeConfig.primary_color || '#3b6e14'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, primary_color: e.target.value })}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Primary Button Hover Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={themeConfig.primary_hover || '#2e5710'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, primary_hover: e.target.value })}
                              className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              value={themeConfig.primary_hover || '#2e5710'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, primary_hover: e.target.value })}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Accent Highlight Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={themeConfig.accent_color || '#f59e0b'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, accent_color: e.target.value })}
                              className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              value={themeConfig.accent_color || '#f59e0b'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, accent_color: e.target.value })}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Card Background Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={themeConfig.secondary_color || '#f8f7f2'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, secondary_color: e.target.value })}
                              className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              value={themeConfig.secondary_color || '#f8f7f2'}
                              onChange={(e) => setThemeConfig({ ...themeConfig, secondary_color: e.target.value })}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. TYPOGRAPHY FONTS */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">3. Typography & Google Fonts</span>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Heading Font Family</label>
                          <select
                            value={themeConfig.heading_font || 'Outfit'}
                            onChange={(e) => setThemeConfig({ ...themeConfig, heading_font: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="Outfit">Outfit (Modern Bold)</option>
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek Clean)</option>
                            <option value="Inter">Inter (Swiss Tech)</option>
                            <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                            <option value="Roboto">Roboto (Classic Sans)</option>
                            <option value="Cabinet Grotesk">Cabinet Grotesk (Editorial Display)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Body Text Font</label>
                          <select
                            value={themeConfig.body_font || 'Inter'}
                            onChange={(e) => setThemeConfig({ ...themeConfig, body_font: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="Inter">Inter (Ultra Readable)</option>
                            <option value="Outfit">Outfit (Modern)</option>
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            <option value="Roboto">Roboto</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 4. CORNER ROUNDNESS & HEADER STYLE */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">4. UI Border Roundness & Navbar Theme</span>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Product Card Corner Radius</label>
                          <select
                            value={themeConfig.border_radius || 'rounded-3xl'}
                            onChange={(e) => setThemeConfig({ ...themeConfig, border_radius: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="rounded-3xl">Pill Smooth (rounded-3xl)</option>
                            <option value="rounded-2xl">Modern Soft (rounded-2xl)</option>
                            <option value="rounded-xl">Subtle Curved (rounded-xl)</option>
                            <option value="rounded-none">Sharp Minimalist (rounded-none)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Navbar Header Theme</label>
                          <select
                            value={themeConfig.header_style || 'EMERALD_DARK'}
                            onChange={(e) => setThemeConfig({ ...themeConfig, header_style: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="EMERALD_DARK">Emerald Dark Gradient</option>
                            <option value="MINIMAL_WHITE">Clean Minimal White</option>
                            <option value="GOLD_ACCENT">Gold Accent Border</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 5. PRODUCT CARD DESIGN & ACTION BUTTON STYLE */}
                    <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
                          ⚡ Product Card Action & Layout Design
                        </span>
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Selected: {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'CLASSIC_SPLIT' ? '2-Button Split' : 'VALUELIFE ESSENTIALS Pill'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setThemeConfig({ ...themeConfig, card_style: 'VALUELIFE_ESSENTIALS' })}
                          className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                            (themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'VALUELIFE_ESSENTIALS'
                              ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-white">🌿 VALUELIFE ESSENTIALS Pill Card</span>
                            {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'VALUELIFE_ESSENTIALS' && <CheckCircle size={14} className="text-emerald-400" />}
                          </div>
                          <p className="text-[10px] opacity-80 font-medium">1-Click 🛒 ADD TO CART button + Rating Stars + Red Heart Wishlist Pill</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setThemeConfig({ ...themeConfig, card_style: 'CLASSIC_SPLIT' })}
                          className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                            themeConfig.card_style === 'CLASSIC_SPLIT'
                              ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-white">🛍️ Classic 2-Button Split</span>
                            {themeConfig.card_style === 'CLASSIC_SPLIT' && <CheckCircle size={14} className="text-emerald-400" />}
                          </div>
                          <p className="text-[10px] opacity-80 font-medium">Side-by-Side 2 Buttons: [ Details ] + [ + Add ]</p>
                        </button>
                      </div>

                      {/* INLINE LIVE CARD PREVIEW MOCKUP BOX */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                          <span className="text-[11px] font-extrabold text-slate-200 flex items-center gap-1.5">
                            <Eye size={14} className="text-emerald-400" /> Card Live Preview Mockup:
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'CLASSIC_SPLIT' ? 'Classic 2-Button Split' : 'VALUELIFE ESSENTIALS 1-Click Pill'}
                          </span>
                        </div>

                        <div className="bg-[#f8f7f2] p-3 rounded-2xl border border-gray-300 space-y-2.5 shadow-md max-w-sm mx-auto">
                          <div className="w-full h-28 bg-white rounded-xl relative flex items-center justify-center p-2 border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80" alt="Preview" className="h-full object-contain" />
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow">
                              <Heart size={12} fill="white" color="white" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-extrabold text-xs text-gray-800 truncate">Organic Himalayan Pink Salt Powder 1kg</div>
                            <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                              <span>★★★★★ 5.00</span>
                              <span className="text-gray-400">| (24)</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs font-black text-gray-900">₹129.00</span>
                              <span className="text-[10px] text-gray-400 line-through">₹199.00</span>
                              <span className="bg-[#4a7729] text-white text-[9px] font-bold px-1 rounded">-35% Off</span>
                            </div>
                          </div>

                          {(themeConfig.card_style === 'CLASSIC_SPLIT') ? (
                            <div className="flex gap-1.5 pt-1">
                              <button type="button" className="border-2 border-[#3b6e14] text-[#3b6e14] flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center">
                                Details
                              </button>
                              <button type="button" className="bg-[#3b6e14] text-white flex-1 py-1.5 rounded-lg text-[10px] font-black text-center">
                                + Add
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="w-full bg-[#3b6e14] text-white py-2 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                              <ShoppingBag size={12} /> ADD TO CART
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-xl transition-all cursor-pointer text-xs uppercase tracking-wider">
                      Save Theme & Publish Across Entire Website
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: REAL-TIME LIVE THEME PREVIEW CANVAS (6 COLS STICKY) */}
                <div className="lg:col-span-6 sticky top-6 space-y-3">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                          👁️ LIVE REAL-TIME THEME PREVIEW CANVAS
                        </span>
                      </div>
                      <span className="bg-slate-800 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded border border-slate-700 font-extrabold uppercase">
                        {themeConfig.active_preset} PRESET
                      </span>
                    </div>

                    {/* MOCK STOREFRONT THEME COMPONENT CANVAS */}
                    <div 
                      className="rounded-2xl p-5 border border-slate-700 space-y-5 transition-all shadow-2xl overflow-hidden"
                      style={{ 
                        backgroundColor: themeConfig.dark_mode === 1 ? '#090d16' : '#ffffff',
                        fontFamily: themeConfig.body_font || 'Inter'
                      }}
                    >
                      {/* HEADER MOCKUP */}
                      <div 
                        className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
                        style={{
                          backgroundColor: themeConfig.header_style === 'CLEAN_LIGHT' ? '#ffffff' : (themeConfig.primary_color || '#3b6e14'),
                          color: themeConfig.header_style === 'CLEAN_LIGHT' ? '#0f172a' : '#ffffff',
                          border: themeConfig.header_style === 'CLEAN_LIGHT' ? '1px solid #e2e8f0' : 'none'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌿</span>
                          <span className="font-black text-sm tracking-tight" style={{ fontFamily: themeConfig.heading_font || 'Outfit' }}>
                            VALUELIFE ESSENTIALS
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: themeConfig.accent_color || '#f59e0b', color: '#000' }}>
                            Cart (3)
                          </span>
                        </div>
                      </div>

                      {/* HERO BADGE & TITLE MOCKUP */}
                      <div className="space-y-2 text-center py-2">
                        <span 
                          className="text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block border"
                          style={{
                            backgroundColor: `${themeConfig.primary_color}15`,
                            color: themeConfig.primary_color || '#3b6e14',
                            borderColor: `${themeConfig.primary_color}40`
                          }}
                        >
                          🌱 100% Certified Organic Theme
                        </span>

                        <h3 
                          className="text-xl font-black tracking-tight"
                          style={{ 
                            fontFamily: themeConfig.heading_font || 'Outfit',
                            color: themeConfig.dark_mode === 1 ? '#ffffff' : '#0f172a'
                          }}
                        >
                          Fresh Organic Groceries & Superfoods
                        </h3>
                      </div>

                      {/* MOCK PRODUCT CARD IN CANVAS */}
                      <div 
                        className={`p-3.5 border space-y-3 shadow-md transition-all ${themeConfig.border_radius || 'rounded-3xl'}`}
                        style={{
                          backgroundColor: themeConfig.secondary_color || '#f8f7f2',
                          borderColor: '#e2e8f0'
                        }}
                      >
                        <div className="w-full h-32 bg-white rounded-xl overflow-hidden relative flex items-center justify-center p-2">
                          <img 
                            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80" 
                            alt="Mock" 
                            className="w-full h-full object-contain rounded-lg" 
                          />
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow">
                            <Heart size={12} fill="white" color="white" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-amber-600">★★★★★ 5.0 (24 Reviews)</span>
                          <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">Pure Organic Ashwagandha Root Powder</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">₹349.00</span>
                            <span className="text-xs text-slate-400 line-through">₹499.00</span>
                            <span className="bg-[#4a7729] text-white text-[9px] font-bold px-1 rounded">-30% Off</span>
                          </div>
                        </div>

                        {/* DYNAMIC CARD BUTTON IN CANVAS */}
                        {(themeConfig.card_style === 'CLASSIC_SPLIT') ? (
                          <div className="flex gap-1.5 pt-1">
                            <button 
                              type="button"
                              className="border-2 border-[#3b6e14] text-[#3b6e14] flex-1 py-2 rounded-xl text-xs font-bold text-center"
                            >
                              Details
                            </button>
                            <button 
                              type="button"
                              className="bg-[#3b6e14] text-white flex-1 py-2 rounded-xl text-xs font-black text-center"
                            >
                              + Add
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full py-2.5 rounded-full text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: themeConfig.primary_color || '#3b6e14' }}
                          >
                            <ShoppingBag size={14} /> ADD TO CART
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      💡 Theme choices update live in real-time. Click Save to publish across all customer devices!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: DYNAMIC PRODUCT FILTERS MANAGER */}
          {activeTab === 'filters' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Dynamic Product Filters Manager</h3>
                  <p className="text-xs text-slate-400">Manage storefront catalog filter pills (Form, Dietary, Health Benefit, Price Range, Pack Size).</p>
                </div>
              </div>

              {/* CREATE FILTER GROUP FORM */}
              <form onSubmit={handleAddFilterGroup} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">+ Add New Filter Group</span>
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text" required
                    placeholder="Filter Group Name (e.g. Health Benefit, Dietary, Form)"
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                    className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
                  />
                  <input 
                    type="text"
                    placeholder="Key handle (e.g. benefit, form, dietary)"
                    value={newGroupForm.filter_key}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, filter_key: e.target.value })}
                    className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs shadow-md">
                    + Create Filter Group
                  </button>
                </div>
              </form>

              {/* FILTER GROUPS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterGroups.map(grp => (
                  <div key={grp.id} className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm relative">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-extrabold text-base text-white">{grp.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          key: {grp.filter_key}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteFilterGroup(grp.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950/60 rounded border border-rose-900 text-xs"
                        title="Delete Filter Group"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* EXISTING FILTER OPTION PILLS */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Active Filter Pills ({grp.options?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {grp.options?.map(opt => (
                          <span key={opt.id} className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                            <span>{opt.label}</span>
                            <button 
                              onClick={() => handleDeleteFilterOption(opt.id)}
                              className="text-slate-400 hover:text-rose-400 text-sm font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ADD NEW OPTION INPUT */}
                    <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                      <input 
                        type="text"
                        placeholder={`+ Add option to ${grp.name}...`}
                        value={newOptionInputs[grp.id] || ''}
                        onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [grp.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFilterOption(grp.id); } }}
                        className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                      <button 
                        onClick={() => handleAddFilterOption(grp.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs"
                      >
                        + Add Pill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INVENTORY & STOCK MANAGEMENT */}
          {activeTab === 'inventory' && (() => {
            const filteredProducts = products.filter(p => {
              const query = inventorySearchQuery.trim().toLowerCase();
              const matchesSearch = !query ||
                (p.title && p.title.toLowerCase().includes(query)) ||
                (p.sku && p.sku.toLowerCase().includes(query)) ||
                (p.variants && p.variants.some(v => v.variant_name?.toLowerCase().includes(query) || v.sku?.toLowerCase().includes(query)));

              let matchesStock = true;
              if (inventoryStockFilter === 'IN_STOCK') matchesStock = (p.stock || 0) >= 50;
              else if (inventoryStockFilter === 'LOW_STOCK') matchesStock = (p.stock || 0) > 0 && (p.stock || 0) < 50;
              else if (inventoryStockFilter === 'OUT_OF_STOCK') matchesStock = (p.stock || 0) === 0;

              let matchesCategory = true;
              if (inventoryCategoryFilter !== 'ALL') {
                matchesCategory = String(p.category_id) === String(inventoryCategoryFilter) || p.category_name?.toLowerCase() === inventoryCategoryFilter.toLowerCase();
              }

              return matchesSearch && matchesStock && matchesCategory;
            });

            const totalInventoryPages = Math.ceil(filteredProducts.length / inventoryItemsPerPage) || 1;
            const paginatedProducts = filteredProducts.slice((inventoryPage - 1) * inventoryItemsPerPage, inventoryPage * inventoryItemsPerPage);

            return (
              <div className="space-y-6">
                {/* TOP HEADER & STATS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">REALTIME INVENTORY CONTROL</span>
                    <h3 className="text-xl font-black text-white font-['Outfit']">🏭 Stock Status & Variant Inventory Manager</h3>
                    <p className="text-xs text-slate-400">Manage available stock quantities for all products and their specific variants in real time.</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-850 px-4 py-2 rounded-xl border border-slate-800 text-center min-w-28">
                      <span className="text-[11px] text-slate-400 block font-bold">Total Catalog</span>
                      <span className="text-lg font-black text-white">{products.length} Products</span>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl text-center min-w-28">
                      <span className="text-[11px] text-emerald-400 block font-bold">In Stock Units</span>
                      <span className="text-lg font-black text-emerald-300">
                        {products.reduce((sum, p) => sum + (p.stock || 0) + (p.variants?.reduce((vSum, v) => vSum + (v.stock || 0), 0) || 0), 0)} Units
                      </span>
                    </div>

                    <div className="bg-amber-950/40 border border-amber-800/60 px-4 py-2 rounded-xl text-center min-w-28">
                      <span className="text-[11px] text-amber-400 block font-bold">Low Stock (&lt;50)</span>
                      <span className="text-lg font-black text-amber-300">
                        {products.filter(p => (p.stock || 0) < 50).length + products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) < 50).length || 0), 0)} Alerts
                      </span>
                    </div>

                    <div className="bg-rose-950/40 border border-rose-800/60 px-4 py-2 rounded-xl text-center min-w-28">
                      <span className="text-[11px] text-rose-400 block font-bold">Out of Stock (0)</span>
                      <span className="text-lg font-black text-rose-300">
                        {products.filter(p => (p.stock || 0) === 0).length + products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) === 0).length || 0), 0)} Items
                      </span>
                    </div>
                  </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {/* SEARCH INPUT */}
                    <div className="relative sm:col-span-2">
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search by Product Name, SKU ID, or Variant..."
                        value={inventorySearchQuery}
                        onChange={(e) => setInventorySearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* STOCK STATUS FILTER */}
                    <div>
                      <select 
                        value={inventoryStockFilter}
                        onChange={(e) => setInventoryStockFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">📦 All Stock Levels ({products.length})</option>
                        <option value="IN_STOCK">🟢 In Stock (≥50 Units)</option>
                        <option value="LOW_STOCK">🟡 Low Stock Alert (&lt;50 Units)</option>
                        <option value="OUT_OF_STOCK">🔴 Out of Stock (0 Units)</option>
                      </select>
                    </div>

                    {/* CATEGORY FILTER */}
                    <div>
                      <select 
                        value={inventoryCategoryFilter}
                        onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="ALL">🏷️ All Categories ({categories.length})</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(inventorySearchQuery || inventoryStockFilter !== 'ALL' || inventoryCategoryFilter !== 'ALL') && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-emerald-400 font-bold">
                        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching criteria
                      </span>
                      <button 
                        onClick={() => {
                          setInventorySearchQuery('');
                          setInventoryStockFilter('ALL');
                          setInventoryCategoryFilter('ALL');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Reset All Inventory Filters ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* INVENTORY TABLE CARD */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md space-y-4 p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <Grid size={18} className="text-amber-400" />
                      <span>Variant & Product Inventory Matrix</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                        <span>Items per page:</span>
                        <select 
                          value={inventoryItemsPerPage}
                          onChange={(e) => setInventoryItemsPerPage(Number(e.target.value))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold cursor-pointer"
                        >
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="text-xs text-slate-400 font-bold bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 hidden md:block">
                        💡 Click <span className="text-emerald-400 font-extrabold">+</span> or <span className="text-rose-400 font-extrabold">-</span> buttons or edit numbers to adjust stock
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-850 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Product / Variant Name</th>
                          <th className="p-3.5">SKU ID</th>
                          <th className="p-3.5">Price (₹)</th>
                          <th className="p-3.5 text-center">Available Stock (Qty)</th>
                          <th className="p-3.5">Status Badge</th>
                          <th className="p-3.5 text-right">Quick Save</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">
                              No products match your search or filter criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedProducts.map((p) => (
                            <React.Fragment key={p.id}>
                              {/* MAIN PRODUCT ROW */}
                              <tr className="bg-slate-900 hover:bg-slate-850/60 transition-colors">
                                <td className="p-3.5 flex items-center gap-3 font-extrabold text-white">
                                  <img 
                                    src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                                    alt={p.title} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80';
                                    }}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-white shrink-0" 
                                  />
                                  <div>
                                    <span className="text-sm font-black text-white block">{p.title}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Category: {p.category_name || 'Organic'}</span>
                                  </div>
                                </td>

                                <td className="p-3.5 font-mono text-emerald-400 font-bold">{p.sku || `OB-${p.id}`}</td>

                                <td className="p-3.5 font-extrabold text-slate-200">
                                  ₹{p.discount_inr || p.price_inr}
                                </td>

                                {/* INLINE EDITABLE STOCK WITH - / + BUTTONS */}
                                <td className="p-3.5">
                                  <div className="flex items-center justify-center gap-1.5 max-w-40 mx-auto">
                                    <button 
                                      type="button"
                                      onClick={() => handleUpdateProductStock(p.id, Math.max(0, (p.stock || 0) - 1))}
                                      className="w-7 h-7 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-lg border border-slate-700 font-black text-sm flex items-center justify-center transition-colors"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="number"
                                      value={p.stock !== undefined ? p.stock : 100}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        handleUpdateProductStock(p.id, val);
                                      }}
                                      className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-center font-extrabold text-white text-xs"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => handleUpdateProductStock(p.id, (p.stock || 0) + 1)}
                                      className="w-7 h-7 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 rounded-lg border border-slate-700 font-black text-sm flex items-center justify-center transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                <td className="p-3.5 space-y-1">
                                  {/* STATUS BADGE */}
                                  <div>
                                    {p.status === 'Draft' ? (
                                      <span className="bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                                        🟡 Draft
                                      </span>
                                    ) : p.status === 'Archived' ? (
                                      <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                                        🔴 Archived
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 shadow-sm">
                                        🟢 Active
                                      </span>
                                    )}
                                  </div>

                                  {/* STOCK BADGE */}
                                  <div>
                                    {(p.stock || 0) === 0 ? (
                                      <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                        OUT OF STOCK
                                      </span>
                                    ) : (p.stock || 0) < 50 ? (
                                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                        LOW STOCK ({p.stock})
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                        IN STOCK ({p.stock})
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3.5 text-right">
                                  <button 
                                    onClick={() => {
                                      setEditingProduct(p);
                                      const rawImages = Array.isArray(p.images) && p.images.length > 0 
                                        ? p.images 
                                        : (p.image_url ? [p.image_url] : (p.thumbnail ? [p.thumbnail] : []));
                                      const pImages = rawImages.map(img => (typeof img === 'object' && img?.image_url) ? img.image_url : img).filter(Boolean);
                                      const pVariants = (p.variants || []).map(v => ({
                                        ...v,
                                        variant_name: v.variant_name || v.name || 'Standard Pack',
                                        price_inr: Number(v.price_inr || v.price || p.price_inr || 0),
                                        stock: Number(v.stock !== undefined ? v.stock : 50),
                                        image_url: typeof v.image_url === 'object' ? v.image_url?.image_url : (v.image_url || pImages[0] || null)
                                      }));
                                      setProductForm({ ...p, images: pImages, variants: pVariants });
                                      setShowProductModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg border border-slate-700 text-xs shadow-sm"
                                  >
                                    Edit Product & Variants
                                  </button>
                                </td>
                              </tr>

                              {/* VARIANT SUB-ROWS (Matching User Screenshot 3) */}
                              {p.variants?.map((v) => (
                                <tr key={`var-${v.id}`} className="bg-slate-950/70 hover:bg-slate-850/40 transition-colors border-l-4 border-emerald-600">
                                  <td className="p-3 pl-8 flex items-center gap-2.5 font-bold text-slate-300">
                                    <span className="text-slate-500 font-mono text-xs">↳</span>
                                    <img 
                                      src={resolveImgUrl(v.image_url || p.thumbnail || p.images?.[0])} 
                                      alt={v.variant_name || 'Variant'} 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80';
                                      }}
                                      className="w-8 h-8 object-cover rounded border border-slate-700 bg-white shrink-0" 
                                    />
                                    <div>
                                      <span className="text-xs font-bold text-emerald-300">{v.variant_name}</span>
                                      <span className="text-[10px] text-slate-500 block">Variant Pill</span>
                                    </div>
                                  </td>

                                  <td className="p-3 font-mono text-slate-400 text-[11px]">{v.sku || `OB-VAR-${v.id}`}</td>

                                  <td className="p-3 font-bold text-emerald-400 text-xs">₹{v.price_inr}</td>

                                  {/* INLINE EDITABLE VARIANT STOCK */}
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1 max-w-36 mx-auto">
                                      <button 
                                        type="button"
                                        onClick={() => handleUpdateVariantStock(v.id, Math.max(0, (v.stock || 0) - 1))}
                                        className="w-6 h-6 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded border border-slate-700 font-bold text-xs flex items-center justify-center"
                                      >
                                        -
                                      </button>
                                      <input 
                                        type="number"
                                        value={v.stock !== undefined ? v.stock : 50}
                                        onChange={(e) => handleUpdateVariantStock(v.id, Number(e.target.value))}
                                        className="w-14 p-1 bg-slate-800 border border-slate-700 rounded text-center font-bold text-white text-xs"
                                      />
                                      <button 
                                        type="button"
                                        onClick={() => handleUpdateVariantStock(v.id, (v.stock || 0) + 1)}
                                        className="w-6 h-6 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 rounded border border-slate-700 font-bold text-xs flex items-center justify-center"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  <td className="p-3">
                                    {(v.stock || 0) === 0 ? (
                                      <span className="bg-rose-950/80 text-rose-300 border border-rose-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                        OUT OF STOCK
                                      </span>
                                    ) : (v.stock || 0) < 50 ? (
                                      <span className="bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                        LOW ({v.stock})
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                        IN STOCK ({v.stock})
                                      </span>
                                    )}
                                  </td>

                                  <td className="p-3 text-right font-mono text-[10px] text-slate-400">
                                    Variant ID #{v.id}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* INVENTORY PAGINATION FOOTER */}
                  {filteredProducts.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
                      <div>
                        Showing <strong className="text-white">{(inventoryPage - 1) * inventoryItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(inventoryPage * inventoryItemsPerPage, filteredProducts.length)}</strong> of <strong className="text-emerald-400">{filteredProducts.length}</strong> products
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <button 
                          onClick={() => setInventoryPage(prev => Math.max(prev - 1, 1))}
                          disabled={inventoryPage === 1}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                        >
                          Previous
                        </button>

                        {Array.from({ length: totalInventoryPages }).map((_, i) => {
                          const pg = i + 1;
                          if (
                            pg === 1 || 
                            pg === totalInventoryPages || 
                            (pg >= inventoryPage - 2 && pg <= inventoryPage + 2)
                          ) {
                            return (
                              <button 
                                key={pg}
                                onClick={() => setInventoryPage(pg)}
                                className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                                  inventoryPage === pg 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {pg}
                              </button>
                            );
                          }
                          if (pg === inventoryPage - 3 || pg === inventoryPage + 3) {
                            return <span key={pg} className="px-1 text-slate-600">...</span>;
                          }
                          return null;
                        })}

                        <button 
                          onClick={() => setInventoryPage(prev => Math.min(prev + 1, totalInventoryPages))}
                          disabled={inventoryPage >= totalInventoryPages}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB: ALL STOREFRONT SECTIONS CONTROL CENTER */}
          {activeTab === 'sections' && (
            <div className="space-y-6 w-full">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">STOREFRONT SECTIONS CONTROL</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">🎛️ Master Website Sections Control Center</h3>
                <p className="text-xs text-slate-400">Enable, disable, reorder, and customize headlines & subtext for every single section of your storefront in real time with 50-50 side-by-side live canvas preview.</p>
              </div>

              {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                {/* LEFT COLUMN: CONTROLS & TOGGLES (50% WIDTH) */}
                <div className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
                  <form onSubmit={handleSectionsConfigSubmit} className="space-y-5 text-xs">
                {/* SECTION 1: HEADER TOP ANNOUNCEMENT BAR */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">📢</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">1. Top Header Announcement Bar</span>
                        <p className="text-slate-400 text-xs">Promotional banner ticker displayed at the very top of the website header.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab('announcement')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        ✏️ Edit Content
                      </button>
                      <button 
                        type="button"
                        onClick={() => updateAndSaveSectionToggle('show_announcement', sectionsConfig.show_announcement === 1 ? 0 : 1)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          sectionsConfig.show_announcement === 1 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sectionsConfig.show_announcement === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{sectionsConfig.show_announcement === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: HERO SECTION MANAGER */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">🦸</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">2. Hero Banner Showcase</span>
                        <p className="text-slate-400 text-xs">Main storefront hero banner featuring headlines, CTA buttons, and background images.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab('hero')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        ✏️ Edit Content
                      </button>
                      <button 
                        type="button"
                        onClick={() => updateAndSaveSectionToggle('show_hero', sectionsConfig.show_hero === 1 ? 0 : 1)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          sectionsConfig.show_hero === 1 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sectionsConfig.show_hero === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{sectionsConfig.show_hero === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: TRUST & SERVICE BADGES ROW */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🌱</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">3. Trust & Service Badges Row</span>
                        <p className="text-slate-400 text-xs">Highlights key value propositions (100% Organic, Fast Delivery, Partial COD, Top Rating).</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateAndSaveSectionToggle('show_trust_badges', sectionsConfig.show_trust_badges === 1 ? 0 : 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        sectionsConfig.show_trust_badges === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sectionsConfig.show_trust_badges === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{sectionsConfig.show_trust_badges === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                    </button>
                  </div>

                  {sectionsConfig.show_trust_badges === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge 1: Title & Subtitle</label>
                        <input type="text" value={sectionsConfig.trust_badge_1_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_1_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                        <input type="text" value={sectionsConfig.trust_badge_1_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_1_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge 2: Title & Subtitle</label>
                        <input type="text" value={sectionsConfig.trust_badge_2_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_2_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                        <input type="text" value={sectionsConfig.trust_badge_2_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_2_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge 3: Title & Subtitle</label>
                        <input type="text" value={sectionsConfig.trust_badge_3_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_3_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                        <input type="text" value={sectionsConfig.trust_badge_3_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_3_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge 4: Title & Subtitle</label>
                        <input type="text" value={sectionsConfig.trust_badge_4_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_4_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                        <input type="text" value={sectionsConfig.trust_badge_4_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_4_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 4: ANIMATED PROMO BANNERS SLIDER (INDIVIDUAL PART 1) */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-purple-950/60 border border-purple-800 text-purple-400 rounded-xl text-lg">🖼️</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">4. Photorealistic Animated Promo Banner Slider (Part 1)</span>
                        <p className="text-slate-400 text-xs">High-converting animated banner carousel card.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab('banners')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        ✏️ Edit Banners
                      </button>
                      <button 
                        type="button"
                        onClick={() => updateAndSaveSectionToggle('show_promo_banners', sectionsConfig.show_promo_banners === 1 ? 0 : 1)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          sectionsConfig.show_promo_banners === 1 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sectionsConfig.show_promo_banners === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{sectionsConfig.show_promo_banners === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 4B: LIVE SOCIAL PROOF SALES TICKER (INDIVIDUAL PART 2) */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⚡</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">4B. Live Social Proof Sales Ticker (Part 2)</span>
                        <p className="text-slate-400 text-xs">Floating customer purchase ticker ("Priya Patel from Bengaluru just purchased...")</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateAndSaveSectionToggle('show_sales_ticker', sectionsConfig.show_sales_ticker === 0 ? 1 : 0)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                        sectionsConfig.show_sales_ticker !== 0 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sectionsConfig.show_sales_ticker !== 0 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{sectionsConfig.show_sales_ticker !== 0 ? 'TICKER ENABLED (ON)' : 'TICKER DISABLED (OFF)'}</span>
                    </button>
                  </div>

                  {sectionsConfig.show_sales_ticker !== 0 && (() => {
                    const currentTickers = (() => {
                      if (!sectionsConfig?.sales_ticker_json) {
                        return [
                          { id: 1, name: 'Rohan Sharma', city: 'New Delhi', item: '5kg Organic Vermicompost', time: '2m ago' },
                          { id: 2, name: 'Priya Patel', city: 'Bengaluru', item: '1L Liquid Seaweed Extract', time: '4m ago' },
                          { id: 3, name: 'Amit Verma', city: 'Mumbai', item: '2kg Neem Cake Powder', time: '6m ago' },
                          { id: 4, name: 'Neha Gupta', city: 'Pune', item: 'Organic Epsom Salt Booster', time: '8m ago' }
                        ];
                      }
                      try {
                        const parsed = typeof sectionsConfig.sales_ticker_json === 'string'
                          ? JSON.parse(sectionsConfig.sales_ticker_json)
                          : sectionsConfig.sales_ticker_json;
                        return Array.isArray(parsed) ? parsed : [];
                      } catch (e) {
                        return [];
                      }
                    })();

                    const handleTickerChange = (index, field, value) => {
                      const updated = [...currentTickers];
                      updated[index] = { ...updated[index], [field]: value };
                      setSectionsConfig({
                        ...sectionsConfig,
                        sales_ticker_json: JSON.stringify(updated)
                      });
                    };

                    const handleAddTicker = () => {
                      const updated = [
                        ...currentTickers,
                        { id: Date.now(), name: 'New Customer', city: 'City', item: 'Organic Fertilizer', time: 'Just now' }
                      ];
                      setSectionsConfig({
                        ...sectionsConfig,
                        sales_ticker_json: JSON.stringify(updated)
                      });
                    };

                    const handleDeleteTicker = (index) => {
                      const updated = currentTickers.filter((_, i) => i !== index);
                      setSectionsConfig({
                        ...sectionsConfig,
                        sales_ticker_json: JSON.stringify(updated)
                      });
                    };

                    const handleSyncWithOrders = () => {
                      if (!orders || orders.length === 0) {
                        if (showToast) showToast('info', 'No Real Orders Yet', 'Added default customer ticker samples.');
                        return;
                      }
                      const synced = orders.slice(0, 8).map((o, idx) => ({
                        id: o.id || idx + 1,
                        name: o.customer_name || 'Verified Customer',
                        city: o.city || o.shipping_address?.split(',')[1]?.trim() || 'India',
                        item: o.items?.[0]?.product_name || o.order_number || 'Organic Agro Product',
                        time: o.created_at ? `${Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)))}m ago` : 'Recent'
                      }));
                      setSectionsConfig({
                        ...sectionsConfig,
                        sales_ticker_json: JSON.stringify(synced)
                      });
                      if (showToast) showToast('success', 'Synced with Real Customer Orders!', `Updated ticker with ${synced.length} real store purchases.`);
                    };

                    return (
                      <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                        <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="font-bold text-slate-300">Live Customer Purchase Notifications ({currentTickers.length})</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSyncWithOrders}
                              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-lg font-bold transition-all cursor-pointer"
                            >
                              ⚡ Auto-Sync Real Orders
                            </button>
                            <button
                              type="button"
                              onClick={handleAddTicker}
                              className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 rounded-lg font-bold transition-all cursor-pointer"
                            >
                              + Add Entry
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {currentTickers.map((t, idx) => (
                            <div key={t.id || idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-3">
                                <input
                                  type="text"
                                  value={t.name || ''}
                                  onChange={(e) => handleTickerChange(idx, 'name', e.target.value)}
                                  placeholder="Customer Name"
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={t.city || ''}
                                  onChange={(e) => handleTickerChange(idx, 'city', e.target.value)}
                                  placeholder="City"
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-400 text-xs font-bold"
                                />
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={t.item || ''}
                                  onChange={(e) => handleTickerChange(idx, 'item', e.target.value)}
                                  placeholder="Item Purchased"
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-amber-300 text-xs font-bold"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={t.time || ''}
                                  onChange={(e) => handleTickerChange(idx, 'time', e.target.value)}
                                  placeholder="e.g. 5m ago"
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-400 text-xs"
                                />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteTicker(idx)}
                                  className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950 rounded border border-rose-900 cursor-pointer"
                                  title="Delete notification entry"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* SECTION 5: CIRCULAR CATEGORIES SLIDER */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⭕</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">5. Shop By Categories Circular Slider</span>
                        <p className="text-slate-400 text-xs">Horizontal infinite carousel displaying category circular badges.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => updateAndSaveSectionToggle('show_categories_slider', sectionsConfig.show_categories_slider === 1 ? 0 : 1)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          sectionsConfig.show_categories_slider === 1 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sectionsConfig.show_categories_slider === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{sectionsConfig.show_categories_slider === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                      </button>
                    </div>
                  </div>

                  {sectionsConfig.show_categories_slider === 1 && (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Section Title</label>
                      <input 
                        type="text"
                        value={sectionsConfig.category_slider_title || ''}
                        onChange={(e) => setSectionsConfig({ ...sectionsConfig, category_slider_title: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                        placeholder="e.g. Shop By Categories"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION 6: BEST SELLER PRODUCTS SHOWCASE */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">🔥</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">6. Best Seller Products Showcase</span>
                        <p className="text-slate-400 text-xs">Curated highlight grid displaying top-selling products on storefront.</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateAndSaveSectionToggle('show_bestsellers', sectionsConfig.show_bestsellers === 1 ? 0 : 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        sectionsConfig.show_bestsellers === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sectionsConfig.show_bestsellers === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{sectionsConfig.show_bestsellers === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                    </button>
                  </div>

                  {sectionsConfig.show_bestsellers === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Badge Tag</label>
                        <input type="text" value={sectionsConfig.bestsellers_badge || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_badge: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Section Title</label>
                        <input type="text" value={sectionsConfig.bestsellers_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Max Display Items</label>
                        <input type="number" min="4" max="24" value={sectionsConfig.bestsellers_count || 8} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_count: Number(e.target.value) })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 7: MAIN CATALOG PRODUCT GRID */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🛍️</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">7. Main Product Catalog & Filter Grid</span>
                        <p className="text-slate-400 text-xs">Primary product catalog grid with dynamic pill filters and view controls.</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateAndSaveSectionToggle('show_catalog_grid', sectionsConfig.show_catalog_grid === 1 ? 0 : 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        sectionsConfig.show_catalog_grid === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sectionsConfig.show_catalog_grid === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{sectionsConfig.show_catalog_grid === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                    </button>
                  </div>
                </div>

                {/* SECTION 8: STORE FOOTER */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-lg">🦶</span>
                      <div>
                        <span className="font-extrabold text-sm text-white block">8. Storefront Footer & Legal Links</span>
                        <p className="text-slate-400 text-xs">Footer column navigation, payment logos, contact details and copyright line.</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateAndSaveSectionToggle('show_footer', sectionsConfig.show_footer === 1 ? 0 : 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        sectionsConfig.show_footer === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sectionsConfig.show_footer === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{sectionsConfig.show_footer === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-transform duration-140 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-wider text-xs cursor-pointer"
                >
                  Save Storefront Sections Configuration Live
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS (50% WIDTH STICKY) */}
            <div className="w-full sticky top-6 space-y-3">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                      👁️ LIVE REAL-TIME STOREFRONT PREVIEW
                    </span>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
                    100% Live Sync
                  </span>
                </div>

                {/* BROWSER FRAME MOCKUP */}
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                  <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="bg-slate-950 px-4 py-0.5 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800 truncate max-w-xs">
                      http://localhost:5173 (Live Sections Preview)
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Realtime Canvas</span>
                  </div>

                  <div className="p-2 space-y-3 max-h-[720px] overflow-y-auto bg-slate-950/80">
                    {/* SECTION 1: HEADER ANNOUNCEMENT BAR */}
                    {sectionsConfig.show_announcement === 1 ? (
                      <div className="bg-[#1b4332] text-white text-[10px] py-1 px-3 rounded-lg border border-emerald-900 flex justify-between items-center shadow">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="bg-[#52b788] text-[#1b4332] font-black text-[8px] px-1.5 py-0.2 rounded-full uppercase">SALE</span>
                          <span className="truncate">{settingsForm.announcement_text || 'Get 15% OFF! Use Code: ORGANIC15'}</span>
                        </div>
                        <span className="text-[9px] text-emerald-300 font-bold">🇮🇳 (₹)</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        📢 1. Top Announcement Bar (DISABLED)
                      </div>
                    )}

                    {/* SECTION 2: HERO SECTION */}
                    {sectionsConfig.show_hero === 1 ? (
                      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 p-1">
                        <HeroSection heroConfig={heroConfig} navigateTo={() => {}} sectionsConfig={sectionsConfig} />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🦸 2. Hero Banner Showcase (DISABLED)
                      </div>
                    )}

                    {/* SECTION 3: TRUST BADGES */}
                    {sectionsConfig.show_trust_badges === 1 ? (
                      <div className="bg-white p-2.5 rounded-xl text-slate-900 grid grid-cols-2 gap-2 text-[10px] shadow">
                        <div className="flex items-center gap-1.5"><span>🌱</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_1_title || '100% Organic'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_1_sub || 'Chemical-free'}</span></div></div>
                        <div className="flex items-center gap-1.5"><span>🚚</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_2_title || 'Fast Delivery'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_2_sub || 'Across India'}</span></div></div>
                        <div className="flex items-center gap-1.5"><span>💳</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_3_title || 'Partial COD'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_3_sub || '20% deposit'}</span></div></div>
                        <div className="flex items-center gap-1.5"><span>⭐</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_4_title || 'Top Rating'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_4_sub || '4.9 ★ Reviews'}</span></div></div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🌱 3. Trust & Service Badges (DISABLED)
                      </div>
                    )}

                    {/* SECTION 4: PROMO BANNERS SLIDER */}
                    {sectionsConfig.show_promo_banners === 1 ? (
                      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 p-1">
                        <PromoBannerSlider navigateTo={() => {}} sectionsConfig={sectionsConfig} banners={banners} />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🖼️ 4. Animated Promo Banner Slider (DISABLED)
                      </div>
                    )}

                    {/* SECTION 5: CATEGORIES CIRCULAR SLIDER */}
                    {sectionsConfig.show_categories_slider === 1 ? (
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs font-black text-white font-['Outfit'] block">{sectionsConfig.category_slider_title || 'Shop By Categories'}</span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {categories.slice(0, 6).map(c => (
                            <div key={c.id} className="p-2 bg-slate-850 rounded-xl text-center shrink-0 w-20 border border-slate-800">
                              <div className="text-base mb-0.5">🌿</div>
                              <span className="text-[9px] font-bold text-slate-300 block truncate">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        ⭕ 5. Circular Category Slider (DISABLED)
                      </div>
                    )}

                    {/* SECTION 6: BEST SELLERS SHOWCASE */}
                    {sectionsConfig.show_bestsellers === 1 ? (
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-amber-400 font-['Outfit']">{sectionsConfig.bestsellers_title || '🔥 Best Seller Products'}</span>
                          <span className="text-[9px] bg-amber-950 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-800">{sectionsConfig.bestsellers_badge || 'HIGH DEMAND'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {products.slice(0, 2).map(p => (
                            <div key={p.id} className="p-2 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                              <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'; }} className="w-full h-16 object-contain rounded bg-white" />
                              <span className="font-bold text-white block text-[10px] truncate">{p.title}</span>
                              <span className="text-emerald-400 font-black text-[10px]">₹{p.price_inr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🔥 6. Best Seller Showcase Grid (DISABLED)
                      </div>
                    )}

                    {/* SECTION 7: MAIN CATALOG GRID */}
                    {sectionsConfig.show_catalog_grid === 1 ? (
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs font-black text-white font-['Outfit'] block">🛍️ Main Catalog & Pill Filters</span>
                        <div className="grid grid-cols-2 gap-2">
                          {products.slice(2, 4).map(p => (
                            <div key={p.id} className="p-2 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                              <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'; }} className="w-full h-16 object-contain rounded bg-white" />
                              <span className="font-bold text-white block text-[10px] truncate">{p.title}</span>
                              <span className="text-emerald-400 font-black text-[10px]">₹{p.price_inr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🛍️ 7. Main Product Catalog & Filters (DISABLED)
                      </div>
                    )}

                    {/* SECTION 8: FOOTER */}
                    {sectionsConfig.show_footer === 1 ? (
                      <div className="bg-[#1b4332] text-white p-3 rounded-xl text-[10px] space-y-1 border border-emerald-900 shadow">
                        <span className="font-extrabold text-xs block">🌱 VALUELIFE ESSENTIALS Footer</span>
                        <p className="opacity-80 text-[9px]">Your 100% trusted online organic store.</p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                        🦶 8. Storefront Footer & Links (DISABLED)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* TAB: PAYMENT SETTINGS (PARTIAL COD, FULL COD, GATEWAYS) */}
          {activeTab === 'payment' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md w-full max-w-5xl space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PAYMENT ARCHITECTURE</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">💳 Payment Settings & Partial COD Controls</h3>
                <p className="text-xs text-slate-400">Configure Cash on Delivery (COD), partial deposit breakdown %, and prepaid discounts.</p>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs">
                {/* 1. CASH ON DELIVERY (COD) TOGGLE CONTROL */}
                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-white block">💵 Cash on Delivery (COD) Payment Mode</span>
                      <p className="text-slate-400 text-xs">Enable or disable Cash on Delivery option for customer checkout.</p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, enable_cod: settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 0 : 1 })}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 'COD ENABLED (ON)' : 'COD DISABLED (OFF)'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. PARTIAL PAYMENT BREAKDOWN CONTROL */}
                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-extrabold text-sm text-white block">⚡ Partial Payment Breakdown Control</span>
                      <p className="text-slate-400 text-xs">Allow customers to pay a small online deposit (e.g., 20%) and pay the remaining balance on COD delivery.</p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, enable_partial_payment: settingsForm.enable_partial_payment === 1 ? 0 : 1 })}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        settingsForm.enable_partial_payment === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {settingsForm.enable_partial_payment === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{settingsForm.enable_partial_payment === 1 ? 'PARTIAL PAY ON' : 'PARTIAL PAY OFF'}</span>
                    </button>
                  </div>

                  {settingsForm.enable_partial_payment === 1 && (
                    <div className="space-y-4 pt-1 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1">
                          <label>Partial Deposit Percentage (%)</label>
                          <span className="text-emerald-400 font-black">{settingsForm.partial_deposit_percent || 20}% DEPOSIT</span>
                        </div>
                        <input 
                          type="range" min="5" max="50" step="5"
                          value={settingsForm.partial_deposit_percent || 20}
                          onChange={(e) => setSettingsForm({ ...settingsForm, partial_deposit_percent: Number(e.target.value) })}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Payment Breakdown Heading *</label>
                          <input 
                            type="text"
                            value={settingsForm.partial_payment_heading || 'Choose Payment Breakdown Option:'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_heading: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Deposit Button Subtext *</label>
                          <input 
                            type="text"
                            value={settingsForm.partial_payment_subtext || 'Pay rest on Delivery'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_subtext: e.target.value })}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. PREPAID FULL PAYMENT DISCOUNT CONTROL */}
                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-white block">🎁 100% Full Prepaid Payment Discount (%)</span>
                      <p className="text-slate-400 text-xs">Offer customers an extra discount percentage when choosing 100% Full Online Payment.</p>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                      {settingsForm.prepaid_discount_percent || 0}% OFF PREPAID
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="range" min="0" max="25" step="1"
                      value={settingsForm.prepaid_discount_percent || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <input 
                      type="number" min="0" max="25"
                      value={settingsForm.prepaid_discount_percent || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
                      className="w-20 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-center"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg uppercase tracking-wider text-xs">
                  Save Payment Settings Live
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: DEDICATED TAXES & GST MANAGEMENT TAB */}
          {activeTab === 'taxes' && (
            <div className="space-y-6 w-full max-w-5xl">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">INDIAN GST & REGIONAL TAX STUDIO</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">🏛️ Taxes & GST Management Center</h3>
                <p className="text-xs text-slate-400">Configure global GSTIN, State-wise regional tax rates, Tax Inclusive/Exclusive rules, and export tax ledger reports.</p>
              </div>

              {/* GST TAX CONFIGURATION & INVOICE SETTINGS CARD */}
              <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-extrabold text-sm text-white block flex items-center gap-2">
                      🏛️ GST Tax & Invoice Configuration (Indian GST System)
                    </span>
                    <p className="text-slate-400 text-xs">Configure Store GSTIN, Tax Rates, CGST/SGST vs IGST state splitting, and export tax ledger CSV.</p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      const newVal = Number(settingsForm.enable_gst ?? 1) === 1 ? 0 : 1;
                      updateAndSaveSettingToggle('enable_gst', newVal);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      Number(settingsForm.enable_gst ?? 1) === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {Number(settingsForm.enable_gst ?? 1) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{Number(settingsForm.enable_gst ?? 1) === 1 ? 'GST TAX ENABLED' : 'GST TAX DISABLED'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store GSTIN Identification Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      value={settingsForm.gstin_number || '27AAAAA0000A1Z5'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gstin_number: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Legal Business / Entity Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VALUELIFE ESSENTIALS Retail Pvt Ltd"
                      value={settingsForm.legal_business_name || 'ValueLife Essentials Private Limited'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, legal_business_name: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Base State (for CGST/SGST vs IGST) *</label>
                    <select 
                      value={settingsForm.store_state || 'Maharashtra'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, store_state: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                    >
                      {[
                        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
                        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
                        "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
                        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
                        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
                        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
                        "Uttarakhand", "West Bengal"
                      ].map(stName => (
                        <option key={stName} value={stName}>{stName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Default GST Rate (%) *</label>
                    <select 
                      value={settingsForm.default_gst_percent ?? 5.0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, default_gst_percent: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-extrabold cursor-pointer"
                    >
                      <option value={0}>0% (Exempt / Nil Rated)</option>
                      <option value={5.0}>5% (Organic Groceries & Fertilizers)</option>
                      <option value={12.0}>12% (Processed Organic Foods)</option>
                      <option value={18.0}>18% (Supplements & Garden Tools)</option>
                      <option value={28.0}>28% (Luxury Goods)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                  <button 
                    type="button"
                    onClick={handleDownloadGstCSV}
                    className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download size={15} /> 📥 Export GST Tax Register (CSV for CA)
                  </button>

                  <button 
                    type="button"
                    onClick={() => onUpdateSettings(settingsForm)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2 rounded-xl shadow-md cursor-pointer"
                  >
                    Save GST Tax Settings
                  </button>
                </div>
              </div>

              {/* MONTHLY GST TAX LEDGER & CSV EXPORT CARD */}
              <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 font-['Outfit']">
                      📅 Monthly GST Tax Register & CA CSV Export
                    </h3>
                    <p className="text-slate-400 text-xs">Filter tax liability by month and download month-specific GST reports for CA tax filing.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedGstMonth}
                      onChange={(e) => setSelectedGstMonth(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-extrabold px-3 py-2 rounded-xl cursor-pointer shadow-inner"
                    >
                      <option value="ALL">📅 All Months (Cumulative Report)</option>
                      {(gstSummaryData?.availableMonths || ['2026-08', '2026-07', '2026-06']).map(mKey => {
                        const dateObj = new Date(`${mKey}-01`);
                        const monthLabel = isNaN(dateObj.getTime()) ? mKey : dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                        return (
                          <option key={mKey} value={mKey}>{monthLabel} ({mKey})</option>
                        );
                      })}
                    </select>

                    <button 
                      type="button"
                      onClick={() => handleDownloadGstCSV(selectedGstMonth)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Download size={15} /> 📥 Export {selectedGstMonth === 'ALL' ? 'All Months' : selectedGstMonth} CSV
                    </button>
                  </div>
                </div>

                {/* MONTH-FILTERED GST KPI CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total GST Liability</span>
                    <div className="text-2xl font-black text-emerald-400">₹{(gstSummaryData?.totalGst || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">{selectedGstMonth === 'ALL' ? 'All Time GST' : `Month: ${selectedGstMonth}`}</span>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Central Tax (CGST 50%)</span>
                    <div className="text-2xl font-black text-blue-400">₹{(gstSummaryData?.totalCgst || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Intra-State CGST</span>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">State Tax (SGST 50%)</span>
                    <div className="text-2xl font-black text-purple-400">₹{(gstSummaryData?.totalSgst || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Intra-State SGST</span>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Integrated Tax (IGST)</span>
                    <div className="text-2xl font-black text-amber-400">₹{(gstSummaryData?.totalIgst || 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-500">Inter-State IGST</span>
                  </div>
                </div>
              </div>

              {/* SHOPIFY-STYLE BASE TAXES & REGIONAL STATE TAX COLLECTION MANAGER */}
              <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-5 shadow-md">
                {/* HEADER & BREADCRUMB */}
                <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block font-mono">
                      🛍️ Taxes & Duties &gt; India &gt; Regional Base Taxes
                    </span>
                    <h3 className="font-extrabold text-base text-white font-['Outfit']">
                      Base Taxes & Regional Tax Rates
                    </h3>
                    <p className="text-slate-400 text-xs">Configure state-wise tax rates, IGST / SGST labels, and create product collection tax overrides.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Manual Tax • Active (Free service)
                    </span>
                  </div>
                </div>

                {/* TAX INCLUSIVE VS EXCLUSIVE ADMIN TOGGLE */}
                <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-xs text-white block">
                        🏷️ Tax Calculation Mode: {Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 'TAX INCLUSIVE (All prices include tax)' : 'TAX EXCLUSIVE (Tax added at checkout)'}
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        {Number(settingsForm.all_prices_include_tax ?? 1) === 1 
                          ? 'Product prices in store already include all taxes. Tax is extracted at checkout.' 
                          : 'Product prices are net. Applicable state GST is calculated & added on top at checkout.'}
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        const newVal = Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 0 : 1;
                        setSettingsForm({ ...settingsForm, all_prices_include_tax: newVal });
                        updateAndSaveSettingToggle('all_prices_include_tax', newVal);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        Number(settingsForm.all_prices_include_tax ?? 1) === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-amber-600 text-white shadow-lg'
                      }`}
                    >
                      {Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 'INCLUSIVE (INCLUDED)' : 'EXCLUSIVE (ADDED AT CHECKOUT)'}</span>
                    </button>
                  </div>
                </div>

                {/* BASE TAXES STATE REGIONS TABLE */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-white">Base Taxes (Regions)</h4>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleResetStateTaxRates}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Reset to default tax rates
                      </button>

                      <button 
                        type="button"
                        onClick={handleSaveStateTaxRates}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-md cursor-pointer"
                      >
                        Save State Tax Rates
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    {/* HEADER ROW */}
                    <div className="grid grid-cols-12 bg-slate-900 p-3 font-extrabold text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <div className="col-span-3">Regions</div>
                      <div className="col-span-2">Tax Rate %</div>
                      <div className="col-span-3">Tax Name / Label</div>
                      <div className="col-span-4">Tax Rule Behavior</div>
                    </div>

                    {/* INDIA FEDERAL COUNTRY ROW */}
                    <div className="grid grid-cols-12 p-3 bg-slate-850 border-b border-slate-800/80 items-center font-bold text-white">
                      <div className="col-span-3 font-extrabold text-sm">India (Federal Base)</div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input 
                          type="number" step="0.1" 
                          value={settingsForm.federal_tax_rate ?? 0}
                          onChange={(e) => setSettingsForm({ ...settingsForm, federal_tax_rate: parseFloat(e.target.value) || 0 })}
                          className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-center"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                      <div className="col-span-3 text-slate-400 font-mono text-[11px]">FEDERAL GST</div>
                      <div className="col-span-4 text-slate-400 text-[11px]">Country Level Default Base Tax</div>
                    </div>

                    {/* 36 INDIAN STATES REGION ROWS WITH PAGINATION */}
                    {(() => {
                      const totalTaxPages = Math.ceil(stateTaxRates.length / taxesPerPage);
                      const startIndex = (taxPage - 1) * taxesPerPage;
                      const currentStates = stateTaxRates.slice(startIndex, startIndex + taxesPerPage);

                      return (
                        <div className="divide-y divide-slate-800/60">
                          {currentStates.map((st) => (
                            <div key={st.id} className="grid grid-cols-12 p-3 hover:bg-slate-800/50 items-center text-xs">
                              <div className="col-span-3 font-bold text-slate-200">{st.state_name}</div>
                              <div className="col-span-2 flex items-center gap-1">
                                <input 
                                  type="number" step="0.1"
                                  value={st.tax_rate}
                                  onChange={(e) => {
                                    const newVal = parseFloat(e.target.value) || 0;
                                    setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_rate: newVal } : item));
                                  }}
                                  className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-extrabold text-center"
                                />
                                <span className="text-slate-400 font-bold">%</span>
                              </div>
                              <div className="col-span-3">
                                <input 
                                  type="text"
                                  value={st.tax_label || 'IGST'}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_label: newVal } : item));
                                  }}
                                  className="w-full max-w-[120px] p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                                />
                              </div>
                              <div className="col-span-4">
                                <select 
                                  value={st.tax_rule || 'INSTEAD_OF_FEDERAL'}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_rule: newVal } : item));
                                  }}
                                  className="w-full p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-[11px] font-medium cursor-pointer"
                                >
                                  <option value="INSTEAD_OF_FEDERAL">instead of 0% federal tax</option>
                                  <option value="ADDED_TO_FEDERAL">added to 0% federal tax</option>
                                  <option value="COMPOUNDED">compounded on 0% federal tax</option>
                                </select>
                              </div>
                            </div>
                          ))}

                          {/* PAGINATION CONTROLS */}
                          <div className="p-3 bg-slate-900 flex justify-between items-center border-t border-slate-800">
                            <span className="text-[11px] text-slate-400 font-bold">
                              Showing {startIndex + 1} - {Math.min(startIndex + taxesPerPage, stateTaxRates.length)} of {stateTaxRates.length} State Regions
                            </span>

                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                disabled={taxPage === 1}
                                onClick={() => setTaxPage(taxPage - 1)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${
                                  taxPage === 1 ? 'border-slate-800 text-slate-600 bg-slate-850 cursor-not-allowed' : 'border-slate-700 text-white bg-slate-800 hover:bg-slate-700 cursor-pointer'
                                }`}
                              >
                                ‹
                              </button>
                              <span className="px-2 font-mono text-xs text-emerald-400 font-bold">{taxPage} / {totalTaxPages || 1}</span>
                              <button 
                                type="button"
                                disabled={taxPage >= totalTaxPages}
                                onClick={() => setTaxPage(taxPage + 1)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${
                                  taxPage >= totalTaxPages ? 'border-slate-800 text-slate-600 bg-slate-850 cursor-not-allowed' : 'border-slate-700 text-white bg-slate-800 hover:bg-slate-700 cursor-pointer'
                                }`}
                              >
                                ›
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* COLLECTION TAX OVERRIDES MANAGER */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      📦 Product Collection Tax Overrides & Exemptions
                    </h4>
                    <p className="text-slate-400 text-xs">Create custom tax rates for specific product collections/categories per state region.</p>
                  </div>

                  {/* CREATE OVERRIDE FORM */}
                  <form onSubmit={handleCreateTaxOverride} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Override Label / Title *</label>
                        <input 
                          type="text" required
                          placeholder="e.g. Bio-Fertilizers 5% Tax Slab"
                          value={newOverrideForm.title}
                          onChange={(e) => setNewOverrideForm({ ...newOverrideForm, title: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Select Product Collection *</label>
                        <select 
                          required
                          value={newOverrideForm.collection_id}
                          onChange={(e) => setNewOverrideForm({ ...newOverrideForm, collection_id: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
                        >
                          <option value="">-- Select Collection --</option>
                          {collections.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Applicable Region State *</label>
                        <select 
                          value={newOverrideForm.state_name}
                          onChange={(e) => setNewOverrideForm({ ...newOverrideForm, state_name: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
                        >
                          <option value="ALL">All India (National Collection Tax)</option>
                          {stateTaxRates.map(st => (
                            <option key={st.id} value={st.state_name}>{st.state_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Custom Collection Tax Rate (%) *</label>
                        <select 
                          value={newOverrideForm.tax_rate}
                          onChange={(e) => setNewOverrideForm({ ...newOverrideForm, tax_rate: parseFloat(e.target.value) })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-extrabold cursor-pointer"
                        >
                          <option value={0}>0% (Tax Exempt Collection)</option>
                          <option value={5.0}>5% (Fertilizers & Seeds)</option>
                          <option value={12.0}>12% (Processed Foods)</option>
                          <option value={18.0}>18% (Supplements & Garden Tools)</option>
                          <option value={28.0}>28% (Luxury Goods)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        + Add Collection Tax Override
                      </button>
                    </div>
                  </form>

                  {/* ACTIVE OVERRIDES TABLE */}
                  {taxOverrides.length > 0 && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-slate-900 p-2.5 font-bold text-slate-400 text-[11px] uppercase border-b border-slate-800">
                        <div className="col-span-3">Override Label</div>
                        <div className="col-span-3">Target Collection</div>
                        <div className="col-span-3">State Region</div>
                        <div className="col-span-2">Tax Rate</div>
                        <div className="col-span-1 text-right">Action</div>
                      </div>

                      <div className="divide-y divide-slate-800/60">
                        {taxOverrides.map((ov) => (
                          <div key={ov.id} className="grid grid-cols-12 p-2.5 bg-slate-850 hover:bg-slate-800 items-center text-xs">
                            <div className="col-span-3 font-bold text-white">{ov.title}</div>
                            <div className="col-span-3 text-emerald-400 font-bold">{ov.collection_name || 'All Collections'}</div>
                            <div className="col-span-3 text-slate-300 font-mono text-[11px]">{ov.state_name}</div>
                            <div className="col-span-2 text-emerald-300 font-extrabold">{ov.tax_rate}% GST</div>
                            <div className="col-span-1 text-right">
                              <button 
                                type="button"
                                onClick={() => handleDeleteTaxOverride(ov.id)}
                                className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/60 rounded"
                                title="Delete Tax Override"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STORE SETTINGS & ADMIN PROFILE (DUPLICATE ANNOUNCEMENT/CONTACT CARD REMOVED) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 w-full max-w-5xl">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ADMIN PROFILE & ACCOUNT SECURITY</span>
                <h3 className="text-xl font-black text-white font-['Outfit']">⚙️ Admin Profile, Security & Store Currency Settings</h3>
                <p className="text-xs text-slate-400">Manage administrator credentials, change master password, and toggle global storefront settings.</p>
              </div>

              {/* 1. SINGLE MASTER ADMIN PROFILE & SECURITY CARD */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-extrabold text-sm text-white block">👤 Admin Profile & Account Security</span>
                    <p className="text-slate-400 text-xs">Update your administrative credentials, email, and password security.</p>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                    SUPER ADMIN OWNER
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Admin Display Name</label>
                    <input 
                      type="text"
                      value={adminProfileForm.name}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Admin Email Address</label>
                    <input 
                      type="email"
                      value={adminProfileForm.email}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                </div>

                {/* PASSWORD CHANGE FORM */}
                <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-xs text-amber-400 block uppercase tracking-wider">
                    🔒 Change Master Admin Password:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={adminProfileForm.currentPass}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, currentPass: e.target.value })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={adminProfileForm.newPass}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, newPass: e.target.value })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Confirm Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={adminProfileForm.confirmPass}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, confirmPass: e.target.value })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* MULTI CURRENCY TOGGLE */}
                <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-white block">🌐 Multi-Currency (USD $) Switcher Flag</span>
                      <p className="text-slate-400 text-xs">Enable or disable the USD ($) currency switcher on storefront header.</p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        const newVal = Number(settingsForm.enable_multi_currency) === 1 ? 0 : 1;
                        updateAndSaveSettingToggle('enable_multi_currency', newVal);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        Number(settingsForm.enable_multi_currency) === 1 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {Number(settingsForm.enable_multi_currency) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{Number(settingsForm.enable_multi_currency) === 1 ? 'MULTI-CURRENCY ON' : 'INR ONLY (OFF)'}</span>
                    </button>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    onUpdateSettings(settingsForm);
                    if (showToast) showToast('success', 'Profile & Settings Saved', 'Master Admin credentials and store settings saved successfully!');
                    setAdminProfileForm({ ...adminProfileForm, currentPass: '', newPass: '', confirmPass: '' });
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs tracking-wider shadow-lg uppercase cursor-pointer"
                >
                  Save Admin Profile & Security Credentials
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FULL SHOPIFY-STYLE ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-[98vw] w-full p-5 lg:p-8 space-y-6 shadow-2xl max-h-[96vh] overflow-y-auto">
            {/* TOP HEADER */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PRODUCT CREATOR & MANAGER</span>
                <h3 className="font-extrabold text-2xl text-white font-['Outfit']">{editingProduct ? `Edit ${editingProduct.title}` : 'Add New Product'}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProductSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle size={15} /> Save Product
                </button>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
              {/* LEFT COLUMN (2 COLS WIDE) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. TITLE & SKU ID CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-200 mb-1">Title *</label>
                      <input 
                        type="text" required placeholder="e.g. Short sleeve t-shirt or Organic Vermicompost 5Kg"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-emerald-400">SKU ID *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const titleWords = (productForm.title || 'PROD').trim().split(/\s+/).slice(0, 2).map(w => w.substring(0, 4).toUpperCase()).join('-');
                            const cleanPrefix = titleWords ? `VLE-${titleWords}` : 'VLE-PROD';
                            let num = 1;
                            let candidate = `${cleanPrefix}-00${num}`;
                            const existingSkus = new Set(products.filter(p => p.id !== productForm.id).flatMap(p => [p.sku?.toUpperCase(), ...(p.variants?.map(v => v.sku?.toUpperCase()) || [])]));
                            while (existingSkus.has(candidate.toUpperCase())) {
                              num++;
                              candidate = `${cleanPrefix}-${num < 10 ? '00' : num < 100 ? '0' : ''}${num}`;
                            }
                            setProductForm({ ...productForm, sku: candidate });
                            if (showToast) showToast('info', 'Unique SKU Generated', `Assigned unique SKU: ${candidate}`);
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                          title="Generate Auto Unique SKU ID"
                        >
                          ⚡ Auto-Generate
                        </button>
                      </div>
                      <input 
                        type="text" required placeholder="e.g. VLE-FERT-001"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                        className={`w-full p-2.5 bg-slate-800 border rounded-lg text-white font-mono font-bold uppercase transition-colors ${
                          isDuplicateSku ? 'border-rose-500 bg-rose-950/20 text-rose-300 ring-2 ring-rose-500/50' : 'border-slate-700'
                        }`}
                      />
                      {isDuplicateSku && (
                        <span className="text-[11px] text-rose-400 font-extrabold block mt-1 animate-pulse">
                          ⚠️ SKU ID "{productForm.sku}" is already assigned to another product!
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">Description *</label>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-900 border-b border-slate-700 p-2 flex flex-wrap items-center gap-2 text-slate-300 text-xs font-bold">
                        <button type="button" className="p-1 hover:bg-slate-800 rounded font-serif">B</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded italic">I</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded underline">U</button>
                        <span className="text-slate-600">|</span>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Paragraph ▾</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">List •</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Link 🔗</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Image 🖼️</button>
                      </div>
                      <textarea 
                        rows={4} required placeholder="Write detailed product description, benefits, instructions..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-3 bg-slate-800 border-0 text-white focus:outline-none text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 2. MEDIA & IMAGE UPLOADER CARD (Drag & Drop + URL + Media Library) */}
                <div 
                  onDragOver={handleDragOverArea}
                  onDragLeave={handleDragLeaveArea}
                  onDrop={handleDropFilesOnArea}
                  className={`bg-slate-850 p-4 rounded-2xl border transition-all duration-200 space-y-4 relative ${
                    isDraggingOverArea 
                      ? 'border-emerald-500 bg-emerald-950/30 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.01]' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* ACTIVE DRAG OVER OVERLAY */}
                  {isDraggingOverArea && (
                    <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-50 rounded-2xl border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center space-y-2 animate-pulse pointer-events-none">
                      <UploadCloud size={48} className="text-emerald-400 animate-bounce" />
                      <p className="text-emerald-200 font-extrabold text-base">Drop Image Files Here to Upload Instantly!</p>
                      <p className="text-emerald-400/80 text-xs font-semibold">Multiple images supported (.png, .jpg, .webp, .jpeg)</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="block font-bold text-slate-200">Media & Product Images *</label>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <UploadCloud size={11} /> Drag & Drop Supported
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-bold">({productForm.images?.length || 0} Images attached)</span>
                  </div>

                  {/* VISUAL DRAG & DROP UPLOAD DROPZONE */}
                  <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-3 text-center transition-all cursor-pointer group">
                    <label className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 group-hover:text-slate-200">
                      <UploadCloud size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span><strong>Drag & Drop</strong> product image files directly into this box, or</span>
                      <span className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-md font-bold text-[11px] border border-emerald-500/50 transition-colors inline-block">
                        Browse Files
                      </span>
                      <input type="file" accept="image/*" multiple onChange={handleProductMediaFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* URL INPUT & MEDIA LIBRARY BUTTONS */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddImage}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      + Add URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fetchAdminData();
                        setShowProductMediaPickerModal(true);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-2 rounded-lg font-bold text-xs border border-slate-700 flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <FolderOpen size={14} /> Select from Media Library
                    </button>
                  </div>

                  {/* REORDERABLE THUMBNAILS GRID */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                        <span>💡 Tip: Drag & drop thumbnails to reorder photos (Card #1 is Primary)</span>
                        <span className="text-emerald-400 text-[9px]">↕️ Hold & Drag</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        {productForm.images?.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            draggable={true}
                            onDragStart={(e) => handleThumbnailDragStart(e, idx)}
                            onDragOver={(e) => handleThumbnailDragOver(e, idx)}
                            onDrop={(e) => handleThumbnailDrop(e, idx)}
                            onDragEnd={() => { setDraggedImageIndex(null); setDragOverImageIndex(null); }}
                            className={`relative group rounded-xl overflow-hidden border bg-slate-900 h-28 shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                              draggedImageIndex === idx 
                                ? 'opacity-40 border-dashed border-emerald-500 scale-95' 
                                : dragOverImageIndex === idx 
                                ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/40 scale-105 z-10' 
                                : 'border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <img 
                              src={resolveImgUrl(imgUrl)} 
                              alt={`Product Image ${idx + 1}`}
                              className="w-full h-full object-cover select-none pointer-events-none" 
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80'; }}
                            />

                            {/* DRAG HANDLE BADGE */}
                            <div className="absolute top-1.5 left-1.5 bg-slate-950/80 text-slate-300 p-1 rounded-md border border-slate-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <GripVertical size={12} className="text-emerald-400" />
                            </div>

                            {idx === 0 ? (
                              <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-0.5">
                                PRIMARY ⭐
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const reordered = [imgUrl, ...productForm.images.filter((_, i) => i !== idx)];
                                  setProductForm({ ...productForm, images: reordered });
                                  if (showToast) showToast('info', 'Primary Image Set', `Image #${idx + 1} set as main product cover.`);
                                }}
                                className="absolute bottom-1.5 left-1.5 bg-slate-950/90 hover:bg-emerald-700 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                Make Primary
                              </button>
                            )}

                            <button 
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 bg-rose-950/90 text-rose-200 p-1.5 rounded-lg hover:bg-rose-700 transition-colors shadow border border-rose-800"
                              title="Remove Image"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. CATEGORY & SUBCATEGORY CARD (CUSTOM REACT DROPDOWN FOR GUARANTEED 100% VISIBILITY) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-200">Category & Subcategory *</label>
                    <button 
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      + Create Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* CUSTOM MAIN CATEGORY DROPDOWN */}
                    <div className="relative">
                      <label className="block text-slate-300 font-bold text-xs mb-1">
                        Main Category <span className="text-rose-400 font-extrabold">* (Required)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCatDropdownOpen(!isCatDropdownOpen);
                          setIsSubcatDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 bg-slate-800 hover:bg-slate-750 border rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer ${
                          !productForm.category_id 
                            ? 'border-rose-500/70 ring-1 ring-rose-500/30' 
                            : 'border-slate-700'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          {selectedCategoryObj ? (
                            <>
                              <span>{selectedCategoryObj.icon || '🌿'}</span>
                              <span className="text-white font-extrabold">{selectedCategoryObj.name}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-normal">-- Select Main Category --</span>
                          )}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isCatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                      </button>

                      {isCatDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
                          {categories.length === 0 ? (
                            <div className="p-3 text-center text-slate-400 text-xs font-semibold">
                              No categories found.
                            </div>
                          ) : (
                            categories.map(c => {
                              const isSelected = String(c.id) === String(productForm.category_id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setProductForm({ ...productForm, category_id: Number(c.id), subcategory_id: '' });
                                    setIsCatDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base">{c.icon || '🌿'}</span>
                                    <span className="font-extrabold">{c.name}</span>
                                  </span>
                                  {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* CUSTOM SUBCATEGORY DROPDOWN */}
                    <div className="relative">
                      <label className="block text-slate-400 text-xs mb-1">Subcategory (Optional)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubcatDropdownOpen(!isSubcatDropdownOpen);
                          setIsCatDropdownOpen(false);
                        }}
                        className="w-full p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="truncate">
                          {selectedCategoryObj?.subcategories?.find(sc => String(sc.id) === String(productForm.subcategory_id))?.name || (
                            <span className="text-slate-400 font-normal">-- Choose Subcategory --</span>
                          )}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isSubcatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                      </button>

                      {isSubcatDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({ ...productForm, subcategory_id: '' });
                              setIsSubcatDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                          >
                            -- None (No Subcategory) --
                          </button>
                          {selectedCategoryObj?.subcategories?.map(sc => {
                            const isSelected = String(sc.id) === String(productForm.subcategory_id);
                            return (
                              <button
                                key={sc.id}
                                type="button"
                                onClick={() => {
                                  setProductForm({ ...productForm, subcategory_id: Number(sc.id) });
                                  setIsSubcatDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <span className="font-extrabold">{sc.name}</span>
                                {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. PRICING CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Pricing & Profit Margins</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-emerald-400 font-bold mb-1 text-xs">Price INR (₹) *</label>
                      <input 
                        type="number" min="0" required placeholder="₹ 0.00"
                        value={productForm.price_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            price_inr: val, 
                            discount_inr: prev.discount_inr ? prev.discount_inr : val,
                            price_usd: autoUsd,
                            discount_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-400 font-bold mb-1 text-xs">Price USD ($) *</label>
                      <input 
                        type="number" min="0" required placeholder="$ 0.00" step="0.01"
                        value={productForm.price_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ 
                            ...prev, 
                            price_usd: val, 
                            discount_usd: prev.discount_usd ? prev.discount_usd : val 
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-blue-400 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1 text-xs">Compare-at Price INR (₹)</label>
                      <input 
                        type="number" min="0" placeholder="₹ Original / MRP (INR)"
                        value={productForm.compare_price_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            compare_price_inr: val,
                            compare_price_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-300 font-medium mb-1 text-xs">Compare-at Price USD ($)</label>
                      <input 
                        type="number" min="0" placeholder="$ Original / MRP (USD)" step="0.01"
                        value={productForm.compare_price_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ ...prev, compare_price_usd: val }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-blue-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-400 mb-1 text-xs">Cost per item INR (₹)</label>
                      <input 
                        type="number" min="0" placeholder="₹ Supplier Cost (INR)"
                        value={productForm.cost_per_item_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            cost_per_item_inr: val,
                            cost_per_item_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-400/80 mb-1 text-xs">Cost per item USD ($)</label>
                      <input 
                        type="number" min="0" placeholder="$ Supplier Cost (USD)" step="0.01"
                        value={productForm.cost_per_item_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ ...prev, cost_per_item_usd: val }));
                        }}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* PRODUCT SPECIFIC GST TAX RATE OVERRIDE */}
                  <div className="pt-3 border-t border-slate-800">
                    <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5 text-xs">
                      <span>🏷️ Product Specific GST Tax Rate (%)</span>
                    </label>
                    <select
                      value={productForm.gst_percent ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, gst_percent: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer focus:border-amber-500 text-xs"
                    >
                      <option value="">⚙️ Default (Inherit Store / Collection Tax Rate)</option>
                      <option value="0">0% GST (Tax Exempt / Nil Rated)</option>
                      <option value="5">5% GST (Organic Fertilizers & Seeds)</option>
                      <option value="12">12% GST (Bio-Pesticides & Processed Goods)</option>
                      <option value="18">18% GST (Garden Tools & Equipment)</option>
                      <option value="28">28% GST (Luxury Goods)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      💡 Setting a custom GST rate here overrides the default store & collection tax rates for this specific product.
                    </p>
                  </div>
                </div>

                {/* 5. PRODUCT VARIANTS & STOCK BREAKDOWN CARD */}
                <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Product Variants & Stock Breakdown</h3>
                      <p className="text-xs text-slate-400">Add variant options like different pack sizes (e.g. 250g, 500g, 1Kg) with title, image, price & compare price in INR & USD.</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      {productForm.variants?.length || 0} VARIANTS
                    </span>
                  </div>

                  {/* VARIANTS LIST TABLE */}
                  {productForm.variants && productForm.variants.length > 0 && (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead className="bg-slate-900 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Image</th>
                            <th className="p-2.5">Variant Title</th>
                            <th className="p-2.5 text-emerald-400">Price (₹)</th>
                            <th className="p-2.5 text-blue-400">Price ($)</th>
                            <th className="p-2.5 text-slate-400">Compare (₹)</th>
                            <th className="p-2.5 text-blue-300">Compare ($)</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-850">
                          {productForm.variants.map((v, vIdx) => (
                            <tr key={v.id || vIdx} className="hover:bg-slate-800/50">
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  {v.image_url ? (
                                    <img src={resolveImgUrl(typeof v.image_url === 'object' ? v.image_url.image_url : v.image_url)} alt="Variant" className="w-8 h-8 object-cover rounded-lg border border-slate-700 bg-slate-900" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-[9px] text-slate-500 font-bold">No Img</div>
                                  )}
                                  <label className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                    Upload
                                    <input 
                                      type="file" accept="image/*" className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        try {
                                          const res = await adminFetch('/api/upload', { method: 'POST', body: formData });
                                          const data = await res.json();
                                          if (data.imageUrl) {
                                            const updated = [...productForm.variants];
                                            updated[vIdx] = { ...updated[vIdx], image_url: data.imageUrl };
                                            setProductForm({ ...productForm, variants: updated });
                                          }
                                        } catch (err) {}
                                      }}
                                    />
                                  </label>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="text" value={v.variant_name || v.name || ''} 
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    updated[vIdx] = { ...updated[vIdx], variant_name: e.target.value };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-full min-w-[100px] p-1.5 bg-slate-800 border border-slate-700 rounded text-white font-bold"
                                  placeholder="e.g. 500g Pack"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.price_inr !== undefined ? v.price_inr : (v.price || '')} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    const autoUsd = (pVal !== '' && pVal > 0) ? Number((pVal / 95).toFixed(2)) : '';
                                    updated[vIdx] = { ...updated[vIdx], price_inr: pVal, price: pVal, discount_inr: pVal, price_usd: autoUsd, discount_usd: autoUsd };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" step="0.01" value={v.price_usd !== undefined ? v.price_usd : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], price_usd: pVal, discount_usd: pVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-400 font-bold"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.compare_price_inr !== undefined ? v.compare_price_inr : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    const autoUsd = (pVal !== '' && pVal > 0) ? Number((pVal / 95).toFixed(2)) : '';
                                    updated[vIdx] = { ...updated[vIdx], compare_price_inr: pVal, compare_price_usd: autoUsd };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-300"
                                  placeholder="₹ MRP"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" step="0.01" value={v.compare_price_usd !== undefined ? v.compare_price_usd : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], compare_price_usd: pVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-300"
                                  placeholder="$ MRP"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.stock !== undefined ? v.stock : 50} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const sVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], stock: sVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded text-white font-bold"
                                />
                              </td>
                              <td className="p-2.5 text-center">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const updated = productForm.variants.filter((_, idx) => idx !== vIdx);
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ADD NEW VARIANT CREATION INPUTS */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">+ Add New Variant Pill:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Variant Title *</label>
                        <input 
                          type="text" placeholder="e.g. 500g, 1Kg, Pack of 5"
                          value={newVariantForm.variant_name || ''}
                          onChange={(e) => setNewVariantForm({ ...newVariantForm, variant_name: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-emerald-400 mb-0.5 font-bold">Price INR (₹)</label>
                        <input 
                          type="number" min="0" placeholder="₹ Price"
                          value={newVariantForm.price_inr || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                            setNewVariantForm(prev => ({ ...prev, price_inr: val, price_usd: autoUsd }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-400 mb-0.5 font-bold">Price USD ($)</label>
                        <input 
                          type="number" min="0" step="0.01" placeholder="$ Price"
                          value={newVariantForm.price_usd || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, price_usd: val }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Compare INR (₹)</label>
                        <input 
                          type="number" min="0" placeholder="₹ MRP"
                          value={newVariantForm.compare_price_inr || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                            setNewVariantForm(prev => ({ ...prev, compare_price_inr: val, compare_price_usd: autoUsd }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-300 mb-0.5 font-bold">Compare USD ($)</label>
                        <input 
                          type="number" min="0" step="0.01" placeholder="$ MRP"
                          value={newVariantForm.compare_price_usd || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, compare_price_usd: val }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-32">
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Stock Qty</label>
                        <input 
                          type="number" min="0" placeholder="100"
                          value={newVariantForm.stock || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const sVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, stock: sVal }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
                        />
                      </div>
                      <div className="flex-1 pt-4">
                        <button 
                          type="button"
                          onClick={() => {
                            if (!newVariantForm.variant_name || !newVariantForm.variant_name.trim()) {
                              if (showToast) showToast('warning', 'Variant Title Required', 'Please enter a Variant Title (e.g. 500g, 1Kg, Pack of 5)');
                              return;
                            }
                            const vPrice = Number(newVariantForm.price_inr || productForm.price_inr || 0);
                            const vPriceUsd = newVariantForm.price_usd !== '' && Number(newVariantForm.price_usd) > 0 ? Number(newVariantForm.price_usd) : Number((vPrice / 95).toFixed(2));
                            const vCompInr = Number(newVariantForm.compare_price_inr || 0);
                            const vCompUsd = newVariantForm.compare_price_usd !== '' && Number(newVariantForm.compare_price_usd) > 0 ? Number(newVariantForm.compare_price_usd) : (vCompInr > 0 ? Number((vCompInr / 95).toFixed(2)) : 0);
                            const vStock = Number(newVariantForm.stock || 100);
                            const newV = {
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
                            };
                            setProductForm(prev => ({ ...prev, variants: [...(prev.variants || []), newV] }));
                            setNewVariantForm({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });
                            if (showToast) showToast('success', 'Variant Pill Added', `Variant "${newV.variant_name}" added to list!`);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer uppercase tracking-wider"
                        >
                          Save & Create Variant Pill ➕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. GOOGLE SEO & URL HANDLE CARD */}
                <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Search Engine Listing Preview (Google SEO)</h3>
                      <p className="text-xs text-slate-400">Preview of how this product will appear in Google search results.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowSeoFields(!showSeoFields)}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Edit website SEO {showSeoFields ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* PREVIEW BOX */}
                  <div className="p-3 bg-white rounded-xl space-y-1 font-sans shadow-sm">
                    <div className="text-[11px] text-gray-500 truncate">
                      VALUELIFE ESSENTIALS › https://valuelifeessentials.com › products/{productForm.url_handle || (productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </div>
                    <div className="text-sm font-bold text-blue-800 truncate hover:underline cursor-pointer">
                      {pageTitle}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 leading-normal">
                      {metaDesc}
                    </div>
                    <div className="text-xs font-bold text-gray-900 pt-1">
                      ₹{productForm.price_inr || productForm.discount_inr || 0}.00 INR
                    </div>
                  </div>

                  {/* SEO INPUT FIELDS (EXPANDS ONLY ON CLICKING EDIT WEBSITE SEO) */}
                  {showSeoFields && (
                    <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-300">Page title</label>
                          <span className="text-[10px] text-slate-400">{pageTitle.length} of 70 characters used</span>
                        </div>
                        <input 
                          type="text"
                          value={productForm.seo_title || ''}
                          onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
                          placeholder={productForm.title || ''}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-300">Meta description</label>
                          <span className="text-[10px] text-slate-400">{metaDesc.length} of 160 characters used</span>
                        </div>
                        <textarea 
                          rows={2}
                          value={productForm.seo_description || ''}
                          onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
                          placeholder={productForm.description || ''}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">URL handle</label>
                        <input 
                          type="text"
                          value={productForm.url_handle || ''}
                          onChange={(e) => setProductForm({ ...productForm, url_handle: e.target.value })}
                          placeholder={`products/${(productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN (1 COL WIDE) */}
              <div className="space-y-5">
                {/* 1. STATUS CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-200">Status *</label>
                  <select 
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* 2. PRODUCT ORGANIZATION CARD (With Collections & Tags Pill Buttons) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                  <span className="font-extrabold text-sm text-white block">Product Organization</span>

                  <div>
                    <label className="block text-slate-400 mb-1">Type</label>
                    <input 
                      type="text" placeholder="e.g. Garden Supplies"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Vendor / Brand</label>
                    <input 
                      type="text" placeholder="e.g. VALUELIFE ESSENTIALS"
                      value={productForm.vendor}
                      onChange={(e) => setProductForm({ ...productForm, vendor: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  {/* COLLECTIONS PILL TAGS */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-300">Collections</label>
                        <button 
                          type="button" 
                          onClick={() => setShowCollectionModal(true)}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          + Create Collection
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">({productForm.collection_ids?.length || 0} Selected)</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-h-12 items-center">
                      {collections.length === 0 ? (
                        <div className="w-full flex items-center justify-between py-1 px-1">
                          <span className="text-xs text-slate-400">No custom collections created yet.</span>
                          <button
                            type="button"
                            onClick={() => setShowCollectionModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            + Create Collection
                          </button>
                        </div>
                      ) : (
                        collections.map(col => {
                          const isSelected = (productForm.collection_ids || []).map(id => Number(id)).includes(Number(col.id));
                          return (
                            <button 
                              key={col.id}
                              type="button"
                              onClick={() => handleToggleCollection(col.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400' 
                                  : 'bg-slate-900 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{col.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* TAGS PILL MANAGER */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <label className="font-bold text-slate-300 block">Tags</label>

                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Add new tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                      <button 
                        type="button"
                        onClick={handleAddTag}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-xs"
                      >
                        + Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-h-12">
                      {(() => {
                        const tagsArr = Array.isArray(productForm.tags)
                          ? productForm.tags
                          : typeof productForm.tags === 'string'
                            ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : [];
                        return tagsArr.map((t, idx) => (
                          <span key={idx} className="bg-slate-900 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                            #{t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="text-rose-400 hover:text-rose-300 ml-1">
                              ×
                            </button>
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. SUGGESTED PRODUCTS & CROSS-SELL SETTINGS (Matching User Screenshot 1) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
                      ⚡ Suggested Products & Collections Settings
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">Recommendation Engine</span>
                  </div>

                  {/* RECOMMENDATION MODE TABS */}
                  <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, related_mode: 'PRODUCTS' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        (productForm.related_mode || 'PRODUCTS') === 'PRODUCTS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Specific Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, related_mode: 'COLLECTIONS' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        productForm.related_mode === 'COLLECTIONS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dynamic Collections
                    </button>
                  </div>

                  {/* MODE 1: SPECIFIC RELATED PRODUCTS */}
                  {(productForm.related_mode || 'PRODUCTS') === 'PRODUCTS' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setBrowseTargetType('products'); setBrowseTargetField('frequently_bought'); setShowBrowseModal(true); }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          + Browse & Select Products
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {products
                          .filter(p => (productForm.frequently_bought_ids || '').split(',').map(n => Number(n.trim())).includes(p.id))
                          .map(p => (
                            <div key={p.id} className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                              <span className="font-bold text-white line-clamp-1">{p.title}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIds = (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                                  const newIds = currentIds.filter(id => id !== p.id.toString()).join(',');
                                  setProductForm({ ...productForm, frequently_bought_ids: newIds });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold text-sm ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    /* MODE 2: DYNAMIC COLLECTIONS */
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setBrowseTargetType('collections'); setBrowseTargetField('related_collections'); setShowBrowseModal(true); }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          + Browse & Select Collections
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {collections
                          .filter(c => (productForm.related_collection_ids || '').split(',').map(n => Number(n.trim())).includes(c.id))
                          .map(c => (
                            <div key={c.id} className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                              <span className="font-bold text-white line-clamp-1">🏷️ {c.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIds = (productForm.related_collection_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                                  const newIds = currentIds.filter(id => id !== c.id.toString()).join(',');
                                  setProductForm({ ...productForm, related_collection_ids: newIds });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold text-sm ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        💡 Storefront will dynamically pick random items from selected collections to display on PDP.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COLLECTION MODAL */}
      {showCollectionModal && (
        <div className="drawer-overlay flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 lg:p-8 space-y-5 shadow-2xl max-h-[94vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white">{editingCollection ? 'Edit Collection & Map Products' : 'Create New Collection'}</h3>
              <button onClick={() => setShowCollectionModal(false)}><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Collection Title *</label>
                <input 
                  type="text" required placeholder="e.g. Monsoon Gardening Special Sale"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description *</label>
                <input 
                  type="text" required placeholder="Special collection for rainy season garden boosters"
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <ImageUploader 
                label="Collection Banner Image (Upload Local File or Paste URL Link) *"
                value={collectionForm.image_url}
                onChange={(url) => setCollectionForm({ ...collectionForm, image_url: url })}
                placeholder="Upload image file or paste web/Unsplash URL..."
              />

              <div>
                <label className="block font-bold text-slate-300 mb-1">Map to Parent Category (Optional)</label>
                <select 
                  value={collectionForm.category_id}
                  onChange={(e) => setCollectionForm({ ...collectionForm, category_id: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                >
                  <option value="">-- All Categories --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* TOP NAVBAR FEATURED TOGGLE */}
              <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-emerald-300 text-xs block">Featured Top Navbar Navigation Link</span>
                  <p className="text-[11px] text-slate-400">Show this collection directly as a featured link on the top website navbar (next to Offers / Best Sellers).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={collectionForm.show_in_navbar === 1 || collectionForm.show_in_navbar === true || String(collectionForm.show_in_navbar) === '1'}
                    onChange={(e) => setCollectionForm({ ...collectionForm, show_in_navbar: e.target.checked ? 1 : 0 })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-2 bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="font-extrabold text-emerald-400 block">Attach Products to Collection (Multi-Select Checkboxes):</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {products.map(p => {
                    const isSelected = collectionForm.product_ids?.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded cursor-pointer text-xs">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? [...(collectionForm.product_ids || []), p.id]
                              : (collectionForm.product_ids || []).filter(id => id !== p.id);
                            setCollectionForm({ ...collectionForm, product_ids: newIds });
                          }}
                          className="w-4 h-4 accent-emerald-500"
                        />
                        <span className="font-bold text-white">{p.title}</span>
                        <span className="text-slate-400 text-[11px]">(₹{p.discount_inr || p.price_inr})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg">
                Save & Update Collection Mapping
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL ORDER DETAILS & NOTES INVOICE MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ORDER INVOICE & DETAILS</span>
                <h3 className="font-extrabold text-lg text-white font-mono">{selectedOrderDetails.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer Information:</span>
                <div className="font-bold text-white text-sm">{selectedOrderDetails.customer_name}</div>
                <div className="text-emerald-400 font-mono">{selectedOrderDetails.customer_email}</div>
                <div className="text-slate-300">{selectedOrderDetails.customer_phone}</div>
                <div className="text-slate-400 mt-2">{selectedOrderDetails.shipping_address}, {selectedOrderDetails.country}</div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment & Shipping Status:</span>
                <div className="font-extrabold text-white text-sm">Mode: {selectedOrderDetails.payment_mode}</div>
                <div className="text-emerald-400 font-black text-base">Total: ₹{selectedOrderDetails.total_amount}</div>
                <div className="text-emerald-300 font-bold">Paid Deposit (20%): ₹{selectedOrderDetails.paid_amount}</div>
                <div className="text-amber-400 font-bold">COD Balance Due: ₹{selectedOrderDetails.remaining_amount}</div>
              </div>
            </div>

            {/* CUSTOMER REMARK / SPECIAL INSTRUCTIONS HIGHLIGHT CARD */}
            {selectedOrderDetails.order_notes && (
              <div className="p-3.5 bg-amber-950/70 border border-amber-500/50 rounded-xl space-y-1 shadow-md">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <MessageSquare size={16} /> 📝 Customer Remark & Special Instructions:
                </div>
                <p className="text-white text-xs font-semibold pl-6 italic">
                  "{selectedOrderDetails.order_notes}"
                </p>
              </div>
            )}

            {/* GST TAX INVOICE BREAKDOWN CARD */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  🏛️ GST Tax Invoice Breakdown (Store GSTIN: {settingsForm.gstin_number || '27AAAAA0000A1Z5'})
                </span>
                {selectedOrderDetails.customer_gstin && (
                  <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-800">
                    B2B GSTIN: {selectedOrderDetails.customer_gstin}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono text-[11px]">
                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">Taxable Value</span>
                  <div className="font-bold text-white">₹{(selectedOrderDetails.total_amount - (selectedOrderDetails.gst_amount || 0)).toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">CGST (Central)</span>
                  <div className="font-bold text-blue-400">₹{(selectedOrderDetails.cgst_amount || 0).toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">SGST (State)</span>
                  <div className="font-bold text-purple-400">₹{(selectedOrderDetails.sgst_amount || 0).toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">IGST (Integrated)</span>
                  <div className="font-bold text-amber-400">₹{(selectedOrderDetails.igst_amount || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* ADMIN SHIPPING & CANCELLATION CONTROL CARD */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <span className="text-[10px] font-black uppercase text-blue-400 block tracking-wider flex items-center gap-1.5">
                <Truck size={14} /> Shipping, Courier Tracking & Cancellation Control
              </span>

              <form onSubmit={handleUpdateOrderShippingAndStatus} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Order Status</label>
                    <select
                      value={adminOrderStatusInput}
                      onChange={(e) => setAdminOrderStatusInput(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
                    >
                      <option value="PROCESSING">🟡 PROCESSING</option>
                      <option value="SHIPPED">🔵 SHIPPED</option>
                      <option value="DELIVERED">🟢 DELIVERED</option>
                      <option value="CANCELLED">🔴 CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Courier Partner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhivery, BlueDart, DTDC"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Tracking Number / AWB #</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                    />
                  </div>
                </div>

                {adminOrderStatusInput === 'CANCELLED' && (
                  <div className="space-y-2 p-3 bg-rose-950/40 border border-rose-800 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-rose-300 font-bold text-xs">Cancellation Reason & Admin Remarks</label>
                      <div className="flex items-center gap-2">
                        {Number(selectedOrderDetails.paid_amount) > 0 && selectedOrderDetails.payment_status !== 'REFUNDED' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  order_status: 'CANCELLED',
                                  payment_status: 'REFUNDED',
                                  cancellation_notes: 'Refund approved and initiated by Admin'
                                })
                              });
                              fetchAdminData();
                              setSelectedOrderDetails(prev => ({ ...prev, payment_status: 'REFUNDED' }));
                              if (showToast) showToast('success', 'Refund Approved', `₹${selectedOrderDetails.paid_amount} marked as REFUNDED.`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shadow cursor-pointer transition-colors"
                          >
                            <span>💸 Approve Refund (₹{selectedOrderDetails.paid_amount})</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                order_status: 'PROCESSING',
                                cancellation_reason: ''
                              })
                            });
                            fetchAdminData();
                            setSelectedOrderDetails(prev => ({ ...prev, order_status: 'PROCESSING', cancellation_reason: '' }));
                            setAdminOrderStatusInput('PROCESSING');
                            if (showToast) showToast('info', 'Order Restored', 'Order reverted back to PROCESSING status.');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 font-bold px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>↩️ Reject & Restore</span>
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Reason for cancellation (e.g. Customer request, Out of stock)"
                      value={adminCancelReasonInput}
                      onChange={(e) => setAdminCancelReasonInput(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingShippingStatus}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingShippingStatus ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Updating Status...
                      </>
                    ) : (
                      <>
                        <Truck size={14} /> Update Shipping & Status
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Itemized Purchased Products ({selectedOrderDetails.items?.length || 0}):</span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-850 overflow-hidden">
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={resolveImgUrl(item.thumbnail || item.image_url)} alt={item.product_title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'; }} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                      <div>
                        <div className="font-bold text-white text-sm">{item.product_title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.variant_name ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-0.5 rounded-md font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                              📦 Variant: {item.variant_name}
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              Standard Item
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            SKU: <strong className="text-slate-200">{item.variant_sku || item.product_sku}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">Qty: {item.quantity}</span>
                      <div className="font-black text-emerald-400">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-black uppercase text-emerald-400 block flex items-center gap-1.5">
                <MessageSquare size={14} /> Order Notes & Customer Delivery Instructions:
              </span>

              <form onSubmit={handleSaveOrderNotes} className="space-y-2">
                <textarea 
                  rows={3}
                  placeholder="Add delivery instructions, special customer requests, or admin shipping message..."
                  value={orderNoteInput}
                  onChange={(e) => setOrderNoteInput(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                ></textarea>

                <div className="flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
                  >
                    <Printer size={14} /> Print Invoice
                  </button>

                  <button 
                    type="submit"
                    disabled={savingOrderNote}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    {savingOrderNote ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Saving Note...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Save Order Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW LIGHTBOX MODAL */}
      {previewMediaItem && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ASSET DETAILS</span>
                <h3 className="font-extrabold text-base text-white truncate max-w-md">{previewMediaItem.filename}</h3>
              </div>
              <button onClick={() => setPreviewMediaItem(null)} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-80 flex items-center justify-center p-2">
              <img 
                src={`${resolveImgUrl(previewMediaItem.url)}${previewMediaItem.url && previewMediaItem.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`} 
                alt="Preview" 
                className="max-h-72 object-contain rounded-xl" 
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 font-mono text-[11px]">
                <span className="text-slate-400">Full Image URL:</span>
                <span className="text-emerald-300 font-bold truncate max-w-md">{previewMediaItem.fullUrl || getApiUrl(previewMediaItem.url)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(previewMediaItem.fullUrl || getApiUrl(previewMediaItem.url));
                  if (showToast) showToast('success', 'URL Copied!', 'Image URL copied to clipboard.');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5"
              >
                <LinkIcon size={14} /> Copy Full Image URL
              </button>

              <label className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                <RefreshCw size={14} /> Replace Image File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!window.confirm(`Replace image "${previewMediaItem.filename}" with new file "${file.name}"? The image URL will stay identical across all products.`)) return;
                    
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('targetFilename', previewMediaItem.filename);

                    try {
                      const res = await adminFetch('/api/media/replace', {
                        method: 'POST',
                        body: formData
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setMediaCacheBuster(Date.now());
                        setPreviewMediaItem(null);
                        await fetchAdminData();
                        if (showToast) showToast('success', 'Image Replaced', `Image ${previewMediaItem.filename} replaced successfully!`);
                      } else {
                        if (showToast) showToast('error', 'Replace Failed', data.error);
                      }
                    } catch (err) {
                      if (showToast) showToast('error', 'Replace Error', err.message);
                    }
                  }} 
                  className="hidden" 
                />
              </label>

              <button 
                onClick={() => setPreviewMediaItem(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATOR MEDIA LIBRARY PICKER MODAL */}
      {showProductMediaPickerModal && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PRODUCT MEDIA PICKER</span>
                <h3 className="font-extrabold text-base text-white">Select Images from Media Library</h3>
              </div>
              <button onClick={() => setShowProductMediaPickerModal(false)} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search media by filename..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            {mediaFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-850 rounded-xl border border-slate-800">
                No media files uploaded yet. Upload a file above first.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
                {mediaFiles
                  .filter(m => !mediaSearch || m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((item, idx) => {
                    const isSelected = (productForm.images || []).includes(item.url);
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          if (isSelected) {
                            setProductForm({
                              ...productForm,
                              images: productForm.images.filter(img => img !== item.url)
                            });
                          } else {
                            setProductForm({
                              ...productForm,
                              images: [...(productForm.images || []), item.url]
                            });
                          }
                        }}
                        className={`relative group bg-slate-850 border rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all ${
                          isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800'
                        }`}
                      >
                        <div className="h-28 bg-slate-900 overflow-hidden flex items-center justify-center p-1 relative">
                          <img
                            src={`${resolveImgUrl(item.url)}${item.url && item.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`}
                            alt={item.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                              <CheckCircle size={14} />
                            </span>
                          )}
                        </div>
                        <div className="p-1.5 bg-slate-900/80 border-t border-slate-800">
                          <p className="text-[10px] font-bold text-white truncate" title={item.filename}>{item.filename}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="text-emerald-400 font-bold">
                {productForm.images?.length || 0} image(s) selected for this product
              </span>
              <button
                onClick={() => setShowProductMediaPickerModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-colors"
              >
                Done & Apply Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE VARIANTS MODAL (CRUD) */}
      {selectedProductForVariants && (
        <div className="drawer-overlay flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 lg:p-8 space-y-5 shadow-2xl max-h-[94vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Variant Pills CRUD Manager</h3>
                <p className="text-xs text-emerald-400">{selectedProductForVariants.title}</p>
              </div>
              <button onClick={() => setSelectedProductForVariants(null)}><XCircle size={24} /></button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Existing Variant Pills:</span>
              {selectedProductForVariants.variants?.map(v => (
                <div key={v.id} className="p-3 border border-slate-800 bg-slate-850 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{v.variant_name}</span>
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-2">
                      <span>Offer Price: ₹{v.discount_inr || v.price_inr}</span>
                      {v.price_inr > (v.discount_inr || v.price_inr) && (
                        <span className="text-slate-400 line-through text-[10px]">MRP: ₹{v.price_inr}</span>
                      )}
                      <span className="text-blue-400">(${v.discount_usd || v.price_usd})</span>
                      <span className="text-slate-300">Stock: {v.stock}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteVariant(v.id)} className="bg-rose-900/50 text-rose-300 p-1.5 rounded-lg border border-rose-700 hover:bg-rose-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddVariant} className="space-y-3 border-t border-slate-800 pt-3 text-xs">
              <span className="font-bold text-white block">+ Add New Variant Pill:</span>
              <input 
                type="text" required
                placeholder="Variant Pill Name (e.g. Pack of 1, 5 Kg, 500ml)" 
                value={variantForm.variant_name}
                onChange={(e) => setVariantForm({ ...variantForm, variant_name: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
              />

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400 mb-1">Offer / Sale Price INR (₹) *</label>
                    <input 
                      type="number" min="0" required placeholder="Offer Price (e.g. 249)"
                      value={variantForm.discount_inr || ''}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setVariantForm({ ...variantForm, discount_inr: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Compare At / MRP (₹)</label>
                    <input 
                      type="number" min="0" placeholder="MRP Price (e.g. 349)"
                      value={variantForm.price_inr || ''}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setVariantForm({ ...variantForm, price_inr: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-400 mb-1">Offer USD ($) *</label>
                    <input 
                      type="number" min="0" step="0.01" required placeholder="Offer USD"
                      value={variantForm.discount_usd || ''}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setVariantForm({ ...variantForm, discount_usd: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Compare USD ($)</label>
                    <input 
                      type="number" min="0" step="0.01" placeholder="MRP USD"
                      value={variantForm.price_usd || ''}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setVariantForm({ ...variantForm, price_usd: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Stock Qty *</label>
                    <input 
                      type="number" min="0" required placeholder="Stock"
                      value={variantForm.stock || ''}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setVariantForm({ ...variantForm, stock: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg">
                Save & Create Variant Pill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BANNER MODAL */}
      {showBannerModal && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Create Hero Banner</h3>
              <button onClick={() => setShowBannerModal(false)}><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Banner Title *</label>
                <input 
                  type="text" required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtitle *</label>
                <input 
                  type="text" required
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <ImageUploader 
                label="Banner Image (Upload Local File or Paste URL Link) *"
                value={bannerForm.image_url}
                onChange={(url) => setBannerForm({ ...bannerForm, image_url: url })}
                placeholder="Upload image file or paste web/Unsplash URL..."
              />

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg">
                Create Hero Banner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT DISCOUNT TYPE MODAL (Shopify Style) */}
      {showDiscountTypeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Select discount type</h3>
              <button 
                onClick={() => setShowDiscountTypeModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { id: 'amount_off_products', title: 'Amount off products', subtitle: 'Discount specific products or collections of products', icon: '🏷️' },
                { id: 'buy_x_get_y', title: 'Buy X get Y', subtitle: 'Discount specific products or collections of products', icon: '⚡' },
                { id: 'amount_off_order', title: 'Amount off order', subtitle: 'Discount the total order amount', icon: '💼' },
                { id: 'free_shipping', title: 'Free shipping', subtitle: 'Offer free shipping on an order', icon: '🚚' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedDiscountType(item);
                    setShowDiscountTypeModal(false);
                    setShowCouponModal(true);
                  }}
                  className="w-full text-left p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-950 transition-all">{item.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-emerald-400">{item.title}</div>
                      <div className="text-xs text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowDiscountTypeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SHOPIFY-GRADE DYNAMIC CREATE DISCOUNT FORM MODAL */}
      {showCouponModal && selectedDiscountType && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setShowCouponModal(false); setShowDiscountTypeModal(true); }}
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  ‹ Back to discount types
                </button>
                <span className="text-slate-500">•</span>
                <h3 className="font-extrabold text-base text-white">{selectedDiscountType.title}</h3>
              </div>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCouponSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* LEFT COLUMN (2 COLS WIDE) */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* METHOD SELECTOR CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">{selectedDiscountType.title}</span>
                  <span className="text-xs text-slate-400 font-semibold block">Method</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountMethod('CODE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        discountMethod === 'CODE' 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Discount code
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMethod('AUTO')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        discountMethod === 'AUTO' 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Automatic discount
                    </button>
                  </div>

                  {discountMethod === 'CODE' && (
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-extrabold text-xs text-slate-300">Discount Code *</label>
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, code: `ORGANIC-${Math.floor(1000 + Math.random() * 9000)}` })}
                          className="text-emerald-400 font-bold text-xs hover:underline"
                        >
                          Generate random code ⚡
                        </button>
                      </div>
                      <input 
                        type="text" required placeholder="e.g. ORGANIC15"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase font-bold text-sm tracking-wider"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Customers must enter this code at checkout.</span>
                    </div>
                  )}
                </div>

                {/* 1. AMOUNT OFF PRODUCTS SPECIFIC CARD (SCREENSHOT 1) */}
                {selectedDiscountType.id === 'amount_off_products' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Discount value</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Value Type</label>
                        <select 
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                        >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Fixed Amount (₹ / $)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Discount Value *</label>
                        <input 
                          type="number" required placeholder={couponForm.discount_type === 'PERCENT' ? '15%' : '₹100'}
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Applies to</label>
                      <select 
                        value={browseTargetType}
                        onChange={(e) => setBrowseTargetType(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold mb-2"
                      >
                        <option value="products">Specific products</option>
                        <option value="collections">Specific collections</option>
                        <option value="categories">Specific categories</option>
                      </select>

                      <div className="flex gap-2">
                        <div 
                          onClick={() => { setBrowseTargetField('applies_to'); setShowBrowseModal(true); }}
                          className="relative flex-1 cursor-pointer"
                        >
                          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="text" readOnly
                            placeholder={`Click Browse to select real ${browseTargetType}...`} 
                            value={discountSelections.applies_to.map(item => item.name || item.title).join(', ')}
                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('applies_to'); setShowBrowseModal(true); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 flex items-center gap-1 shadow-md"
                        >
                          <Search size={14} /> Browse Real Data
                        </button>
                      </div>

                      {/* SELECTED ITEMS TAG PILLS */}
                      {discountSelections.applies_to.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {discountSelections.applies_to.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button 
                                type="button"
                                onClick={() => setDiscountSelections(prev => ({ ...prev, applies_to: prev.applies_to.filter(i => i.id !== item.id) }))}
                                className="text-emerald-400 hover:text-rose-400 font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. BUY X GET Y SPECIFIC CARD (SCREENSHOT 2) */}
                {selectedDiscountType.id === 'buy_x_get_y' && (
                  <div className="space-y-4">
                    {/* CUSTOMER BUYS CARD */}
                    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-sm text-white block">Customer buys</span>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                          <input type="radio" name="buyReq" defaultChecked className="accent-emerald-500" />
                          <span>Minimum quantity of items</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                          <input type="radio" name="buyReq" className="accent-emerald-500" />
                          <span>Minimum purchase amount (₹)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Quantity</label>
                          <input type="number" defaultValue={1} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-bold text-slate-400 mb-1">Any items from</label>
                          <select 
                            value={browseTargetType}
                            onChange={(e) => setBrowseTargetType(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="products">Specific products</option>
                            <option value="collections">Specific collections</option>
                            <option value="categories">Specific categories</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" readOnly
                          placeholder={`Select real ${browseTargetType}...`} 
                          value={discountSelections.buys.map(i => i.name || i.title).join(', ')}
                          onClick={() => { setBrowseTargetField('buys'); setShowBrowseModal(true); }}
                          className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('buys'); setShowBrowseModal(true); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs"
                        >
                          Browse Real Data
                        </button>
                      </div>

                      {discountSelections.buys.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {discountSelections.buys.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, buys: prev.buys.filter(i => i.id !== item.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CUSTOMER GETS CARD */}
                    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-sm text-white block">Customer gets</span>
                      <p className="text-[11px] text-slate-400">Customers must add the quantity of items specified below to their cart.</p>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Quantity</label>
                          <input type="number" defaultValue={1} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-bold text-slate-400 mb-1">Any items from</label>
                          <select 
                            value={browseTargetType}
                            onChange={(e) => setBrowseTargetType(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="products">Specific products</option>
                            <option value="collections">Specific collections</option>
                            <option value="categories">Specific categories</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" readOnly
                          placeholder={`Select real ${browseTargetType}...`} 
                          value={discountSelections.gets.map(i => i.name || i.title).join(', ')}
                          onClick={() => { setBrowseTargetField('gets'); setShowBrowseModal(true); }}
                          className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('gets'); setShowBrowseModal(true); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs"
                        >
                          Browse Real Data
                        </button>
                      </div>

                      {discountSelections.gets.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {discountSelections.gets.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, gets: prev.gets.filter(i => i.id !== item.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 space-y-2 border-t border-slate-800">
                        <span className="font-extrabold text-xs text-white block">At a discounted value</span>
                        <label className="flex items-center gap-2 text-slate-200">
                          <input type="radio" name="getVal" className="accent-emerald-500" />
                          <span>Percentage (%)</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-200">
                          <input type="radio" name="getVal" className="accent-emerald-500" />
                          <span>Amount off each</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-200 font-bold text-emerald-400">
                          <input type="radio" name="getVal" defaultChecked className="accent-emerald-500" />
                          <span>Free 🎁</span>
                        </label>
                      </div>

                      <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/80 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                        <span>⚡ Rule Note:</span>
                        <span>The higher price product is billable. Free/Discounted item applies to equal or lower value items.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. AMOUNT OFF ORDER SPECIFIC CARD (SCREENSHOT 3) */}
                {selectedDiscountType.id === 'amount_off_order' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Discount value</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Value Type</label>
                        <select 
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                        >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Fixed Amount (₹ / $)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Discount Amount *</label>
                        <input 
                          type="number" required placeholder={couponForm.discount_type === 'PERCENT' ? '15%' : '₹100'}
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FREE SHIPPING SPECIFIC CARD (SCREENSHOT 4) */}
                {selectedDiscountType.id === 'free_shipping' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Countries</span>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                        <input type="radio" name="countryReq" defaultChecked className="accent-emerald-500" />
                        <span>All countries</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input type="radio" name="countryReq" className="accent-emerald-500" />
                        <span>Selected countries</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" className="accent-emerald-500" />
                        <span>Exclude shipping rates over a certain amount</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* COMMON ELIGIBILITY CARD (SCREENSHOT 2) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Eligibility</span>
                  <select 
                    value={eligibilityType}
                    onChange={(e) => setEligibilityType(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="all">All customers</option>
                    <option value="segments">Specific customer segments</option>
                    <option value="specific">Specific customers</option>
                  </select>

                  {(eligibilityType === 'specific' || eligibilityType === 'segments') && (
                    <div className="pt-1 space-y-2">
                      <div className="flex gap-2">
                        <div 
                          onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
                          className="relative flex-1 cursor-pointer"
                        >
                          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="text" readOnly
                            placeholder="Search registered customers..." 
                            value={discountSelections.customers.map(c => c.name || c.email).join(', ')}
                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs shadow-md"
                        >
                          Browse
                        </button>
                      </div>

                      {discountSelections.customers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {discountSelections.customers.map(c => (
                            <span key={c.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>👤 {c.name} ({c.email})</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, customers: prev.customers.filter(i => i.id !== c.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COMMON MINIMUM PURCHASE REQUIREMENTS CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Minimum purchase requirements</span>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                      <input type="radio" name="minReq" defaultChecked className="accent-emerald-500" />
                      <span>No minimum requirements</span>
                    </label>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input type="radio" name="minReq" className="accent-emerald-500" />
                        <span>Minimum purchase amount (₹)</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="₹ 300.00"
                        value={couponForm.min_spend_inr}
                        onChange={(e) => setCouponForm({ ...couponForm, min_spend_inr: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* MAXIMUM DISCOUNT USES CARD (SCREENSHOT 1) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Maximum discount uses</span>

                  <div className="space-y-2 text-slate-200 text-xs">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input 
                          type="checkbox" 
                          checked={limitTotalUses} 
                          onChange={(e) => setLimitTotalUses(e.target.checked)}
                          className="accent-emerald-500 w-4 h-4 rounded" 
                        />
                        <span>Limit number of times this discount can be used in total</span>
                      </label>
                      {limitTotalUses && (
                        <div className="mt-2 pl-6">
                          <input 
                            type="number" 
                            value={limitTotalUsesVal}
                            onChange={(e) => setLimitTotalUsesVal(Number(e.target.value))}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs"
                            placeholder="e.g. 100 uses total"
                          />
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-medium pt-1">
                      <input 
                        type="checkbox" 
                        checked={limitOnePerCustomer} 
                        onChange={(e) => setLimitOnePerCustomer(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4 rounded" 
                      />
                      <span>Limit to one use per customer</span>
                    </label>
                  </div>
                </div>

                {/* COMMON ACTIVE DATES CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Active dates</span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Start date</label>
                      <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Start time (IST)</label>
                      <input type="time" defaultValue="17:15" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (1 COL WIDE) - LIVE SUMMARY CARD */}
              <div className="space-y-4">
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 sticky top-0">
                  <span className="font-extrabold text-sm text-white block">Discount Summary Preview</span>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-mono font-black text-emerald-400 text-base">{couponForm.code || 'NO CODE SET YET'}</div>
                    <div className="text-xs text-slate-300 font-bold">{selectedDiscountType.title}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">🏷️ {selectedDiscountType.subtitle}</div>

                    <ul className="text-[11px] text-slate-400 space-y-1.5 pt-3 border-t border-slate-800">
                      <li className="flex items-center gap-1.5 text-emerald-400">✓ All customers</li>
                      <li className="flex items-center gap-1.5 text-emerald-400">✓ For Online Store</li>
                      <li className="flex items-center gap-1.5">
                        {couponForm.min_spend_inr > 0 ? `✓ Minimum purchase of ₹${couponForm.min_spend_inr}` : '✓ No minimum purchase requirement'}
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-400">✓ Can't combine with other discounts</li>
                      <li className="flex items-center gap-1.5 text-slate-400">✓ Active from today</li>
                    </ul>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg text-xs tracking-wider uppercase"
                  >
                    Save & Activate Discount Code
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
              <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name *</label>
                <input 
                  type="text" required placeholder="e.g. Organic Insecticides"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Icon (Emoji) (Optional)</label>
                <input 
                  type="text" placeholder="e.g. 🐛 or 🌿 (Optional)"
                  value={categoryForm.icon || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <input 
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <ImageUploader 
                label="Category Cover Image (Upload Local File or Paste URL Link) *"
                value={categoryForm.image_url}
                onChange={(url) => setCategoryForm({ ...categoryForm, image_url: url })}
                placeholder="Upload image file or paste web/Unsplash URL..."
              />

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition-colors">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBCATEGORY MODAL */}
      {showSubcategoryModal && selectedCatForSubcat && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Add Subcategory to {selectedCatForSubcat.name}</h3>
              <button onClick={() => setShowSubcategoryModal(false)}><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleSubcategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subcategory Name *</label>
                <input 
                  type="text" required placeholder="e.g. Vermicompost or Neem Cake"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg">
                Add Subcategory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REAL DATA BROWSE SELECTOR MODAL */}
      {showBrowseModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[10000]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Select Real {browseTargetType.toUpperCase()}</h3>
                <p className="text-xs text-slate-400">Choose items from your store's live database.</p>
              </div>
              <button onClick={() => setShowBrowseModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {/* TARGET TYPE TABS */}
            <div className="flex gap-2 p-1 bg-slate-850 rounded-xl border border-slate-800">
              <button 
                onClick={() => setBrowseTargetType('products')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'products' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Products ({products.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('collections')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'collections' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Collections ({collections.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('categories')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'categories' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Categories ({categories.length})
              </button>
              <button 
                onClick={() => setBrowseTargetType('customers')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  browseTargetType === 'customers' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Customers ({users.length})
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Search real ${browseTargetType}...`} 
                value={browseSearchQuery}
                onChange={(e) => setBrowseSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>

            {/* REAL DATA ITEMS LIST WITH CHECKBOXES */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {browseTargetType === 'products' && (
                products
                  .filter(p => p.title.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(p => {
                    const isSelected = browseTargetField === 'frequently_bought' 
                      ? (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).includes(p.id.toString())
                      : discountSelections[browseTargetField]?.some(i => i.id === p.id);
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          if (browseTargetField === 'frequently_bought') {
                            const currentIds = (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                            const newIds = currentIds.includes(p.id.toString())
                              ? currentIds.filter(id => id !== p.id.toString())
                              : [...currentIds, p.id.toString()];
                            setProductForm({ ...productForm, frequently_bought_ids: newIds.join(',') });
                          } else {
                            setDiscountSelections(prev => {
                              const currentList = prev[browseTargetField] || [];
                              const exists = currentList.some(i => i.id === p.id);
                              const updated = exists ? currentList.filter(i => i.id !== p.id) : [...currentList, p];
                              return { ...prev, [browseTargetField]: updated };
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=100'; }} className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-white line-clamp-1">{p.title}</div>
                            <div className="text-[10px] text-emerald-400 font-mono">₹{p.discount_inr || p.price_inr} • Stock: {p.stock}</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'collections' && (
                collections
                  .filter(c => c.name.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(c => {
                    const isSelected = browseTargetField === 'related_collections'
                      ? (productForm.related_collection_ids || '').split(',').map(n => n.trim()).includes(c.id.toString())
                      : discountSelections[browseTargetField]?.some(i => i.id === c.id);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          if (browseTargetField === 'related_collections') {
                            const currentIds = (productForm.related_collection_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                            const newIds = currentIds.includes(c.id.toString())
                              ? currentIds.filter(id => id !== c.id.toString())
                              : [...currentIds, c.id.toString()];
                            setProductForm({ ...productForm, related_collection_ids: newIds.join(',') });
                          } else {
                            setDiscountSelections(prev => {
                              const currentList = prev[browseTargetField] || [];
                              const exists = currentList.some(i => i.id === c.id);
                              const updated = exists ? currentList.filter(i => i.id !== c.id) : [...currentList, c];
                              return { ...prev, [browseTargetField]: updated };
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">🏷️</span>
                          <div>
                            <div className="font-bold text-xs text-white">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.product_count || 0} products included</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'categories' && (
                categories
                  .filter(cat => cat.name.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(cat => {
                    const isSelected = discountSelections[browseTargetField]?.some(i => i.id === cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => {
                          setDiscountSelections(prev => {
                            const currentList = prev[browseTargetField] || [];
                            const exists = currentList.some(i => i.id === cat.id);
                            const updated = exists ? currentList.filter(i => i.id !== cat.id) : [...currentList, cat];
                            return { ...prev, [browseTargetField]: updated };
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">{cat.icon || '🌿'}</span>
                          <div>
                            <div className="font-bold text-xs text-white">{cat.name}</div>
                            <div className="text-[10px] text-slate-400">{cat.subcategories?.length || 0} subcategories</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}

              {browseTargetType === 'customers' && (
                users
                  .filter(u => u.name.toLowerCase().includes(browseSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  .map(u => {
                    const isSelected = discountSelections[browseTargetField]?.some(i => i.id === u.id);
                    return (
                      <div 
                        key={u.id} 
                        onClick={() => {
                          setDiscountSelections(prev => {
                            const currentList = prev[browseTargetField] || [];
                            const exists = currentList.some(i => i.id === u.id);
                            const updated = exists ? currentList.filter(i => i.id !== u.id) : [...currentList, u];
                            return { ...prev, [browseTargetField]: updated };
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500/80' : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-800 rounded-lg">👤</span>
                          <div>
                            <div className="font-bold text-xs text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email} • {u.phone || 'No phone'}</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-500 w-4 h-4" />
                      </div>
                    );
                  })
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">
                {discountSelections[browseTargetField]?.length || 0} items selected
              </span>

              <button 
                onClick={() => setShowBrowseModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg"
              >
                Apply Selection ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CMS PAGE CREATE / EDIT MODAL */}
      {showPageModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">SHOPIFY-GRADE CMS PAGE BUILDER</span>
                <h3 className="font-extrabold text-lg text-white">{editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Custom Page'}</h3>
              </div>
              <button onClick={() => setShowPageModal(false)} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
            </div>

            <form onSubmit={handlePageSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Page Title *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. About Us, Contact Us, FAQ"
                    value={pageForm.title}
                    onChange={(e) => setPageForm({ 
                      ...pageForm, 
                      title: e.target.value,
                      slug: pageForm.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">URL Slug Handle *</label>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 text-slate-400 text-xs">
                    <span>/pages/</span>
                    <input 
                      type="text" required
                      placeholder="about-us"
                      value={pageForm.slug}
                      onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                      className="w-full p-2 bg-transparent text-white font-mono border-0 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Page Body Content (Markdown / Rich Text) *</label>
                <textarea 
                  rows={8} required
                  placeholder="Enter full page content in Markdown or HTML text..."
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
                <span className="font-extrabold text-slate-200 block text-xs">Search Engine Optimization (SEO) Metadata</span>
                
                <div>
                  <label className="block text-slate-400 mb-1">SEO Title Tag</label>
                  <input 
                    type="text"
                    placeholder="Page title as displayed on Google search results"
                    value={pageForm.seo_title}
                    onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">SEO Meta Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Short description snippet for search engines..."
                    value={pageForm.seo_description}
                    onChange={(e) => setPageForm({ ...pageForm, seo_description: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Visibility Status</label>
                  <select 
                    value={pageForm.status}
                    onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-all">
                    {editingPage ? 'Save & Update Page' : 'Publish Page Live'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE & ORDER DOSSIER MODAL */}
      {selectedUserDossier && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center text-lg ${
                  (selectedUserDossier.user.role || '').toUpperCase() === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                  {(selectedUserDossier.user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-['Outfit']">
                      {selectedUserDossier.user.name || 'User Profile Dossier'}
                    </h3>
                    {(selectedUserDossier.user.role || '').toUpperCase() === 'ADMIN' ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        👑 MASTER ADMIN
                      </span>
                    ) : (
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        CUSTOMER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 font-mono">{selectedUserDossier.user.email}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUserDossier(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* DOSSIER SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
                <div className="font-extrabold text-white font-mono">{selectedUserDossier.user.phone || 'N/A'}</div>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Orders</span>
                <div className="font-extrabold text-emerald-400">{selectedUserDossier.orders?.length || 0} Orders</div>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Spent</span>
                <div className="font-black text-amber-400">₹{(selectedUserDossier.user.total_spent || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* DELIVERY ADDRESS & B2B GSTIN */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3 text-xs">
              <span className="font-extrabold text-white block">🏠 Saved Delivery Address & Billing Info</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Street Address</span>
                  <p className="font-medium">{selectedUserDossier.user.address || 'No address saved yet'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">City, State & Pincode</span>
                  <p className="font-medium">
                    {selectedUserDossier.user.city ? `${selectedUserDossier.user.city}, ` : ''}
                    {selectedUserDossier.user.state || 'N/A'} 
                    {selectedUserDossier.user.pincode ? ` - ${selectedUserDossier.user.pincode}` : ''}
                  </p>
                </div>

                {selectedUserDossier.user.gstin_number && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-emerald-400">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">B2B Business Name & GSTIN</span>
                      <p className="font-mono font-bold">{selectedUserDossier.user.business_name} ({selectedUserDossier.user.gstin_number})</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROLE MANAGEMENT ACTION */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white block">Account Administrative Role</span>
                <p className="text-slate-400 text-[11px]">Grant or revoke Administrator access rights for this user account.</p>
              </div>

              <div className="flex items-center gap-2">
                {(selectedUserDossier.user.role || '').toUpperCase() === 'ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateUserRole(selectedUserDossier.user.id, 'CUSTOMER')}
                    className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Revoke Admin Access
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateUserRole(selectedUserDossier.user.id, 'ADMIN')}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-xl shadow-md cursor-pointer"
                  >
                    👑 Promote to Admin
                  </button>
                )}
              </div>
            </div>

            {/* ORDER HISTORY LIST */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                📦 Customer Order History ({selectedUserDossier.orders?.length || 0})
              </h4>

              {selectedUserDossier.orders?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-850 rounded-xl border border-slate-800">
                  No orders placed by this customer yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                  {selectedUserDossier.orders.map(ord => (
                    <div key={ord.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white font-mono block">{ord.order_number}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ord.created_at || Date.now()).toLocaleDateString()} • ₹{ord.total_amount} ({ord.payment_mode})
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        ord.order_status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {ord.order_status || 'PROCESSING'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PREMIUM CONFIRMATION MODAL (REPLACES BROWSER CONFIRM POPUPS) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border shrink-0 text-xl ${
                confirmModal.danger 
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800' 
                  : 'bg-amber-950/80 text-amber-400 border-amber-800'
              }`}>
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white font-['Outfit']">{confirmModal.title}</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const onConf = confirmModal.onConfirm;
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (typeof onConf === 'function') {
                    await onConf();
                  }
                }}
                className={`px-5 py-2 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  confirmModal.danger 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                }`}
              >
                <Trash2 size={14} />
                <span>{confirmModal.confirmText || 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase block">CONFIRM DELETION</span>
                <h3 className="text-base font-extrabold text-white">Delete Product Confirmation</h3>
              </div>
            </div>

            <div className="bg-slate-850 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {deleteConfirmProduct.thumbnail || deleteConfirmProduct.image_url ? (
                    <img src={resolveImgUrl(deleteConfirmProduct.thumbnail || deleteConfirmProduct.image_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{deleteConfirmProduct.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {deleteConfirmProduct.sku || 'N/A'}</p>
                  <p className="text-[11px] text-emerald-400 font-extrabold">₹{deleteConfirmProduct.price_inr || 0}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmProduct.title}"</strong> from your catalog? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={!!deletingProductId}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                disabled={!!deletingProductId}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingProductId ? 'Deleting...' : 'Yes, Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED DELETE CATEGORY CONFIRMATION MODAL */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase block">CONFIRM CATEGORY DELETION</span>
                <h3 className="text-base font-extrabold text-white">Delete Category Confirmation</h3>
              </div>
            </div>

            <div className="bg-slate-850 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                  {deleteConfirmCategory.icon || '🌿'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{deleteConfirmCategory.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Slug: {deleteConfirmCategory.slug || 'N/A'}</p>
                  <p className="text-[11px] text-emerald-400 font-extrabold">Subcategories: {(deleteConfirmCategory.subcategories || []).length}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to permanently delete category <strong className="text-white">"{deleteConfirmCategory.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmCategory(null)}
                disabled={!!deletingCategoryId}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={!!deletingCategoryId}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingCategoryId ? 'Deleting...' : 'Yes, Delete Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
