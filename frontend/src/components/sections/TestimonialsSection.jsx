import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai, India',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment: 'Amazing quality products! ValueLife has become my go-to store for natural essentials. The chia seeds and turmeric are exceptionally pure.'
    },
    {
      name: 'Rahul Mehta',
      location: 'Bengaluru, India',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      comment: 'Fast delivery and great packaging. Really happy with my purchase. The cold-pressed oils and herbal tea-cuts exceeded my expectations!'
    },
    {
      name: 'Sneha Jain',
      location: 'Indore, India',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      comment: 'Love the product range and customer service. Highly recommended for anyone transitioning to a clean, organic daily lifestyle!'
    }
  ];

  return (
    <section className="py-14 bg-[#fbf9f5] border-t border-b border-gray-200/70" data-reticle-target="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Real experiences from thousands of happy wellness enthusiasts across India
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" stroke="none" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-700 leading-relaxed italic mb-6">
                "{rev.comment}"
              </p>

              {/* User Profile */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-100 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-gray-900">{rev.name}</h4>
                    <CheckCircle size={12} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-gray-400 block font-medium">
                    Verified Customer • {rev.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
