import React from 'react';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';

export default function MegaMenu({ categories = [], onClose, onNavigate }) {
  const defaultSubcategoriesMap = {
    'seeds-and-gardening': ['Edible Seeds', 'Plant Seeds', 'Vegetable Seeds', 'Flower Seeds'],
    'natural-powders': ['Food Powders', 'Face Care Powders', 'Hair Care Powders'],
    'organic-fertilizers': ['Vermicompost', 'Neem Cake', 'Seaweed Booster', 'Bio Compost'],
    'pots-and-grow-bags': ['HDPE Grow Bags', 'Fabric Bags', 'Terracotta Pots'],
    'garden-tools': ['Sprayer Pumps', 'Pruning Shears', 'Watering Cans'],
    'pest-control': ['Neem Oil Spray', 'Bio Insecticides', 'Fungicides'],
    'organic-superfoods': ['Chia Seeds', 'Himalayan Shilajit', 'Pink Salt', 'Moringa']
  };

  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Grains & Staples', slug: 'grains-staples', icon: '🌾' },
    { id: 2, name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', icon: '🌰' },
    { id: 3, name: 'Seeds', slug: 'seeds-and-gardening', icon: '🌱' },
    { id: 4, name: 'Herbs & Seasonings', slug: 'herbs-seasonings', icon: '🌿' },
    { id: 5, name: 'Spices & Masalas', slug: 'spices-masalas', icon: '🌶️' },
    { id: 6, name: 'Salt, Sugar & Sweeteners', slug: 'salt-sugar-sweeteners', icon: '🍯' },
    { id: 7, name: 'Tea & Beverages', slug: 'tea-beverages', icon: '🍵' },
    { id: 8, name: 'Health & Wellness', slug: 'health-wellness', icon: '🧘' },
    { id: 9, name: 'Baking Essentials', slug: 'baking-essentials', icon: '🧁' },
    { id: 10, name: 'Natural Powders', slug: 'natural-powders', icon: '🍃' },
    { id: 11, name: 'Organic Fertilizers', slug: 'organic-fertilizers', icon: '🌿' },
    { id: 12, name: 'Pots & Grow Bags', slug: 'pots-and-grow-bags', icon: '🪴' },
    { id: 13, name: 'Garden Tools', slug: 'garden-tools', icon: '🛠️' },
    { id: 14, name: 'Pest Control & Care', slug: 'pest-control', icon: '🐛' },
    { id: 15, name: 'Organic Superfoods', slug: 'organic-superfoods', icon: '🥗' }
  ];

  return (
    <div className="absolute top-full left-0 right-0 z-[999] pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-[#0b132b] text-slate-100 border border-slate-800/90 rounded-3xl shadow-2xl p-6 max-w-6xl mx-auto backdrop-blur-md">
        {/* HEADER BAR IN MEGA MENU (Matching Screenshot 1) */}
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛍️</span>
            <h3 className="font-extrabold text-base sm:text-lg text-white font-['Outfit'] tracking-wide">
              Shop Organic Grocery & Wellness Catalog
            </h3>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
              {displayCategories.length} Categories
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/products', { view: 'all_products', slug: null, category: null, collection: null });
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight size={14} />
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CATEGORY CARDS GRID (Matching Screenshot 1 & 2 Taxonomy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {displayCategories.map((cat) => {
            const subList = (cat.subcategories && cat.subcategories.length > 0)
              ? cat.subcategories.map(s => s.name)
              : (defaultSubcategoriesMap[cat.slug] || []);

            return (
              <div 
                key={cat.id} 
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => {
                  onClose();
                  onNavigate(`/category/${cat.slug}`, { view: 'catalog', slug: null, category: cat.slug, collection: null });
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {cat.icon || '🌱'}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </h4>
                  </div>

                  {subList.length > 0 && (
                    <ul className="text-[11px] text-slate-400 space-y-1 pl-6">
                      {subList.slice(0, 4).map((subName, idx) => (
                        <li 
                          key={idx} 
                          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onNavigate(`/category/${cat.slug}`, { view: 'catalog', slug: null, category: cat.slug, collection: null });
                          }}
                        >
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{subName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
