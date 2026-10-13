import React from 'react';

// Providers & State Management
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { CheckoutProvider, useCheckout } from './context/CheckoutContext';
import { useRouter } from './hooks/useRouter';
import { useCatalog } from './hooks/useCatalog';

// Layout & Common Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import BrandLoader from './components/common/BrandLoader';
import SectionErrorBoundary from './components/common/SectionErrorBoundary';

// Store Views
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

/**
 * Inner Storefront Shell — consumes modular hooks and renders layout & active view
 */
function StorefrontLayout() {
  const { route, navigateTo } = useRouter();
  const { showToast } = useToast();

  const {
    currentUser,
    isAuthOpen,
    closeAuthModal,
    openAuthModal,
    customerForm,
    setCustomerForm,
    login,
    logout,
    updateUser
  } = useAuth();

  const {
    currency,
    setCurrency,
    currencySymbol,
    isAppLoading,
    isProductsLoading,
    isMaintenanceActive,
    isMaintenanceUnlocked,
    unlockMaintenance,
    settings,
    filterGroups,
    heroConfig,
    themeConfig,
    sectionsConfig,
    banners,
    categories,
    collections,
    products,
    bestProducts,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    mobileViewMode,
    setMobileViewMode,
    visibleCount,
    setVisibleCount,
    isLoadingMore,
    selectedFilters,
    setSelectedFilters,
    activeFilterDropdown,
    setActiveFilterDropdown,
    variantModalProduct,
    openVariantModal,
    closeVariantModal,
    getProductPricing
  } = useShop();

  const {
    cart,
    cartCount,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const {
    wishlist,
    wishlistCount,
    isWishlistOpen,
    openWishlist,
    closeWishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist
  } = useWishlist();

  const {
    showCheckoutModal,
    setShowCheckoutModal,
    checkoutData,
    isSubmittingOrder,
    orderSuccess,
    setOrderSuccess,
    selectedPaymentGateway,
    setSelectedPaymentGateway,
    availableGateways,
    showPaymentModal,
    setShowPaymentModal,
    pendingPaymentOrder,
    paymentPayableAmount,
    proceedToCheckout,
    submitOrder,
    handlePaymentSuccess,
    handlePaymentFailure
  } = useCheckout();

  const { sortedProducts, handleClearFilters } = useCatalog();

  // 1. Initial Brand Loader
  if (isAppLoading) {
    return <BrandLoader text="Loading ValueLife Essentials..." fullScreen={true} />;
  }

  // 2. Maintenance Gatekeeper
  if (isMaintenanceActive && !isMaintenanceUnlocked) {
    return <MaintenancePage onUnlock={unlockMaintenance} />;
  }

  const isCatalog = route.view === 'catalog' ||
    route.view === 'all_products' ||
    route.view === 'offers' ||
    route.view === 'bestsellers' ||
    route.view === 'new_arrivals' ||
    Boolean(searchQuery);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]" data-reticle-target="user-app-root">
      {/* HEADER */}
      <Header
        currency={currency}
        setCurrency={setCurrency}
        currencySymbol={currencySymbol}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={openCart}
        onOpenWishlist={openWishlist}
        currentUser={currentUser}
        onOpenAuth={() => currentUser ? navigateTo('/account', { view: 'account' }) : openAuthModal()}
        categories={categories}
        collections={collections}
        products={products}
        onSelectCategory={(cat) => navigateTo(`/category/${cat}`, { view: 'catalog', slug: null, category: cat, collection: null })}
        onSelectCollection={(coll) => navigateTo(`/collection/${coll}`, { view: 'catalog', slug: null, category: null, collection: coll })}
        onSelectAllProducts={() => navigateTo('/products', { view: 'all_products' })}
        onSelectOffers={() => navigateTo('/offers', { view: 'offers' })}
        onSelectBestSellers={() => navigateTo('/bestsellers', { view: 'bestsellers' })}
        onSelectNewArrivals={() => navigateTo('/new-arrivals', { view: 'new_arrivals' })}
        navigateTo={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => navigateTo('/search', { view: 'catalog' })}
        onGoHome={() => navigateTo('/', { view: 'store' })}
        onOpenPage={(slug) => slug === 'blog' ? navigateTo('/blog', { view: 'blog' }) : navigateTo(`/pages/${slug}`, { view: 'page', slug })}
        settings={settings}
        sectionsConfig={sectionsConfig}
        showToast={showToast}
      />

      {/* DYNAMIC VIEW ROUTING */}
      {route.view === 'account' || route.view === 'profile' ? (
        <SectionErrorBoundary name="Customer Profile">
          <CustomerProfilePage
            currentUser={currentUser}
            onLogout={() => {
              logout();
              navigateTo('/', { view: 'store' });
            }}
            onUpdateUser={updateUser}
            showToast={showToast}
            onGoHome={() => navigateTo('/', { view: 'store' })}
            onSelectProduct={(slug, pObj) => navigateTo(`/products/${slug || pObj?.slug}`, { view: 'pdp', slug: slug || pObj?.slug, id: pObj?.id })}
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
            onAddToCart={addToCart}
            onAddToWishlist={toggleWishlist}
            onBack={() => navigateTo('/products', { view: 'all_products' })}
            onSelectProduct={(slug) => navigateTo(`/product/${slug}`, { view: 'pdp', slug })}
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
          <PageView slug={route.slug} onGoHome={() => navigateTo('/', { view: 'store' })} showToast={showToast} />
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
            handleAddToCart={addToCart}
            handleToggleWishlist={toggleWishlist}
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
            handleAddToCart={addToCart}
            handleToggleWishlist={toggleWishlist}
            getProductPricing={getProductPricing}
            openVariantModal={openVariantModal}
          />
        </main>
      )}

      {/* FOOTER */}
      <Footer settings={settings} categories={categories} navigateTo={navigateTo} />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        currency={currency}
        currencySymbol={currencySymbol}
        onProceedToCheckout={proceedToCheckout}
        settings={settings}
        onAddToCart={addToCart}
        allProducts={products}
      />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={closeWishlist}
        wishlistItems={wishlist}
        onRemoveItem={removeFromWishlist}
        onAddToCart={addToCart}
        currency={currency}
        currencySymbol={currencySymbol}
      />

      {/* SELECT VARIANT MODAL */}
      <SelectVariantModal
        isOpen={Boolean(variantModalProduct)}
        onClose={closeVariantModal}
        product={variantModalProduct}
        currency={currency}
        currencySymbol={currencySymbol}
        onAddToCart={addToCart}
        onAddToWishlist={toggleWishlist}
        navigateTo={navigateTo}
        isWishlisted={isInWishlist(variantModalProduct?.id)}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        checkoutData={checkoutData}
        cart={cart}
        currencySymbol={currencySymbol}
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        currentUser={currentUser}
        handleOrderSubmit={submitOrder}
        isSubmittingOrder={isSubmittingOrder}
        selectedPaymentGateway={selectedPaymentGateway}
        setSelectedPaymentGateway={setSelectedPaymentGateway}
        orderSuccess={orderSuccess}
        setOrderSuccess={setOrderSuccess}
        navigateTo={navigateTo}
      />

      {/* PAYMENT GATEWAY MODAL */}
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

      {/* CUSTOMER AUTH MODAL */}
      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={closeAuthModal}
        currentUser={currentUser}
        onLoginSuccess={login}
        onLogout={logout}
      />

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav
        cartCount={cartCount}
        navigateTo={navigateTo}
        onOpenCart={openCart}
        currentUser={currentUser}
        onOpenAuth={() => currentUser ? navigateTo('/account', { view: 'account' }) : openAuthModal()}
      />
    </div>
  );
}

/**
 * Root Application Component with Composed Provider Architecture
 */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <WishlistProvider>
              <CheckoutProvider>
                <StorefrontLayout />
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
