import React, { useState } from 'react';
import { Copy, Check, Globe } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsAppIcon } from '../SocialIcons';

export default function AnnouncementBar({
  sectionsConfig,
  settings,
  currency,
  setCurrency,
  showToast
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  if (sectionsConfig && Number(sectionsConfig.show_announcement) === 0) {
    return null;
  }

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (showToast) {
      showToast('success', 'Coupon Code Copied!', `Code "${code}" copied to clipboard. Apply at checkout for discount!`);
    }
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="bg-[#1b4332] text-white text-xs py-1.5 px-2 sm:px-4 border-b border-emerald-900" data-reticle-target="announcement-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="bg-[#52b788] text-[#1b4332] font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm">
            SALE
          </span>
          <span className="font-semibold text-emerald-100 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
            <span className="whitespace-nowrap">{settings?.announcement_text || 'Get 15% OFF! Use Code:'}</span>
            <button
              type="button"
              onClick={() => handleCopyCode(settings?.announcement_code || 'ORGANIC15')}
              className="inline-flex items-center gap-1.5 bg-[#52b788]/25 hover:bg-[#52b788]/40 border border-[#52b788]/60 text-amber-300 font-black px-2.5 py-0.5 rounded-lg text-[11px] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono group shrink-0"
              title="Click to copy coupon code"
              data-reticle-target="copy-announcement-code-btn"
            >
              <span className="tracking-wide">{settings?.announcement_code || 'ORGANIC15'}</span>
              {copiedCode ? (
                <span className="text-emerald-300 font-black text-[10px] flex items-center gap-0.5 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-400 animate-pulse">
                  <Check size={11} /> Copied!
                </span>
              ) : (
                <Copy size={11} className="text-emerald-300 group-hover:text-white transition-colors" />
              )}
            </button>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* SOCIAL MEDIA ICONS BAR */}
          <div className="flex items-center gap-2 border-r border-emerald-800/80 pr-2 mr-1">
            <a href={settings?.instagram_url || "https://instagram.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="Instagram">
              <InstagramIcon size={13} />
            </a>
            <a href={settings?.facebook_url || "https://facebook.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="Facebook">
              <FacebookIcon size={13} />
            </a>
            <a href={settings?.youtube_url || "https://youtube.com/@valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="YouTube">
              <YoutubeIcon size={13} />
            </a>
            <a href={`https://wa.me/${(settings?.whatsapp_number || '919876543210').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-emerald-400 hover:scale-110 transition-all flex items-center" title="WhatsApp Support">
              <WhatsAppIcon size={13} />
            </a>
          </div>

          {/* MULTI CURRENCY SWITCHER */}
          {Number(settings?.enable_multi_currency) === 1 && (
            <div className="relative">
              <button 
                onClick={() => setCurrencyDropdown(!currencyDropdown)}
                className="flex items-center gap-1 hover:text-[#52b788] text-[10px] sm:text-xs font-bold transition-colors bg-emerald-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-700/50 whitespace-nowrap cursor-pointer"
                data-reticle-target="currency-switcher-btn"
              >
                <Globe size={11} className="text-[#52b788]" />
                <span>{currency === 'INR' ? '🇮🇳 (₹)' : '🇺🇸 ($)'}</span>
              </button>

              {currencyDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white text-gray-800 rounded-xl shadow-xl py-1.5 border border-gray-200 z-50">
                  <button 
                    onClick={() => { setCurrency('INR'); setCurrencyDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${currency === 'INR' ? 'font-bold text-emerald-800 bg-emerald-50/50' : ''}`}
                  >
                    <span>🇮🇳 INR (₹)</span>
                    {currency === 'INR' && '✓'}
                  </button>
                  <button 
                    onClick={() => { setCurrency('USD'); setCurrencyDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${currency === 'USD' ? 'font-bold text-emerald-800 bg-emerald-50/50' : ''}`}
                  >
                    <span>🇺🇸 USD ($)</span>
                    {currency === 'USD' && '✓'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
