import React from 'react';
import { BarChart2, ShoppingBag, DollarSign, ImageIcon, Menu } from 'lucide-react';

export default function AdminMobileBottomBar({
  activeTab,
  setActiveTab,
  ordersCount = 0,
  onOpenAllTabs
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1 text-[10px] font-bold shadow-2xl" data-reticle-target="admin-mobile-bottom-bar">
      <button 
        onClick={() => setActiveTab('analytics')} 
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'analytics' ? 'text-emerald-400 font-extrabold bg-emerald-950/50' : 'text-slate-400 hover:text-white'
        }`}
        data-reticle-target="admin-bottom-tab-analytics"
      >
        <BarChart2 size={18} />
        <span>Analytics</span>
      </button>
      <button 
        onClick={() => setActiveTab('products')} 
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'products' ? 'text-emerald-400 font-extrabold bg-emerald-950/50' : 'text-slate-400 hover:text-white'
        }`}
        data-reticle-target="admin-bottom-tab-products"
      >
        <ShoppingBag size={18} />
        <span>Products</span>
      </button>
      <button 
        onClick={() => setActiveTab('orders')} 
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
          activeTab === 'orders' ? 'text-emerald-400 font-extrabold bg-emerald-950/50' : 'text-slate-400 hover:text-white'
        }`}
        data-reticle-target="admin-bottom-tab-orders"
      >
        <DollarSign size={18} />
        <span>Orders</span>
        {ordersCount > 0 && (
          <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-400" />
        )}
      </button>
      <button 
        onClick={() => setActiveTab('media')} 
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'media' ? 'text-emerald-400 font-extrabold bg-emerald-950/50' : 'text-slate-400 hover:text-white'
        }`}
        data-reticle-target="admin-bottom-tab-media"
      >
        <ImageIcon size={18} />
        <span>Media</span>
      </button>
      <button 
        onClick={onOpenAllTabs} 
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
        data-reticle-target="admin-bottom-tab-all"
      >
        <Menu size={18} />
        <span>All Tabs</span>
      </button>
    </nav>
  );
}
