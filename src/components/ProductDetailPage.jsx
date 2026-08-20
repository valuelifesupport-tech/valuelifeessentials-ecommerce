import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, ShieldCheck, Truck, RefreshCw, Heart, ShoppingBag, CheckCircle, Upload, ArrowLeft, 
  ChevronRight, Award, Zap, ThumbsUp, HelpCircle, Check, MapPin, Truck as DeliveryTruck, Layers, Plus
} from 'lucide-react';

export default function ProductDetailPage({ 
  productSlug, 
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
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const [activeTab, setActiveTab] = useState('highlights');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '', user_email: '', rating: 5, title: '', comment: '', images: []
  });

  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('highest');

  // AUTO-SCROLL CAROUSEL STATE & REF
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
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth } = carouselRef.current;
      if (scrollLeft <= 10) {
        carouselRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
      }
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (productSlug) {
      fetchProductDetail();
    }
  }, [productSlug]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/slug/${productSlug}`);
      const data = await res.json();
      setProductData(data);
      
      const bundles = data.frequently_bought_products || data.frequentlyBoughtProducts || [];
      setSelectedBundleIds([]); // Default 0 items selected (not added by default as requested by user)
      
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      } else {
        setSelectedVariant(null);
      }

      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0].image_url);
      } else {
        setSelectedImage('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80');
      }

      fetch('http://localhost:5000/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'sess_' + Math.random().toString(36).substr(2, 9),
          page_url: `/products/${productSlug}`,
          product_id: data.id,
          action: 'VIEW'
        })
      });
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeCheck = () => {
    if (pincode.length >= 6) {
      setPincodeStatus({
        available: true,
        message: `Express Delivery Available to Pincode ${pincode}! Delivered in 2-4 Days.`
      });
    } else {
      setPincodeStatus({
        available: false,
        message: 'Please enter a valid 6-digit Pincode.'
      });
    }
  };

  const handleReviewUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) {
        setReviewForm({ ...reviewForm, images: [...reviewForm.images, `http://localhost:5000${data.imageUrl}`] });
      }
    } catch (err) {
      showToast('error', 'Upload Failed', 'Failed to upload review image');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewForm, product_id: productData.id })
      });
      if (res.ok) {
        setShowReviewModal(false);
        fetchProductDetail();
        showToast('success', 'Review Submitted!', 'Thank you for your customer feedback.');
      }
    } catch (err) {
      showToast('error', 'Review Error', 'Error submitting review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <div className="text-5xl animate-bounce mb-3">🌱</div>
        <p className="font-extrabold text-gray-800">Loading ValueLife Essentials Product Details...</p>
      </div>
    );
  }

  if (!productData) return null;

  const price = selectedVariant 
    ? (currency === 'INR' ? (selectedVariant.discount_inr || selectedVariant.price_inr) : (selectedVariant.discount_usd || selectedVariant.price_usd))
    : (currency === 'INR' ? (productData.discount_inr || productData.price_inr) : (productData.discount_usd || productData.price_usd));

  const originalPrice = selectedVariant
    ? (currency === 'INR' ? selectedVariant.price_inr : selectedVariant.price_usd)
    : (currency === 'INR' ? productData.price_inr : productData.price_usd);

  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const deposit20 = Math.round(price * 0.20 * quantity);
  const remaining80 = (price * quantity) - deposit20;

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* BREADCRUMB BAR */}
      <div className="bg-gray-100/80 border-b border-gray-200 py-2.5 px-4 text-xs font-semibold text-gray-600">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="hover:text-emerald-800 transition-colors">Home</button>
          <ChevronRight size={14} className="text-gray-400" />
          <button onClick={onBack} className="hover:text-emerald-800 transition-colors">Products</button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="hover:text-emerald-800">{productData.category_name}</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-gray-900 line-clamp-1">{productData.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-12">
        {/* PDP MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT: IMAGE GALLERY */}
          <div className="space-y-4">
            <div className="w-full h-96 sm:h-[460px] bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 relative group shadow-sm">
              <img 
                src={selectedImage} 
                alt={productData.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#2d6a4f] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  100% ORGANIC CERTIFIED
                </span>
                {discountPercent > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {productData.images && productData.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img.image_url ? 'border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20 shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS, VARIANTS & TECHNICAL SPECS */}
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest block mb-1">
                VALUELIFE ESSENTIALS ORGANIC & WELLNESS SOLUTIONS
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight font-['Outfit']">
                {productData.title}
              </h1>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star size={14} fill="#f59e0b" className="text-amber-500" />
                  <span className="font-black text-xs text-gray-900">
                    {Number(productData.ratingStats?.avg_rating || 5).toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-bold underline cursor-pointer">
                  {productData.ratingStats?.total_reviews || 2} Customer Reviews
                </span>
                <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle size={14} /> In Stock ({selectedVariant?.stock || productData.stock} units)
                </span>
              </div>
            </div>

            {/* PRODUCT VARIANTS SELECTOR PILLS */}
            {productData.variants && productData.variants.length > 0 && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-['Outfit']">
                    <Layers size={16} className="text-[#2d6a4f]" /> Select Size / Pack Variant:
                  </label>
                  <span className="text-xs font-black text-white bg-[#1b4332] px-3 py-1 rounded-full shadow-sm">
                    {selectedVariant?.variant_name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {productData.variants.map((v) => {
                    const vPrice = currency === 'INR' ? (v.discount_inr || v.price_inr) : (v.discount_usd || v.price_usd);
                    const isSelected = selectedVariant?.id === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-md scale-105 ring-2 ring-emerald-500/30'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="font-extrabold">{v.variant_name}</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${isSelected ? 'bg-amber-400 text-gray-950' : 'bg-emerald-100 text-emerald-900'}`}>
                          {currencySymbol}{vPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRICE DISPLAY */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#1b4332]">
                  {currencySymbol}{price}
                </span>
                {originalPrice > price && (
                  <span className="text-base text-gray-400 line-through font-bold">
                    {currencySymbol}{originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-amber-400 text-gray-950 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800 font-semibold">Inclusive of all taxes & doorstep home delivery.</p>
            </div>

            {/* PARTIAL PAYMENT BANNER */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                <Zap size={16} className="text-amber-600 fill-amber-500" />
                <span>Partial Payment Deposit Option:</span>
              </div>
              <div className="text-xs text-gray-800 space-y-1 font-medium">
                <p>• Pay <strong>{currencySymbol}{deposit20}</strong> online deposit now (20%).</p>
                <p>• Pay balance <strong>{currencySymbol}{remaining80}</strong> on Cash on Delivery (COD).</p>
              </div>
            </div>

            {/* QUANTITY & ACTION BUTTONS */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-black text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  onClick={() => onAddToCart({ ...productData, variant: selectedVariant, price, quantity })}
                  className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white flex-1 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>

                <button 
                  onClick={() => {
                    onAddToCart({ ...productData, variant: selectedVariant, price, quantity });
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-950 flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  ⚡ Buy Now
                </button>

                <button 
                  onClick={() => onAddToWishlist(productData)}
                  className="p-3.5 rounded-2xl border border-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
                  title="Save to Wishlist"
                >
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {/* TECHNICAL SPECS TABLE GRID (From Screenshot 2) */}
            {productData.specs && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <h3 className="text-xs font-black uppercase text-gray-900 tracking-wider">🛠️ Product Specifications</h3>
                <div className="divide-y divide-gray-200 text-xs">
                  {Object.entries(productData.specs).map(([key, val]) => (
                    <div key={key} className="py-2 flex justify-between gap-4">
                      <span className="font-bold text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-extrabold text-gray-900 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 SERVICE GUARANTEE BADGES (Matching User Screenshot 1 Red Circle) */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm grid grid-cols-3 gap-2 text-center divide-x divide-gray-200">
              <div className="flex flex-col items-center gap-1 px-1">
                <div className="w-10 h-10 rounded-full bg-[#f0f7ec] text-[#3b6e14] flex items-center justify-center text-lg">
                  🚚
                </div>
                <div>
                  <span className="text-xs font-extrabold text-gray-800 block leading-tight font-['Outfit']">Free Shipping</span>
                  <span className="text-[10px] text-gray-500 font-medium">Above ₹499</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-1">
                <div className="w-10 h-10 rounded-full bg-[#f0f7ec] text-[#3b6e14] flex items-center justify-center text-lg">
                  🔄
                </div>
                <div>
                  <span className="text-xs font-extrabold text-gray-800 block leading-tight font-['Outfit']">7 Days</span>
                  <span className="text-[10px] text-gray-500 font-medium">Returnable</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-1">
                <div className="w-10 h-10 rounded-full bg-[#f0f7ec] text-[#3b6e14] flex items-center justify-center text-lg">
                  🎥
                </div>
                <div>
                  <span className="text-xs font-extrabold text-gray-800 block leading-tight font-['Outfit']">Video Guides</span>
                  <span className="text-[10px] text-gray-500 font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 50-50 DESKTOP GRID: PRODUCT HIGHLIGHTS & DESCRIPTION (LEFT 50%) + SUGGESTED PRODUCTS (RIGHT 50%) */}
        <div className="border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* LEFT 50%: HIGHLIGHTS & ACCORDIONS */}
          <div className="space-y-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-200/80">
            <div className="flex border-b border-gray-200 gap-4 text-xs font-extrabold text-gray-600 overflow-x-auto pb-1">
              <button 
                onClick={() => setActiveTab('highlights')}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'highlights' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
              >
                📝 Product Highlights
              </button>
              <button 
                onClick={() => setActiveTab('plants')}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'plants' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
              >
                🪴 Suitable Plants & Usage
              </button>
              <button 
                onClick={() => setActiveTab('shipping')}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'shipping' ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent hover:text-gray-900'}`}
              >
                🚚 Shipping & COD Policy
              </button>
            </div>

            <div className="text-xs text-gray-700 leading-relaxed space-y-4">
              {activeTab === 'highlights' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-gray-900">Description & Key Benefits:</h4>
                  <p>{productData.description}</p>
                </div>
              )}

              {activeTab === 'plants' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-gray-900">Recommended Plant Types:</h4>
                  <p>Suitable for Tomato, Chilli, Brinjal, Spinach, Coriander, Cucumber, Rose, Jasmine, and indoor potted plants.</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-gray-900">Delivery Information:</h4>
                  <p>All orders are dispatched within 24 hours via Express Courier. Cash on Delivery (COD) and 20% online partial deposit options available nationwide.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 50%: FREQUENTLY BOUGHT TOGETHER */}
          <div className="space-y-4">
            {(() => {
              const bundleList = productData.frequently_bought_products || productData.frequentlyBoughtProducts || [];
              if (bundleList.length === 0) return (
                <div className="p-4 bg-gray-50 rounded-2xl border text-xs text-gray-500">
                  No suggested products available for this item.
                </div>
              );

              // Calculate total price of all selected bundle items
              const bundleTotalPrice = bundleList.reduce((sum, item) => {
                if (selectedBundleIds.includes(item.id)) {
                  const itemPrice = currency === 'INR' ? (item.discount_inr || item.price_inr) : (item.discount_usd || item.price_usd);
                  return sum + itemPrice;
                }
                return sum;
              }, 0);

              const handleAddBundleToCart = () => {
                if (selectedBundleIds.length === 0) return;
                
                const selectedItems = bundleList.filter(item => selectedBundleIds.includes(item.id));
                selectedItems.forEach(item => {
                  onAddToCart(item);
                });

                if (showToast) {
                  showToast('success', 'Bundle Added to Cart!', `Added ${selectedItems.length} items to cart (${currencySymbol}${bundleTotalPrice.toFixed(2)})`);
                }
              };

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-extrabold text-gray-900 font-['Outfit'] tracking-tight flex items-center gap-2">
                      <span>Frequently Bought Together</span>
                    </h3>
                    {selectedBundleIds.length > 0 && (
                      <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        {selectedBundleIds.length} Selected
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {bundleList.map((bundleItem) => {
                      const bPrice = currency === 'INR' ? (bundleItem.discount_inr || bundleItem.price_inr) : (bundleItem.discount_usd || bundleItem.price_usd);
                      const bOriginal = currency === 'INR' ? bundleItem.price_inr : bundleItem.price_usd;
                      const isSelected = selectedBundleIds.includes(bundleItem.id);

                      const handleToggleSuggested = (e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          setSelectedBundleIds(selectedBundleIds.filter(id => id !== bundleItem.id));
                        } else {
                          setSelectedBundleIds([...selectedBundleIds, bundleItem.id]);
                        }
                      };

                      return (
                        <div 
                          key={bundleItem.id} 
                          onClick={handleToggleSuggested}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-4 relative cursor-pointer group ${
                            isSelected 
                              ? 'bg-amber-50/40 border-amber-400 shadow-sm ring-1 ring-amber-300' 
                              : 'bg-white border-gray-200 hover:border-amber-400/60'
                          }`}
                        >
                          {/* YELLOW + / CHECK CIRCLE OVERLAY BUTTON */}
                          <div className="relative shrink-0">
                            <img 
                              src={bundleItem.thumbnail || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef1b7a5?w=100'} 
                              alt={bundleItem.title} 
                              className="w-16 h-16 object-cover rounded-2xl border border-gray-200 bg-white" 
                            />
                            <button
                              type="button"
                              onClick={handleToggleSuggested}
                              className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-md border border-amber-300 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-amber-500 text-slate-950 scale-110' 
                                  : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                              }`}
                              title={isSelected ? 'Deselect item' : 'Select item for bundle'}
                            >
                              {isSelected ? '✓' : '+'}
                            </button>
                          </div>

                          {/* DETAILS */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 
                              onClick={(e) => { e.stopPropagation(); onSelectProduct && onSelectProduct(bundleItem.slug); }}
                              className="font-extrabold text-xs sm:text-sm text-gray-800 hover:text-[#3b6e14] cursor-pointer line-clamp-2 leading-snug"
                            >
                              {bundleItem.title}
                            </h4>

                            <div className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                              <span className="text-amber-600 font-extrabold">{Number(bundleItem.avg_rating || 4.62).toFixed(2)}</span>
                              <span className="text-gray-400">| {bundleItem.review_count || 13} Reviews</span>
                            </div>

                            <div className="flex items-baseline gap-2 pt-0.5">
                              <span className="text-xs sm:text-sm font-black text-gray-900">{currencySymbol} {bPrice}.00</span>
                              {bOriginal > bPrice && (
                                <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {bOriginal}.00</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM CREAM CONTAINER WITH BIG GREEN DYNAMIC ADD TO CART BUTTON */}
                  <div className="bg-[#f7f6f0] p-4 rounded-2xl border border-amber-200/60 shadow-inner flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleAddBundleToCart}
                      disabled={selectedBundleIds.length === 0}
                      className={`w-full py-3.5 px-6 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                        selectedBundleIds.length > 0
                          ? 'bg-[#3b6e14] hover:bg-[#2e5710] text-white shadow-emerald-900/30 hover:scale-[1.02] active:scale-95'
                          : 'bg-[#4a7729]/60 text-white/80 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <ShoppingBag size={18} />
                      <span>ADD TO CART</span>
                      <span className="font-extrabold text-amber-300 ml-1">{currencySymbol}{bundleTotalPrice.toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        {/* 1. "SUGGESTED" BADGE & "YOU MIGHT ALSO LIKE" AUTO-SCROLL CAROUSEL SECTION */}
        {(() => {
          const suggestedList = productData.frequently_bought_products || productData.frequentlyBoughtProducts || [];
          if (suggestedList.length === 0) return null;

          return (
            <div 
              className="border-t pt-10 pb-6 space-y-6 max-w-6xl mx-auto px-4"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* CENTERED HEADER & NAV BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
                <div className="text-center sm:text-left space-y-1">
                  <span className="bg-[#3b6e14] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block">
                    SUGGESTED FOR YOU
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Outfit']">
                    You Might Also Like
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleScrollLeft}
                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-[#3b6e14] text-gray-700 hover:text-white border border-gray-300 font-extrabold flex items-center justify-center text-base transition-all shadow-sm cursor-pointer"
                    title="Previous Slide"
                  >
                    ‹
                  </button>
                  <button 
                    type="button"
                    onClick={handleScrollRight}
                    className="w-9 h-9 rounded-xl bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold flex items-center justify-center text-base transition-all shadow-md cursor-pointer"
                    title="Next Slide"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* CENTERED AUTO-SCROLLING CAROUSEL CONTAINER */}
              <div className="w-full overflow-hidden relative">
                <div 
                  ref={carouselRef}
                  className="flex items-stretch justify-center gap-5 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-none max-w-full"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {suggestedList.map((item) => {
                    const sPrice = currency === 'INR' ? (item.discount_inr || item.price_inr) : (item.discount_usd || item.price_usd);
                    const sOriginal = currency === 'INR' ? item.price_inr : item.price_usd;
                    const sPct = sOriginal > sPrice ? Math.round(((sOriginal - sPrice) / sOriginal) * 100) : 0;

                    return (
                      <div 
                        key={item.id} 
                        className="w-64 min-w-[250px] max-w-[270px] bg-[#f8f7f2] rounded-3xl p-3.5 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-[#3b6e14] flex flex-col justify-between space-y-3 group transition-all flex-shrink-0"
                      >
                        <div 
                          onClick={() => onSelectProduct && onSelectProduct(item.slug)}
                          className="w-full h-44 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-3 shadow-inner"
                        >
                          <img 
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=250'} 
                            alt={item.title} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
                          <div className="space-y-1">
                            <h4 
                              onClick={() => onSelectProduct && onSelectProduct(item.slug)}
                              className="font-extrabold text-xs text-gray-900 group-hover:text-[#3b6e14] cursor-pointer line-clamp-2 leading-snug"
                            >
                              {item.title}
                            </h4>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-sm font-black text-gray-900">{currencySymbol} {sPrice}.00</span>
                                {sOriginal > sPrice && (
                                  <span className="text-[10px] text-gray-400 line-through font-bold">{currencySymbol} {sOriginal}.00</span>
                                )}
                                {sPct > 0 && (
                                  <span className="bg-[#4a7729] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                    -{sPct}% Off
                                  </span>
                                )}
                              </div>

                              <button 
                                type="button"
                                onClick={() => onAddToWishlist(item)}
                                className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
                              >
                                <Heart size={13} fill="currentColor" color="white" />
                              </button>
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => onAddToCart(item)}
                            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white py-2.5 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all mt-2 cursor-pointer"
                          >
                            <ShoppingBag size={13} /> ADD TO CART
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. FULL CUSTOMER REVIEWS BREAKDOWN SECTION (Matching Screenshot 2 1-to-1) */}
        <div className="border-t pt-10 space-y-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 font-['Outfit'] text-center">
            Customer Reviews
          </h2>

          {/* RATING SUMMARY BANNER */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* RATING SCORE */}
            <div className="text-center md:text-left space-y-1">
              <div className="star-rating text-amber-500 font-extrabold text-lg flex items-center justify-center md:justify-start gap-1">
                <span>★★★★★</span>
                <span className="text-gray-900 font-black text-xl">4.93 out of 5</span>
              </div>
              <p className="text-xs text-gray-500 font-bold">Based on 15 verified customer reviews</p>
            </div>

            {/* STAR RATING BARS */}
            <div className="space-y-1 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-2">
                <span>★★★★★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3b6e14] h-full w-[93%]"></div>
                </div>
                <span>14</span>
              </div>
              <div className="flex items-center gap-2">
                <span>★★★★☆</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3b6e14] h-full w-[7%]"></div>
                </div>
                <span>1</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>★★★☆☆</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
                <span>0</span>
              </div>
            </div>

            {/* WRITE A REVIEW + AUTHENTICITY SEALS */}
            <div className="text-center space-y-3">
              <button 
                onClick={() => setShowReviewModal(true)}
                className="bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
              >
                Write a review
              </button>

              <div className="flex justify-center gap-4 text-[9px] font-black text-blue-900">
                <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 px-2 py-1 rounded-lg">
                  🛡️ DIAMOND AUTHENTICITY 100.0
                </div>
                <div className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-1 rounded-lg text-amber-900">
                  🏆 TRANSPARENCY 88.9
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER PHOTOS & VIDEOS STRIP (From Screenshot 2) */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">
              Customer photos & videos
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150" alt="Review photo 1" className="w-20 h-20 object-cover rounded-2xl border border-gray-200 flex-shrink-0" />
              <img src="https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=150" alt="Review photo 2" className="w-20 h-20 object-cover rounded-2xl border border-gray-200 flex-shrink-0" />
              <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=150" alt="Review photo 3" className="w-20 h-20 object-cover rounded-2xl border border-gray-200 flex-shrink-0" />
              <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150" alt="Review photo 4" className="w-20 h-20 object-cover rounded-2xl border border-gray-200 flex-shrink-0" />
            </div>
          </div>

          {/* REVIEWS LIST HEADER & SORT */}
          {(() => {
            const rawReviews = (productData.reviews && productData.reviews.length > 0) 
              ? productData.reviews 
              : [
                { id: 1, user_name: 'SujitDinda', title: 'ladies finger', comment: 'super', rating: 5, created_at: '2026-03-14' },
                { id: 2, user_name: 'Koshy Chacko', title: 'Easy To grow, High Germination', comment: 'Okra or Lady Finger Hybrid (bhindi) Seeds - 50 Seeds (भिंडी के बीज) Easy To grow, High Germination, High Yield Okra Seeds for Home Gardening', rating: 5, created_at: '2026-02-05' },
                { id: 3, user_name: 'Aswini Patra', title: 'Your product is very good', comment: 'Your product is very good. Your gide the very mostly give me', rating: 5, created_at: '2025-12-15' },
                { id: 4, user_name: 'Harmesh Mehta', title: 'Packing is good', comment: 'Superb packing and quality is also good', rating: 5, created_at: '2025-12-05' },
                { id: 5, user_name: 'Tushar', title: 'Got good germination rate!!', comment: 'These okra seeds are truly amazing, the germination rate is awesome.', rating: 5, created_at: '2025-08-22', images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300'] },
                { id: 6, user_name: 'Ega Doyc', title: 'Great Germination White Seeds', comment: 'Untreated Radish White Long Seeds For Organic Gardening - 250 Seeds (Mooli/ मूली के बीज)', rating: 5, created_at: '2026-01-12' },
                { id: 7, user_name: 'SUKHJEET', title: 'Quick Success Rate', comment: 'Radish White seeds, i used these seeds and they are very quick and success rate of germination around 95%.', rating: 5, created_at: '2025-09-29' },
                { id: 8, user_name: 'Vijay Kumar', title: 'Quality Product', comment: 'Excellent! One word i can say its quality product.', rating: 5, created_at: '2025-06-10' },
                { id: 9, user_name: 'Ramesh Patel', title: 'Awesome quality', comment: 'Very fresh seeds, germinated in 4 days!', rating: 4, created_at: '2025-05-18' }
              ];

            const sorted = [...rawReviews].sort((a, b) => {
              if (reviewSort === 'lowest') return (a.rating || 5) - (b.rating || 5);
              if (reviewSort === 'recent') return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
              return (b.rating || 5) - (a.rating || 5);
            });

            const REVIEWS_PER_PAGE = 3;
            const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE) || 1;
            const paginated = sorted.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

            return (
              <div id="customer-reviews-section" className="space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs font-black text-gray-800">{sorted.length} Customer Reviews</span>
                  <select 
                    value={reviewSort}
                    onChange={(e) => {
                      setReviewSort(e.target.value);
                      setReviewPage(1);
                    }}
                    className="bg-white border border-gray-300 text-xs font-bold text-gray-700 rounded-full px-3.5 py-1.5 focus:outline-none cursor-pointer shadow-sm"
                  >
                    <option value="highest">Highest Rating ▾</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>

                {/* DYNAMIC CUSTOMER REVIEWS CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[220px]">
                  {paginated.map((rev) => (
                    <div key={rev.id} className="p-4 bg-[#f8f7f2] rounded-3xl border border-gray-200/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="star-rating text-amber-500 font-bold text-xs">
                            {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#3b6e14] text-white text-[11px] font-black flex items-center justify-center uppercase font-mono">
                            {rev.user_name ? rev.user_name.charAt(0) : 'U'}
                          </span>
                          <span className="font-extrabold text-xs text-gray-900">{rev.user_name}</span>
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">Verified</span>
                        </div>
                        <h5 className="font-extrabold text-xs text-gray-800 pt-0.5">{rev.title}</h5>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                          {rev.comment}
                        </p>

                        {rev.images && rev.images.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            {rev.images.map((imgUrl, idx) => (
                              <img key={idx} src={imgUrl} className="w-20 h-20 object-cover rounded-2xl border border-gray-200" />
                            ))}
                          </div>
                        )}
                      </div>

                      {rev.admin_reply && (
                        <div className="mt-2 bg-emerald-50 border border-emerald-200 p-2 rounded-2xl text-[11px] text-emerald-900 font-medium">
                          💬 <strong>ValueLife Essentials Reply:</strong> "{rev.admin_reply}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* PAGINATION NUMBERS (Matching User Screenshot 1-to-1) */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2.5 pt-6 pb-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => {
                          setReviewPage(pNum);
                          const el = document.getElementById('customer-reviews-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs transition-all cursor-pointer ${
                          reviewPage === pNum
                            ? 'bg-[#3b6e14] text-white shadow-md scale-105'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    {/* NEXT PAGE BUTTON > */}
                    <button
                      type="button"
                      disabled={reviewPage >= totalPages}
                      onClick={() => {
                        setReviewPage(prev => Math.min(prev + 1, totalPages));
                        const el = document.getElementById('customer-reviews-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-700 flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-sm"
                      title="Next Page"
                    >
                      ›
                    </button>

                    {/* LAST PAGE BUTTON >| */}
                    <button
                      type="button"
                      disabled={reviewPage >= totalPages}
                      onClick={() => {
                        setReviewPage(totalPages);
                        const el = document.getElementById('customer-reviews-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-700 flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-sm"
                      title="Last Page"
                    >
                      »
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* WRITE A REVIEW MODAL OVERLAY */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleIn relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="font-extrabold text-lg text-gray-900 font-['Outfit']">Write a Customer Review</h3>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              {/* STAR RATING PICKER */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Overall Rating *</label>
                <div className="flex gap-2 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={star <= reviewForm.rating ? 'text-amber-500' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Ramesh Patel"
                    value={reviewForm.user_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#3b6e14] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Email</label>
                  <input 
                    type="email" placeholder="e.g. ramesh@gmail.com"
                    value={reviewForm.user_email}
                    onChange={(e) => setReviewForm({ ...reviewForm, user_email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#3b6e14] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Review Headline / Title</label>
                <input 
                  type="text" placeholder="e.g. Excellent germination rate & fast delivery!"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#3b6e14] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Feedback *</label>
                <textarea 
                  rows={3} required placeholder="Tell other gardeners about your experience with this organic product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:border-[#3b6e14] focus:outline-none"
                ></textarea>
              </div>

              {/* UPLOAD CUSTOMER PHOTO */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Upload Product Photo (Optional)</label>
                <input 
                  type="file" accept="image/*"
                  onChange={handleReviewUpload}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
                {reviewForm.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {reviewForm.images.map((img, i) => (
                      <img key={i} src={img} className="w-12 h-12 object-cover rounded-xl border" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl border cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  Submit Review ⭐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM CART BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-3 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={selectedImage} className="w-12 h-12 object-cover rounded-xl border border-gray-200 hidden sm:block" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">{productData.title}</h4>
              <span className="font-black text-sm text-[#1b4332]">{currencySymbol}{price}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50 hidden sm:flex">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 py-1 text-xs font-black text-gray-700 hover:bg-gray-200">-</button>
              <span className="px-3 text-xs font-black text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 py-1 text-xs font-black text-gray-700 hover:bg-gray-200">+</button>
            </div>

            <button 
              onClick={() => onAddToCart({ ...productData, variant: selectedVariant, price, quantity })}
              className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
