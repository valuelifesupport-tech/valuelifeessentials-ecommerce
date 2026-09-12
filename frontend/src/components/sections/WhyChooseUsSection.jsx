import React from 'react';
import { ShieldCheck, Lock, Truck, Headphones } from 'lucide-react';

export default function WhyChooseUsSection({ sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_why_choose_us) === 0) return null;

  const features = [
    {
      icon: ShieldCheck,
      title: 'Quality Products',
      description: 'Sourced with care from organic certified growers'
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      description: '100% safe & secure encrypted transactions'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'On orders above ₹499 across India'
    },
    {
      icon: Headphones,
      title: 'Customer Support',
      description: "We're here to help you 7 days a week"
    }
  ];

  return (
    <section className="py-12 bg-white" data-reticle-target="why-choose-us-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
            Why Choose ValueLife?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Committed to your family's health with pure, chemical-free ingredients
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200/90 rounded-2xl p-6 text-center hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f4f7f5] text-[#164e3f] group-hover:bg-[#164e3f] group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-300 shadow-sm">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#164e3f] transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
