import React from 'react';
import { Star, Upload, ThumbsUp } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function ProductReviews({
  productData,
  showReviewModal,
  setShowReviewModal,
  reviewForm,
  setReviewForm,
  handleReviewUpload,
  handleReviewSubmit,
  previewReviewImage,
  setPreviewReviewImage,
  reviewSort,
  setReviewSort,
  reviewPage,
  setReviewPage
}) {
  const rawReviews = Array.isArray(productData?.reviews) ? productData.reviews : [];
  const totalReviews = rawReviews.length;
  const avgRatingNum = totalReviews > 0 
    ? (rawReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews)
    : Number(productData?.avg_rating || 0);
  const avgRatingFormatted = avgRatingNum > 0 ? avgRatingNum.toFixed(1) : '0.0';

  // Compute star counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rawReviews.forEach(r => {
    const s = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    starCounts[s] = (starCounts[s] || 0) + 1;
  });

  // Extract all real customer review photos
  const allCustomerPhotos = [];
  rawReviews.forEach(r => {
    if (r.images && Array.isArray(r.images)) {
      r.images.forEach(img => { if (img) allCustomerPhotos.push(img); });
    }
  });

  const sorted = [...rawReviews].sort((a, b) => {
    if (reviewSort === 'lowest') return (a.rating || 5) - (b.rating || 5);
    if (reviewSort === 'recent') return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
    return (b.rating || 5) - (a.rating || 5);
  });

  const REVIEWS_PER_PAGE = 3;
  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE) || 1;
  const paginated = sorted.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  return (
    <div className="border-t pt-10 space-y-8 max-w-5xl mx-auto" data-reticle-target="pdp-reviews-section">
      <h2 className="text-2xl font-black text-gray-900 font-['Outfit'] text-center">
        Customer Reviews
      </h2>

      {/* RATING SUMMARY BANNER */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* RATING SCORE */}
        <div className="text-center md:text-left space-y-1">
          <div className="star-rating text-amber-500 font-extrabold text-lg flex items-center justify-center md:justify-start gap-1">
            <span>★★★★★</span>
            <span className="text-gray-900 font-black text-xl">{avgRatingFormatted} out of 5</span>
          </div>
          <p className="text-xs text-gray-500 font-bold">
            {totalReviews > 0 ? `Based on ${totalReviews} verified customer ${totalReviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet for this product'}
          </p>
        </div>

        {/* STAR RATING BARS */}
        <div className="space-y-1 text-xs font-bold text-gray-600">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-12 text-right">{'★'.repeat(stars)}</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3b6e14] h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="w-6 text-left">{count}</span>
              </div>
            );
          })}
        </div>

        {/* WRITE A REVIEW + AUTHENTICITY SEALS */}
        <div className="text-center space-y-3">
          <button 
            onClick={() => setShowReviewModal(true)}
            className="bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
            data-reticle-target="pdp-write-review-btn"
          >
            Write a review
          </button>

          <div className="flex justify-center gap-4 text-[9px] font-black">
            <div className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-900">
              🏆 100% VERIFIED BUYERS
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CUSTOMER PHOTOS STRIP */}
      {allCustomerPhotos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Customer photos & videos</span>
            <span className="text-[10px] text-emerald-700 font-bold lowercase">({allCustomerPhotos.length} photos)</span>
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allCustomerPhotos.map((photoUrl, pIdx) => (
              <div 
                key={pIdx} 
                onClick={() => setPreviewReviewImage(resolveImgUrl(photoUrl))}
                className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer hover:border-emerald-600 transition-all hover:scale-105"
              >
                <img src={resolveImgUrl(photoUrl)} alt="Customer review photo" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {paginated.map((r, rIdx) => (
          <div key={r.id || rIdx} className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-gray-900">{r.user_name || 'Verified Buyer'}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Verified</span>
              </div>
              <div className="text-amber-400 text-xs flex">
                {'★'.repeat(Math.round(r.rating || 5))}
              </div>
            </div>
            {r.title && <h4 className="font-bold text-xs text-gray-800">{r.title}</h4>}
            <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-gray-900 font-['Outfit']">Write a Verified Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Your Name *</label>
                <input 
                  type="text" required placeholder="e.g. Ramesh Kumar"
                  value={reviewForm.user_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rating *</label>
                <select 
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value={5}>★★★★★ (5 - Excellent)</option>
                  <option value={4}>★★★★☆ (4 - Good)</option>
                  <option value={3}>★★★☆☆ (3 - Average)</option>
                  <option value={2}>★★☆☆☆ (2 - Poor)</option>
                  <option value={1}>★☆☆☆☆ (1 - Terrible)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Review Comment *</label>
                <textarea 
                  rows={3} required placeholder="Share your experience with this organic product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-2.5 border rounded-xl text-gray-600 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CUSTOMER PHOTO MODAL */}
      {previewReviewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setPreviewReviewImage(null)}>
          <img src={previewReviewImage} alt="Full size customer photo" className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl" />
        </div>
      )}
    </div>
  );
}
