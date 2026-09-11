import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

export default function BrandStorySection({ navigateTo }) {
  const handleLearnMore = () => {
    if (navigateTo) navigateTo('/pages/about-us', { view: 'page', slug: 'about-us' });
  };

  return (
    <section className="py-12 bg-white" data-reticle-target="brand-story-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl overflow-hidden bg-[#faf8f5] border border-gray-200/80 shadow-md">
          
          {/* Left Column: Sprout in Hands Photography (6 cols) */}
          <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[420px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80"
              alt="A Healthier Tomorrow Together"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8 sm:p-10">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight max-w-sm drop-shadow-md">
                A Healthier <br />
                <span className="italic font-normal text-emerald-300">Tomorrow Together</span>
              </h3>
            </div>
          </div>

          {/* Right Column: Narrative Content & Mission (6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
            {/* Decorative leaf watermark */}
            <Leaf 
              size={180} 
              className="absolute -bottom-8 -right-8 text-emerald-900/5 rotate-12 pointer-events-none" 
            />

            <div className="space-y-6 max-w-lg z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#164e3f] uppercase">
                <span>WHO WE ARE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-950">
                Our Story
              </h2>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-normal">
                At ValueLife, we believe in the power of nature to create a healthier, happier world. Our mission is to bring you high-quality, natural and sustainable products for a better everyday life.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLearnMore}
                  className="bg-[#124734] hover:bg-[#0a2e22] text-white px-7 py-3 rounded-full font-bold text-xs tracking-wider shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                  data-reticle-target="brand-story-learn-more-btn"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
