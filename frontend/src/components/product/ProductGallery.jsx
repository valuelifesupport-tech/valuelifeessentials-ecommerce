import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function ProductGallery({
  productData,
  allProductImages = [],
  selectedImage,
  setSelectedImage,
  handlePrevImage,
  handleNextImage
}) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Touch gesture state for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // References for thumbnail scrolling & auto-centering
  const thumbnailsContainerRef = useRef(null);
  const thumbnailRefs = useRef([]);

  const currentImg = selectedImage || allProductImages[0] || productData?.image_url || productData?.thumbnail;
  const totalImages = allProductImages?.length || 0;

  const currentIndex = allProductImages.findIndex(
    (img) => resolveImgUrl(img) === resolveImgUrl(currentImg)
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  // Next / Prev handlers with robust fallback
  const onPrev = (e) => {
    if (e) e.stopPropagation();
    if (handlePrevImage) {
      handlePrevImage();
    } else if (totalImages > 0) {
      const prevIdx = (safeIndex - 1 + totalImages) % totalImages;
      setSelectedImage(allProductImages[prevIdx]);
    }
  };

  const onNext = (e) => {
    if (e) e.stopPropagation();
    if (handleNextImage) {
      handleNextImage();
    } else if (totalImages > 0) {
      const nextIdx = (safeIndex + 1) % totalImages;
      setSelectedImage(allProductImages[nextIdx]);
    }
  };

  // Scroll Thumbnail Strip with arrow buttons
  const scrollThumbnails = (direction) => {
    if (thumbnailsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      thumbnailsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check if thumbnails overflow container to show/hide scroll arrows
  const checkThumbnailScroll = () => {
    const el = thumbnailsContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
  };

  // Auto-scroll active thumbnail into view whenever safeIndex changes
  useEffect(() => {
    const targetThumb = thumbnailRefs.current[safeIndex];
    if (targetThumb) {
      targetThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
    checkThumbnailScroll();
  }, [safeIndex, totalImages]);

  // Keep scroll arrow states updated on window resize & scroll
  useEffect(() => {
    checkThumbnailScroll();
    const el = thumbnailsContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkThumbnailScroll, { passive: true });
      window.addEventListener('resize', checkThumbnailScroll);
      return () => {
        el.removeEventListener('scroll', checkThumbnailScroll);
        window.removeEventListener('resize', checkThumbnailScroll);
      };
    }
  }, [allProductImages]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, safeIndex, totalImages]);

  // Touch Swipe Handlers for Main Image
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (diff > threshold) {
      onNext();
    } else if (diff < -threshold) {
      onPrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="space-y-4 select-none" data-reticle-target="pdp-gallery">
      {/* 1. MAIN LARGE IMAGE PREVIEW CONTAINER */}
      <div 
        className="relative aspect-square max-h-[520px] w-full bg-white rounded-3xl border border-gray-200/90 overflow-hidden flex items-center justify-center p-4 sm:p-6 group shadow-sm transition-all duration-300 hover:shadow-md cursor-zoom-in"
        onClick={() => setIsZoomOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-reticle-target="pdp-main-image"
      >
        {/* TOP BADGES & CONTROLS */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          {/* Discount / Category Pill */}
          {productData?.discount_percent ? (
            <span className="pointer-events-auto bg-rose-600/95 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm tracking-wide">
              {productData.discount_percent}% OFF
            </span>
          ) : (
            <span className="pointer-events-auto bg-emerald-700/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
              100% Authentic
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {/* Image Counter Pill */}
            {totalImages > 1 && (
              <span className="pointer-events-auto bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                <span>{safeIndex + 1}</span>
                <span className="opacity-60">/</span>
                <span>{totalImages}</span>
              </span>
            )}

            {/* Zoom / Lightbox Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#3b6e14] shadow-sm hover:shadow border border-gray-200/80 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
              title="Click to expand full image"
              data-reticle-target="pdp-zoom-btn"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* MAIN PRODUCT IMAGE WITH HOVER SCALE */}
        <img 
          src={resolveImgUrl(currentImg)} 
          alt={productData?.title || 'Product Image'} 
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* IMAGE SLIDER PREV / NEXT CHEVRONS */}
        {totalImages > 1 && (
          <>
            <button 
              type="button" 
              onClick={onPrev}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200/90 flex items-center justify-center text-gray-700 hover:text-[#3b6e14] transition-all duration-200 opacity-85 hover:opacity-100 cursor-pointer active:scale-90 z-10"
              title="Previous Image"
              data-reticle-target="pdp-prev-img-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button" 
              onClick={onNext}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200/90 flex items-center justify-center text-gray-700 hover:text-[#3b6e14] transition-all duration-200 opacity-85 hover:opacity-100 cursor-pointer active:scale-90 z-10"
              title="Next Image"
              data-reticle-target="pdp-next-img-btn"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* MOBILE PAGINATION DOTS */}
        {totalImages > 1 && (
          <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full pointer-events-none z-10">
            {allProductImages.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  dotIdx === safeIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. HORIZONTAL THUMBNAILS STRIP (ZERO UGLY NATIVE SCROLLBARS) */}
      {totalImages > 1 && (
        <div className="relative group/thumbs" data-reticle-target="pdp-thumbnails-wrapper">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollThumbnails('left')}
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#3b6e14] flex items-center justify-center transition-all duration-200 z-10 active:scale-90 cursor-pointer"
              title="Scroll thumbnails left"
              data-reticle-target="pdp-thumb-scroll-left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Left Gradient Fade Mask */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-[5] rounded-l-2xl" />
          )}

          {/* Clean Thumbnails Rail */}
          <div 
            ref={thumbnailsContainerRef}
            className="flex gap-2.5 sm:gap-3 overflow-x-auto py-2 px-1 scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            data-reticle-target="pdp-thumbnails"
          >
            {allProductImages.map((imgUrl, idx) => {
              const isSelected = resolveImgUrl(currentImg) === resolveImgUrl(imgUrl);
              return (
                <button 
                  key={idx}
                  ref={(el) => (thumbnailRefs.current[idx] = el)}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer flex items-center justify-center p-1.5 active:scale-95 ${
                    isSelected 
                      ? 'border-[#3b6e14] bg-white ring-2 ring-[#3b6e14]/25 shadow-md shadow-[#3b6e14]/15 scale-105 z-[2]' 
                      : 'border-gray-200/90 bg-white/90 hover:border-emerald-600/60 hover:bg-white opacity-70 hover:opacity-100 hover:scale-[1.03]'
                  }`}
                  data-reticle-target={`pdp-thumb-${idx}`}
                  title={`View image ${idx + 1}`}
                >
                  <img 
                    src={resolveImgUrl(imgUrl)} 
                    alt={`${productData?.title || 'Product'} view ${idx + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  {/* Subtle active indicator pill */}
                  {isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#3b6e14]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade Mask */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-[5] rounded-r-2xl" />
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollThumbnails('right')}
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#3b6e14] flex items-center justify-center transition-all duration-200 z-10 active:scale-90 cursor-pointer"
              title="Scroll thumbnails right"
              data-reticle-target="pdp-thumb-scroll-right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* 3. ULTRA-CLEAR FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[999999] flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn select-none"
          onClick={() => setIsZoomOpen(false)}
          data-reticle-target="pdp-lightbox-modal"
        >
          {/* Header Controls */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base text-gray-200 font-['Outfit']">
                {productData?.title || 'Product Image Preview'}
              </span>
              <span className="bg-white/10 text-emerald-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                {safeIndex + 1} / {totalImages}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close Preview (Esc)"
              data-reticle-target="pdp-lightbox-close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Central Full-View Image */}
          <div 
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center py-4 my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={resolveImgUrl(currentImg)} 
              alt={productData?.title || 'Product Fullscreen Preview'} 
              className="max-h-[75vh] max-w-full object-contain transition-all duration-300 rounded-2xl shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {/* Lightbox Prev / Next Chevrons */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
                  title="Previous (Left Arrow)"
                  data-reticle-target="pdp-lightbox-prev"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
                  title="Next (Right Arrow)"
                  data-reticle-target="pdp-lightbox-next"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          {totalImages > 1 && (
            <div 
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {allProductImages.map((imgUrl, idx) => {
                const isSelected = resolveImgUrl(currentImg) === resolveImgUrl(imgUrl);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all p-1 flex-shrink-0 cursor-pointer bg-white ${
                      isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={resolveImgUrl(imgUrl)} 
                      alt="" 
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
