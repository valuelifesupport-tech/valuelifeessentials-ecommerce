import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import ToastNotification from './components/common/ToastNotification';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
import ProductDetailPage from './components/product/ProductDetailPage';
import PageView from './components/sections/PageView';
import HeroSection from './components/sections/HeroSection';
import PromoBannerSlider, { SalesTickerNotification } from './components/sections/PromoBannerSlider';
import CategorySlider from './components/sections/CategorySlider';
import MobileBottomNav from './components/layout/MobileBottomNav';
import CustomerAuthModal from './components/auth/CustomerAuthModal';
import CustomerProfilePage from './components/auth/CustomerProfilePage';
import MaintenancePage from './components/sections/MaintenancePage';
import BrandLoader from './components/common/BrandLoader';
import SectionErrorBoundary from './components/common/SectionErrorBoundary';
import PaymentGatewayModal from './components/payment/PaymentGatewayModal';
import { getApiUrl } from './api/config';
import { 
  ShoppingBag, Heart, Star, ShieldCheck, Truck, RotateCcw, CheckCircle, 
  ArrowRight, PhoneCall, Mail, MapPin, Sparkles, Filter, Lock, Grid, SlidersHorizontal, List, LayoutGrid, Eye
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsAppIcon } from './components/layout/SocialIcons';

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

