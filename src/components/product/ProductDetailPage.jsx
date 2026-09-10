import { getApiUrl, resolveImgUrl } from '../../api/config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Heart, ShoppingBag } from 'lucide-react';
import BrandLoader from '../common/BrandLoader';
import ProductGallery from './ProductGallery';
import ProductPricingBox from './ProductPricingBox';
import ProductReviews from './ProductReviews';

export default function ProductDetailPage({ 
  productSlug, 
  productId,
  currency, 
  currencySymbol, 
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
    if (Array.isArray(productData.images)) {
      productData.images.forEach(img => {
        if (typeof img === 'string') addUrl(img);
        else if (img && img.image_url) addUrl(img.image_url);
      });
    }
    addUrl(productData.image_url);
    addUrl(productData.thumbnail);
    if (Array.isArray(productData.variants)) {
      productData.variants.forEach(v => addUrl(v?.image_url));
    }
    return list;
  }, [productData]);

  // Carousel ref & auto-scroll
  const carouselRef = useRef(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [isCarouselPaused, productData]);

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
        if (showToast) showToast('success', 'Review Submitted!', 'Thank you for your feedback.');
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

  const suggestedList = productData.frequently_bought_products || productData.frequentlyBoughtProducts || [];

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
                  <span className="font-black text-gray-900">{productData.category || 'Organic Essentials'}</span>
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

        {/* RELATED PRODUCTS CAROUSEL */}
        {suggestedList.length > 0 && (
          <div 
            className="border-t pt-10 pb-6 space-y-6 max-w-6xl mx-auto"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            data-reticle-target="pdp-related-carousel"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-['Outfit']">You Might Also Like</h2>
              <div className="flex gap-2">
                <button onClick={handleScrollLeft} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-700 hover:text-white flex items-center justify-center cursor-pointer">‹</button>
                <button onClick={handleScrollRight} className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center cursor-pointer">›</button>
              </div>
            </div>
            <div ref={carouselRef} className="flex gap-5 overflow-x-auto scroll-smooth py-2 scrollbar-none">
              {suggestedList.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectProduct && onSelectProduct(item.slug || item.id)}
                  className="w-56 min-w-[220px] bg-[#f8f7f2] rounded-2xl p-3 border hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-36 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2">
                    <img src={resolveImgUrl(item.thumbnail || item.image_url)} alt={item.title} className="max-h-full object-contain" />
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.title}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-black text-xs text-gray-900">{currencySymbol}{item.price_inr || item.price}.00</span>
                    <button onClick={(e) => { e.stopPropagation(); onAddToCart(item); }} className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer">+ Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
