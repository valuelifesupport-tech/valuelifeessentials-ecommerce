import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SEARCH_PHRASES = [
  "Search 'Organic Vermicompost Fertilizer'...",
  "Search 'Raw Chia Seeds 500g'...",
  "Search 'HDPE Heavy Duty Grow Bags'...",
  "Search 'Pure Ashwagandha & Moringa Powder'...",
  "Search 'Terrace Garden Vegetable Seeds'...",
  "Search 'Cold Pressed Neem Oil Spray'..."
];

export default function SearchForm({
  searchQuery,
  setSearchQuery,
  onSearchSubmit
}) {
  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = SEARCH_PHRASES[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (placeholderText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        }, 60);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (placeholderText.length > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % SEARCH_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, phraseIndex]);

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSearchSubmit(searchQuery); }}
      className="hidden md:flex flex-1 max-w-lg relative"
      data-reticle-target="header-search-form"
    >
      <input 
        type="text" 
        placeholder={placeholderText || "Search organic superfoods, chia seeds, spices..."} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-12 text-xs font-medium focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition-all shadow-inner"
        data-reticle-target="header-search-input"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#2d6a4f] transition-colors cursor-pointer"
        data-reticle-target="header-search-submit-btn"
      >
        <Search size={18} />
      </button>
    </form>
  );
}
