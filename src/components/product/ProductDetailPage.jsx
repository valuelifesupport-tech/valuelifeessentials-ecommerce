import { getApiUrl, resolveImgUrl } from '../../api/config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import BrandLoader from '../common/BrandLoader';
import ProductGallery from './ProductGallery';
import ProductPricingBox from './ProductPricingBox';
import ProductReviews from './ProductReviews';

export default function ProductDetailPage({ 
  productSlug, 
  productId,
  currency, 
  currencySymbol, 
  wishlist = [],
  onAddToCart, 
  onAddToWishlist, 
  onBack,
  onSelectProduct,
  showToast
}) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('highlights');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '', user_email: '', rating: 5, title: '', comment: '', images: []
  });
  const [previewReviewImage, setPreviewReviewImage] = useState(null);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('highest');
  const [relatedProducts, setRelatedProducts] = useState([]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const targetParam = productSlug || productId;
      const res = await fetch(getApiUrl(`/api/products/${targetParam}`));
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProductData(data);
      if (Array.isArray(data?.variants) && data.variants.length > 0) {
        const activeVars = data.variants.filter(v => !v.status || v.status === 'active');
        setSelectedVariant(activeVars[0] || data.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      if (data?.image_url) setSelectedImage(data.image_url);

      // Populate Related / Suggested Products with fallback
      const directRelated = data?.related_products || data?.frequently_bought_products || [];
      if (Array.isArray(directRelated) && directRelated.length > 0) {
        setRelatedProducts(directRelated);
      } else {
        try {
          const fallbackRes = await fetch(getApiUrl('/api/products?limit=10'));
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const list = Array.isArray(fallbackData) ? fallbackData : (fallbackData.products || []);
            setRelatedProducts(list.filter(p => p.id !== data.id && p.slug !== data.slug));
          }
        } catch (e) {
          console.warn('Fallback related products error:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [productSlug, productId]);

  const allProductImages = useMemo(() => {
    if (!productData) return [];
    const list = [];
    const seen = new Set();
    const addUrl = (url) => {
      if (!url || typeof url !== 'string' || !url.trim()) return;
      const clean = url.trim();
      if (!seen.has(clean)) { seen.add(clean); list.push(clean); }
    };
    addUrl(productData.image_url);
    addUrl(productData.thumbnail);
    if (Array.isArray(productData.images)) {
      productData.images.forEach(img => {
        if (typeof img === 'string') addUrl(img);
        else if (img && img.image_url) addUrl(img.image_url);
      });
    }
    if (Array.isArray(productData.variants)) {
      productData.variants.forEach(v => addUrl(v?.image_url));
    }
    return list;
  }, [productData]);

  // Carousel ref & auto-scroll
  const carouselRef = useRef(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (isCarouselPaused || !relatedProducts || relatedProducts.length <= 1) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 3200);
    return () => clearInterval(interval);
  }, [isCarouselPaused, relatedProducts]);

  const handleScrollLeft = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  };
  const handleScrollRight = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.user_name || !reviewForm.comment) {
      if (showToast) showToast('error', 'Missing Information', 'Please fill in your name and comment.');
      return;
    }
    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewForm, product_id: productData.id })
      });
      if (res.ok) {
        setShowReviewModal(false);
        setReviewForm({ user_name: '', user_email: '', rating: 5, title: '', comment: '', images: [] });
        fetchProductDetail();
        if (showToast) showToast('success', 'Review Submitted for Moderation!', 'Thank you! Your review was submitted for admin verification and will be published once approved.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Review Error', err.message);
    }
  };

  if (loading) return <BrandLoader text="Loading ValueLife Essentials Product Details..." fullScreen={false} />;
  if (!productData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-6xl animate-bounce">📦</div>
        <h2 className="text-2xl font-black text-gray-800 font-['Outfit']">Product Not Found</h2>
        <button onClick={onBack} className="bg-[#2d6a4f] text-white font-extrabold px-6 py-3 rounded-full text-sm">
          ← Back to Catalog
        </button>
      </div>
    );
  }

  const variantsList = Array.isArray(productData?.variants) ? productData.variants : [];
  const targetItem = selectedVariant || (variantsList.length > 0 ? variantsList[0] : productData);
  const isINR = currency === 'INR';
  const prodInr = Number(productData.price_inr || productData.price || productData.discount_inr) || 0;
  const prodUsd = Number(productData.price_usd || productData.discount_usd) || (prodInr > 0 ? Number((prodInr / 95).toFixed(2)) : 0);
  const varInr = targetItem && (Number(targetItem.price_inr) || Number(targetItem.price) || prodInr);
  const varUsd = targetItem && (Number(targetItem.price_usd) || prodUsd);
  const rawPrice = isINR ? (varInr > 0 ? varInr : prodInr) : (varUsd > 0 ? varUsd : prodUsd);
  const rawCompare = isINR ? Number(targetItem?.compare_price_inr || productData.compare_price_inr || 0) : Number(targetItem?.compare_price_usd || productData.compare_price_usd || 0);

  const price = rawPrice;
  const originalPrice = rawCompare > price ? rawCompare : price;
  const savingsAmount = originalPrice > price ? (originalPrice - price) : 0;

  const activeImgIdx = allProductImages.findIndex(img => resolveImgUrl(img) === resolveImgUrl(selectedImage || allProductImages[0]));
  const currentImgIdx = activeImgIdx >= 0 ? activeImgIdx : 0;
  const handlePrevImage = () => {
    if (!allProductImages || allProductImages.length <= 1) return;
    setSelectedImage(allProductImages[(currentImgIdx - 1 + allProductImages.length) % allProductImages.length]);
  };
  const handleNextImage = () => {
    if (!allProductImages || allProductImages.length <= 1) return;
    setSelectedImage(allProductImages[(currentImgIdx + 1) % allProductImages.length]);
  };

  return (
    <div className="bg-white min-h-screen pb-32 font-sans" data-reticle-target="pdp-page-container">
      {/* BREADCRUMB BAR */}
      <div className="bg-gray-50/80 border-b border-gray-200/80 py-3 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
            <ArrowLeft size={14} /> Back
          </button>
          <span>/</span>
          <span>Home</span>
          {productData.category_name && (
            <>
              <span>/</span>
              <span className="hover:text-emerald-700 cursor-pointer">{productData.category_name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-none">{productData.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* TWO-COLUMN PRODUCT HERO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductGallery
            productData={productData}
            allProductImages={allProductImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            handlePrevImage={handlePrevImage}
            handleNextImage={handleNextImage}
          />

          <ProductPricingBox
            productData={productData}
            price={price}
            originalPrice={originalPrice}
            savingsAmount={savingsAmount}
            currencySymbol={currencySymbol}
            variantsList={variantsList}
            selectedVariant={selectedVariant}
            handleSelectVariant={(v) => { setSelectedVariant(v); if (v?.image_url) setSelectedImage(v.image_url); }}
            quantity={quantity}
            setQuantity={setQuantity}
            isINR={isINR}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            isWishlisted={Boolean(productData && Array.isArray(wishlist) && wishlist.some(w => w.id === productData.id || w.slug === productData.slug))}
            showToast={showToast}
          />
        </div>

        {/* HIGHLIGHTS & ACCORDIONS */}
        <div className="border-t pt-8 space-y-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-200/80" data-reticle-target="pdp-tabs">
          <div className="flex border-b border-gray-200 gap-4 text-xs font-extrabold text-gray-600 overflow-x-auto pb-1">
            <button 
              onClick={() => setActiveTab('highlights')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'highlights' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
            >
              📝 Product Highlights
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'specs' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
            >
              🔍 Specifications & Details
            </button>
            <button 
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'shipping' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
            >
              🚚 Shipping & COD Policy
            </button>
          </div>

          <div className="text-xs text-gray-700 leading-relaxed space-y-4">
            {activeTab === 'highlights' && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-gray-900">Description & Key Benefits:</h4>
                <p className="whitespace-pre-line">{productData.description || '100% Pure, authentic, and certified organic wellness formulation.'}</p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-black text-gray-900">{productData.category_name || productData.category || 'Organic Essentials'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Brand</span>
                  <span className="font-black text-gray-900">ValueLife Essentials</span>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <p className="text-xs text-gray-600">Express home delivery across India in 2-4 business days. Safe tamper-proof packaging.</p>
            )}
          </div>
        </div>

        {/* CUSTOMER REVIEWS */}
        <ProductReviews
          productData={productData}
          showReviewModal={showReviewModal}
          setShowReviewModal={setShowReviewModal}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          handleReviewSubmit={handleReviewSubmit}
          previewReviewImage={previewReviewImage}
          setPreviewReviewImage={setPreviewReviewImage}
          reviewSort={reviewSort}
          setReviewSort={setReviewSort}
          reviewPage={reviewPage}
          setReviewPage={setReviewPage}
        />

        {/* RELATED / SUGGESTED PRODUCTS (BELOW CUSTOMER REVIEWS) */}
        {relatedProducts.length > 0 && (
          <section 
            className="border-t border-gray-100 pt-12 pb-8 space-y-6 max-w-7xl mx-auto"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            data-reticle-target="pdp-related-products-section"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
                  <Sparkles size={13} className="text-emerald-600" /> Recommended For You
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Outfit'] tracking-tight">
                  Related Products You Might Like
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Pure, authentic, and certified natural wellness essentials matching your choice.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  type="button"
                  onClick={handleScrollLeft} 
                  aria-label="Previous products"
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-emerald-700 hover:text-white text-gray-700 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  type="button"
                  onClick={handleScrollRight} 
                  aria-label="Next products"
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-emerald-700 hover:text-white text-gray-700 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Products List */}
            <div 
              ref={carouselRef} 
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none snap-x"
            >
              {relatedProducts.map((item) => {
                const isINR = currency === 'INR';
                const itemPrice = isINR 
                  ? (Number(item.price_inr || item.price) || 0)
                  : (Number(item.price_usd) || (Number(item.price_inr || item.price) ? Number((Number(item.price_inr || item.price) / 95).toFixed(2)) : 0));
                const itemCompare = isINR 
                  ? Number(item.compare_price_inr || 0) 
                  : Number(item.compare_price_usd || 0);
                const discount = itemCompare > itemPrice && itemCompare > 0 
                  ? Math.round(((itemCompare - itemPrice) / itemCompare) * 100) 
                  : 0;
                const isWishlisted = Array.isArray(wishlist) && wishlist.some(w => w.id === item.id);

                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(item.slug || item.id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    className="w-[230px] sm:w-[260px] flex-shrink-0 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group snap-start"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-44 sm:h-48 bg-[#fbfbfa] m-2.5 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-3">
                      <img 
                        src={resolveImgUrl(item.thumbnail || item.image_url)} 
                        alt={item.title} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToWishlist) onAddToWishlist(item);
                        }}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                          isWishlisted 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                            : 'bg-white/90 text-gray-400 hover:text-rose-600 hover:bg-white'
                        }`}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart size={15} className={isWishlisted ? 'fill-current text-rose-600' : ''} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 sm:p-4 pt-1 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        {item.category_name && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1.5">
                            {item.category_name}
                          </span>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {item.title || item.name}
                        </h4>
                        
                        {/* Real Rating & Review Count */}
                        {(() => {
                          const revCount = Number(item.review_count || item.total_reviews || 0);
                          const ratingVal = Number(item.rating || item.avg_rating || 0);
                          if (revCount > 0 && ratingVal > 0) {
                            const fullStars = Math.min(5, Math.max(1, Math.round(ratingVal)));
                            return (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="flex text-amber-500 text-xs">
                                  {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}
                                </div>
                                <span className="text-[11px] font-extrabold text-gray-700">
                                  {ratingVal.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  ({revCount})
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="flex text-gray-300 text-xs">
                                ☆☆☆☆☆
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                No reviews yet
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-sm sm:text-base text-gray-900">
                              {currencySymbol}{itemPrice}
                            </span>
                            {itemCompare > itemPrice && (
                              <span className="text-[11px] text-gray-400 line-through font-semibold">
                                {currencySymbol}{itemCompare}
                              </span>
                            )}
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (onAddToCart) onAddToCart({ ...item, price: itemPrice, quantity: 1 }); 
                          }} 
                          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <ShoppingBag size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
