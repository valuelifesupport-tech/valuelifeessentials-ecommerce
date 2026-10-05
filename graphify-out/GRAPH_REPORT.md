# Graph Report - tree website  (2026-10-05)

## Corpus Check
- 323 files · ~350,904 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: (none) 8, .ttf 6, .woff 6)

## Summary
- 1139 nodes · 2482 edges · 78 communities (65 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d10aad4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- fallbackStore.cjs
- admin/AdminDashboard.jsx
- payment.routes.cjs
- getApiUrl
- resolveImgUrl
- frontend/src/App.jsx
- frontend/src/components/product/CatalogView.jsx
- components/AdminDashboard.jsx
- admin/package.json
- ProductModal.jsx
- collections.routes.cjs
- auth.cjs
- paymentGateways.cjs
- resolveImgUrl
- getApiUrl
- src/components/auth/CustomerProfilePage.jsx
- server/package.json
- frontend/src/components/layout/Header.jsx
- ShiprocketService
- resolveImgUrl
- src/App.jsx
- src/components/payment/PaymentGatewayModal.jsx
- frontend/src/components/payment/PaymentGatewayModal.jsx
- package.json
- index.cjs
- ref_express
- frontend/src/components/auth/CustomerProfilePage.jsx
- src/components/layout/Header.jsx
- OrderDetailsModal.jsx
- dependencies
- ref_react
- BannersTab.jsx
- database.cjs
- shiprocket.routes.cjs
- orders.routes.cjs
- frontend/package.json
- frontend/src/components/auth/CustomerAuthModal.jsx
- settings.routes.cjs
- ref_lucide_react
- devDependencies
- products.routes.cjs
- CouponModal.jsx
- fetchApi
- frontend/src/components/blog/BlogDetailView.jsx
- frontend/src/components/cart/CartDrawer.jsx
- frontend/src/components/product/ProductDetailPage.jsx
- fetchApi
- src/components/blog/BlogDetailView.jsx
- getApiUrl
- components/Header.jsx
- src/components/product/CatalogView.jsx
- admin/src/App.jsx
- media.routes.cjs
- components/CustomerAuthModal.jsx
- frontend/src/components/layout/header/SearchForm.jsx
- scripts
- db.cjs
- ref_path
- build_pdf.py
- frontend/.oxlintrc.json
- React + Vite
- .oxlintrc.json
- customerAuth.cjs
- analytics.routes.cjs
- blogs.routes.cjs
- categories.routes.cjs
- SectionErrorBoundary
- optionalDependencies
- ref_vite
- frontend/src/main.jsx
- ErrorBoundary
- frontend/src/components/layout/header/HeaderMegaMenu.jsx
- src/components/layout/header/HeaderMegaMenu.jsx
- useStoreRouter.js

## God Nodes (most connected - your core abstractions)
1. `getApiUrl()` - 69 edges
2. `getApiUrl()` - 48 edges
3. `resolveImgUrl()` - 44 edges
4. `resolveImgUrl()` - 37 edges
5. `executeMySQL()` - 35 edges
6. `resolveImgUrl()` - 30 edges
7. `db` - 24 edges
8. `getApiUrl()` - 23 edges
9. `requireAdminAuth()` - 18 edges
10. `ShiprocketService` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ensureCartWishlistTables()` --calls--> `executeMySQL()`  [EXTRACTED]
  server/routes/cartWishlist.routes.cjs → server/config/database.cjs
- `enrichOrdersWithItems()` --calls--> `executeMySQL()`  [EXTRACTED]
  server/routes/orders.routes.cjs → server/config/database.cjs
- `App()` --calls--> `getApiUrl()`  [EXTRACTED]
  admin/src/App.jsx → admin/src/api/config.js
- `MediaPreviewModal()` --calls--> `getApiUrl()`  [EXTRACTED]
  admin/src/components/admin/modals/MediaPreviewModal.jsx → admin/src/api/config.js
- `ImageUploader()` --calls--> `getApiUrl()`  [EXTRACTED]
  admin/src/components/common/ImageUploader.jsx → admin/src/api/config.js

## Import Cycles
- None detected.

## Communities (78 total, 13 thin omitted)

### Community 0 - "fallbackStore.cjs"
Cohesion: 0.17
Nodes (15): ref_fs, defaultCategories, defaultCollections, defaultHeroConfig, defaultSectionsConfig, defaultStoreSettings, defaultSubcategories, defaultThemeConfig (+7 more)

### Community 1 - "admin/AdminDashboard.jsx"
Cohesion: 0.06
Nodes (25): AdminHeader(), AdminMobileBottomBar(), BannerModal(), CategoryModal(), CollectionModal(), DiscountTypeModal(), ManageVariantsModal(), PageModal() (+17 more)

### Community 2 - "payment.routes.cjs"
Cohesion: 0.13
Nodes (23): executeMySQL(), { buildOrderConfirmationEmailHtml }, crypto, { executeMySQL, db }, express, {
  initiatePaymentTransaction,
  recordGatewayHandshake,
  recordPaymentFailure,
  recordPaymentVerification,
  getTransaction,
  listTransactions
}, { paymentManager }, { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } (+15 more)

### Community 3 - "getApiUrl"
Cohesion: 0.11
Nodes (22): API_BASE, DEFAULT_FALLBACK_SVG, getApiUrl(), getProxyImgUrl(), AdminDashboard(), loadAdminProfile(), getProxyImgUrl(), resolveImgUrl() (+14 more)

### Community 4 - "resolveImgUrl"
Cohesion: 0.13
Nodes (13): resolveImgUrl(), ProductCard(), CatalogProductCard(), SelectVariantModal(), BestSellersSection(), BlogSection(), CategorySlider(), EditorialPromoBanner() (+5 more)

### Community 5 - "frontend/src/App.jsx"
Cohesion: 0.11
Nodes (12): App(), BlogListingView(), WishlistDrawer(), INDIAN_STATES, SectionErrorBoundary, ToastNotification(), PageView(), useCartActions() (+4 more)

### Community 6 - "frontend/src/components/product/CatalogView.jsx"
Cohesion: 0.29
Nodes (5): CatalogBanner(), CatalogControlsBar(), CatalogFilterPills(), CatalogLoadMore(), CatalogView()

### Community 7 - "components/AdminDashboard.jsx"
Cohesion: 0.15
Nodes (14): AdminDashboard, PromoBannerSlider(), BestSellersSection(), BlogSection(), BrandStorySection(), CategorySlider(), EditorialPromoBanner(), FeaturedProductsSection() (+6 more)

### Community 8 - "admin/package.json"
Cohesion: 0.06
Nodes (31): dependencies, chart.js, clsx, lucide-react, react, react-chartjs-2, react-dom, tailwind-merge (+23 more)

### Community 9 - "ProductModal.jsx"
Cohesion: 0.13
Nodes (15): ProductCategorySelector(), ProductOrganization(), ProductPricingSection(), ProductSeoSection(), ProductVariantsSection(), ProductModal(), CollectionTaxOverrides(), GstConfigCard() (+7 more)

### Community 10 - "collections.routes.cjs"
Cohesion: 0.33
Nodes (4): { db, executeMySQL }, express, { requireAdminAuth }, router

### Community 11 - "auth.cjs"
Cohesion: 0.07
Nodes (34): ref_crypto, ref_http, ref_https, server_config_constants_admin_password, server_config_constants_admin_secret_key, server_config_constants_maintenance_password, server_config_constants_password_salt, activeAdminTokens (+26 more)

### Community 12 - "paymentGateways.cjs"
Cohesion: 0.08
Nodes (11): server_config_constants_razorpay_key_id, server_config_constants_razorpay_key_secret, BaseGateway, CashfreeGateway, crypto, PaymentGatewayManager, paymentManager, PaytmGateway (+3 more)

### Community 13 - "resolveImgUrl"
Cohesion: 0.17
Nodes (14): BrowseModal(), ConfirmModals(), MediaPreviewModal(), OrderItemList(), ProductMediaSection(), ProductMediaPickerModal(), CollectionsTab(), InventoryTab() (+6 more)

### Community 14 - "getApiUrl"
Cohesion: 0.19
Nodes (15): API_BASE, DEFAULT_FALLBACK_SVG, getApiUrl(), getProxyImgUrl(), AdminDashboard(), useAdminAuth(), useAdminConfig(), useAdminData() (+7 more)

### Community 15 - "src/components/auth/CustomerProfilePage.jsx"
Cohesion: 0.19
Nodes (8): CustomerProfilePage(), CancelOrderModal(), ProfileHeaderBanner(), INDIAN_STATES, ProfileDetailsTab(), ProfileGstinTab(), ProfileOrdersTab(), ProfileSecurityTab()

### Community 16 - "server/package.json"
Cohesion: 0.08
Nodes (25): dependencies, cors, dotenv, express, jsonwebtoken, multer, mysql2, nodemailer (+17 more)

### Community 17 - "frontend/src/components/layout/Header.jsx"
Cohesion: 0.33
Nodes (5): AnnouncementBar(), Header(), MobileNavMenu(), getCategoryIcon(), NavMegaMenu()

### Community 19 - "resolveImgUrl"
Cohesion: 0.18
Nodes (10): resolveImgUrl(), BrandLoader(), ProductCard(), HeroSection(), CatalogProductCard(), ProductDetailPage(), ProductGallery(), ProductPricingBox() (+2 more)

### Community 20 - "src/App.jsx"
Cohesion: 0.18
Nodes (9): App(), BlogListingView(), CartDrawer(), WishlistDrawer(), ToastNotification(), PaymentGatewayModal(), SelectVariantModal(), PageView() (+1 more)

### Community 21 - "src/components/payment/PaymentGatewayModal.jsx"
Cohesion: 0.17
Nodes (9): CardPaymentTab(), BANKS, NetbankingTab(), PaymentGatewayHeader(), PaymentSimulatorFooter(), UPI_APPS, UpiPaymentTab(), WALLETS (+1 more)

### Community 22 - "frontend/src/components/payment/PaymentGatewayModal.jsx"
Cohesion: 0.17
Nodes (9): CardPaymentTab(), BANKS, NetbankingTab(), PaymentGatewayHeader(), PaymentSimulatorFooter(), UPI_APPS, UpiPaymentTab(), WALLETS (+1 more)

### Community 23 - "package.json"
Cohesion: 0.07
Nodes (28): better-sqlite3, chart.js, cors, dotenv, express, jsonwebtoken, lucide-react, multer (+20 more)

### Community 24 - "index.cjs"
Cohesion: 0.12
Nodes (13): ref_cors, server_config_constants_port, server_config_database_setuphostingermysql, ALLOWED_ORIGINS, app, cors, errorHandler, express (+5 more)

### Community 25 - "ref_express"
Cohesion: 0.07
Nodes (26): app, express, path, http, ref_express, requireAdminAuth(), { db, executeMySQL }, express (+18 more)

### Community 26 - "frontend/src/components/auth/CustomerProfilePage.jsx"
Cohesion: 0.24
Nodes (6): CancelOrderModal(), ProfileHeaderBanner(), INDIAN_STATES, ProfileDetailsTab(), ProfileGstinTab(), ProfileSecurityTab()

### Community 27 - "src/components/layout/Header.jsx"
Cohesion: 0.20
Nodes (9): AnnouncementBar(), Header(), MobileNavMenu(), getCategoryIcon(), NavMegaMenu(), SEARCH_PHRASES, SearchForm(), TRENDING_SEARCHES (+1 more)

### Community 28 - "OrderDetailsModal.jsx"
Cohesion: 0.21
Nodes (8): clean10Phone(), INDIAN_STATES, OrderCustomerCard(), OrderGstBreakdown(), OrderNotesForm(), OrderShiprocketCard(), OrderStatusControl(), OrderDetailsModal()

### Community 29 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, basic-ftp, chart.js, cors, dotenv, express, jsonwebtoken, lucide-react (+6 more)

### Community 30 - "ref_react"
Cohesion: 0.15
Nodes (5): AdminMobileDrawer(), AdminNavLinks(), AdminSidebar(), ImageUploader(), ref_react

### Community 31 - "BannersTab.jsx"
Cohesion: 0.18
Nodes (8): resolveImgUrl(), BannersTab(), SalesTickerManager(), SectionToggleCard(), StorefrontPreview(), SectionsTab(), HeroSection(), PromoBannerSlider()

### Community 32 - "database.cjs"
Cohesion: 0.11
Nodes (18): ref_mysql2, db, { setupHostingerMySQL, getMySQLPool }, getMySQLPool(), mysql, setupHostingerMySQL(), sqliteDb, { db, executeMySQL } (+10 more)

### Community 33 - "shiprocket.routes.cjs"
Cohesion: 0.18
Nodes (11): ref_nodemailer, getTransporter(), nodemailer, sendEmailNotification(), _verifySmtp(), { executeMySQL, db }, express, { requireAdminAuth } (+3 more)

### Community 34 - "orders.routes.cjs"
Cohesion: 0.18
Nodes (10): { buildOrderConfirmationEmailHtml }, { db, executeMySQL }, enrichOrdersWithItems(), express, { requireAdminAuth }, router, { sendEmailNotification }, { verifyAndCalculateOrderPricing } (+2 more)

### Community 35 - "frontend/package.json"
Cohesion: 0.05
Nodes (43): dependencies, chart.js, clsx, esbuild, express, lucide-react, react, react-chartjs-2 (+35 more)

### Community 36 - "frontend/src/components/auth/CustomerAuthModal.jsx"
Cohesion: 0.27
Nodes (5): ForgotPasswordForm(), LoginForm(), OtpVerificationForm(), ProfileSummaryView(), SignupForm()

### Community 37 - "settings.routes.cjs"
Cohesion: 0.17
Nodes (10): ALLOWED_BRAND_STORY_COLS, ALLOWED_EDITORIAL_COLS, ALLOWED_HERO_COLS, ALLOWED_SECTIONS_COLS, ALLOWED_SETTINGS_COLS, ALLOWED_THEME_COLS, { db, executeMySQL }, express (+2 more)

### Community 38 - "ref_lucide_react"
Cohesion: 0.17
Nodes (11): ref_lucide_react, CustomerAuthModal(), ForgotPasswordForm(), LoginForm(), OtpVerificationForm(), ProfileSummaryView(), SignupForm(), CartCrossSell() (+3 more)

### Community 39 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, concurrently, nodemon, oxlint, playwright, tailwindcss, @tailwindcss/vite, @types/react (+3 more)

### Community 40 - "products.routes.cjs"
Cohesion: 0.24
Nodes (8): { db, executeMySQL }, express, { isSkuTaken, generateUniqueSku }, { requireAdminAuth }, router, { db, executeMySQL }, generateUniqueSku(), isSkuTaken()

### Community 41 - "CouponModal.jsx"
Cohesion: 0.33
Nodes (5): CustomerEligibilityCard(), DiscountLimitsCard(), DiscountStrategyPanel(), SelectedItemsPills(), CouponModal()

### Community 42 - "fetchApi"
Cohesion: 0.38
Nodes (7): fetchApi(), getCategories(), getCategoriesTree(), getBestSellers(), getProductBySlug(), getProducts(), getSuggestedBundle()

### Community 43 - "frontend/src/components/blog/BlogDetailView.jsx"
Cohesion: 0.29
Nodes (8): BlogDetailView(), Footer(), FacebookIcon(), InstagramIcon(), TwitterIcon(), WhatsAppIcon(), YoutubeIcon(), InstagramFeedSection()

### Community 44 - "frontend/src/components/cart/CartDrawer.jsx"
Cohesion: 0.29
Nodes (5): CartCrossSell(), CartDrawer(), CartItemCard(), CartPaymentSelector(), CartSummary()

### Community 45 - "frontend/src/components/product/ProductDetailPage.jsx"
Cohesion: 0.29
Nodes (5): BrandLoader(), ProductDetailPage(), ProductGallery(), ProductPricingBox(), ProductReviews()

### Community 46 - "fetchApi"
Cohesion: 0.38
Nodes (7): fetchApi(), getCategories(), getCategoriesTree(), getBestSellers(), getProductBySlug(), getProducts(), getSuggestedBundle()

### Community 47 - "src/components/blog/BlogDetailView.jsx"
Cohesion: 0.36
Nodes (7): BlogDetailView(), Footer(), FacebookIcon(), InstagramIcon(), TwitterIcon(), WhatsAppIcon(), YoutubeIcon()

### Community 48 - "getApiUrl"
Cohesion: 0.16
Nodes (13): API_BASE, DEFAULT_FALLBACK_SVG, getApiUrl(), getProxyImgUrl(), CustomerAuthModal(), CustomerProfilePage(), MobileBottomNav(), PaymentGatewayModal() (+5 more)

### Community 49 - "components/Header.jsx"
Cohesion: 0.31
Nodes (5): MegaMenu(), FacebookIcon(), InstagramIcon(), WhatsAppIcon(), YoutubeIcon()

### Community 50 - "src/components/product/CatalogView.jsx"
Cohesion: 0.29
Nodes (5): CatalogBanner(), CatalogControlsBar(), CatalogFilterPills(), CatalogLoadMore(), CatalogView()

### Community 51 - "admin/src/App.jsx"
Cohesion: 0.36
Nodes (4): App(), BrandLoader(), ToastNotification(), admin_src_index

### Community 52 - "media.routes.cjs"
Cohesion: 0.14
Nodes (15): ref_multer, { db, executeMySQL }, express, fs, path, { requireAdminAuth }, router, { upload, uploadsDir, sendSvgFallback } (+7 more)

### Community 53 - "components/CustomerAuthModal.jsx"
Cohesion: 0.25
Nodes (6): ref_api_config, ref_modal_forgotpasswordform, ref_modal_loginform, ref_modal_otpverificationform, ref_modal_profilesummaryview, ref_modal_signupform

### Community 54 - "frontend/src/components/layout/header/SearchForm.jsx"
Cohesion: 0.39
Nodes (5): SEARCH_PHRASES, SearchForm(), TRENDING_SEARCHES, useAppData(), getProductPricing()

### Community 55 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, client, dev, dev:split, preview, server

### Community 56 - "db.cjs"
Cohesion: 0.33
Nodes (5): initDb(), { createFallbackDb }, dbPath, { initDb }, path

### Community 57 - "ref_path"
Cohesion: 0.40
Nodes (4): app, express, path, ref_path

### Community 58 - "build_pdf.py"
Cohesion: 0.50
Nodes (3): os, playwright_sync_api, pymupdf

### Community 59 - "frontend/.oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 60 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

### Community 61 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 63 - "analytics.routes.cjs"
Cohesion: 0.33
Nodes (4): { db, executeMySQL }, express, { requireAdminAuth }, router

### Community 64 - "blogs.routes.cjs"
Cohesion: 0.33
Nodes (4): { db, executeMySQL }, express, { requireAdminAuth }, router

### Community 65 - "categories.routes.cjs"
Cohesion: 0.33
Nodes (4): { db, executeMySQL }, express, { requireAdminAuth }, router

### Community 71 - "frontend/src/main.jsx"
Cohesion: 0.25
Nodes (3): frontend_src_index, ErrorBoundary, ref_react_dom

## Knowledge Gaps
- **333 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+328 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 424 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getApiUrl()` connect `getApiUrl` to `ref_lucide_react`, `components/AdminDashboard.jsx`, `fetchApi`, `src/components/auth/CustomerProfilePage.jsx`, `src/components/blog/BlogDetailView.jsx`, `resolveImgUrl`, `src/App.jsx`, `src/components/payment/PaymentGatewayModal.jsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `getApiUrl()` connect `getApiUrl` to `resolveImgUrl`, `frontend/src/components/auth/CustomerAuthModal.jsx`, `frontend/src/App.jsx`, `fetchApi`, `frontend/src/components/blog/BlogDetailView.jsx`, `frontend/src/components/cart/CartDrawer.jsx`, `frontend/src/components/product/ProductDetailPage.jsx`, `frontend/src/components/payment/PaymentGatewayModal.jsx`, `frontend/src/components/layout/header/SearchForm.jsx`, `frontend/src/components/auth/CustomerProfilePage.jsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `executeMySQL()` connect `payment.routes.cjs` to `database.cjs`, `blogs.routes.cjs`, `categories.routes.cjs`, `orders.routes.cjs`, `shiprocket.routes.cjs`, `settings.routes.cjs`, `products.routes.cjs`, `collections.routes.cjs`, `auth.cjs`, `media.routes.cjs`, `ref_express`, `analytics.routes.cjs`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _333 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin/AdminDashboard.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06183574879227053 - nodes in this community are weakly interconnected._
- **Should `payment.routes.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._
- **Should `getApiUrl` be split into smaller, more focused modules?**
  _Cohesion score 0.1092436974789916 - nodes in this community are weakly interconnected._