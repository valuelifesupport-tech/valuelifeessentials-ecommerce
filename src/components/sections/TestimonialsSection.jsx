import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { getApiUrl } from '../../api/config';

export default function TestimonialsSection({ sectionsConfig }) {

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch live approved customer reviews from database
    fetch(getApiUrl('/api/admin/reviews'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const approved = data.filter(r => r.status === 'APPROVED');
          setReviews(approved.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  if (sectionsConfig && Number(sectionsConfig.show_testimonials) === 0) return null;

  return (
    <section className="py-14 bg-[#fbf9f5] border-t border-b border-gray-200/70" data-reticle-target="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
            {reviews.length > 0 ? 'What Our Customers Say' : 'Our Quality Commitment'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {reviews.length > 0
              ? 'Real customer experiences verified directly from our store'
              : 'Committed to 100% pure botanical health, transparent sourcing and family wellness'}
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(Number(rev.rating || 5))].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" stroke="none" />
                  ))}
                </div>

                <p className="text-sm text-gray-700 leading-relaxed italic mb-6">
                  "{rev.comment || rev.title}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-sm">
                    {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-gray-900">{rev.user_name}</span>
                      <CheckCircle size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-gray-400">Verified Customer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <ShieldCheck size={36} className="text-[#164e3f] mb-3" />
              <h3 className="font-bold text-sm text-gray-900 mb-1">100% Lab Verified</h3>
              <p className="text-xs text-gray-500">Every single harvest is tested for chemical purity, zero additives and authentic botanical origin.</p>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <HeartHandshake size={36} className="text-[#164e3f] mb-3" />
              <h3 className="font-bold text-sm text-gray-900 mb-1">Direct Farmer Sourcing</h3>
              <p className="text-xs text-gray-500">We partner directly with organic farmers across India, eliminating middlemen for peak freshness.</p>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <Award size={36} className="text-[#164e3f] mb-3" />
              <h3 className="font-bold text-sm text-gray-900 mb-1">Satisfaction Guarantee</h3>
              <p className="text-xs text-gray-500">Enjoy hassle-free returns within 7 days if you are not completely satisfied with your order.</p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
