import React, { useState } from 'react';
import { Truck, ShieldCheck, RotateCcw, Phone, Globe } from 'lucide-react';

export default function AnnouncementBar({
  sectionsConfig,
  settings,
  currency,
  setCurrency,
  showToast
}) {
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  if (sectionsConfig && Number(sectionsConfig.show_announcement) === 0) {
    return null;
  }

  return (
    <div className="bg-[#0e382b] text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 border-b border-[#164e3f]" data-reticle-target="announcement-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Value Pillars matching Mockup Section 1 */}
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar font-medium text-emerald-100">
          <div className="flex items-center gap-1.5 shrink-0">
            <Truck size={13} className="text-emerald-400" />
            <span>Free Shipping on Orders Above ₹499</span>
          </div>
          <span className="hidden sm:inline text-emerald-700/80">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>100% Natural Products</span>
          </div>
          <span className="hidden md:inline text-emerald-700/80">•</span>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <RotateCcw size={13} className="text-emerald-400" />
            <span>Easy Returns</span>
          </div>
        </div>

        {/* Right Info: Phone & Currency Switcher */}
        <div className="flex items-center gap-3 shrink-0 text-emerald-100 font-medium">
          <a
            href={`tel:${(settings?.contact_phone || '7675941899').split('/')[0].split(',')[0].replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors shrink-0"
            title={`Customer Support: ${settings?.contact_phone || '+91 76759 41899 / 78931 00755'}`}
            data-reticle-target="topbar-phone-link"
          >
            <Phone size={12} className="text-emerald-400" />
            <span className="font-semibold">{settings?.contact_phone || '+91 76759 41899 / 78931 00755'}</span>
          </a>

          {/* Currency Switcher */}
          {settings && Number(settings.enable_multi_currency) === 1 && (
            <div className="relative border-l border-emerald-800/80 pl-3">
              <button
                type="button"
                onClick={() => setCurrencyDropdown(!currencyDropdown)}
                className="flex items-center gap-1 font-bold text-[10px] bg-emerald-900/80 hover:bg-emerald-800 px-2 py-0.5 rounded border border-emerald-700/60 cursor-pointer"
                data-reticle-target="currency-switcher-btn"
              >
                <Globe size={11} className="text-emerald-400" />
                <span>{currency === 'USD' ? 'USD ($)' : 'INR (₹)'}</span>
              </button>
              {currencyDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white text-gray-900 shadow-xl rounded-lg py-1 border border-gray-200 z-50 text-xs min-w-[90px]">
                  <button
                    type="button"
                    onClick={() => { setCurrency('INR'); setCurrencyDropdown(false); }}
                    className={`w-full text-left px-3 py-1 hover:bg-emerald-50 ${currency === 'INR' ? 'font-bold text-emerald-700 bg-emerald-50/60' : ''}`}
                  >
                    INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrency('USD'); setCurrencyDropdown(false); }}
                    className={`w-full text-left px-3 py-1 hover:bg-emerald-50 ${currency === 'USD' ? 'font-bold text-emerald-700 bg-emerald-50/60' : ''}`}
                  >
                    USD ($)
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
