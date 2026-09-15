import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, TrendingUp, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { resolveImgUrl } from '../../../api/config';
import { getProductPricing } from '../../../utils/pricing';

const SEARCH_PHRASES = [
  "Search 'Raw Organic Chia Seeds 500g'...",
  "Search 'Pure Himalayan Pink Rock Salt'...",
  "Search 'Organic Ashwagandha Root Powder'...",
  "Search 'Pure Triphala Churna / Powder'...",
  "Search 'Unpolished Foxtail Millet'...",
  "Search 'Wild Kasturi Haldi Turmeric'...",
  "Search 'Organic Unpolished Moong Dal'...",
  "Search 'Pure Hibiscus Flower Herbal Tea'...",
  "Search 'Natural Crystal Fitkari Stone'...",
  "Search 'Moringa Leaf Superfood Powder'..."
];

const TRENDING_SEARCHES = [
  { label: 'Ashwagandha', query: 'Ashwagandha' },
  { label: 'Chia Seeds', query: 'Chia Seeds' },
  { label: 'Pink Salt', query: 'Pink Salt' },
  { label: 'Triphala', query: 'Triphala' },
  { label: 'Foxtail Millet', query: 'Foxtail Millet' },
  { label: 'Kasturi Haldi', query: 'Kasturi Haldi' },
  { label: 'Moong Dal', query: 'Moong Dal' },
  { label: 'Hibiscus Tea', query: 'Hibiscus' },
  { label: 'Fitkari', query: 'Fitkari' }
];

export default function SearchForm({
  searchQuery = '',
  setSearchQuery,
  onSearchSubmit,
  products = [],
  categories = [],
  navigateTo,
  currencySymbol = '₹',
  isMobile = false
}) {
  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Typewriter effect for search placeholder
  useEffect(() => {
    const currentPhrase = SEARCH_PHRASES[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (placeholderText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (placeholderText.length > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % SEARCH_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, phraseIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search query
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];

    const matches = [];
    const keywords = q.split(/\s+/).filter(Boolean);

    for (const p of products) {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      const tags = (p.tags || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();

      // Check if all or any keywords match
      const titleMatches = keywords.every(kw => title.includes(kw));
      const generalMatches = keywords.every(kw => title.includes(kw) || cat.includes(kw) || tags.includes(kw) || sku.includes(kw));

      if (titleMatches) {
        matches.push({ product: p, score: 3 });
      } else if (generalMatches) {
        matches.push({ product: p, score: 2 });
      } else if (title.includes(q) || cat.includes(q)) {
        matches.push({ product: p, score: 1 });
      }

      if (matches.length >= 30) break; // cap search pool for performance
    }

    // Sort by score and take top 6
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 6).map(m => m.product);
  }, [searchQuery, products]);

  const handleSelectProduct = (product) => {
    setIsOpen(false);
    if (navigateTo) {
      const targetSlug = product.slug || product.id;
      navigateTo(`/products/${targetSlug}`, {
        view: 'pdp',
        slug: targetSlug,
        id: product.id,
        category: null,
        collection: null
      });
    }
  };

  const handleApplyKeyword = (kw) => {
    if (setSearchQuery) setSearchQuery(kw);
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit(kw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit(searchQuery);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (setSearchQuery) setSearchQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div 
      ref={containerRef}
      className={isMobile ? "flex w-full relative" : "hidden md:flex flex-1 max-w-lg relative"}
      data-reticle-target="header-search-form"
    >
      <form 
        onSubmit={handleSubmit}
        className="w-full relative flex items-center"
      >
        <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
          <Search size={16} className="text-emerald-800/60" />
        </div>

        <input 
          ref={inputRef}
          type="text" 
          placeholder={placeholderText || "Search organic groceries, superfoods, spices..."} 
          value={searchQuery}
          onChange={(e) => {
            if (setSearchQuery) setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          className={`w-full bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-250 focus:border-[#164e3f] rounded-full text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#164e3f]/20 transition-all shadow-inner pl-9 ${
            searchQuery ? 'pr-16' : 'pr-10'
          } ${isMobile ? 'py-2' : 'py-2.5'}`}
          data-reticle-target="header-search-input"
          autoComplete="off"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-9 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}

        <button 
          type="submit" 
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#164e3f] transition-colors cursor-pointer"
          data-reticle-target="header-search-submit-btn"
          title="Search"
        >
          <Search size={16} />
        </button>
      </form>

      {/* DROPDOWN SEARCH SUGGESTIONS & AUTOCOMPLETE */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: '75vh' }}
        >
          {/* STATE A: EMPTY QUERY -> SHOW TRENDING SEARCHES & CATEGORIES */}
          {!searchQuery.trim() ? (
            <div className="p-4 space-y-3.5 bg-white">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#164e3f]">
                <TrendingUp size={14} className="text-[#164e3f]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyKeyword(item.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 hover:bg-emerald-100 text-[#164e3f] text-xs font-semibold rounded-full border border-emerald-200/80 transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                  >
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {categories && categories.length > 0 && (
                <div className="pt-2.5 border-t border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Tag size={12} className="text-emerald-700" />
                    <span>Popular Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id || cat.slug || cat.name}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          if (navigateTo) {
                            navigateTo(`/category/${cat.slug || cat.name}`, {
                              view: 'catalog',
                              slug: null,
                              category: cat.name,
                              collection: null
                            });
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-[#164e3f] rounded-lg transition-colors cursor-pointer border border-gray-200/50"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : searchResults.length > 0 ? (
            /* STATE B: QUERY WITH MATCHING PRODUCTS */
            <div className="bg-white">
              <div className="px-4 py-2.5 bg-gray-50/95 border-b border-gray-150 flex items-center justify-between text-xs text-gray-600">
                <span className="font-medium">
                  Products matching <span className="font-extrabold text-gray-900">"{searchQuery}"</span>
                </span>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto bg-white">
                {searchResults.map((product) => {
                  const pricing = getProductPricing(product, 'INR');
                  const thumb = resolveImgUrl(product.image || (Array.isArray(product.images) ? product.images[0] : null));

                  return (
                    <button
                      key={product.id || product.slug}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full flex items-center gap-3 p-3 bg-white hover:bg-emerald-50/70 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                        <img 
                          src={thumb} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 rounded"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide truncate max-w-[150px]">
                            {product.category_name || 'Organic'}
                          </span>
                          {product.is_bestseller ? (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                              BESTSELLER
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#164e3f] transition-colors truncate">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-[#164e3f]">
                            {currencySymbol}{pricing.pPrice}
                          </span>
                          {pricing.pct > 0 && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {currencySymbol}{pricing.pOriginal}
                            </span>
                          )}
                          {pricing.pct > 0 && (
                            <span className="text-[10px] text-emerald-600 font-extrabold">
                              {pricing.pct}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-gray-300 group-hover:text-[#164e3f] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* FOOTER: VIEW ALL RESULTS */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2.5 px-4 bg-gray-50 hover:bg-emerald-50 text-[#164e3f] hover:text-[#0f382c] text-xs font-extrabold border-t border-gray-150 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View all search results for "{searchQuery}"</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            /* STATE C: NO RESULTS FOUND */
            <div className="p-6 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Search size={18} />
              </div>
              <p className="text-xs font-bold text-gray-800">
                No products found for "{searchQuery}"
              </p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                Try searching for items like Chia Seeds, Ashwagandha, Pink Salt, or Moong Dal.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {TRENDING_SEARCHES.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyKeyword(item.query)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-[11px] font-semibold rounded-full border border-gray-200 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

