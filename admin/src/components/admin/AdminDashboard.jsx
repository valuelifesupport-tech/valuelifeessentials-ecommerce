import React, { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// Hooks
import useAdminAuth from '../../hooks/useAdminAuth';
import useAdminData from '../../hooks/useAdminData';
import useAdminModals from '../../hooks/useAdminModals';
import useProductActions from '../../hooks/useProductActions';
import useOrderActions from '../../hooks/useOrderActions';
import useCatalogActions from '../../hooks/useCatalogActions';
import useAdminConfig from '../../hooks/useAdminConfig';

// Layout Components
import AdminHeader from './layout/AdminHeader';
import AdminSidebar from './layout/AdminSidebar';
import AdminMobileDrawer from './layout/AdminMobileDrawer';
import AdminMobileBottomBar from './layout/AdminMobileBottomBar';

// Tab Components
import AnalyticsTab from './tabs/AnalyticsTab';
import ProductsTab from './tabs/ProductsTab';
import CategoriesTab from './tabs/CategoriesTab';
import CollectionsTab from './tabs/CollectionsTab';
import MediaTab from './tabs/MediaTab';
import BannersTab from './tabs/BannersTab';
import CouponsTab from './tabs/CouponsTab';
import ReviewsTab from './tabs/ReviewsTab';
import OrdersTab from './tabs/OrdersTab';
import UsersTab from './tabs/UsersTab';
import PagesTab from './tabs/PagesTab';
import AnnouncementTab from './tabs/AnnouncementTab';
import HeroTab from './tabs/HeroTab';
import FiltersTab from './tabs/FiltersTab';
import InventoryTab from './tabs/InventoryTab';
import SectionsTab from './tabs/SectionsTab';
import PaymentTab from './tabs/PaymentTab';
import TaxesTab from './tabs/TaxesTab';
import SettingsTab from './tabs/SettingsTab';

// Modal Components
import ProductModal from './modals/ProductModal';
import CollectionModal from './modals/CollectionModal';
import OrderDetailsModal from './modals/OrderDetailsModal';
import MediaPreviewModal from './modals/MediaPreviewModal';
import ProductMediaPickerModal from './modals/ProductMediaPickerModal';
import ManageVariantsModal from './modals/ManageVariantsModal';
import BannerModal from './modals/BannerModal';
import DiscountTypeModal from './modals/DiscountTypeModal';
import CouponModal from './modals/CouponModal';
import CategoryModal from './modals/CategoryModal';
import SubcategoryModal from './modals/SubcategoryModal';
import BrowseModal from './modals/BrowseModal';
import PageModal from './modals/PageModal';
import UserDossierModal from './modals/UserDossierModal';
import ConfirmModals from './modals/ConfirmModals';

export default function AdminDashboard({ onExitAdmin, showToast, sectionsConfig: propSectionsConfig, onUpdateSectionsConfig, settings: propSettings, onUpdateSettings }) {
  // --- Hooks ---
  const auth = useAdminAuth({ showToast });
  const data = useAdminData({ adminFetch: auth.adminFetch, isAuthLocked: auth.isAuthLocked });
  const modals = useAdminModals();
  const config = useAdminConfig({
    adminFetch: auth.adminFetch, fetchAdminData: data.fetchAdminData, showToast,
    propSectionsConfig, onUpdateSectionsConfig,
    propSettings, onUpdateSettings,
    settings: data.settings, setSettings: data.setSettings
  });
  const productActions = useProductActions({
    adminFetch: auth.adminFetch, products: data.products, setProducts: data.setProducts,
    categories: data.categories, fetchAdminData: data.fetchAdminData, showToast,
    setShowProductModal: modals.setShowProductModal, editingProduct: modals.editingProduct,
    setEditingProduct: modals.setEditingProduct, setDeleteConfirmProduct: modals.setDeleteConfirmProduct,
    setDeletingProductId: modals.setDeletingProductId
  });
  const orderActions = useOrderActions({
    adminFetch: auth.adminFetch, fetchAdminData: data.fetchAdminData, showToast,
    setSelectedOrderDetails: modals.setSelectedOrderDetails, setOrderNoteInput: modals.setOrderNoteInput,
    setCourierInput: modals.setCourierInput, setTrackingInput: modals.setTrackingInput,
    setAdminOrderStatusInput: modals.setAdminOrderStatusInput, setAdminCancelReasonInput: modals.setAdminCancelReasonInput
  });
  const catalogActions = useCatalogActions({
    adminFetch: auth.adminFetch, fetchAdminData: data.fetchAdminData, showToast,
    askConfirmation: modals.askConfirmation,
    setProducts: data.setProducts, setCollections: data.setCollections,
    setBanners: data.setBanners, setCoupons: data.setCoupons,
    setPages: data.setPages, setFilterGroups: data.setFilterGroups,
    setShowCategoryModal: modals.setShowCategoryModal, setShowCollectionModal: modals.setShowCollectionModal,
    setShowSubcategoryModal: modals.setShowSubcategoryModal, setShowBannerModal: modals.setShowBannerModal,
    setShowCouponModal: modals.setShowCouponModal, setShowPageModal: modals.setShowPageModal,
    setEditingCategory: modals.setEditingCategory, setEditingCollection: modals.setEditingCollection,
    setEditingPage: modals.setEditingPage,
    setDeleteConfirmCategory: modals.setDeleteConfirmCategory, setDeletingCategoryId: modals.setDeletingCategoryId,
    selectedProductForVariants: modals.selectedProductForVariants,
    setSelectedProductForVariants: modals.setSelectedProductForVariants,
    setSelectedUserDossier: modals.setSelectedUserDossier, setLoadingUserDossier: modals.setLoadingUserDossier,
    setUsers: data.setUsers
  });

  // Tab navigation
  const [activeTab, setActiveTab] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'analytics';
    return tab === 'theme' ? 'analytics' : tab;
  });

  // Tab lazy-loading
  useEffect(() => {
    data.fetchTabData(activeTab);
  }, [activeTab]);

  // --- Computed values ---
  const salesChartLabels = data.analytics?.salesChart?.map(d => {
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
      return d.date;
    } catch (e) { return d.date; }
  }) || [];

  const salesChartData = {
    labels: salesChartLabels.length ? salesChartLabels : Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: (data.analytics && Array.isArray(data.analytics.salesChart)) ? data.analytics.salesChart.map(d => Number(d.revenue || 0)) : [0, 0, 0, 0, 0, 0, 0],
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

  const counts = {
    products: data.products.length,
    categories: data.categories.length,
    collections: data.collections.length,
    mediaFiles: data.mediaFiles.length,
    filterGroups: data.filterGroups.length,
    orders: data.orders.length,
    users: data.users.length,
    banners: data.banners.length,
    coupons: data.coupons.length,
    reviews: data.reviews.length,
    pages: data.pages.length
  };

  // --- Auth Gate ---
  if (auth.isAuthLocked) {
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

          {auth.loginError && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3.5 rounded-xl font-bold text-center">
              ⚠️ {auth.loginError}
            </div>
          )}

          <form onSubmit={auth.handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Username / Email
              </label>
              <input
                type="text" required
                value={auth.loginForm.username}
                onChange={(e) => auth.setLoginForm({ ...auth.loginForm, username: e.target.value })}
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
                    auth.setLoginForm({ username: 'admin@valuelifeessentials.com', password: 'admin123' });
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                >
                  Auto-Fill (admin123)
                </button>
              </div>
              <input
                type="password" required
                value={auth.loginForm.password}
                onChange={(e) => auth.setLoginForm({ ...auth.loginForm, password: e.target.value })}
                placeholder="admin123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 block pt-1 font-mono">Accepted: admin123, 123456, valuelife2026</span>
            </div>

            <button
              type="submit"
              disabled={auth.isAuthenticating}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {auth.isAuthenticating ? 'Unlocking...' : 'Unlock Control Panel 🔑'}
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

  // --- Main Dashboard ---
  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden" data-reticle-target="admin-dashboard-root">
      {/* SIDEBAR (DESKTOP) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSubmenus={config.openSubmenus}
        toggleSubmenu={config.toggleSubmenu}
        counts={counts}
        fetchAdminData={data.fetchAdminData}
        onExitAdmin={onExitAdmin}
        onLogout={auth.handleAdminLogout}
      />

      {/* MOBILE DRAWER */}
      <AdminMobileDrawer
        isOpen={modals.isMobileMenuOpen}
        onClose={() => modals.setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSubmenus={config.openSubmenus}
        toggleSubmenu={config.toggleSubmenu}
        counts={counts}
        fetchAdminData={data.fetchAdminData}
        onExitAdmin={onExitAdmin}
        onLogout={auth.handleAdminLogout}
      />

      {/* MOBILE BOTTOM BAR */}
      <AdminMobileBottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={data.orders.length}
        onOpenAllTabs={() => modals.setIsMobileMenuOpen(true)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AdminHeader
          activeTab={activeTab}
          liveUsers={data.analytics?.liveUsers ?? 0}
          onOpenMobileMenu={() => modals.setIsMobileMenuOpen(true)}
          onLogout={auth.handleAdminLogout}
        />

        <main className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex-1 min-w-0 overflow-x-hidden pb-24 md:pb-6">
          {activeTab === 'analytics' && (
            <AnalyticsTab
              analytics={data.analytics}
              orders={data.orders}
              products={data.products}
              reviews={data.reviews}
              salesChartData={salesChartData}
              handleDownloadGstCSV={config.handleDownloadGstCSV}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              categories={data.categories}
              filteredProducts={productActions.filteredProducts}
              productSearchQuery={productActions.productSearchQuery}
              setProductSearchQuery={productActions.setProductSearchQuery}
              productCategoryFilter={productActions.productCategoryFilter}
              setProductCategoryFilter={productActions.setProductCategoryFilter}
              productStatusFilter={productActions.productStatusFilter}
              setProductStatusFilter={productActions.setProductStatusFilter}
              adminProductPage={productActions.adminProductPage}
              setAdminProductPage={productActions.setAdminProductPage}
              adminItemsPerPage={productActions.adminItemsPerPage}
              setEditingProduct={modals.setEditingProduct}
              setProductForm={productActions.setProductForm}
              defaultProductForm={productActions.defaultProductForm}
              setShowProductModal={modals.setShowProductModal}
              setSelectedProductForVariants={modals.setSelectedProductForVariants}
              setDeleteConfirmProduct={modals.setDeleteConfirmProduct}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={data.categories}
              setEditingCategory={modals.setEditingCategory}
              setCategoryForm={catalogActions.setCategoryForm}
              setShowCategoryModal={modals.setShowCategoryModal}
              setSelectedCatForSubcat={modals.setSelectedCatForSubcat}
              setShowSubcategoryModal={modals.setShowSubcategoryModal}
              setDeleteConfirmCategory={modals.setDeleteConfirmCategory}
              adminFetch={auth.adminFetch}
              fetchAdminData={data.fetchAdminData}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsTab
              collections={data.collections}
              setCollections={data.setCollections}
              setEditingCollection={modals.setEditingCollection}
              setCollectionForm={catalogActions.setCollectionForm}
              setShowCollectionModal={modals.setShowCollectionModal}
              adminFetch={auth.adminFetch}
              fetchAdminData={data.fetchAdminData}
              showToast={showToast}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              mediaFiles={data.mediaFiles}
              mediaUploading={catalogActions.mediaUploading}
              setMediaUploading={catalogActions.setMediaUploading}
              mediaSearch={catalogActions.mediaSearch}
              setMediaSearch={catalogActions.setMediaSearch}
              mediaFilter={catalogActions.mediaFilter}
              setMediaFilter={catalogActions.setMediaFilter}
              mediaCacheBuster={catalogActions.mediaCacheBuster}
              setMediaCacheBuster={catalogActions.setMediaCacheBuster}
              setPreviewMediaItem={modals.setPreviewMediaItem}
              adminFetch={auth.adminFetch}
              fetchAdminData={data.fetchAdminData}
              showToast={showToast}
            />
          )}

          {activeTab === 'banners' && (
            <BannersTab
              banners={data.banners}
              setBanners={data.setBanners}
              setShowBannerModal={modals.setShowBannerModal}
              sectionsConfig={config.sectionsConfig}
              adminFetch={auth.adminFetch}
              showToast={showToast}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsTab
              coupons={data.coupons}
              setCoupons={data.setCoupons}
              setShowDiscountTypeModal={modals.setShowDiscountTypeModal}
              setCouponForm={catalogActions.setCouponForm}
              setEditingCouponId={catalogActions.setEditingCouponId}
              setSelectedDiscountType={modals.setSelectedDiscountType}
              setShowCouponModal={modals.setShowCouponModal}
              adminFetch={auth.adminFetch}
              showToast={showToast}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={data.reviews}
              setReviews={data.setReviews}
              products={data.products}
              reviewSearchQuery={catalogActions.reviewSearchQuery}
              setReviewSearchQuery={catalogActions.setReviewSearchQuery}
              reviewProductFilter={catalogActions.reviewProductFilter}
              setReviewProductFilter={catalogActions.setReviewProductFilter}
              reviewStatusFilter={catalogActions.reviewStatusFilter}
              setReviewStatusFilter={catalogActions.setReviewStatusFilter}
              reviewRatingFilter={catalogActions.reviewRatingFilter}
              setReviewRatingFilter={catalogActions.setReviewRatingFilter}
              reviewPage={catalogActions.reviewPage}
              setReviewPage={catalogActions.setReviewPage}
              reviewItemsPerPage={catalogActions.reviewItemsPerPage}
              adminFetch={auth.adminFetch}
              showToast={showToast}
              askConfirmation={modals.askConfirmation}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={data.orders}
              orderSearchQuery={orderActions.orderSearchQuery}
              setOrderSearchQuery={orderActions.setOrderSearchQuery}
              orderStatusFilter={orderActions.orderStatusFilter}
              setOrderStatusFilter={orderActions.setOrderStatusFilter}
              orderPaymentFilter={orderActions.orderPaymentFilter}
              setOrderPaymentFilter={orderActions.setOrderPaymentFilter}
              orderPage={orderActions.orderPage}
              setOrderPage={orderActions.setOrderPage}
              orderItemsPerPage={orderActions.orderItemsPerPage}
              handleFetchOrderDetails={orderActions.handleFetchOrderDetails}
              handleOrderStatus={orderActions.handleOrderStatus}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={data.users}
              userSearchQuery={catalogActions.userSearchQuery}
              setUserSearchQuery={catalogActions.setUserSearchQuery}
              userRoleFilter={catalogActions.userRoleFilter}
              setUserRoleFilter={catalogActions.setUserRoleFilter}
              userPage={catalogActions.userPage}
              setUserPage={catalogActions.setUserPage}
              userItemsPerPage={catalogActions.userItemsPerPage}
              handleDownloadUsersCSV={catalogActions.handleDownloadUsersCSV}
              handleViewUserDetails={catalogActions.handleViewUserDetails}
              handleDeleteUser={catalogActions.handleDeleteUser}
            />
          )}

          {activeTab === 'pages' && (
            <PagesTab
              pages={data.pages}
              setEditingPage={modals.setEditingPage}
              setPageForm={catalogActions.setPageForm}
              setShowPageModal={modals.setShowPageModal}
              handleDeletePage={catalogActions.handleDeletePage}
            />
          )}

          {activeTab === 'announcement' && (
            <AnnouncementTab
              settingsForm={config.settingsForm}
              setSettingsForm={config.setSettingsForm}
              handleSettingsSubmit={config.handleSettingsSubmit}
            />
          )}

          {activeTab === 'hero' && (
            <HeroTab
              heroConfig={config.heroConfig}
              setHeroConfig={config.setHeroConfig}
              sectionsConfig={config.sectionsConfig}
              setSectionsConfig={config.setSectionsConfig}
              handleHeroSubmit={config.handleHeroSubmit}
              updateAndSaveHeroToggle={config.updateAndSaveHeroToggle}
              showToast={showToast}
            />
          )}

          {activeTab === 'filters' && (
            <FiltersTab
              filterGroups={data.filterGroups}
              newGroupForm={catalogActions.newGroupForm}
              setNewGroupForm={catalogActions.setNewGroupForm}
              handleAddFilterGroup={catalogActions.handleAddFilterGroup}
              handleDeleteFilterGroup={catalogActions.handleDeleteFilterGroup}
              handleDeleteFilterOption={catalogActions.handleDeleteFilterOption}
              newOptionInputs={catalogActions.newOptionInputs}
              setNewOptionInputs={catalogActions.setNewOptionInputs}
              handleAddFilterOption={catalogActions.handleAddFilterOption}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={data.products}
              categories={data.categories}
              inventorySearchQuery={catalogActions.inventorySearchQuery}
              setInventorySearchQuery={catalogActions.setInventorySearchQuery}
              inventoryStockFilter={catalogActions.inventoryStockFilter}
              setInventoryStockFilter={catalogActions.setInventoryStockFilter}
              inventoryCategoryFilter={catalogActions.inventoryCategoryFilter}
              setInventoryCategoryFilter={catalogActions.setInventoryCategoryFilter}
              inventoryPage={catalogActions.inventoryPage}
              setInventoryPage={catalogActions.setInventoryPage}
              inventoryItemsPerPage={catalogActions.inventoryItemsPerPage}
              setInventoryItemsPerPage={catalogActions.setInventoryItemsPerPage}
              handleUpdateProductStock={catalogActions.handleUpdateProductStock}
              handleUpdateVariantStock={catalogActions.handleUpdateVariantStock}
              setEditingProduct={modals.setEditingProduct}
              setProductForm={productActions.setProductForm}
              setShowProductModal={modals.setShowProductModal}
            />
          )}

          {activeTab === 'sections' && (
            <SectionsTab
              sectionsConfig={config.sectionsConfig}
              setSectionsConfig={config.setSectionsConfig}
              handleSectionsConfigSubmit={config.handleSectionsConfigSubmit}
              updateAndSaveSectionToggle={config.updateAndSaveSectionToggle}
              setActiveTab={setActiveTab}
              orders={data.orders}
              banners={data.banners}
              categories={data.categories}
              products={data.products}
              settingsForm={config.settingsForm}
              heroConfig={config.heroConfig}
              showToast={showToast}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentTab
              settingsForm={config.settingsForm}
              setSettingsForm={config.setSettingsForm}
              handleSettingsSubmit={config.handleSettingsSubmit}
              adminFetch={auth.adminFetch}
              showToast={showToast}
            />
          )}

          {activeTab === 'taxes' && (
            <TaxesTab
              settingsForm={config.settingsForm}
              setSettingsForm={config.setSettingsForm}
              updateAndSaveSettingToggle={config.updateAndSaveSettingToggle}
              handleDownloadGstCSV={config.handleDownloadGstCSV}
              onUpdateSettings={onUpdateSettings}
              setSettings={data.setSettings}
              selectedGstMonth={config.selectedGstMonth}
              setSelectedGstMonth={config.setSelectedGstMonth}
              gstSummaryData={config.gstSummaryData}
              handleResetStateTaxRates={config.handleResetStateTaxRates}
              handleSaveStateTaxRates={config.handleSaveStateTaxRates}
              stateTaxRates={config.stateTaxRates}
              setStateTaxRates={config.setStateTaxRates}
              taxOverrides={config.taxOverrides}
              taxPage={config.taxPage}
              setTaxPage={config.setTaxPage}
              taxesPerPage={config.taxesPerPage}
              newOverrideForm={config.newOverrideForm}
              setNewOverrideForm={config.setNewOverrideForm}
              handleCreateTaxOverride={config.handleCreateTaxOverride}
              handleDeleteTaxOverride={config.handleDeleteTaxOverride}
              collections={data.collections}
              orders={data.orders}
              handleFetchOrderDetails={orderActions.handleFetchOrderDetails}
              adminFetch={auth.adminFetch}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              adminProfileForm={catalogActions.adminProfileForm}
              setAdminProfileForm={catalogActions.setAdminProfileForm}
              settingsForm={config.settingsForm}
              setSettingsForm={config.setSettingsForm}
              updateAndSaveSettingToggle={config.updateAndSaveSettingToggle}
              adminFetch={auth.adminFetch}
              setSettings={data.setSettings}
              onUpdateSettings={onUpdateSettings}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <ProductModal
        showProductModal={modals.showProductModal}
        setShowProductModal={modals.setShowProductModal}
        editingProduct={modals.editingProduct}
        handleProductSubmit={productActions.handleProductSubmit}
        isDuplicateSku={productActions.isDuplicateSku}
        productForm={productActions.productForm}
        setProductForm={productActions.setProductForm}
        isDraggingOverArea={productActions.isDraggingOverArea}
        handleDropFilesOnArea={productActions.handleDropFilesOnArea}
        handleDragOverArea={productActions.handleDragOverArea}
        handleDragLeaveArea={productActions.handleDragLeaveArea}
        handleProductMediaFileUpload={productActions.handleProductMediaFileUpload}
        setShowProductMediaPickerModal={modals.setShowProductMediaPickerModal}
        imageUrlInput={productActions.imageUrlInput}
        setImageUrlInput={productActions.setImageUrlInput}
        handleAddImage={productActions.handleAddImage}
        draggedImageIndex={productActions.draggedImageIndex}
        setDraggedImageIndex={productActions.setDraggedImageIndex}
        dragOverImageIndex={productActions.dragOverImageIndex}
        setDragOverImageIndex={productActions.setDragOverImageIndex}
        handleThumbnailDragStart={productActions.handleThumbnailDragStart}
        handleThumbnailDragOver={productActions.handleThumbnailDragOver}
        handleThumbnailDrop={productActions.handleThumbnailDrop}
        handleRemoveImage={productActions.handleRemoveImage}
        newVariantForm={productActions.newVariantForm}
        setNewVariantForm={productActions.setNewVariantForm}
        categories={data.categories}
        isCatDropdownOpen={productActions.isCatDropdownOpen}
        setIsCatDropdownOpen={productActions.setIsCatDropdownOpen}
        setShowCategoryModal={modals.setShowCategoryModal}
        isSubcatDropdownOpen={productActions.isSubcatDropdownOpen}
        setIsSubcatDropdownOpen={productActions.setIsSubcatDropdownOpen}
        tagInput={productActions.tagInput}
        setTagInput={productActions.setTagInput}
        handleAddTag={productActions.handleAddTag}
        handleRemoveTag={productActions.handleRemoveTag}
        collections={data.collections}
        handleToggleCollection={productActions.handleToggleCollection}
        setShowCollectionModal={modals.setShowCollectionModal}
        showSeoFields={productActions.showSeoFields}
        setShowSeoFields={productActions.setShowSeoFields}
        products={data.products}
        fetchAdminData={data.fetchAdminData}
        adminFetch={auth.adminFetch}
        showToast={showToast}
        setShowBrowseModal={modals.setShowBrowseModal}
        setBrowseTargetType={modals.setBrowseTargetType}
        setBrowseTargetField={modals.setBrowseTargetField}
      />

      <CollectionModal
        showCollectionModal={modals.showCollectionModal}
        setShowCollectionModal={modals.setShowCollectionModal}
        editingCollection={modals.editingCollection}
        collectionForm={catalogActions.collectionForm}
        setCollectionForm={catalogActions.setCollectionForm}
        handleCollectionSubmit={catalogActions.handleCollectionSubmit}
        categories={data.categories}
        products={data.products}
      />

      <OrderDetailsModal
        selectedOrderDetails={modals.selectedOrderDetails}
        setSelectedOrderDetails={modals.setSelectedOrderDetails}
        settingsForm={config.settingsForm}
        adminOrderStatusInput={modals.adminOrderStatusInput}
        setAdminOrderStatusInput={modals.setAdminOrderStatusInput}
        courierInput={modals.courierInput}
        setCourierInput={modals.setCourierInput}
        trackingInput={modals.trackingInput}
        setTrackingInput={modals.setTrackingInput}
        adminCancelReasonInput={modals.adminCancelReasonInput}
        setAdminCancelReasonInput={modals.setAdminCancelReasonInput}
        adminFetch={auth.adminFetch}
        fetchAdminData={data.fetchAdminData}
        showToast={showToast}
        updatingShippingStatus={orderActions.updatingShippingStatus}
        handleUpdateOrderShippingAndStatus={orderActions.handleUpdateOrderShippingAndStatus}
        orderNoteInput={modals.orderNoteInput}
        setOrderNoteInput={modals.setOrderNoteInput}
        savingOrderNote={orderActions.savingOrderNote}
        handleSaveOrderNotes={orderActions.handleSaveOrderNotes}
      />

      <MediaPreviewModal
        previewMediaItem={modals.previewMediaItem}
        setPreviewMediaItem={modals.setPreviewMediaItem}
        mediaCacheBuster={catalogActions.mediaCacheBuster}
        setMediaCacheBuster={catalogActions.setMediaCacheBuster}
        adminFetch={auth.adminFetch}
        fetchAdminData={data.fetchAdminData}
        showToast={showToast}
      />

      <ProductMediaPickerModal
        showProductMediaPickerModal={modals.showProductMediaPickerModal}
        setShowProductMediaPickerModal={modals.setShowProductMediaPickerModal}
        mediaSearch={catalogActions.mediaSearch}
        setMediaSearch={catalogActions.setMediaSearch}
        mediaFiles={data.mediaFiles}
        productForm={productActions.productForm}
        setProductForm={productActions.setProductForm}
        mediaCacheBuster={catalogActions.mediaCacheBuster}
      />

      <ManageVariantsModal
        selectedProductForVariants={modals.selectedProductForVariants}
        setSelectedProductForVariants={modals.setSelectedProductForVariants}
        handleDeleteVariant={catalogActions.handleDeleteVariant}
        handleAddVariant={catalogActions.handleAddVariant}
        variantForm={catalogActions.variantForm}
        setVariantForm={catalogActions.setVariantForm}
      />

      <BannerModal
        showBannerModal={modals.showBannerModal}
        setShowBannerModal={modals.setShowBannerModal}
        bannerForm={catalogActions.bannerForm}
        setBannerForm={catalogActions.setBannerForm}
        handleBannerSubmit={catalogActions.handleBannerSubmit}
      />

      <DiscountTypeModal
        showDiscountTypeModal={modals.showDiscountTypeModal}
        setShowDiscountTypeModal={modals.setShowDiscountTypeModal}
        setSelectedDiscountType={modals.setSelectedDiscountType}
        setShowCouponModal={modals.setShowCouponModal}
      />

      <CouponModal
        showCouponModal={modals.showCouponModal}
        setShowCouponModal={modals.setShowCouponModal}
        setShowDiscountTypeModal={modals.setShowDiscountTypeModal}
        selectedDiscountType={modals.selectedDiscountType}
        discountMethod={modals.discountMethod}
        setDiscountMethod={modals.setDiscountMethod}
        setShowBrowseModal={modals.setShowBrowseModal}
        browseTargetType={modals.browseTargetType}
        setBrowseTargetType={modals.setBrowseTargetType}
        setBrowseTargetField={modals.setBrowseTargetField}
        discountSelections={modals.discountSelections}
        setDiscountSelections={modals.setDiscountSelections}
        eligibilityType={modals.eligibilityType}
        setEligibilityType={modals.setEligibilityType}
        limitTotalUses={modals.limitTotalUses}
        setLimitTotalUses={modals.setLimitTotalUses}
        limitTotalUsesVal={modals.limitTotalUsesVal}
        setLimitTotalUsesVal={modals.setLimitTotalUsesVal}
        limitOnePerCustomer={modals.limitOnePerCustomer}
        setLimitOnePerCustomer={modals.setLimitOnePerCustomer}
        couponForm={catalogActions.couponForm}
        setCouponForm={catalogActions.setCouponForm}
        handleCouponSubmit={catalogActions.handleCouponSubmit}
        products={data.products}
        categories={data.categories}
        collections={data.collections}
      />

      <CategoryModal
        showCategoryModal={modals.showCategoryModal}
        setShowCategoryModal={modals.setShowCategoryModal}
        editingCategory={modals.editingCategory}
        setEditingCategory={modals.setEditingCategory}
        categoryForm={catalogActions.categoryForm}
        setCategoryForm={catalogActions.setCategoryForm}
        handleCategorySubmit={catalogActions.handleCategorySubmit}
      />

      <SubcategoryModal
        showSubcategoryModal={modals.showSubcategoryModal}
        setShowSubcategoryModal={modals.setShowSubcategoryModal}
        selectedCatForSubcat={modals.selectedCatForSubcat}
        subcategoryName={catalogActions.subcategoryName}
        setSubcategoryName={catalogActions.setSubcategoryName}
        handleSubcategorySubmit={catalogActions.handleSubcategorySubmit}
      />

      <BrowseModal
        showBrowseModal={modals.showBrowseModal}
        setShowBrowseModal={modals.setShowBrowseModal}
        browseTargetType={modals.browseTargetType}
        setBrowseTargetType={modals.setBrowseTargetType}
        browseSearchQuery={modals.browseSearchQuery}
        setBrowseSearchQuery={modals.setBrowseSearchQuery}
        browseTargetField={modals.browseTargetField}
        discountSelections={modals.discountSelections}
        setDiscountSelections={modals.setDiscountSelections}
        productForm={productActions.productForm}
        setProductForm={productActions.setProductForm}
        products={data.products}
        collections={data.collections}
        categories={data.categories}
        users={data.users}
      />

      <PageModal
        showPageModal={modals.showPageModal}
        setShowPageModal={modals.setShowPageModal}
        editingPage={modals.editingPage}
        pageForm={catalogActions.pageForm}
        setPageForm={catalogActions.setPageForm}
        handlePageSubmit={catalogActions.handlePageSubmit}
      />

      <UserDossierModal
        selectedUserDossier={modals.selectedUserDossier}
        setSelectedUserDossier={modals.setSelectedUserDossier}
        handleUpdateUserRole={catalogActions.handleUpdateUserRole}
      />

      <ConfirmModals
        confirmModal={modals.confirmModal}
        setConfirmModal={modals.setConfirmModal}
        deleteConfirmProduct={modals.deleteConfirmProduct}
        setDeleteConfirmProduct={modals.setDeleteConfirmProduct}
        deletingProductId={modals.deletingProductId}
        handleConfirmDeleteProduct={() => productActions.handleConfirmDeleteProduct(modals.deleteConfirmProduct)}
        deleteConfirmCategory={modals.deleteConfirmCategory}
        setDeleteConfirmCategory={modals.setDeleteConfirmCategory}
        deletingCategoryId={modals.deletingCategoryId}
        handleConfirmDeleteCategory={() => catalogActions.handleConfirmDeleteCategory(modals.deleteConfirmCategory)}
      />
    </div>
  );
}
