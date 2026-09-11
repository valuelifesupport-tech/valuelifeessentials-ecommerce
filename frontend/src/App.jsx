import React, { useState, useEffect } from 'react';
import { getApiUrl, resolveImgUrl } from './api/config';
import { getProductPricing as getCalcProductPricing } from './utils/pricing';

// Layout & Common Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ToastNotification from './components/common/ToastNotification';
import BrandLoader from './components/common/BrandLoader';
import SectionErrorBoundary from './components/common/SectionErrorBoundary';

// Views
import StoreHomeView from './components/sections/StoreHomeView';
import CatalogView from './components/product/CatalogView';
import ProductDetailPage from './components/product/ProductDetailPage';
import PageView from './components/sections/PageView';
import CustomerProfilePage from './components/auth/CustomerProfilePage';
import MaintenancePage from './components/sections/MaintenancePage';

// Modals & Drawers
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import PaymentGatewayModal from './components/payment/PaymentGatewayModal';
import CustomerAuthModal from './components/auth/CustomerAuthModal';
import SelectVariantModal from './components/product/SelectVariantModal';

export default function App() {
  const getInitialRouteState = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return { view: 'admin', slug: null, category: null, collection: null };
    if (path.startsWith('/account') || path.startsWith('/profile')) return { view: 'account', slug: null, category: null, collection: null };
    if (path.startsWith('/products/')) {
      const slug = path.replace('/products/', '');
      return { view: 'pdp', slug, category: null, collection: null };
    }
    if (path === '/products') return { view: 'all_products', slug: null, category: null, collection: null };
    if (path === '/offers') return { view: 'offers', slug: null, category: null, collection: null };
    if (path === '/bestsellers') return { view: 'bestsellers', slug: null, category: null, collection: null };
    if (path === '/new-arrivals') return { view: 'new_arrivals', slug: null, category: null, collection: null };
    if (path.startsWith('/pages/')) {
      const slug = path.replace('/pages/', '');
      return { view: 'page', slug, category: null, collection: null };
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
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [settings, setSettings] = useState({ enable_multi_currency: 0 });
  const [heroConfig, setHeroConfig] = useState(null);
  const [themeConfig, setThemeConfig] = useState({
    active_preset: 'EMERALD',
    card_style: 'VALUELIFE_ESSENTIALS'
  });
  const [sectionsConfig, setSectionsConfig] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Cart & Wishlist
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('organic_cart')) || []; } catch (e) { return []; }
  });
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const openVariantModal = (p) => setVariantModalProduct(p);

  useEffect(() => {
    try { localStorage.setItem('organic_cart', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  // Auth & Checkout
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customerUser')) || null; } catch (e) { return null; }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', address: '', remark: '' });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState('razorpay');
  const [availableGateways, setAvailableGateways] = useState(['razorpay', 'phonepe', 'cod']);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [paymentPayableAmount, setPaymentPayableAmount] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRouteState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetch(getApiUrl('/api/settings')).then(r => r.json()).then(d => d && setSettings(d)).catch(() => {});
    fetch(getApiUrl('/api/filter-groups')).then(r => r.json()).then(d => d && setFilterGroups(d)).catch(() => {});
    fetch(getApiUrl('/api/hero-config')).then(r => r.json()).then(d => d && setHeroConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/theme-config')).then(r => r.json()).then(d => d && setThemeConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/sections-config')).then(r => r.json()).then(d => d && setSectionsConfig(d)).catch(() => {});
    fetch(getApiUrl('/api/maintenance/status')).then(r => r.json()).then(d => d?.maintenance_mode && setIsMaintenanceActive(true)).catch(() => {});
    fetch(getApiUrl('/api/currency/detect')).then(r => r.json()).then(d => { if (d.currency) { setCurrency(d.currency); setCurrencySymbol(d.symbol); } }).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrencySymbol(currency === 'INR' ? '₹' : '$');
  }, [currency]);

  useEffect(() => {
    if (route.view !== 'admin') {
      fetch(getApiUrl('/api/banners')).then(r => r.json()).then(d => setBanners(d || [])).catch(() => {});
      fetch(getApiUrl('/api/categories')).then(r => r.json()).then(d => setCategories(d || [])).catch(() => {});
      fetch(getApiUrl('/api/collections')).then(r => r.json()).then(d => setCollections(d || [])).catch(() => {});
      fetchProducts();
    }
  }, [route, searchQuery]);

  useEffect(() => {
    setVisibleCount(12);
  }, [route, selectedFilters, searchQuery, sortBy]);

  const navigateTo = (path, newRouteState) => {
    window.history.pushState({}, '', path);
    setRoute(newRouteState);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const getProductPricing = (p, curr = currency) => getCalcProductPricing(p, curr);

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const params = new URLSearchParams();
      if (route.category) params.append('category', route.category);
      if (route.collection) params.append('collection', route.collection);
      if (searchQuery) params.append('search', searchQuery);
      const url = getApiUrl('/api/products') + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);
      const rawData = await res.json();
      let data = Array.isArray(rawData) ? rawData : (rawData?.products || []);

      if (route.view === 'offers') {
        data = data.filter(p => getProductPricing(p).pct > 0);
      } else if (route.view === 'bestsellers') {
        data = data.filter(p => p && p.is_best_product === 1);
      } else if (route.view === 'new_arrivals') {
        data = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      }
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
    const isINR = currency === 'INR';
    const variants = Array.isArray(productPayload.variants) && productPayload.variants.length > 0 ? productPayload.variants : null;
    const selectedVariant = productPayload.variant || productPayload.selectedVariant || null;

    // If product has variants but user has not selected one, show the SelectVariantModal!
    if (variants && !selectedVariant) {
      setVariantModalProduct(productPayload);
      return;
    }

    const qty = productPayload.quantity || 1;
    const variantId = selectedVariant?.id || productPayload.variant_id || null;
    const variantName = selectedVariant?.variant_name || selectedVariant?.name || productPayload.variant_name || null;

    let itemPriceInr = Number(selectedVariant?.price_inr || selectedVariant?.price || productPayload.price_inr || productPayload.price || 0);
    let itemPriceUsd = Number(selectedVariant?.price_usd || productPayload.price_usd || Math.round(itemPriceInr / 40));
    const activePrice = isINR ? itemPriceInr : itemPriceUsd;
    const cartKey = variantId ? `${productPayload.id}_var_${variantId}` : `${productPayload.id}`;
    const itemThumbnail = selectedVariant?.image_url || productPayload.thumbnail || productPayload.image_url;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartKey === cartKey || (item.id === productPayload.id && item.variant_id === variantId));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
          price: activePrice
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...productPayload,
          cartKey,
          id: productPayload.id,
          variant_id: variantId,
          variant_name: variantName,
          thumbnail: itemThumbnail,
          price: activePrice,
          quantity: qty
        }
      ];
    });

    const displayTitle = variantName ? `${productPayload.title} (${variantName})` : productPayload.title;
    showToast('success', 'Added to Cart', `Added "${displayTitle}" to cart!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) handleRemoveFromCart(cartKey);
    else setCart(prev => prev.map(item => (item.cartKey === cartKey || item.id === cartKey) ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => !(item.cartKey === cartKey || item.id === cartKey)));
  };

  const handleToggleWishlist = (product, selectedVariant = null) => {
    const isINR = currency === 'INR';
    const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : null;
    const chosenVariant = selectedVariant || (variants ? variants[0] : null);
    const variantId = chosenVariant?.id || null;
    const variantName = chosenVariant?.variant_name || chosenVariant?.name || null;

    let itemPriceInr = Number(chosenVariant?.price_inr || chosenVariant?.price || product.price_inr || product.price || 0);
    let itemPriceUsd = Number(chosenVariant?.price_usd || product.price_usd || Math.round(itemPriceInr / 40));
    const activePrice = isINR ? itemPriceInr : itemPriceUsd;
    const itemThumbnail = chosenVariant?.image_url || product.thumbnail || product.image_url;

    setWishlist(prev => {
      const exists = prev.some(item => (variantId ? (item.id === product.id && item.variant_id === variantId) : item.id === product.id));
      if (exists) {
        showToast('info', 'Wishlist', `Removed "${product.title}" from wishlist.`);
        return prev.filter(item => !(variantId ? (item.id === product.id && item.variant_id === variantId) : item.id === product.id));
      }
      const displayTitle = variantName ? `${product.title} (${variantName})` : product.title;
      showToast('success', 'Wishlist', `Saved "${displayTitle}" to wishlist!`);
      return [...prev, {
        ...product,
        variant_id: variantId,
        variant_name: variantName,
        variant: chosenVariant,
        thumbnail: itemThumbnail,
        price: activePrice
      }];
    });
  };

  const handleProceedToCheckout = (data) => {
    if (!currentUser) {
      showToast('info', 'Login Required', 'Please login to proceed with order placement.');
      setIsAuthOpen(true);
      return;
    }
    setCheckoutData(data);
    setIsCartOpen(false);
    setShowCheckoutModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;
    if (!currentUser) {
      showToast('error', 'Login Required', 'Please sign in to place order.');
      setShowCheckoutModal(false);
      setIsAuthOpen(true);
      return;
    }

    const finalPhone = currentUser?.phone || customerForm.phone;
    if (!finalPhone || !customerForm.address) {
      showToast('error', 'Required Fields', 'Phone number and shipping address are required.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const isOnlinePay = checkoutData?.paymentMode === 'PREPAID' || checkoutData?.paymentMode === 'PARTIAL';
      const payableAmount = checkoutData?.paymentMode === 'PARTIAL' ? checkoutData?.depositAmount : checkoutData?.finalTotal;

      const orderRes = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          customer_name: currentUser.name || customerForm.name || 'Customer',
          customer_email: currentUser.email || customerForm.email,
          customer_phone: finalPhone,
          shipping_address: customerForm.address,
          order_notes: customerForm.remark || '',
          country: currency === 'INR' ? 'India' : 'International',
          currency,
          total_amount: checkoutData?.finalTotal || 0,
          paid_amount: isOnlinePay ? payableAmount : 0,
          remaining_amount: isOnlinePay ? Math.max(0, (checkoutData?.finalTotal || 0) - payableAmount) : (checkoutData?.finalTotal || 0),
          payment_mode: checkoutData?.paymentMode || 'COD',
          payment_gateway: selectedPaymentGateway,
          coupon_code: checkoutData?.appliedCoupon?.code || null,
          items: cart.map(i => ({ product_id: i.id, variant_id: i.variant_id, quantity: i.quantity, price: i.price }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      if (!isOnlinePay || currency !== 'INR') {
        setShowCheckoutModal(false);
        setOrderSuccess(orderData);
        setCart([]);
        showToast('success', 'Order Confirmed!', `Order #${orderData.orderNumber || orderData.order_number} confirmed!`);
      } else {
        setShowCheckoutModal(false);
        setPendingPaymentOrder(orderData);
        setPaymentPayableAmount(payableAmount);
        setShowPaymentModal(true);
      }
    } catch (err) {
      showToast('error', 'Order Error', err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setShowPaymentModal(false);
    setOrderSuccess(pendingPaymentOrder);
    setCart([]);
    showToast('success', 'Payment Received!', 'Order successfully paid and confirmed.');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setSelectedFilters({});
    navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null });
  };

  // Filter & Sort
  const filteredProducts = products.filter(p => {
    for (const [key, val] of Object.entries(selectedFilters)) {
      if (!val) continue;
      if (key === 'price_range') {
        const { pPrice } = getProductPricing(p);
        if (val === 'under_200' && pPrice >= 200) return false;
        if (val === '200_500' && (pPrice < 200 || pPrice > 500)) return false;
        if (val === '500_1000' && (pPrice < 500 || pPrice > 1000)) return false;
        if (val === 'above_1000' && pPrice <= 1000) return false;
        continue;
      }
      const text = `${p.title || ''} ${p.tags || ''} ${p.description || ''}`.toLowerCase();
      if (!text.includes(String(val).toLowerCase())) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPricing(a).pPrice;
    const priceB = getProductPricing(b).pPrice;
    if (sortBy === 'low_high') return priceA - priceB;
    if (sortBy === 'high_low') return priceB - priceA;
    return 0;
  });

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || visibleCount >= sortedProducts.length) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 500) {
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

  if (isAppLoading) return <BrandLoader text="Loading ValueLife Essentials..." fullScreen={true} />;

  if (route.view === 'admin') {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-600/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">🛡️</div>
          <h2 className="text-2xl font-black text-white font-['Outfit']">Admin Portal</h2>
          <a href="https://admin.valuelifeessentials.com" target="_blank" rel="noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 px-6 rounded-xl block">
            Open Dedicated Admin Portal →
          </a>
          <button onClick={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })} className="text-slate-400 text-xs font-bold hover:text-white cursor-pointer">
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  if (isMaintenanceActive && !isMaintenanceUnlocked && route.view !== 'admin') {
    return <MaintenancePage onUnlock={() => { setIsMaintenanceUnlocked(true); localStorage.setItem('maintenance_unlocked', 'true'); }} />;
  }

  const isCatalog = route.view === 'catalog' || route.view === 'all_products' || route.view === 'offers' || route.view === 'bestsellers' || route.view === 'new_arrivals' || !!searchQuery;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]" data-reticle-target="user-app-root">
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
        onOpenAuth={() => currentUser ? navigateTo('/account', { view: 'account', slug: null, category: null, collection: null }) : setIsAuthOpen(true)}
        categories={categories}
        collections={collections}
        onSelectCategory={(cat) => navigateTo(`/category/${cat}`, { view: 'catalog', slug: null, category: cat, collection: null })}
        onSelectCollection={(coll) => navigateTo(`/collection/${coll}`, { view: 'catalog', slug: null, category: null, collection: coll })}
        onSelectAllProducts={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
        onSelectOffers={() => navigateTo('/offers', { view: 'offers', slug: null, category: null, collection: null })}
        onSelectBestSellers={() => navigateTo('/bestsellers', { view: 'bestsellers', slug: null, category: null, collection: null })}
        onSelectNewArrivals={() => navigateTo('/new-arrivals', { view: 'new_arrivals', slug: null, category: null, collection: null })}
        navigateTo={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => navigateTo('/search', { view: 'catalog', slug: null, category: null, collection: null })}
        onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
        onOpenPage={(slug) => navigateTo(`/pages/${slug}`, { view: 'page', slug, category: null, collection: null })}
        settings={settings}
        sectionsConfig={sectionsConfig}
        showToast={showToast}
      />

      {route.view === 'account' || route.view === 'profile' ? (
        <SectionErrorBoundary name="Customer Profile">
          <CustomerProfilePage 
            currentUser={currentUser}
            onLogout={() => { setCurrentUser(null); localStorage.removeItem('customerUser'); navigateTo('/', { view: 'store', slug: null, category: null, collection: null }); }}
            onUpdateUser={(updated) => { setCurrentUser(updated); localStorage.setItem('customerUser', JSON.stringify(updated)); }}
            showToast={showToast}
            onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
            onSelectProduct={(slug, pObj) => navigateTo(`/products/${slug || pObj?.slug}`, { view: 'pdp', slug: slug || pObj?.slug, id: pObj?.id, category: null, collection: null })}
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
            onSelectProduct={(slug) => navigateTo(`/products/${slug}`, { view: 'pdp', slug, category: null, collection: null })}
            showToast={showToast}
          />
        </SectionErrorBoundary>
      ) : route.view === 'page' && route.slug ? (
        <SectionErrorBoundary name="Custom Page">
          <PageView slug={route.slug} onGoHome={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })} showToast={showToast} />
        </SectionErrorBoundary>
      ) : isCatalog ? (
        <main className="flex-1">
          <CatalogView 
            route={route}
            categories={categories}
            collections={collections}
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            activeFilterDropdown={activeFilterDropdown}
            setActiveFilterDropdown={setActiveFilterDropdown}
            mobileViewMode={mobileViewMode}
            setMobileViewMode={setMobileViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortedProducts={sortedProducts}
            isProductsLoading={isProductsLoading}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            isLoadingMore={isLoadingMore}
            wishlist={wishlist}
            currencySymbol={currencySymbol}
            themeConfig={themeConfig}
            searchQuery={searchQuery}
            navigateTo={navigateTo}
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            handleClearFilters={handleClearFilters}
            getProductPricing={getProductPricing}
            openVariantModal={openVariantModal}
          />
        </main>
      ) : (
        <main className="flex-1 space-y-12 pb-28 sm:pb-20">
          <StoreHomeView 
            heroConfig={heroConfig}
            sectionsConfig={sectionsConfig}
            banners={banners}
            categories={categories}
            collections={collections}
            bestProducts={bestProducts}
            wishlist={wishlist}
            currencySymbol={currencySymbol}
            themeConfig={themeConfig}
            navigateTo={navigateTo}
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            getProductPricing={getProductPricing}
            openVariantModal={openVariantModal}
          />
        </main>
      )}

      <Footer settings={settings} categories={categories} navigateTo={navigateTo} />

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

      <SelectVariantModal
        isOpen={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
        currency={currency}
        currencySymbol={currencySymbol}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleToggleWishlist}
        navigateTo={navigateTo}
        isWishlisted={wishlist.some(w => w.id === variantModalProduct?.id)}
      />

      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        checkoutData={checkoutData}
        cart={cart}
        currencySymbol={currencySymbol}
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        handleOrderSubmit={handleOrderSubmit}
        isSubmittingOrder={isSubmittingOrder}
        selectedPaymentGateway={selectedPaymentGateway}
        setSelectedPaymentGateway={setSelectedPaymentGateway}
        orderSuccess={orderSuccess}
        setOrderSuccess={setOrderSuccess}
        navigateTo={navigateTo}
      />

      <PaymentGatewayModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={pendingPaymentOrder}
        payableAmount={paymentPayableAmount}
        currency={currency}
        currencySymbol={currencySymbol}
        customerInfo={{ name: currentUser?.name || customerForm.name, email: currentUser?.email || customerForm.email, phone: currentUser?.phone || customerForm.phone }}
        activeGateway={selectedPaymentGateway}
        availableGateways={availableGateways}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={(err) => showToast('error', 'Payment Failed', err?.error || 'Payment declined.')}
      />

      <CustomerAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(u) => { setCurrentUser(u); localStorage.setItem('customerUser', JSON.stringify(u)); setIsAuthOpen(false); showToast('success', 'Signed In', `Welcome back, ${u.name || u.phone}!`); }}
        onLogout={() => { setCurrentUser(null); localStorage.removeItem('customerUser'); showToast('info', 'Signed Out', 'Signed out successfully.'); }}
      />

      <MobileBottomNav 
        cartCount={cart.length} 
        navigateTo={navigateTo} 
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => currentUser ? navigateTo('/account', { view: 'account', slug: null, category: null, collection: null }) : setIsAuthOpen(true)}
      />
    </div>
  );
}
