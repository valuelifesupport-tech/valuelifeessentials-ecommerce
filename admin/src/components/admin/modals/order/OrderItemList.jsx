import React from 'react';
import { resolveImgUrl, DEFAULT_FALLBACK_SVG } from '../../../../utils/resolveImgUrl';

export default function OrderItemList({ selectedOrderDetails }) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black uppercase text-slate-400 block">Itemized Purchased Products ({selectedOrderDetails.items?.length || 0}):</span>
      <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-850 overflow-hidden">
        {selectedOrderDetails.items?.map((item, idx) => (
          <div key={idx} className="p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <img src={resolveImgUrl(item.thumbnail || item.image_url)} alt={item.product_title} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
              <div>
                <div className="font-bold text-white text-sm">{item.product_title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.variant_name ? (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-0.5 rounded-md font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                      📦 Variant: {item.variant_name}
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      Standard Item
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    SKU: <strong className="text-slate-200">{item.variant_sku || item.product_sku || item.sku || (item.variant_id ? `VL-VAR-${item.variant_id}` : (item.product_id ? `VL-${item.product_id}` : 'N/A'))}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-white">Qty: {item.quantity}</span>
              <div className="font-black text-emerald-400">₹{item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
