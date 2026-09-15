import React from 'react';
import { Phone, Mail, MapPin, Leaf } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsAppIcon } from './SocialIcons';

export default function Footer({ settings, categories = [], navigateTo }) {
  const handleNav = (path, view, slug) => {
    if (navigateTo) {
      navigateTo(path, { view: view || 'store', slug: slug || null });
    }
  };

  return (
    <footer className="bg-[#0a2e22] text-white text-xs border-t border-[#124734] mt-auto" data-reticle-target="footer-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Leaf size={16} />
              </div>
              <span className="font-extrabold text-xl text-white font-['Outfit'] tracking-tight uppercase">
                Value<span className="text-emerald-400 font-medium">Life</span>
              </span>
            </div>
            <p className="text-emerald-200/80 text-xs leading-relaxed font-sans">
              Natural products for a healthier, happier everyday life.
            </p>

            {/* Social Icons Bar */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={settings?.facebook_url || "https://facebook.com/valuelifeessentials"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm"
                title="Facebook"
              >
                <FacebookIcon size={14} />
              </a>
              <a
                href={settings?.instagram_url || "https://www.instagram.com/valuelife_essentials/?hl=en"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm"
                title="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href={settings?.youtube_url || "https://youtube.com/@valuelifeessentials"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm"
                title="YouTube"
              >
                <YoutubeIcon size={14} />
              </a>
              <a
                href={`https://wa.me/${(settings?.whatsapp_number || '917675941899').replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-emerald-400 hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm"
                title="WhatsApp Support: 7675941899"
              >
                <WhatsAppIcon size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-emerald-200/80 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/', 'store')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/products', 'all_products')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/about-us', 'page', 'about-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/contact-us', 'page', 'contact-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/blog', 'blog', null)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-emerald-200/80 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/shipping-policy', 'page', 'shipping-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/returns-refund', 'page', 'returns-refund')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Return & Refund
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/faq', 'page', 'faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/track-order', 'page', 'track-order')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/pages/privacy-policy', 'page', 'privacy-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-emerald-200/80 font-medium">
              <li className="flex items-start gap-2">
                <Phone size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href="tel:+917675941899" className="hover:text-white transition-colors block font-semibold">
                    +91 76759 41899
                  </a>
                  <a href="tel:+917893100755" className="hover:text-white transition-colors block font-semibold">
                    +91 78931 00755
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-emerald-400 shrink-0" />
                <a href="mailto:valuelifesupport@gmail.com" className="hover:text-white transition-colors">
                  {settings?.contact_email || 'valuelifesupport@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span>Indore, India</span>
              </li>
            </ul>
          </div>

          {/* Column 5: We Accept */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
              We Accept
            </h4>
            <p className="text-emerald-200/70 text-[11px] mb-2">
              100% Secure 256-Bit Encrypted Payments
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-white text-[#003366] font-black text-[11px] px-2.5 py-1 rounded shadow-xs">
                VISA
              </span>
              <span className="bg-white text-gray-900 font-black text-[11px] px-2.5 py-1 rounded shadow-xs">
                MasterCard
              </span>
              <span className="bg-white text-[#008060] font-black text-[11px] px-2.5 py-1 rounded shadow-xs">
                UPI
              </span>
              <span className="bg-white text-[#005b9f] font-black text-[11px] px-2.5 py-1 rounded shadow-xs">
                RuPay
              </span>
              <span className="bg-white text-gray-900 font-black text-[11px] px-2.5 py-1 rounded shadow-xs">
                NetBanking
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-300/70 text-[11px]">
          <div>
            © 2026 ValueLife. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 italic font-serif text-xs text-emerald-200">
            <span>Good Products, Brighter Days.</span>
            <Leaf size={12} className="text-emerald-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
