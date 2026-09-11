import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function FeaturedProductsSection({
  products = [],
  wishlist = [],
  currencySymbol = '₹',
  handleAddToCart,
  handleToggleWishlist,
  navigateTo
}) {
  const [activeTab, setActiveTab] = useState('All');

  // Curated showcase items matching Section 4 of mockup
  const sampleProducts = [
    {
      id: 101,
      title: 'Organic Turmeric Powder',
      slug: 'organic-turmeric-powder',
      pack: '200g',
      price: 199,
      originalPrice: 249,
      discount: '20% OFF',
      rating: 4.9,
      reviews: 124,
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80',
      category: 'Spices & Seasoning'
    },
    {
      id: 102,
      title: 'Aloe Vera Gel',
      slug: 'aloe-vera-gel',
      pack: '100g',
      price: 299,
      originalPrice: 449,
      discount: '33% OFF',
      rating: 4.8,
      reviews: 89,
      image_url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=500&q=80',
      category: 'Personal Care'
    },
    {
      id: 103,
      title: 'Mixed Dry Fruits',
      slug: 'mixed-dry-fruits',
      pack: '250g',
      price: 349,
      originalPrice: 499,
      discount: '30% OFF',
      rating: 5.0,
      reviews: 76,
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
      category: 'Edible Seeds'
    },
    {
      id: 104,
      title: 'Organic Honey',
      slug: 'organic-honey',
      pack: '500g',
      price: 399,
      originalPrice: 499,
      discount: '20% OFF',
      rating: 4.9,
      reviews: 56,
      image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80',
      category: 'Grocery & Staples'
    },
    {
      id: 105,
      title: 'Green Tea Leaves',
      slug: 'green-tea',
      pack: '100g',
      price: 499,
      originalPrice: 629,
      discount: '20% OFF',
      rating: 4.8,
      reviews: 91,
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
      category: 'Herbs & Teas'
    }
  ];

  // If real products exist in database, display them, otherwise fallback to sample products
  const displayItems = (products && products.length > 0)
    ? products.slice(0, 5).map((p, idx) => ({
        id: p.id,
        title: p.title,
        slug: p.slug || `product-${p.id}`,
        pack: (p.variants && p.variants[0]?.variant_name) || 'Standard Pack',
        price: p.price_inr || p.price || 199,
        originalPrice: p.compare_price_inr || Math.round((p.price_inr || 199) * 1.25),
        discount: '20% OFF',
        rating: 4.9,
        reviews: 45 + idx * 12,
        image_url: p.thumbnail || p.image_url || sampleProducts[idx % sampleProducts.length].image_url,
        category: p.category_name || 'ValueLife Organic'
      }))
    : sampleProducts;

  const isWishlisted = (id) => wishlist.some(w => w.id === id);

  return (
    <section className="py-12 bg-white border-b border-gray-150" data-reticle-target="featured-products-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Handpicked natural formulations for optimum health & wellness
            </p>
          </div>

          {/* Filter Tabs & View All */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full text-xs font-semibold text-gray-600">
              {['All', 'Best Sellers', 'New Arrivals', 'On Sale'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#164e3f] text-white shadow-sm font-bold' 
                      : 'hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigateTo && navigateTo('/products', { view: 'all_products' })}
              className="text-xs font-bold text-[#164e3f] hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* 5-Column Grid matching Section 4 of Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between group hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 relative"
              data-reticle-target={`featured-product-card-${item.id}`}
            >
              {/* Wishlist Heart Icon Button */}
              <button
                type="button"
                onClick={() => handleToggleWishlist && handleToggleWishlist(item)}
                className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isWishlisted(item.id)
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-white/90 hover:bg-white border-gray-200 text-gray-400 hover:text-rose-500 shadow-sm'
                }`}
                title="Add to Wishlist"
              >
                <Heart size={15} fill={isWishlisted(item.id) ? 'currentColor' : 'none'} />
              </button>

              {/* Product Image */}
              <div 
                onClick={() => navigateTo && navigateTo(`/products/${item.slug}`, { view: 'pdp', slug: item.slug })}
                className="w-full aspect-square rounded-xl overflow-hidden bg-[#faf8f5] mb-3 border border-gray-100 p-2 cursor-pointer"
              >
                <img
                  src={resolveImgUrl(item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80';
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="space-y-1.5 flex-1">
                <div 
                  onClick={() => navigateTo && navigateTo(`/products/${item.slug}`, { view: 'pdp', slug: item.slug })}
                  className="cursor-pointer"
                >
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#164e3f] transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-medium block">
                    {item.pack}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">
                    ({item.reviews})
                  </span>
                </div>

                {/* Pricing & Discount */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-gray-950">
                    {currencySymbol}{item.price}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-[11px] text-gray-400 line-through">
                      {currencySymbol}{item.originalPrice}
                    </span>
                  )}
                  {item.discount && (
                    <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      {item.discount}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleAddToCart && handleAddToCart({
                    ...item,
                    price_inr: item.price,
                    discount_inr: item.price
                  })}
                  className="w-full bg-[#164e3f] hover:bg-[#0f382c] text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  data-reticle-target={`featured-add-to-cart-${item.id}`}
                >
                  <ShoppingBag size={14} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
