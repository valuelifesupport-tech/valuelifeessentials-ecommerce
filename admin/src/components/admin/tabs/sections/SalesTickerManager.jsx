import React from 'react';
import { Trash2 } from 'lucide-react';

export default function SalesTickerManager({ sectionsConfig, setSectionsConfig, orders, showToast }) {
  const currentTickers = (() => {
    if (!sectionsConfig?.sales_ticker_json) {
      return [
        { id: 1, name: 'Rohan Sharma', city: 'New Delhi', item: '5kg Organic Vermicompost', time: '2m ago' },
        { id: 2, name: 'Priya Patel', city: 'Bengaluru', item: '1L Liquid Seaweed Extract', time: '4m ago' },
        { id: 3, name: 'Amit Verma', city: 'Mumbai', item: '2kg Neem Cake Powder', time: '6m ago' },
        { id: 4, name: 'Neha Gupta', city: 'Pune', item: 'Organic Epsom Salt Booster', time: '8m ago' }
      ];
    }
    try {
      const parsed = typeof sectionsConfig.sales_ticker_json === 'string'
        ? JSON.parse(sectionsConfig.sales_ticker_json)
        : sectionsConfig.sales_ticker_json;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  })();

  const handleTickerChange = (index, field, value) => {
    const updated = [...currentTickers];
    updated[index] = { ...updated[index], [field]: value };
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleAddTicker = () => {
    const updated = [
      ...currentTickers,
      { id: Date.now(), name: 'New Customer', city: 'City', item: 'Organic Fertilizer', time: 'Just now' }
    ];
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleDeleteTicker = (index) => {
    const updated = currentTickers.filter((_, i) => i !== index);
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleSyncWithOrders = () => {
    if (!orders || orders.length === 0) {
      if (showToast) showToast('info', 'No Real Orders Yet', 'Added default customer ticker samples.');
      return;
    }
    const synced = orders.slice(0, 8).map((o, idx) => ({
      id: o.id || idx + 1,
      name: o.customer_name || 'Verified Customer',
      city: o.city || o.shipping_address?.split(',')[1]?.trim() || 'India',
      item: o.items?.[0]?.product_name || o.order_number || 'Organic Agro Product',
      time: o.created_at ? `${Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)))}m ago` : 'Recent'
    }));
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(synced)
    });
    if (showToast) showToast('success', 'Synced with Real Customer Orders!', `Updated ticker with ${synced.length} real store purchases.`);
  };

  if (sectionsConfig.show_sales_ticker === 0) return null;

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-300">Live Customer Purchase Notifications ({currentTickers.length})</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncWithOrders}
            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-lg font-bold transition-all cursor-pointer"
            data-reticle-target="admin-sync-orders-ticker"
          >
            ⚡ Auto-Sync Real Orders
          </button>
          <button
            type="button"
            onClick={handleAddTicker}
            className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 rounded-lg font-bold transition-all cursor-pointer"
            data-reticle-target="admin-add-ticker-entry"
          >
            + Add Entry
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {currentTickers.map((t, idx) => (
          <div key={t.id || idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3">
              <input
                type="text"
                value={t.name || ''}
                onChange={(e) => handleTickerChange(idx, 'name', e.target.value)}
                placeholder="Customer Name"
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={t.city || ''}
                onChange={(e) => handleTickerChange(idx, 'city', e.target.value)}
                placeholder="City"
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-400 text-xs font-bold"
              />
            </div>
            <div className="col-span-4">
              <input
                type="text"
                value={t.item || ''}
                onChange={(e) => handleTickerChange(idx, 'item', e.target.value)}
                placeholder="Item Purchased"
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-amber-300 text-xs font-bold"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={t.time || ''}
                onChange={(e) => handleTickerChange(idx, 'time', e.target.value)}
                placeholder="e.g. 5m ago"
                className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-400 text-xs"
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button 
                type="button" 
                onClick={() => handleDeleteTicker(idx)}
                className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950 rounded border border-rose-900 cursor-pointer"
                title="Delete notification entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
