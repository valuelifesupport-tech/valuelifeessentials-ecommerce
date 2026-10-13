# ValueLife Essentials — Coding & Architectural Standards

## 1. File & Directory Naming Conventions

- **React Components**: `PascalCase.jsx` (e.g. `ProductCard.jsx`, `CartDrawer.jsx`, `AnnouncementBar.jsx`).
- **Context Providers**: `PascalCaseContext.jsx` (e.g. `CartContext.jsx`, `AuthContext.jsx`).
- **Custom React Hooks**: `useCamelCase.js` (e.g. `useCart.js`, `useAuth.js`, `useRouter.js`).
- **Utilities & Services**: `camelCase.js` (e.g. `pricing.js`, `filterMatchers.js`, `apiClient.js`).
- **Backend Route Files**: `kebab-case.routes.cjs` (e.g. `products.routes.cjs`, `cart.routes.cjs`, `auth.routes.cjs`).
- **Backend Controllers**: `kebab-case.controller.cjs` (e.g. `cart.controller.cjs`).
- **Middleware**: `camelCase.cjs` (e.g. `asyncHandler.cjs`, `errorHandler.cjs`, `auth.cjs`).

---

## 2. Separation of Concerns & Business Logic

1. **No Inline Business Logic in JSX Components**:
   - Complex state, caching, local storage parsing, or networking MUST NOT be embedded directly in presentation components.
   - Use custom hooks or context providers (`useCart`, `useAuth`, `useCatalog`, `useCheckout`).
2. **Atomic Component Decomposition**:
   - Every complex component must be broken down into atomic child subcomponents under a domain directory (e.g. `Header` decomposes into `AnnouncementBar`, `SearchForm`, `NavMegaMenu`, and `MobileNavMenu`).
   - Monolithic components exceeding 300 lines should be split into logical sub-modules.
3. **Pure Utility Functions**:
   - Math calculations (pricing, discounts, tax, weight parsing) must be pure functions isolated in `src/utils/` without DOM or React dependencies.

---

## 3. Error Handling Rules

1. **Every Async Express Route Must Use `asyncHandler`**:
   - Avoid unhandled promise rejections that could crash the Node.js process:
     ```javascript
     router.get('/api/example', asyncHandler(async (req, res) => {
       const data = await fetchSomething();
       res.json({ success: true, data });
     }));
     ```
2. **Wrap UI Views with `SectionErrorBoundary`**:
   - Always protect dynamic sections with `<SectionErrorBoundary name="SectionName">` to maintain application resilience against third-party data or formatting errors.
3. **No Silent Promise Swallowing**:
   - In frontend fetches, log errors and present actionable toast feedback to the user via `useToast().showToast('error', title, message)`.
