import { useState, useEffect } from 'react';

export function useRouter() {
  const getInitialRouteState = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      const adminUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5174'
        : 'https://admin.valuelifeessentials.com';
      window.location.replace(adminUrl);
      return { view: 'store', slug: null, category: null, collection: null };
    }
    if (path.startsWith('/account') || path.startsWith('/profile')) return { view: 'account', slug: null, category: null, collection: null };
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

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRouteState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, newRouteState) => {
    window.history.pushState({}, '', path);
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
  };

  return { route, navigateTo };
}
