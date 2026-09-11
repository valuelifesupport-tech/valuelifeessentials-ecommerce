import React from 'react';
import { ExternalLink } from 'lucide-react';
import { InstagramIcon } from '../layout/SocialIcons';

export default function InstagramFeedSection() {
  const feedItems = [
    {
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      title: 'Chia Smoothie Bowl'
    },
    {
      img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80',
      title: 'Herbal Infusion Drink'
    },
    {
      img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
      title: 'Farm Fresh Spices'
    },
    {
      img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
      title: 'Edible Seeds Selection'
    },
    {
      img: 'https://images.unsplash.com/photo-1608248597359-bb51cb7e44be?auto=format&fit=crop&w=400&q=80',
      title: 'Natural Wellness Essentials'
    },
    {
      img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
      title: 'Raw Pure Honey'
    }
  ];

  return (
    <section className="py-12 bg-white" data-reticle-target="instagram-feed-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              Follow Us On Instagram
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Join our community @valuelifeessentials for healthy recipes, wellness tips and offers
            </p>
          </div>

          <a
            href="https://instagram.com/valuelifeessentials"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164e3f] hover:text-emerald-800 transition-colors"
          >
            <InstagramIcon size={15} />
            <span>@valuelifeessentials</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* 6-Image Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {feedItems.map((item, idx) => (
            <a
              key={idx}
              href="https://instagram.com/valuelifeessentials"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#faf8f5] shadow-sm hover:shadow-xl transition-all duration-300 block"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#164e3f]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                <InstagramIcon size={28} className="transform scale-75 group-hover:scale-100 transition-transform" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