export default function App() {
  const getInitialRouteState = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return { view: 'admin', slug: null, category: null, collection: null };
    }
    if (path === '/account' || path === '/profile' || path === '/my-account') {
      return { view: 'account', slug: null, category: null, collection: null };
    }
    if (path === '/offers') {
      return { view: 'offers', slug: null, category: null, collection: null };
    }
    if (path === '/bestsellers' || path === '/best-sellers') {
      return { view: 'bestsellers', slug: null, category: null, collection: null };
    }
    if (path === '/new-arrivals' || path === '/newarrivals') {
      return { view: 'new_arrivals', slug: null, category: null, collection: null };
    }
    if (path.startsWith('/pages/') && path.split('/').length > 2 && path.split('/')[2] !== '') {
      const slug = path.split('/')[2];
      return { view: 'page', slug, category: null, collection: null };
    }
    if (path.startsWith('/products/') && path.split('/').length > 2 && path.split('/')[2] !== '') {
      const slug = path.split('/')[2];
      return { view: 'pdp', slug, category: null, collection: null };
    }
    if (path.startsWith('/product/') && path.split('/').length > 2 && path.split('/')[2] !== '') {
      const slug = path.split('/')[2];
      return { view: 'pdp', slug, category: null, collection: null };
    }
    if (path === '/products' || path === '/shop') {
      return { view: 'all_products', slug: null, category: null, collection: null };
    }
    if (path.startsWith('/category/')) {
      const category = path.replace('/category/', '');
      return { view: 'catalog', slug: null, category, collection: null };
    }
    if (path.startsWith('/collection/')) {
      const collection = path.replace('/collection/', '');
      return { view: 'catalog', slug: null, category: null, collection };
    }
    return { view: 'store', slug: null, category: null, collection: null };
  };

  const [route, setRoute] = useState(getInitialRouteState());
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isMaintenanceUnlocked, setIsMaintenanceUnlocked] = useState(() => {
    return localStorage.getItem('maintenance_unlocked') === 'true';
  });
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  
  const [banners, setBanners] = useState([]);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [settings, setSettings] = useState({ enable_multi_currency: 1 });
  const [heroConfig, setHeroConfig] = useState(null);
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
  const [sectionsConfig, setSectionsConfig] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [mobileViewMode, setMobileViewMode] = useState('grid');

  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser')) || null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('customerUser', JSON.stringify(user));
    showToast('success', 'Welcome Back!', `Signed in as ${user.name || user.phone}`);
    setIsAuthOpen(false);
    if (cart && cart.length > 0) {
      setIsCartOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('customerUser');
    showToast('info', 'Signed Out', 'You have signed out of your account.');
    navigateTo('/', { view: 'store', slug: null, category: null, collection: null });
  };

  const [toast, setToast] = useState(null);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Pluggable Payment Gateway States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [paymentPayableAmount, setPaymentPayableAmount] = useState(0);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState('razorpay');
  const [availableGateways, setAvailableGateways] = useState([]);

  useEffect(() => {
    fetch(getApiUrl('/api/payment/gateways'))
      .then(res => res.json())
      .then(data => {
        if (data?.gateways && Array.isArray(data.gateways)) {
          setAvailableGateways(data.gateways);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  const handleProceedToCheckout = (data) => {
    if (!currentUser) {
      showToast('info', 'Login Required 🔒', 'Order place karne ke liye kripya pehle Login/Register karein.');
      setIsAuthOpen(true);
      return;
    }
    setCheckoutData(data);
    setIsCartOpen(false);
    setShowCheckoutModal(true);
  };  useEffect(() => {
    const handlePopState = () => {
      setRoute(getInitialRouteState());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetch(getApiUrl('/api/settings'))
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});

    fetch(getApiUrl('/api/filter-groups'))
      .then(res => res.json())
      .then(data => { if (data) setFilterGroups(data); })
      .catch(() => {});

    fetch(getApiUrl('/api/hero-config'))
      .then(res => res.json())
      .then(data => { if (data) setHeroConfig(data); })
      .catch(() => {});

    fetch(getApiUrl('/api/theme-config'))
      .then(res => res.json())
      .then(data => { if (data && data.id) setThemeConfig(data); })
      .catch(() => {});

    fetch(getApiUrl('/api/sections-config'))
      .then(res => res.json())
      .then(data => { if (data && data.id) setSectionsConfig(data); })
      .catch(() => {});

    fetch(getApiUrl('/api/maintenance/status'))
      .then(res => res.json())
      .then(data => { if (data && data.maintenance_mode) setIsMaintenanceActive(true); })
      .catch(() => {});
  }, []);

  const navigateTo = (path, newRouteState) => {
    window.history.pushState({}, '', path);
    setRoute(newRouteState);
    window.scrollTo(0, 0);
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setSelectedFilters({});
    navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null });
    showToast('info', 'Filters Cleared', 'Showing all organic products catalog.');
  };

  useEffect(() => {
    fetch(getApiUrl('/api/currency/detect'))
      .then(res => res.json())
      .then(data => {
        if (data.currency) {
          setCurrency(data.currency);
          setCurrencySymbol(data.symbol);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrencySymbol(currency === 'INR' ? '₹' : '$');
  }, [currency]);

  useEffect(() => {
    if (route.view !== 'admin') {
      fetchBanners();
      fetchCategories();
      fetchCollections();
      fetchProducts();
    }
  }, [route, searchQuery]);

  useEffect(() => {
    setVisibleCount(12);
  }, [route, selectedFilters, searchQuery, sortBy]);

  const fetchBanners = async () => {
    try {
      const res = await fetch(getApiUrl('/api/banners'));
      setBanners(await res.json());
    } catch (err) {}
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(getApiUrl('/api/categories'));
      setCategories(await res.json());
    } catch (err) {}
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(getApiUrl('/api/collections'));
      setCollections(await res.json());
    } catch (err) {}
  };

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const params = new URLSearchParams();
      if (route.category) params.append('category', route.category);
      if (route.collection) params.append('collection', route.collection);
      if (searchQuery) params.append('search', searchQuery);

      const queryString = params.toString();
      const url = getApiUrl('/api/products') + (queryString ? `?${queryString}` : '');

      const res = await fetch(url);
      const rawData = await res.json();
      let data = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.products) ? rawData.products : []);

      if (route.view === 'offers') {
        data = data.filter(p => p && ((p.discount_inr > 0 && p.price_inr > p.discount_inr) || (p.discount_usd > 0 && p.price_usd > p.discount_usd)));
      } else if (route.view === 'bestsellers') {
        data = data.filter(p => p && p.is_best_product === 1);
      } else if (route.view === 'new_arrivals') {
        data = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      // Backend /api/products?collection=... already filters by collection accurately

      setProducts(data);
      setBestProducts(data.filter(p => p && p.is_best_product === 1));
    } catch (err) {
      setProducts([]);
      setBestProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleAddToCart = (productPayload) => {
    const qty = productPayload.quantity || 1;
    const isINR = currency === 'INR';

    // Extract selected variant object
    const selectedVariant = productPayload.variant || productPayload.selectedVariant || null;
    const variantId = selectedVariant?.id || productPayload.variant_id || null;
    const variantName = selectedVariant?.variant_name || selectedVariant?.name || productPayload.variant_name || null;

    // Determine exact unit price
    let itemPriceInr = productPayload.price_inr;
    let itemPriceUsd = productPayload.price_usd;

    if (selectedVariant) {
      itemPriceInr = Number(selectedVariant.discount_inr !== undefined && selectedVariant.discount_inr !== null && Number(selectedVariant.discount_inr) > 0 ? selectedVariant.discount_inr : (selectedVariant.price_inr || selectedVariant.price || productPayload.price_inr));
      itemPriceUsd = Number(selectedVariant.discount_usd !== undefined && selectedVariant.discount_usd !== null && Number(selectedVariant.discount_usd) > 0 ? selectedVariant.discount_usd : (selectedVariant.price_usd || selectedVariant.price || productPayload.price_usd));
    } else if (productPayload.price !== undefined && productPayload.price !== null) {
      if (isINR) itemPriceInr = Number(productPayload.price);
      else itemPriceUsd = Number(productPayload.price);
    }

    if (!itemPriceInr) itemPriceInr = Number(productPayload.discount_inr || productPayload.price_inr || 0);
    if (!itemPriceUsd) itemPriceUsd = Number(productPayload.discount_usd || productPayload.price_usd || Math.round(itemPriceInr / 40));

    const activePrice = isINR ? itemPriceInr : itemPriceUsd;

    const cartKey = variantId 
      ? `${productPayload.id}_var_${variantId}` 
      : (variantName ? `${productPayload.id}_var_${variantName.replace(/\s+/g, '_')}` : `${productPayload.id}`);

    const itemThumbnail = selectedVariant?.image_url || (Array.isArray(productPayload.images) ? productPayload.images[0] : null) || productPayload.thumbnail || productPayload.image_url;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartKey === cartKey || (item.id === productPayload.id && (item.variant_id === variantId || item.variant_name === variantName)));

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
          price: activePrice,
          price_inr: itemPriceInr,
          discount_inr: itemPriceInr,
          price_usd: itemPriceUsd,
          discount_usd: itemPriceUsd
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...productPayload,
          cartKey,
          id: productPayload.id,
          product_id: productPayload.id,
          title: productPayload.title,
          slug: productPayload.slug,
          thumbnail: itemThumbnail,
          image_url: itemThumbnail,
          variant_id: variantId,
          variant_name: variantName,
          variant: selectedVariant,
          selectedVariant,
          price: activePrice,
          price_inr: itemPriceInr,
          discount_inr: itemPriceInr,
          price_usd: itemPriceUsd,
          discount_usd: itemPriceUsd,
          quantity: qty,
          gst_percent: productPayload.gst_percent
        }
      ];
    });

    const toastTitle = variantName ? `Added ${variantName}` : 'Added to Cart';
    showToast('success', toastTitle, `Added "${productPayload.title}${variantName ? ` (${variantName})` : ''}" to cart!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartKey);
    } else {
      setCart(prev => prev.map(item => (item.cartKey === cartKey || item.id === cartKey) ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => !(item.cartKey === cartKey || item.id === cartKey)));
  };

  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast('info', 'Wishlist Updated', `Removed "${product.title}" from wishlist.`);
        return prev.filter(item => item.id !== product.id);
      }
      showToast('success', 'Saved to Wishlist', `Added "${product.title}" to wishlist!`);
      return [...prev, product];
    });
  };

  useEffect(() => {
    if (currentUser) {
      setCustomerForm(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    if (!currentUser) {
      showToast('error', 'Login Required 🔒', 'Order place karne ke liye Account Login hona anivarya hai.');
      setShowCheckoutModal(false);
      setIsAuthOpen(true);
      return;
    }

    if (!cart || cart.length === 0) {
      showToast('error', 'Cart Empty', 'Your shopping cart is empty.');
      return;
    }

    const finalPhone = currentUser?.phone || customerForm.phone;
    if (!finalPhone || !finalPhone.trim()) {
      showToast('error', 'Validation Error', 'Mobile phone number is mandatory.');
      return;
    }

    if (!customerForm.address || !customerForm.address.trim()) {
      showToast('error', 'Validation Error', 'Shipping home address is mandatory.');
      return;
    }

    const rawEmail = currentUser?.email || customerForm.email;
    const finalEmail = (rawEmail && rawEmail.trim()) ? rawEmail.trim() : `${finalPhone.replace(/[^\d+]/g, '')}@mobile.valuelifeessentials.com`;
    const finalName = currentUser?.name || customerForm.name || 'Customer';

    setIsSubmittingOrder(true);

    try {
      const isOnlinePay = checkoutData?.paymentMode === 'PREPAID' || checkoutData?.paymentMode === 'PARTIAL';
      const payableAmount = checkoutData?.paymentMode === 'PARTIAL' ? checkoutData?.depositAmount : checkoutData?.finalTotal;

      const orderRes = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id || null,
          customer_name: finalName,
          customer_email: finalEmail,
          customer_phone: finalPhone,
          shipping_address: customerForm.address,
          order_notes: customerForm.remark || '',
          country: currency === 'INR' ? 'India' : 'International',
          currency,
          total_amount: checkoutData?.finalTotal || 0,
          paid_amount: isOnlinePay ? payableAmount : 0,
          remaining_amount: isOnlinePay ? Math.max(0, (checkoutData?.finalTotal || 0) - payableAmount) : (checkoutData?.finalTotal || 0),
          payment_mode: checkoutData?.paymentMode || 'PARTIAL_COD',
          payment_gateway: selectedPaymentGateway || 'razorpay',
          items: cart.map(item => ({
            product_id: item.id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
            price: currency === 'INR' ? (item.discount_inr || item.price_inr) : (item.discount_usd || item.price_usd)
          }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        showToast('error', 'Order Error', orderData.error || 'Failed to place order.');
        setIsSubmittingOrder(false);
        return;
      }

      // If COD mode or non-online, complete immediately
      if (!isOnlinePay || currency !== 'INR') {
        setShowCheckoutModal(false);
        setOrderSuccess(orderData);
        setCart([]);
        showToast('success', 'Order Confirmed!', `Order ${orderData.orderNumber || orderData.order_number} placed successfully!`);
        setIsSubmittingOrder(false);
        return;
      }

      // Online payment via Pluggable Payment Gateway Modal (Supports Razorpay Dummy & Live)
      setShowCheckoutModal(false);
      setPendingPaymentOrder(orderData);
      setPaymentPayableAmount(payableAmount);
      setShowPaymentModal(true);

    } catch (err) {
      showToast('error', 'Order Error', 'Error connecting to server. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      await fetch(getApiUrl('/api/payment/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: paymentResult.gateway || selectedPaymentGateway || 'razorpay',
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
          payment_id: paymentResult.payment_id,
          order_id: pendingPaymentOrder?.orderId || pendingPaymentOrder?.order_id
        })
      });
    } catch (e) {}

    setShowPaymentModal(false);
    setOrderSuccess(pendingPaymentOrder);
    setCart([]);
    showToast('success', 'Payment Successful! 🎉', `Order confirmed with ${paymentResult.gateway?.toUpperCase() || 'RAZORPAY'} test payment.`);
  };

  const handlePaymentFailure = (err) => {
    showToast('error', 'Payment Failed', err?.error || 'Payment was declined by gateway simulator.');
  };

  const filteredProducts = products.filter(p => {
    for (const [filterKey, filterValue] of Object.entries(selectedFilters)) {
      if (!filterValue) continue;

      // 1. PRICE RANGE FILTER HANDLER
      if (filterKey === 'price_range') {
        const pPrice = currency === 'INR' ? (p.discount_inr || p.price_inr) : (p.discount_usd || p.price_usd);
        if (filterValue === 'under_200' && pPrice >= 200) return false;
        if (filterValue === '200_500' && (pPrice < 200 || pPrice > 500)) return false;
        if (filterValue === '500_1000' && (pPrice < 500 || pPrice > 1000)) return false;
        if (filterValue === 'above_1000' && pPrice <= 1000) return false;
        continue;
      }

      // 2. TAGS, TITLE, SPECS, CATEGORY & TYPE MATCHING
      const rawVal = String(filterValue).toLowerCase().replace(/_/g, ' ');
      const valWords = rawVal.split(' ').filter(w => w.length > 0);

      const titleText = (p.title || '').toLowerCase();
      const tagsText = (p.tags || '').toLowerCase();
      const typeText = (p.product_type || '').toLowerCase();
      const descText = (p.description || '').toLowerCase();
      const specsText = (p.specs_json || '').toLowerCase();
      const vendorText = (p.vendor || '').toLowerCase();

      const combinedText = `${titleText} ${tagsText} ${typeText} ${descText} ${specsText} ${vendorText}`;

      const directMatch = combinedText.includes(rawVal);
      const wordsMatch = valWords.every(w => combinedText.includes(w));

      if (!directMatch && !wordsMatch) {
        return false;
      }
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = currency === 'INR' ? (a.discount_inr || a.price_inr) : (a.discount_usd || a.price_usd);
    const priceB = currency === 'INR' ? (b.discount_inr || b.price_inr) : (b.discount_usd || b.price_usd);
    if (sortBy === 'low_high') return priceA - priceB;
    if (sortBy === 'high_low') return priceB - priceA;
    return 0;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;
      if (visibleCount >= sortedProducts.length) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 500;

      if (scrollPosition >= threshold) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length));
          setIsLoadingMore(false);
        }, 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, sortedProducts.length, isLoadingMore]);

  if (isAppLoading) {
    return <BrandLoader text="Loading ValueLife Essentials..." fullScreen={true} />;
  }

  if (route.view === 'admin') {
    return (
      <Suspense fallback={<BrandLoader text="Loading Admin Dashboard..." fullScreen={true} />}>
        <ToastNotification toast={toast} onClose={() => setToast(null)} />
        <AdminDashboard 
          onExitAdmin={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })} 
          showToast={showToast}
          sectionsConfig={sectionsConfig}
          onUpdateSectionsConfig={setSectionsConfig}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      </Suspense>
    );
  }

  if (isMaintenanceActive && !isMaintenanceUnlocked && route.view !== 'admin') {
    return (
      <MaintenancePage 
        onUnlock={() => {
          setIsMaintenanceUnlocked(true);
          localStorage.setItem('maintenance_unlocked', 'true');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <Header 
        currency={currency}
        setCurrency={setCurrency}
        currencySymbol={currencySymbol}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          if (currentUser) {
            navigateTo('/account', { view: 'account', slug: null, category: null, collection: null });
          } else {
            setIsAuthOpen(true);
          }
        }}
        categories={categories}
        collections={collections}
        onSelectCategory={(catSlug) => navigateTo(`/category/${catSlug}`, { view: 'catalog', slug: null, category: catSlug, collection: null })}
        onSelectCollection={(collSlug) => navigateTo(`/collection/${collSlug}`, { view: 'catalog', slug: null, category: null, collection: collSlug })}
        onSelectAllProducts={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
        onSelectOffers={() => navigateTo('/offers', { view: 'offers', slug: null, category: null, collection: null })}
        onSelectBestSellers={() => navigateTo('/bestsellers', { view: 'bestsellers', slug: null, category: null, collection: null })}
        onSelectNewArrivals={() => navigateTo('/new-arrivals', { view: 'new_arrivals', slug: null, category: null, collection: null })}
        navigateTo={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => navigateTo('/search', { view: 'catalog', slug: null, category: null, collection: null })}
        onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
        onOpenPage={(pageSlug) => navigateTo(`/pages/${pageSlug}`, { view: 'page', slug: pageSlug, category: null, collection: null })}
        settings={settings}
        sectionsConfig={sectionsConfig}
        showToast={showToast}
      />

      {route.view === 'account' || route.view === 'profile' ? (
        <SectionErrorBoundary name="Customer Profile">
          <CustomerProfilePage 
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            showToast={showToast}
            onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
            onSelectProduct={(slug, pObj) => {
              const pId = pObj?.id || (typeof pObj === 'number' ? pObj : null);
              const targetSlug = slug || pObj?.slug || (pId ? String(pId) : '');
              navigateTo(`/products/${targetSlug}`, { view: 'pdp', slug: targetSlug, id: pId, category: null, collection: null });
            }}
          />
        </SectionErrorBoundary>
      ) : route.view === 'pdp' && route.slug ? (
        <SectionErrorBoundary name="Product Details Page">
          <ProductDetailPage 
            productSlug={route.slug}
            productId={route.id}
            currency={currency}
            currencySymbol={currencySymbol}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            onBack={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
            onSelectProduct={(slug, pObj) => {
              const pId = pObj?.id || (typeof pObj === 'number' ? pObj : null);
              const targetSlug = slug || pObj?.slug || (pId ? String(pId) : '');
              navigateTo(`/products/${targetSlug}`, { view: 'pdp', slug: targetSlug, id: pId, category: null, collection: null });
            }}
            showToast={showToast}
          />
        </SectionErrorBoundary>
      ) : route.view === 'page' && route.slug ? (
        <SectionErrorBoundary name="Custom Page">
          <PageView 
            slug={route.slug} 
            onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
            showToast={showToast} 
          />
        </SectionErrorBoundary>
      ) : (
        <main className="flex-1 space-y-12 pb-28 sm:pb-20">
          {/* MULTI-STYLE DYNAMIC HERO SECTION */}
          {route.view === 'store' && !searchQuery && (
            <>
              {(!sectionsConfig || Number(sectionsConfig.show_hero) !== 0) && (
                <HeroSection heroConfig={heroConfig} navigateTo={navigateTo} sectionsConfig={sectionsConfig} />
              )}
              {(!sectionsConfig || Number(sectionsConfig.show_promo_banners) !== 0) && (
                <PromoBannerSlider navigateTo={navigateTo} sectionsConfig={sectionsConfig} banners={banners} />
              )}
              {(!sectionsConfig || Number(sectionsConfig.show_sales_ticker) !== 0) && (
                <SalesTickerNotification sectionsConfig={sectionsConfig} />
              )}
            </>
          )}

          {/* TRUST BADGES */}
          {(!sectionsConfig || Number(sectionsConfig.show_trust_badges) !== 0) && (
            <div className="bg-white py-6 border-b border-gray-200 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center font-bold text-lg">🌱</div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_1_title || '100% Pure Organic'}</h4>
                    <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_1_sub || 'Chemical-free bio products'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg">🚚</div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_2_title || 'Fast Home Delivery'}</h4>
                    <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_2_sub || 'Safe packaging across India'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg">💳</div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_3_title || 'Partial Payment & COD'}</h4>
                    <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_3_sub || 'Pay 20% deposit online'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-lg">⭐</div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_4_title || 'Top Rated Customer Service'}</h4>
                    <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_4_sub || '4.9 ★ Average Reviews'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CIRCULAR SHOP BY CATEGORIES SLIDER */}
          {route.view === 'store' && !searchQuery && (!sectionsConfig || Number(sectionsConfig.show_categories_slider) !== 0) && (
            <CategorySlider categories={categories} navigateTo={navigateTo} sectionTitle={sectionsConfig?.category_slider_title} sectionsConfig={sectionsConfig} />
          )}

          {/* CURATED PRODUCT COLLECTIONS SECTION */}
          {collections && collections.length > 0 && route.view === 'store' && !searchQuery && (
            <div className="max-w-7xl mx-auto px-4 space-y-6">
              <div className="bg-[#0f172a] text-white p-5 rounded-3xl border border-slate-800 flex justify-between items-center shadow-lg">
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                    📦 FEATURED CATALOG COLLECTIONS
                  </span>
                  <h2 className="text-2xl font-black text-white font-['Outfit']">Handpicked Collections</h2>
                </div>
                <button 
                  onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
                  className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Browse All Products →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {collections.map(col => {
                  const count = col.product_count !== undefined ? col.product_count : (col.product_ids ? col.product_ids.length : 0);
                  const coverImg = col.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';

                  return (
                    <div 
                      key={col.id}
                      onClick={() => navigateTo(`/collection/${col.slug || col.id}`, { view: 'catalog', slug: null, category: null, collection: col.id })}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col relative"
                    >
                      <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                        <img 
                          src={resolveImgUrl(coverImg)} 
                          alt={col.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                          <span className="bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full w-fit mb-1.5 shadow">
                            {count} {count === 1 ? 'Product' : 'Products'}
                          </span>
                          <h3 className="font-extrabold text-white text-lg font-['Outfit'] leading-snug group-hover:text-emerald-300 transition-colors">
                            {col.name}
                          </h3>
                        </div>
                      </div>

                      {col.description && (
                        <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                          <p className="text-xs text-gray-600 line-clamp-2">{col.description}</p>
                          <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-700 pt-2 border-t border-gray-100">
                            <span>Explore Collection</span>
                            <span>→</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BEST SELLERS SECTION */}
          {bestProducts.length > 0 && route.view === 'store' && !searchQuery && (!sectionsConfig || Number(sectionsConfig.show_bestsellers) !== 0) && (
            <div className="max-w-7xl mx-auto px-4 space-y-6">
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-800 tracking-widest flex items-center gap-1">
                    <Sparkles size={14} /> {sectionsConfig?.bestsellers_badge || 'HIGH DEMAND ITEMS'}
                  </span>
                  <h2 className="text-2xl font-black text-emerald-950 font-['Outfit']">{sectionsConfig?.bestsellers_title || '🔥 Best Seller Products'}</h2>
                </div>
                <button 
                  onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
                  className="text-xs font-extrabold text-[#2d6a4f] hover:underline"
                >
                  View All Products →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {bestProducts.map((p) => {
                  const isINR = currency === 'INR';
                  const rawPrice = isINR ? (Number(p.price_inr) || 0) : (Number(p.price_usd) || 0);
                  const rawDiscount = isINR 
                    ? (p.discount_inr !== undefined && p.discount_inr !== null && p.discount_inr > 0 ? Number(p.discount_inr) : null)
                    : (p.discount_usd !== undefined && p.discount_usd !== null && p.discount_usd > 0 ? Number(p.discount_usd) : null);
                  const rawCompare = isINR
                    ? (p.compare_price_inr !== undefined && p.compare_price_inr !== null && p.compare_price_inr > 0 ? Number(p.compare_price_inr) : null)
                    : (p.compare_price_usd !== undefined && p.compare_price_usd !== null && p.compare_price_usd > 0 ? Number(p.compare_price_usd) : null);

                  let pPrice = rawPrice;
                  if (rawDiscount !== null && rawDiscount > 0 && rawDiscount < rawPrice) {
                    pPrice = rawDiscount;
                  }

                  let pOriginal = pPrice;
                  if (rawCompare !== null && rawCompare > pPrice) {
                    pOriginal = rawCompare;
                  } else if (rawDiscount !== null && rawDiscount > 0 && rawPrice > pPrice) {
                    pOriginal = rawPrice;
                  }

                  const pct = pOriginal > pPrice ? Math.round(((pOriginal - pPrice) / pOriginal) * 100) : 0;
                  const isWish = wishlist.some(w => w.id === p.id);

                  return (
                    <div key={p.id} className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col group p-3 space-y-3">
                      <div 
                        onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
                        className="w-full h-48 sm:h-56 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-2 group/img"
                      >
                        <img 
                          src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                          alt={p.title}
                          className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
                          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
                            isWish ? 'bg-rose-600 text-white scale-105' : 'bg-[#f87171] hover:bg-rose-600 text-white hover:scale-105'
                          }`}
                          title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={15} fill="currentColor" color="white" />
                        </button>
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
                        <div className="space-y-1">
                          <h3 
                            onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
                            className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#3b6e14] cursor-pointer line-clamp-1 leading-snug"
                          >
                            {p.title}
                          </h3>

                          <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
                            <span>★★★★★</span>
                            <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 0).toFixed(2)}</span>
                            <span className="text-gray-400 font-medium">| {p.review_count || 24}</span>
                          </div>

                          <div className="flex items-baseline gap-1.5 flex-wrap pt-1">
                            <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
                            {pOriginal > pPrice && (
                              <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
                            )}
                            {pct > 0 && (
                              <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{pct}% Off
                              </span>
                            )}
                          </div>
                        </div>

                        {/* BUTTON STYLE DRIVEN BY ADMIN CARD STYLE SETTING */}
                        {(themeConfig?.card_style === 'CLASSIC_SPLIT') ? (
                          <div className="flex gap-1.5 pt-1">
                            <button 
                              onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                              className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => handleAddToCart(p)}
                              className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0"
                            >
                              + Add
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAddToCart(p)}
                            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer"
                          >
                            <ShoppingBag size={15} /> ADD TO CART
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATALOG / ALL PRODUCTS PAGE GRID (Matching valuelifeessentials.com screenshot) */}
          <div className="space-y-6 pb-12">
            {/* 1. HERO HEADER BANNER WITH OVERLAY TITLE & BREADCRUMB */}
            <div className="relative w-full h-48 sm:h-56 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 overflow-hidden flex items-center justify-center text-center">
              <div className="relative z-10 space-y-2 px-4">
                {(() => {
                  const getCategoryTitle = () => {
                    if (!route.category) return 'Catalog';
                    const found = (categories || []).find(c => String(c.id) === String(route.category) || c.slug === route.category);
                    if (found && found.name) return found.name;
                    return String(route.category).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };

                  const getCollectionTitle = () => {
                    if (!route.collection) return 'Catalog';
                    const found = (collections || []).find(c => String(c.id) === String(route.collection) || c.slug === route.collection);
                    if (found && found.name) return found.name;
                    return String(route.collection).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };

                  const titleText = route.view === 'offers' ? '🔥 Special Organic Offers & Discount Deals' :
                    route.view === 'bestsellers' ? '⭐ Best Seller Organic Products' :
                    route.view === 'new_arrivals' ? '✨ New Arrivals & Fresh Stock' :
                    route.view === 'all_products' ? 'All Organic Products' :
                    route.category ? getCategoryTitle() :
                    route.collection ? getCollectionTitle() :
                    'Organic Seeds';

                  const breadcrumbText = route.view === 'offers' ? 'Offers' :
                    route.view === 'bestsellers' ? 'Best Sellers' :
                    route.view === 'new_arrivals' ? 'New Arrivals' :
                    route.category ? getCategoryTitle() :
                    route.collection ? getCollectionTitle() : 'Catalog';

                  return (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Outfit']">
                        {titleText}
                      </h1>
                      <p className="text-xs font-bold text-emerald-200">
                        <span>Home</span> / <span className="text-white font-extrabold">{breadcrumbText}</span>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 space-y-6">
              {/* 2. DYNAMIC PRODUCT FILTER PILLS ROW (MANAGED IN ADMIN PANEL) */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-gray-700 pt-2 relative z-20">
                {filterGroups.map(grp => {
                  const activeVal = selectedFilters[grp.filter_key];
                  const selectedOpt = grp.options?.find(o => o.value === activeVal);

                  return (
                    <div key={grp.id} className="relative">
                      <button 
                        onClick={() => setActiveFilterDropdown(activeFilterDropdown === grp.id ? null : grp.id)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${
                          activeVal 
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' 
                            : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600'
                        }`}
                      >
                        <span>{selectedOpt ? `${grp.name}: ${selectedOpt.label}` : `${grp.name}`}</span>
                        <span className="text-[10px] opacity-70">▼</span>
                      </button>

                      {/* DROPDOWN OPTIONS */}
                      {activeFilterDropdown === grp.id && (
                        <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 text-xs font-medium space-y-1">
                          <button 
                            onClick={() => {
                              const newSel = { ...selectedFilters };
                              delete newSel[grp.filter_key];
                              setSelectedFilters(newSel);
                              setActiveFilterDropdown(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[11px] font-bold"
                          >
                            All {grp.name} (Clear)
                          </button>
                          {grp.options?.map(opt => (
                            <button 
                              key={opt.id}
                              onClick={() => {
                                setSelectedFilters({ ...selectedFilters, [grp.filter_key]: opt.value });
                                setActiveFilterDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                activeVal === opt.value 
                                  ? 'bg-emerald-50 text-emerald-800 font-bold' 
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {activeVal === opt.value && <span className="text-emerald-600 font-black">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Object.keys(selectedFilters).length > 0 && (
                  <button 
                    onClick={() => setSelectedFilters({})}
                    className="px-3 py-1 rounded-full text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Clear All Filters ✕
                  </button>
                )}
              </div>

              {/* 3. MOBILE & DESKTOP CONTROLS BAR (Matching User Mobile Screenshot 1-to-1) */}
              <div className="flex flex-wrap justify-between items-center border-t border-b border-gray-200 py-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-gray-800">
                    <SlidersHorizontal size={16} className="text-[#3b6e14]" />
                    <span>Filter and sort</span>
                  </div>

                  {/* LIST VIEW & GRID VIEW TOGGLES (Matching Screenshot 1 & 2) */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-gray-300 shadow-sm">
                    <button 
                      type="button"
                      onClick={() => setMobileViewMode('list')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        mobileViewMode === 'list' 
                          ? 'bg-[#4a7729] text-white shadow' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`} 
                      title="List View"
                    >
                      <List size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMobileViewMode('grid')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        mobileViewMode === 'grid' 
                          ? 'bg-[#4a7729] text-white shadow' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`} 
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-gray-500 font-['Outfit']">
                    {sortedProducts.length} Products
                  </span>

                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 text-xs font-bold text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:border-[#3b6e14] cursor-pointer shadow-sm"
                  >
                    <option value="default">Sort by ▾</option>
                    <option value="low_high">Price: Low to High</option>
                    <option value="high_low">Price: High to Low</option>
                  </select>

                  {(route.category || route.collection || searchQuery || route.view === 'all_products') && (
                    <button 
                      onClick={handleClearFilters}
                      className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-full hover:bg-red-100 border border-red-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* 4. PRODUCT CARDS GRID (Exact match to VALUELIFE ESSENTIALS screenshot) */}
              {isProductsLoading ? (
                <div className="py-20 text-center space-y-4 bg-white/70 rounded-3xl border border-gray-200/80 shadow-sm my-6">
                  <div className="w-12 h-12 border-4 border-[#3b6e14] border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-gray-800 tracking-wide uppercase font-['Outfit'] animate-pulse">
                      🌱 Loading Fresh Organic Products...
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">Fetching catalog from ValueLife Essentials server</p>
                  </div>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm my-8">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    🔍
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 font-['Outfit']">No Matching Organic Products Found</h3>
                    <p className="text-xs text-slate-500 font-medium">No products match your selected filter options. Try clearing active filter pills.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedFilters({})}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Clear Active Filter Pills ✕
                  </button>
                </div>
              ) : (
                <div className={`grid ${mobileViewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 sm:gap-5`}>
                  {sortedProducts.slice(0, visibleCount).map((p) => {
                  const isINR = currency === 'INR';
                  const rawPrice = isINR ? (Number(p.price_inr) || 0) : (Number(p.price_usd) || 0);
                  const rawDiscount = isINR 
                    ? (p.discount_inr !== undefined && p.discount_inr !== null && p.discount_inr > 0 ? Number(p.discount_inr) : null)
                    : (p.discount_usd !== undefined && p.discount_usd !== null && p.discount_usd > 0 ? Number(p.discount_usd) : null);
                  const rawCompare = isINR
                    ? (p.compare_price_inr !== undefined && p.compare_price_inr !== null && p.compare_price_inr > 0 ? Number(p.compare_price_inr) : null)
                    : (p.compare_price_usd !== undefined && p.compare_price_usd !== null && p.compare_price_usd > 0 ? Number(p.compare_price_usd) : null);

                  let pPrice = rawPrice;
                  if (rawDiscount !== null && rawDiscount > 0 && rawDiscount < rawPrice) {
                    pPrice = rawDiscount;
                  }

                  let pOriginal = pPrice;
                  if (rawCompare !== null && rawCompare > pPrice) {
                    pOriginal = rawCompare;
                  } else if (rawDiscount !== null && rawDiscount > 0 && rawPrice > pPrice) {
                    pOriginal = rawPrice;
                  }

                  const pct = pOriginal > pPrice ? Math.round(((pOriginal - pPrice) / pOriginal) * 100) : 0;
                    const isWish = wishlist.some(w => w.id === p.id);

                    if (mobileViewMode === 'list') {
                      return (
                        <div key={p.id} className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all flex flex-row items-center p-3.5 gap-4 group relative">
                          {/* LEFT IMAGE BOX WITH FLOATING QUICK VIEW & TOP-RIGHT WISHLIST BUTTON */}
                          <div 
                            onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                            className="w-36 sm:w-44 h-36 sm:h-44 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center p-2 border border-gray-200/80 group/img"
                          >
                            <img 
                              src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                              alt={p.title}
                              className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
                            />
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
                              className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
                                isWish ? 'bg-rose-600 text-white scale-105' : 'bg-[#f87171] hover:bg-rose-600 text-white hover:scale-105'
                              }`}
                              title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              <Heart size={14} fill="currentColor" color="white" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null });
                              }}
                              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow border border-gray-200 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                            >
                              <Eye size={12} className="text-[#3b6e14]" /> QUICK VIEW
                            </button>
                          </div>

                          {/* RIGHT DETAILS COLUMN */}
                          <div className="flex-1 space-y-2 flex flex-col justify-between py-1 min-w-0">
                            <div className="space-y-1">
                              <h3 
                                onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                                className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#3b6e14] cursor-pointer line-clamp-2 leading-snug hover:underline"
                              >
                                {p.title}
                              </h3>

                              <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
                                <span>★★★★★</span>
                                <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 0).toFixed(2)}</span>
                                <span className="text-gray-400 font-medium">| {p.review_count || 56}</span>
                              </div>

                              <div className="flex items-baseline gap-1.5 flex-wrap pt-1">
                                <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
                                {pOriginal > pPrice && (
                                  <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
                                )}
                                {pct > 0 && (
                                  <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    -{pct}% Off
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* BUTTON STYLE DRIVEN BY ADMIN CARD STYLE SETTING */}
                            {(themeConfig?.card_style === 'CLASSIC_SPLIT') ? (
                              <div className="flex gap-1.5 pt-1">
                                <button 
                                  onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                                  className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0"
                                >
                                  Details
                                </button>
                                <button 
                                  onClick={() => handleAddToCart(p)}
                                  className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0"
                                >
                                  + Add
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleAddToCart(p)}
                                className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-1 cursor-pointer"
                              >
                                <ShoppingBag size={15} /> ADD TO CART
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={p.id} className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col group p-3 space-y-3">
                        <div 
                          onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                          className="w-full h-52 sm:h-60 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-2 group/img"
                        >
                          <img 
                            src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                            alt={p.title}
                            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
                          />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
                              isWish ? 'bg-rose-600 text-white scale-105' : 'bg-[#f87171] hover:bg-rose-600 text-white hover:scale-105'
                            }`}
                            title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            <Heart size={15} fill="currentColor" color="white" />
                          </button>
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
                          <div className="space-y-1">
                            <h3 
                              onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                              className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#3b6e14] cursor-pointer line-clamp-1 leading-snug"
                            >
                              {p.title}
                            </h3>

                            <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
                              <span>★★★★★</span>
                              <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 0).toFixed(2)}</span>
                              <span className="text-gray-400 font-medium">| {p.review_count || 24}</span>
                            </div>

                            <div className="flex items-baseline gap-1.5 flex-wrap pt-1">
                              <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
                              {pOriginal > pPrice && (
                                <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
                              )}
                              {pct > 0 && (
                                <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  -{pct}% Off
                                </span>
                              )}
                            </div>
                          </div>

                          {/* BUTTON STYLE DRIVEN BY ADMIN CARD STYLE SETTING */}
                          {(themeConfig?.card_style === 'CLASSIC_SPLIT') ? (
                            <div className="flex gap-1.5 pt-1">
                              <button 
                                onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                                className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0"
                              >
                                Details
                              </button>
                              <button 
                                onClick={() => handleAddToCart(p)}
                                className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0"
                              >
                                + Add
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleAddToCart(p)}
                              className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer"
                            >
                              <ShoppingBag size={15} /> ADD TO CART
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* INFINITE SCROLL / LOAD ON SCROLL FOOTER SECTION */}
              {sortedProducts.length > 0 && (
                <div className="pt-8 pb-4 text-center space-y-4">
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-md" />
                      <span className="text-xs font-black text-emerald-800 tracking-wider uppercase animate-pulse">
                        🌱 Loading More Organic Products...
                      </span>
                    </div>
                  )}

                  {!isLoadingMore && visibleCount < sortedProducts.length && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length))}
                        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-2 mx-auto"
                      >
                        <Sparkles size={16} /> Load More Products ({sortedProducts.length - visibleCount} Remaining)
                      </button>
                      <p className="text-[11px] text-gray-500 font-semibold">
                        Scroll down to auto-load or click button above
                      </p>
                    </div>
                  )}

                  {visibleCount >= sortedProducts.length && sortedProducts.length > 0 && (
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold px-5 py-2.5 rounded-full shadow-sm">
                      <span>✨ All {sortedProducts.length} Organic Products Loaded!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1b4332] text-white border-t border-emerald-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img 
                src={settings?.logo_url ? resolveImgUrl(settings.logo_url) : "/valuelife_logo.png"} 
                alt={`${settings?.store_name || 'ValueLife Essentials'} Logo`} 
                className="h-9 w-auto object-contain bg-white/90 p-1 rounded-lg shadow-sm" 
              />
              <span className="font-extrabold text-lg text-white font-['Outfit'] tracking-tight uppercase">
                {settings?.store_name || 'VALUELIFE ESSENTIALS'}
              </span>
            </div>
            <p className="text-emerald-200/80 leading-relaxed">
              {settings?.store_description || settings?.store_tagline || 'Your 100% trusted online organic & wellness store. Supplying certified organic superfoods, seeds, pure supplements, and natural wellness products.'}
            </p>

            {/* SOCIAL MEDIA ICONS BAR */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">Connect & Follow Us:</span>
              <div className="flex items-center gap-2">
                <a href={settings?.instagram_url || "https://instagram.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" title="Instagram">
                  <InstagramIcon size={15} />
                </a>
                <a href={settings?.facebook_url || "https://facebook.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" title="Facebook">
                  <FacebookIcon size={15} />
                </a>
                <a href={settings?.youtube_url || "https://youtube.com/@valuelifeessentials"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" title="YouTube Channel">
                  <YoutubeIcon size={15} />
                </a>
                <a href={`https://wa.me/${(settings?.whatsapp_number || '919876543210').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-emerald-400 hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" title="WhatsApp Direct Chat">
                  <WhatsAppIcon size={15} />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-1.5 text-emerald-200/80">
              <li><button onClick={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">Home Page</button></li>
              <li><button onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">All Products Catalog</button></li>
              {(categories || []).slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => navigateTo(`/category/${cat.slug}`, { view: 'catalog', slug: null, category: cat.slug, collection: null })} 
                    className="hover:text-white transition-colors text-left cursor-pointer truncate max-w-full block"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Company & Policies</h4>
            <ul className="space-y-1.5 text-emerald-200/80">
              <li><button onClick={() => navigateTo('/pages/about-us', { view: 'page', slug: 'about-us', category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">About Us</button></li>
              <li><button onClick={() => navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us', category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => navigateTo('/pages/shipping-policy', { view: 'page', slug: 'shipping-policy', category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">Shipping & Delivery Policy</button></li>
              <li><button onClick={() => navigateTo('/pages/privacy-policy', { view: 'page', slug: 'privacy-policy', category: null, collection: null })} className="hover:text-white transition-colors text-left cursor-pointer">Privacy & Cookie Policy</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-emerald-200/80">
              <li className="flex items-center gap-2 font-medium">
                <span>📞</span>
                <span>{settings?.phone_number || settings?.support_phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span>✉️</span>
                <span>{settings?.support_email || settings?.email || 'support@valuelifeessentials.com'}</span>
              </li>
              <li className="flex items-center gap-2 font-medium text-[11px] text-emerald-300">
                <span>🌐</span>
                <span>{settings?.store_url || 'valuelifeessentials.com'}</span>
              </li>
            </ul>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm">
                <span>🔒</span> 256-Bit SSL Encrypted & Certified
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900/60 py-4 text-center text-[11px] text-emerald-300">
          © 2026 ValueLife Essentials (valuelifeessentials.com). All Rights Reserved. Fully Dynamic E-Commerce System.
        </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        currency={currency}
        currencySymbol={currencySymbol}
        onProceedToCheckout={handleProceedToCheckout}
        settings={settings}
        onAddToCart={handleAddToCart}
        allProducts={products}
      />

      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveItem={(id) => setWishlist(prev => prev.filter(w => w.id !== id))}
        onAddToCart={handleAddToCart}
        currency={currency}
        currencySymbol={currencySymbol}
      />

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && checkoutData && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h3 className="font-extrabold text-lg text-gray-900 font-['Outfit']">Customer Order Checkout</h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-emerald-200/60">
                <span>Items Subtotal ({cart.length} items):</span>
                <span>{currencySymbol}{checkoutData.rawSubtotal || checkoutData.finalTotal}</span>
              </div>

              {!checkoutData.isTaxInclusive ? (
                <div className="flex justify-between font-bold text-amber-800">
                  <span>GST Tax (Added at Checkout):</span>
                  <span>+{currencySymbol}{checkoutData.taxAmount || 0}</span>
                </div>
              ) : (
                <div className="flex justify-between font-medium text-emerald-800">
                  <span>Included GST Tax (Inclusive):</span>
                  <span>(Includes {currencySymbol}{checkoutData.taxAmount || 0} GST)</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-gray-900 pt-1 border-t border-emerald-300">
                <span>Total Order Amount:</span>
                <span className="text-emerald-800 text-sm font-black">{currencySymbol}{checkoutData.finalTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-0.5">
                <span>Payment Mode Selected:</span>
                <span>
                  {checkoutData.paymentMode === 'PARTIAL' 
                    ? '⚡ Partial Deposit (Balance Rest on COD)' 
                    : checkoutData.paymentMode === 'COD' 
                    ? '💵 100% Cash on Delivery (COD)' 
                    : '💳 100% Full Online Prepaid'}
                </span>
              </div>
              {checkoutData.paymentMode === 'PARTIAL' && (
                <div className="flex justify-between font-extrabold text-emerald-900 pt-1 border-t border-emerald-300">
                  <span>Pay Deposit Online Now:</span>
                  <span>{currencySymbol}{checkoutData.depositAmount}</span>
                </div>
              )}
              {checkoutData.paymentMode === 'COD' && (
                <div className="flex justify-between font-extrabold text-amber-950 pt-1 border-t border-amber-300">
                  <span>Pay Online Now:</span>
                  <span className="text-emerald-700 font-black">{currencySymbol}0 (Pay full cash on delivery)</span>
                </div>
              )}

              {/* PAYMENT GATEWAY SELECTION FOR ONLINE PAYMENTS */}
              {checkoutData.paymentMode !== 'COD' && (
                <div className="pt-2 border-t border-emerald-300/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                      <span>⚡</span> Gateway Provider:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">
                      {selectedPaymentGateway} (Test Mode)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'razorpay', label: 'Razorpay', badge: 'Active' },
                      { id: 'phonepe', label: 'PhonePe', badge: 'Ready' },
                      { id: 'paytm', label: 'Paytm', badge: 'Ready' }
                    ].map(gw => (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setSelectedPaymentGateway(gw.id)}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          selectedPaymentGateway === gw.id
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm ring-1 ring-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="font-extrabold text-[11px] leading-tight">{gw.label}</div>
                        <div className={`text-[8px] font-bold ${selectedPaymentGateway === gw.id ? 'text-emerald-200' : 'text-gray-400'}`}>{gw.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required placeholder="e.g. Rajesh Gupta"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number * (Mandatory)</label>
                  <input 
                    type="tel" required placeholder="e.g. +91 98123 45678"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input 
                    type="email" placeholder="e.g. rajesh@gmail.com (Optional)"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Shipping Home Address *</label>
                <textarea 
                  rows={2} required placeholder="Flat No., Street, Area, City, Pincode"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span>📝 Order Remark & Special Instructions (Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Please call before delivery, leave with security guard, pack in eco-friendly box..."
                  value={customerForm.remark || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, remark: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                ></textarea>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  💡 This remark will be attached to your order for the seller/admin to view in Admin Panel.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl border"
                >
                  Cancel
                </button>

                <button 
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order ({currencySymbol}{checkoutData.paymentMode === 'PARTIAL' ? checkoutData.depositAmount : checkoutData.finalTotal})</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS CONFIRMATION MODAL WITH CALIBRATED WRAPPER & CELEBRATORY ANIMATIONS */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="relative bg-slate-900 border border-emerald-500/30 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-emerald-950/80 animate-pop-bounce overflow-hidden">
            
            {/* FLOATING CELEBRATORY SPARKLES & CONFETTI */}
            <div className="absolute top-3 left-4 text-xl animate-float-particle">✨</div>
            <div className="absolute top-6 right-6 text-xl animate-float-particle" style={{ animationDelay: '0.6s' }}>🎉</div>
            <div className="absolute bottom-6 left-6 text-lg animate-float-particle" style={{ animationDelay: '1.2s' }}>📦</div>
            <div className="absolute bottom-4 right-5 text-xl animate-float-particle" style={{ animationDelay: '1.8s' }}>🌱</div>

            {/* GLOWING DOUBLE-RING CHECKMARK AVATAR */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-18 h-18 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 rounded-full flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/50">
                ✓
              </div>
            </div>

            {/* HEADER BADGE & ORDER TITLE */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>ORDER PLACED SUCCESSFULLY!</span>
              </div>
              <h3 className="font-extrabold text-2xl sm:text-3xl text-white font-['Outfit'] tracking-tight">
                {orderSuccess.order_number || orderSuccess.orderNumber || '#OB-88219'}
              </h3>
            </div>

            {/* CALIBRATED ORDER BREAKDOWN CARD */}
            <div className="bg-slate-850/90 rounded-2xl p-4 border border-slate-700/80 space-y-3 text-xs text-left shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Estimated Delivery:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🚚 2-3 Business Days
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Mode:</span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                  {orderSuccess.payment_mode || 'Partial COD (20% Paid)'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-extrabold text-sm">Order Total:</span>
                <span className="text-white font-black text-base font-['Outfit']">
                  {currencySymbol} {orderSuccess.total_amount || orderSuccess.totalAmount || '499.00'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thank you for shopping with ValueLife Essentials (valuelifeessentials.com)! Your order confirmation has been registered and is being processed for express home delivery.
            </p>

            {/* DUAL ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  setShowCheckoutModal(false); 
                  navigateTo('/account', { view: 'account', slug: null, category: null, collection: null }); 
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>📦 View My Orders</span>
              </button>
              <button 
                onClick={() => { setOrderSuccess(null); setShowCheckoutModal(false); navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null }); }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/80 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL PLUGGABLE PAYMENT GATEWAY MODAL (RAZORPAY DUMMY / LIVE + EXTENSIBLE) */}
      <PaymentGatewayModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={pendingPaymentOrder}
        payableAmount={paymentPayableAmount}
        currency={currency}
        currencySymbol={currencySymbol}
        customerInfo={{
          name: currentUser?.name || customerForm.name,
          email: currentUser?.email || customerForm.email,
          phone: currentUser?.phone || customerForm.phone
        }}
        activeGateway={selectedPaymentGateway}
        availableGateways={availableGateways}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />

      {/* CUSTOMER AUTHENTICATION & ACCOUNT MODAL */}
      <CustomerAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* MOBILE BOTTOM NAVIGATION DOCK (Matching User Screenshot) */}
      <MobileBottomNav 
        cartCount={cart.length} 
        navigateTo={navigateTo} 
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
