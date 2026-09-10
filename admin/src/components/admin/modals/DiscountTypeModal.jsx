import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function DiscountTypeModal({
  showDiscountTypeModal,
  setShowDiscountTypeModal,
  setSelectedDiscountType,
  setShowCouponModal
}) {
  if (!showDiscountTypeModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]" data-reticle-target="admin-discount-type-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white">Select discount type</h3>
          <button 
            type="button"
            onClick={() => setShowDiscountTypeModal(false)}
            className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {[
            { id: 'amount_off_products', title: 'Amount off products', subtitle: 'Discount specific products or collections of products', icon: '🏷️' },
            { id: 'buy_x_get_y', title: 'Buy X get Y', subtitle: 'Discount specific products or collections of products', icon: '⚡' },
            { id: 'amount_off_order', title: 'Amount off order', subtitle: 'Discount the total order amount', icon: '💼' },
            { id: 'free_shipping', title: 'Free shipping', subtitle: 'Offer free shipping on an order', icon: '🚚' }
          ].map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setSelectedDiscountType(item);
                setShowDiscountTypeModal(false);
                setShowCouponModal(true);
              }}
              className="w-full text-left p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-950 transition-all">{item.icon}</span>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-400">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button 
            type="button"
            onClick={() => setShowDiscountTypeModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
