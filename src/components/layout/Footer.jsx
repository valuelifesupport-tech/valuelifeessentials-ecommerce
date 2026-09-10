import React from 'react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsAppIcon } from './SocialIcons';
import { resolveImgUrl } from '../../api/config';

export default function Footer({ settings, categories = [], navigateTo }) {
  return (
    <footer className="bg-emerald-950 text-white text-xs border-t border-emerald-900/60 mt-auto pt-12 pb-24 md:pb-12" data-reticle-target="footer-section">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img 
              src={resolveImgUrl(settings?.store_logo || '/valuelife_logo.png')} 
              alt={settings?.store_name || "ValueLife Essentials Logo"} 
              className="h-9 w-auto object-contain bg-white/90 p-1 rounded-xl shadow-md"
              onError={(e) => { e.currentTarget.src = '/valuelife_logo.png'; }}
            />
            <span className="font-extrabold text-lg text-white font-['Outfit'] tracking-tight uppercase">
              {settings?.store_name || 'VALUELIFE ESSENTIALS'}
            </span>
          </div>
          <p className="text-emerald-200/80 leading-relaxed">
            {settings?.store_description || settings?.store_tagline || 'Your 100% trusted online organic & wellness store. Supplying certified organic superfoods, seeds, pure supplements, and natural wellness products.'}
          </p>

          {/* SOCIAL MEDIA ICONS BAR */}
          <div className="pt-1 space-y-1.5">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">Connect & Follow Us:</span>
            <div className="flex items-center gap-2">
              <a 
                href={settings?.instagram_url || "https://instagram.com/valuelifeessentials"} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" 
                title="Instagram"
                data-reticle-target="footer-social-instagram"
              >
                <InstagramIcon size={15} />
              </a>
              <a 
                href={settings?.facebook_url || "https://facebook.com/valuelifeessentials"} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" 
                title="Facebook"
                data-reticle-target="footer-social-facebook"
              >
                <FacebookIcon size={15} />
              </a>
              <a 
                href={settings?.youtube_url || "https://youtube.com/@valuelifeessentials"} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" 
                title="YouTube Channel"
                data-reticle-target="footer-social-youtube"
              >
                <YoutubeIcon size={15} />
              </a>
              <a 
                href={`https://wa.me/${(settings?.whatsapp_number || '919876543210').replace(/[^\d]/g, '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-emerald-200 hover:text-emerald-400 hover:bg-emerald-700 hover:scale-110 transition-all shadow-sm" 
                title="WhatsApp Direct Chat"
                data-reticle-target="footer-social-whatsapp"
              >
                <WhatsAppIcon size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Quick Navigation</h4>
          <ul className="space-y-1.5 text-emerald-200/80">
            <li>
              <button 
                onClick={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-home"
              >
                Home Page
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-products"
              >
                All Products Catalog
              </button>
            </li>
            {(categories || []).slice(0, 4).map((cat) => (
              <li key={cat.id}>
                <button 
                  onClick={() => navigateTo(`/category/${cat.slug}`, { view: 'catalog', slug: null, category: cat.slug, collection: null })} 
                  className="hover:text-white transition-colors text-left cursor-pointer truncate max-w-full block"
                  data-reticle-target={`footer-nav-category-${cat.slug}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Company & Policies</h4>
          <ul className="space-y-1.5 text-emerald-200/80">
            <li>
              <button 
                onClick={() => navigateTo('/pages/about-us', { view: 'page', slug: 'about-us', category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-about"
              >
                About Us
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us', category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-contact"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('/pages/shipping-policy', { view: 'page', slug: 'shipping-policy', category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-shipping"
              >
                Shipping & Delivery Policy
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('/pages/privacy-policy', { view: 'page', slug: 'privacy-policy', category: null, collection: null })} 
                className="hover:text-white transition-colors text-left cursor-pointer"
                data-reticle-target="footer-nav-privacy"
              >
                Privacy & Cookie Policy
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2 text-emerald-200/80">
            <li className="flex items-center gap-2 font-medium">
              <span>📞</span>
              <span>{settings?.phone_number || settings?.support_phone || '+91 98765 43210'}</span>
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span>✉️</span>
              <span>{settings?.support_email || settings?.email || 'support@valuelifeessentials.com'}</span>
            </li>
            <li className="flex items-center gap-2 font-medium text-[11px] text-emerald-300">
              <span>🌐</span>
              <span>{settings?.store_url || 'valuelifeessentials.com'}</span>
            </li>
          </ul>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm">
              <span>🔒</span> 256-Bit SSL Encrypted & Certified
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-900/60 py-4 text-center text-[11px] text-emerald-300">
        © 2026 ValueLife Essentials (valuelifeessentials.com). All Rights Reserved. Fully Dynamic E-Commerce System.
      </div>
    </footer>
  );
}
