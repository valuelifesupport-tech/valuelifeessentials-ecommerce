import React, { useState } from 'react';
import { resolveImgUrl } from './api/config';

// Custom Hooks
import { useRouter } from './hooks/useRouter';
import { useAppData } from './hooks/useAppData';
import { useCartActions } from './hooks/useCartActions';
import { useWishlistActions } from './hooks/useWishlistActions';
import { useAuth } from './hooks/useAuth';
import { useCheckout } from './hooks/useCheckout';
import { useProductFilters } from './hooks/useProductFilters';

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
import BlogListingView from './components/blog/BlogListingView';
import BlogDetailView from './components/blog/BlogDetailView';
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
  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (type, title, message) => setToast({ type, title, message });

  // Search query — shared between useAppData (fetch) and useProductFilters (filter)
  const [searchQuery, setSearchQuery] = useState('');

  // Hook composition
  const { route, navigateTo } = useRouter();

  const { currentUser, setCurrentUser, isAuthOpen, setIsAuthOpen, customerForm, setCustomerForm } = useAuth(showToast);

  const {
    currency, setCurrency, currencySymbol,
    banners, categories, collections, products, bestProducts,
    filterGroups, settings, heroConfig, themeConfig, sectionsConfig,
    isAppLoading, isProductsLoading,
    isMaintenanceActive, isMaintenanceUnlocked, setIsMaintenanceUnlocked,
    getProductPricing
  } = useAppData(route, searchQuery);

  const {
    cart, setCart, isCartOpen, setIsCartOpen,
    variantModalProduct, setVariantModalProduct, openVariantModal,
    handleAddToCart, handleUpdateQuantity, handleRemoveFromCart
  } = useCartActions(currency, showToast);

  const {
    wishlist, setWishlist, isWishlistOpen, setIsWishlistOpen,
    handleToggleWishlist
  } = useWishlistActions(currency, showToast);

  const {
    selectedFilters, setSelectedFilters,
    activeFilterDropdown, setActiveFilterDropdown,
    sortBy, setSortBy,
    mobileViewMode, setMobileViewMode,
    visibleCount, setVisibleCount, isLoadingMore,
    sortedProducts,
    handleClearFilters
  } = useProductFilters(products, getProductPricing, navigateTo, route, searchQuery, setSearchQuery);

  const {
    showCheckoutModal, setShowCheckoutModal,
    checkoutData, isSubmittingOrder,
    orderSuccess, setOrderSuccess,
    selectedPaymentGateway, setSelectedPaymentGateway,
    availableGateways,
    showPaymentModal, setShowPaymentModal,
    pendingPaymentOrder, paymentPayableAmount,
    handleProceedToCheckout, handleOrderSubmit, handlePaymentSuccess
  } = useCheckout({
    currentUser, setCurrentUser, customerForm, setCustomerForm,
    cart, setCart, setIsCartOpen, setIsAuthOpen, currency, showToast
  });

  if (isAppLoading) return <BrandLoader text="Loading ValueLife Essentials..." fullScreen={true} />;

  if (isMaintenanceActive && !isMaintenanceUnlocked) {
    return <MaintenancePage onUnlock={() => { setIsMaintenanceUnlocked(true); sessionStorage.setItem('maintenance_unlocked', 'true'); }} />;
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
        products={products}
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
        onOpenPage={(slug) => slug === 'blog' ? navigateTo('/blog', { view: 'blog', slug: null }) : navigateTo(`/pages/${slug}`, { view: 'page', slug, category: null, collection: null })}
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
      ) : (route.view === 'pdp' || route.view === 'product') && route.slug ? (
        <SectionErrorBoundary name="Product Details Page">
          <ProductDetailPage 
            productSlug={route.slug}
            productId={route.id}
            currency={currency}
            currencySymbol={currencySymbol}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            onBack={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
            onSelectProduct={(slug) => navigateTo(`/product/${slug}`, { view: 'pdp', slug, category: null, collection: null })}
            showToast={showToast}
          />
        </SectionErrorBoundary>
      ) : route.view === 'blog' ? (
        <SectionErrorBoundary name="Wellness Journal">
          <BlogListingView navigateTo={navigateTo} showToast={showToast} />
        </SectionErrorBoundary>
      ) : route.view === 'blog_detail' && route.slug ? (
        <SectionErrorBoundary name="Article Detail">
          <BlogDetailView slug={route.slug} navigateTo={navigateTo} showToast={showToast} />
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
            settings={settings}
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
        onOpenVariantModal={(prod) => setVariantModalProduct(prod)}
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
        currentUser={currentUser}
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
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          try { localStorage.setItem('customerUser', JSON.stringify(u)); } catch (e) {}
          setCustomerForm(prev => ({
            name: u.name || prev?.name || '',
            phone: u.phone || prev?.phone || '',
            email: u.email || prev?.email || '',
            address: u.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
            remark: prev?.remark || ''
          }));
          setIsAuthOpen(false);
          showToast('success', 'Signed In', `Welcome back, ${u.name || u.phone}!`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          try { localStorage.removeItem('customerUser'); } catch (e) {}
          setCustomerForm({ name: '', phone: '', email: '', address: '', remark: '' });
          showToast('info', 'Signed Out', 'Signed out successfully.');
        }}
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
