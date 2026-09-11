import { useState, useEffect } from 'react';

export function getInitialRouteState() {
  if (typeof window === 'undefined') return { view: 'home' };
  const p = window.location.pathname;

  if (p === '/' || p === '') return { view: 'home' };
  if (p.startsWith('/category/')) {
    const slug = p.replace('/category/', '').split('/')[0];
    return { view: 'catalog', slug: null, category: slug, collection: null };
  }
  if (p.startsWith('/collection/')) {
    const slug = p.replace('/collection/', '').split('/')[0];
    return { view: 'collection', slug, collection: slug };
  }
  if (p.startsWith('/product/')) {
    const slug = p.replace('/product/', '').split('/')[0];
    return { view: 'product', slug };
  }
  if (p.startsWith('/pages/')) {
    const slug = p.replace('/pages/', '').split('/')[0];
    return { view: 'page', slug };
  }
  if (p === '/products') return { view: 'all_products' };
  if (p === '/offers') return { view: 'offers' };
  if (p === '/bestsellers') return { view: 'bestsellers' };
  if (p === '/new-arrivals') return { view: 'new_arrivals' };
  if (p === '/profile' || p === '/account') return { view: 'profile' };
  return { view: 'home' };
}

export function useStoreRouter() {
  const [route, setRoute] = useState(getInitialRouteState);

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRouteState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, newRouteState) => {
    window.history.pushState({}, '', path);
    setRoute(newRouteState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { route, setRoute, navigateTo };
}
