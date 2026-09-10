import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function ProductGallery({
  productData,
  allProductImages = [],
  selectedImage,
  setSelectedImage,
  handlePrevImage,
  handleNextImage
}) {
  const currentImg = selectedImage || allProductImages[0] || productData?.image_url || productData?.thumbnail;

  return (
    <div className="space-y-4" data-reticle-target="pdp-gallery">
      {/* MAIN LARGE IMAGE PREVIEW */}
      <div className="relative aspect-square max-h-[500px] w-full bg-white rounded-3xl border border-gray-200/90 overflow-hidden flex items-center justify-center p-4 group shadow-sm" data-reticle-target="pdp-main-image">
        <img 
          src={resolveImgUrl(currentImg)} 
          alt={productData?.title || 'Product Image'} 
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* IMAGE NAVIGATION ARROWS */}
        {allProductImages && allProductImages.length > 1 && (
          <>
            <button 
              type="button" 
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-700 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              title="Previous Image"
              data-reticle-target="pdp-prev-img-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button" 
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-700 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              title="Next Image"
              data-reticle-target="pdp-next-img-btn"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* HORIZONTAL THUMBNAILS STRIP */}
      {allProductImages && allProductImages.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" data-reticle-target="pdp-thumbnails">
          {allProductImages.map((imgUrl, idx) => {
            const isSelected = resolveImgUrl(currentImg) === resolveImgUrl(imgUrl);
            return (
              <button 
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white p-0.5 cursor-pointer flex items-center justify-center ${
                  isSelected 
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-105' 
                    : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                }`}
                data-reticle-target={`pdp-thumb-${idx}`}
              >
                <img 
                  src={resolveImgUrl(imgUrl)} 
                  alt={`${productData?.title || 'Product'} view ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl"
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
  );
}
