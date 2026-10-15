import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const getInitialRouteState = () => {
  if (typeof window === 'undefined') {
    return { view: 'store', slug: null, category: null, collection: null };
  }
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    window.history.replaceState({}, '', '/');
    return { view: 'store', slug: null, category: null, collection: null };
  }
  if (path.startsWith('/account') || path.startsWith('/profile')) {
    return { view: 'account', slug: null, category: null, collection: null };
  }
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '').split('?')[0].split('#')[0].replace(/\/$/, '');
    return { view: 'pdp', slug, category: null, collection: null };
  }
  if (path.startsWith('/product/')) {
    const slug = path.replace('/product/', '').split('?')[0].split('#')[0].replace(/\/$/, '');
    return { view: 'pdp', slug, category: null, collection: null };
  }
  if (path === '/products') return { view: 'all_products', slug: null, category: null, collection: null };
  if (path === '/offers') return { view: 'offers', slug: null, category: null, collection: null };
  if (path === '/bestsellers') return { view: 'bestsellers', slug: null, category: null, collection: null };
  if (path === '/new-arrivals') return { view: 'new_arrivals', slug: null, category: null, collection: null };
  if (path === '/blog' || path === '/pages/blog') return { view: 'blog', slug: null, category: null, collection: null };
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    return { view: 'blog_detail', slug, category: null, collection: null };
  }
  if (path === '/contact' || path === '/contact-us') return { view: 'page', slug: 'contact-us', category: null, collection: null };
  if (path === '/about' || path === '/about-us') return { view: 'page', slug: 'about-us', category: null, collection: null };
  if (path === '/faq') return { view: 'page', slug: 'faq', category: null, collection: null };
  if (path === '/shipping-policy') return { view: 'page', slug: 'shipping-policy', category: null, collection: null };
  if (path === '/returns-refund' || path === '/refund-policy') return { view: 'page', slug: 'refund-policy', category: null, collection: null };
  if (path === '/privacy-policy') return { view: 'page', slug: 'privacy-policy', category: null, collection: null };
  if (path === '/terms-of-service' || path === '/terms') return { view: 'page', slug: 'terms-of-service', category: null, collection: null };
  if (path.startsWith('/pages/')) {
    let slug = path.replace('/pages/', '').split('?')[0].split('#')[0].replace(/\/$/, '');
    if (slug === 'blog') return { view: 'blog', slug: null, category: null, collection: null };
    if (slug === 'contact') slug = 'contact-us';
    if (slug === 'about') slug = 'about-us';
    if (slug === 'returns-refund') slug = 'refund-policy';
    return { view: 'page', slug, category: null, collection: null };
  }
  if (path.startsWith('/category/')) {
    const category = path.replace('/category/', '').split('?')[0].split('#')[0].replace(/\/$/, '');
    return { view: 'catalog', slug: null, category, collection: null };
  }
  if (path.startsWith('/collection/')) {
    const collection = path.replace('/collection/', '').split('?')[0].split('#')[0].replace(/\/$/, '');
    return { view: 'catalog', slug: null, category: null, collection };
  }
  return { view: 'store', slug: null, category: null, collection: null };
};

export const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(getInitialRouteState);

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRouteState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path, newRouteState) => {
    if (path) {
      window.history.pushState({}, '', path);
    }
    let state = newRouteState;
    if (!state) {
      state = getInitialRouteState();
    } else {
      if (state.view === 'product') {
        state = { ...state, view: 'pdp' };
      }
    }
    setRoute(state);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return React.createElement(
    RouterContext.Provider,
    { value: { route, setRoute, navigateTo } },
    children
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (ctx) return ctx;

  // Fallback for isolated tests or un-wrapped components
  const [route, setRoute] = useState(getInitialRouteState);

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRouteState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path, newRouteState) => {
    if (path) {
      window.history.pushState({}, '', path);
    }
    let state = newRouteState;
    if (!state) {
      state = getInitialRouteState();
    } else {
      if (state.view === 'product') {
        state = { ...state, view: 'pdp' };
      }
    }
    setRoute(state);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return { route, setRoute, navigateTo };
}

export default useRouter;
