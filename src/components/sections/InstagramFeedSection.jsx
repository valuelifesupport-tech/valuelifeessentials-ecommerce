import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { InstagramIcon } from '../layout/SocialIcons';
import { getApiUrl, resolveImgUrl } from '../../api/config';

export default function InstagramFeedSection({ sectionsConfig, settings }) {

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Chia Smoothie Bowl',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    },
    {
      id: 2,
      title: 'Herbal Infusion Drink',
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    },
    {
      id: 3,
      title: 'Farm Fresh Spices',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    },
    {
      id: 4,
      title: 'Edible Seeds Selection',
      image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    },
    {
      id: 5,
      title: 'Natural Wellness Essentials',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    },
    {
      id: 6,
      title: 'Raw Pure Honey',
      image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
      post_url: 'https://www.instagram.com/valuelife_essentials/?hl=en'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    fetch(getApiUrl('/api/instagram-posts'))
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter(p => p.is_active === undefined || Number(p.is_active) === 1);
          if (activeOnly.length > 0) {
            setPosts(activeOnly);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch instagram posts, using fallback:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const defaultInstagramUrl = settings?.instagram_url || 'https://www.instagram.com/valuelife_essentials/?hl=en';

  if (sectionsConfig && Number(sectionsConfig.show_instagram_feed) === 0) return null;

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
              Join our community @valuelife_essentials for healthy recipes, wellness tips and offers
            </p>
          </div>

          <a
            href={defaultInstagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164e3f] hover:text-emerald-800 transition-colors"
          >
            <InstagramIcon size={15} />
            <span>@valuelife_essentials</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Dynamic Image Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((item, idx) => (
            <a
              key={item.id || idx}
              href={item.post_url || defaultInstagramUrl}
              target="_blank"
              rel="noreferrer"
              title={item.title}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#faf8f5] shadow-sm hover:shadow-xl transition-all duration-300 block"
            >
              <img
                src={resolveImgUrl(item.image_url || item.img)}
                alt={item.title || 'Instagram Post'}
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
