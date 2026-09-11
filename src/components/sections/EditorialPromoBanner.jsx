import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function EditorialPromoBanner({ navigateTo }) {
  const handleCta = () => {
    if (navigateTo) navigateTo('/offers', { view: 'offers' });
  };

  return (
    <section className="py-10 bg-white" data-reticle-target="editorial-promo-banner-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#f3eee7] border border-gray-200/80 shadow-md">
          {/* Subtle botanical glow background */}
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-14">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/80 border border-emerald-900/10 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 shadow-sm">
                <Sparkles size={12} className="text-amber-500" />
                <span>LIMITED TIME OFFER</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-950 leading-[1.15]">
                Pure Products <br />
                <span className="text-[#164e3f] italic font-normal">Happier Lives</span>
              </h2>

              <p className="text-base sm:text-lg text-gray-700 font-medium">
                Flat <span className="text-[#164e3f] font-extrabold font-mono">20% Off</span> on Natural Essentials & Certified Organics
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCta}
                  className="bg-[#124734] hover:bg-[#0a2e22] text-white px-7 py-3 rounded-full font-bold text-xs tracking-wider shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                  data-reticle-target="promo-shop-collection-btn"
                >
                  <span>Shop the Collection</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Right Visual & Script Quote (5 cols) */}
            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
              {/* Script Quote */}
              <div className="absolute -top-4 right-4 z-20 text-right pointer-events-none hidden sm:block">
                <span className="font-serif italic text-2xl text-emerald-950/70 block leading-tight font-medium">
                  Nature Nurtures You
                </span>
                <span className="text-xs text-emerald-800 font-sans block">🌿 Handcrafted with Care</span>
              </div>

              {/* Composition Image */}
              <div className="relative w-full max-w-md aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="ValueLife Natural Wellness Products"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
