import { DEFAULT_FALLBACK_SVG, getProxyImgUrl } from '../../../utils/resolveImgUrl';
import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function ReviewsTab({
  reviews = [],
  setReviews,
  products = [],
  reviewSearchQuery,
  setReviewSearchQuery,
  reviewProductFilter,
  setReviewProductFilter,
  reviewStatusFilter,
  setReviewStatusFilter,
  reviewRatingFilter,
  setReviewRatingFilter,
  reviewPage,
  setReviewPage,
  reviewItemsPerPage = 10,
  adminFetch,
  showToast,
  askConfirmation
}) {
  const filteredReviews = reviews.filter(r => {
    const query = reviewSearchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      (r.product_title && r.product_title.toLowerCase().includes(query)) ||
      (r.user_name && r.user_name.toLowerCase().includes(query)) ||
      (r.user_email && r.user_email.toLowerCase().includes(query)) ||
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.comment && r.comment.toLowerCase().includes(query));

    const matchesProduct = reviewProductFilter === 'ALL' || String(r.product_id) === String(reviewProductFilter);
    const matchesStatus = reviewStatusFilter === 'ALL' || (r.status || 'PENDING') === reviewStatusFilter;
    const matchesRating = reviewRatingFilter === 'ALL' || Number(r.rating) === Number(reviewRatingFilter);

    return matchesSearch && matchesProduct && matchesStatus && matchesRating;
  });

  const totalReviewPages = Math.ceil(filteredReviews.length / reviewItemsPerPage) || 1;
  const paginatedReviews = filteredReviews.slice((reviewPage - 1) * reviewItemsPerPage, reviewPage * reviewItemsPerPage);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-reviews-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white font-['Outfit']">Customer Reviews & Moderation Hub</h3>
          <p className="text-xs text-slate-400">Approve customer ratings, write official responses, delete spam, or filter by specific products.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
            Showing {filteredReviews.length} of {reviews.length} Reviews
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3" data-reticle-target="admin-reviews-controls">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. SEARCH INPUT */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search review, user, email..."
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
              data-reticle-target="admin-review-search-input"
            />
          </div>

          {/* 2. FILTER ACCORDING TO PRODUCT */}
          <div>
            <select 
              value={reviewProductFilter}
              onChange={(e) => setReviewProductFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-review-product-filter"
            >
              <option value="ALL">Filter by Product (All Products)</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.length > 32 ? p.title.substring(0, 32) + '...' : p.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. STATUS FILTER */}
          <div>
            <select 
              value={reviewStatusFilter}
              onChange={(e) => setReviewStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-review-status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* 4. RATING FILTER */}
          <div>
            <select 
              value={reviewRatingFilter}
              onChange={(e) => setReviewRatingFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-review-rating-filter"
            >
              <option value="ALL">All Ratings (1 - 5 Stars)</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER RESET BAR */}
        {(reviewSearchQuery || reviewProductFilter !== 'ALL' || reviewStatusFilter !== 'ALL' || reviewRatingFilter !== 'ALL') && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-emerald-400 font-bold">
              Filtered {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} matching criteria
            </span>
            <button 
              onClick={() => {
                setReviewSearchQuery('');
                setReviewProductFilter('ALL');
                setReviewStatusFilter('ALL');
                setReviewRatingFilter('ALL');
              }}
              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              data-reticle-target="admin-reset-review-filters"
            >
              Reset All Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS GRID / LIST */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-850 rounded-2xl border border-slate-800 space-y-2" data-reticle-target="admin-empty-reviews">
          <div className="text-3xl">⭐</div>
          <h4 className="font-bold text-white text-sm">No Customer Reviews Found</h4>
          <p className="text-xs text-slate-400">No reviews match your selected product or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4" data-reticle-target="admin-reviews-list">
          {paginatedReviews.map(r => (
            <div key={r.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-850 space-y-3 text-xs shadow-sm hover:border-slate-700 transition-colors" data-reticle-target={`admin-review-card-${r.id}`}>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <img 
                    src={r.product_thumbnail || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=100'} 
                    alt={r.product_title || 'Product'} 
                    className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-white"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{r.product_title || `Product #${r.product_id}`}</h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                      <span className="font-bold text-white">{r.user_name}</span>
                      <span>({r.user_email || 'No Email'})</span>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Verified Buyer</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                    r.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    r.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                  }`}>
                    {r.status === 'PENDING' ? '⏳ PENDING APPROVAL' : (r.status || 'PENDING')}
                  </span>

                  {r.status === 'PENDING' ? (
                    <>
                      <button 
                        type="button"
                        onClick={async () => {
                          const res = await adminFetch(`/api/admin/reviews/${r.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'APPROVED' })
                          });
                          if (res.ok) {
                            setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, status: 'APPROVED' } : rev));
                            if (showToast) showToast('success', 'Review Approved', 'Customer review is now publicly visible on the storefront.');
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] cursor-pointer shadow-sm transition-all"
                        data-reticle-target={`admin-approve-review-btn-${r.id}`}
                      >
                        ✓ Approve Review
                      </button>
                      <button 
                        type="button"
                        onClick={async () => {
                          const res = await adminFetch(`/api/admin/reviews/${r.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'REJECTED' })
                          });
                          if (res.ok) {
                            setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, status: 'REJECTED' } : rev));
                            if (showToast) showToast('info', 'Review Rejected', 'Customer review was rejected and hidden.');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-bold rounded-xl border border-slate-700 text-[11px] cursor-pointer transition-all"
                        data-reticle-target={`admin-reject-review-btn-${r.id}`}
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button"
                      onClick={async () => {
                        const newStatus = r.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                        const res = await adminFetch(`/api/admin/reviews/${r.id}/status`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: newStatus })
                        });
                        if (res.ok) {
                          setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, status: newStatus } : rev));
                          if (showToast) showToast('success', 'Status Updated', `Review set to ${newStatus}`);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-[11px] cursor-pointer transition-all"
                      data-reticle-target={`admin-toggle-review-status-${r.id}`}
                    >
                      {r.status === 'APPROVED' ? '✕ Mark Rejected' : '✓ Approve Review'}
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => {
                      askConfirmation({
                        title: 'Delete Customer Review?',
                        message: `Are you sure you want to permanently delete this review by "${r.user_name || 'Customer'}"? This action cannot be undone.`,
                        confirmText: 'Delete Review',
                        danger: true,
                        onConfirm: async () => {
                          const res = await adminFetch(`/api/admin/reviews/${r.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            setReviews(prev => prev.filter(rev => rev.id !== r.id));
                            if (showToast) showToast('info', 'Review Deleted', 'Review removed from system');
                          }
                        }
                      });
                    }}
                    className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 cursor-pointer"
                    title="Delete Review"
                    data-reticle-target={`admin-delete-review-btn-${r.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* RATING & COMMENT */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="text-amber-400 font-bold flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="font-extrabold text-white text-xs">{r.title}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{r.comment}</p>

                {/* UPLOADED CUSTOMER PHOTOS */}
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {r.images.map((imgUrl, idx) => (
                      <img 
                        key={idx} 
                        src={resolveImgUrl(imgUrl)} 
                        alt="Review attachment" 
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }} 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-white" 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* OFFICIAL ADMIN REPLY SECTION */}
              <div className="pt-1 space-y-1">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type official store reply to customer..."
                    defaultValue={r.admin_reply || ''}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const replyVal = e.target.value;
                        const res = await adminFetch(`/api/admin/reviews/${r.id}/reply`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ admin_reply: replyVal })
                        });
                        if (res.ok) {
                          setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, admin_reply: replyVal } : rev));
                          showToast('success', 'Reply Saved', 'Admin response published');
                        }
                      }
                    }}
                    className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    data-reticle-target={`admin-review-reply-input-${r.id}`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono self-center">Press Enter to save</span>
                </div>
                {r.admin_reply && (
                  <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 p-2 rounded-xl text-[11px]">
                    <strong>Official Admin Response:</strong> "{r.admin_reply}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION FOOTER CONTROLS */}
      {filteredReviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400" data-reticle-target="admin-reviews-pagination">
          <div>
            Showing <strong className="text-white">{(reviewPage - 1) * reviewItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(reviewPage * reviewItemsPerPage, filteredReviews.length)}</strong> of <strong className="text-emerald-400">{filteredReviews.length}</strong> reviews
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
              disabled={reviewPage === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-review-prev-page"
            >
              Previous
            </button>

            {Array.from({ length: totalReviewPages }).map((_, i) => {
              const pg = i + 1;
              return (
                <button 
                  key={pg}
                  onClick={() => setReviewPage(pg)}
                  className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    reviewPage === pg 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  data-reticle-target={`admin-review-page-${pg}`}
                >
                  {pg}
                </button>
              );
            })}

            <button 
              onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
              disabled={reviewPage >= totalReviewPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-review-next-page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
