import React from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function AnalyticsTab({
  analytics,
  orders = [],
  products = [],
  reviews = [],
  salesChartData,
  handleDownloadGstCSV,
  setActiveTab
}) {
  const lowStockCount = analytics?.lowStockCount ?? (
    products.filter(p => (p.stock || 0) < 50).length + 
    products.reduce((acc, p) => acc + (p.variants?.filter(v => (v.stock || 0) < 50).length || 0), 0)
  );

  return (
    <div className="space-y-6" data-reticle-target="admin-analytics-tab">
      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-emerald-500/30" data-reticle-target="metric-live-users">
          <span className="text-xs font-extrabold text-emerald-200 uppercase tracking-wider block">Live Active Users</span>
          <div className="text-3xl font-black mt-2">{analytics?.liveUsers ?? 0}</div>
          <span className="text-[11px] text-emerald-200 block mt-1">Real-time store visitors</span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md" data-reticle-target="metric-total-revenue">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="text-3xl font-black mt-2 text-white">
            ₹{(analytics?.totalRevenue ?? orders.reduce((acc, o) => acc + (o.total_amount || 0), 0)).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block mt-1">
            ₹{(analytics?.totalCollected ?? orders.reduce((acc, o) => acc + (o.paid_amount || 0), 0)).toLocaleString('en-IN')} Collected
          </span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md" data-reticle-target="metric-total-visitors">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Visitors</span>
          <div className="text-3xl font-black mt-2 text-white">{(analytics?.totalVisitors ?? 0).toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Sessions tracked</span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md" data-reticle-target="metric-total-orders">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <div className="text-3xl font-black mt-2 text-white">{analytics?.totalOrders ?? orders.length}</div>
          <span className="text-[11px] text-blue-400 font-bold block mt-1">Processed orders</span>
        </div>
      </div>

      {/* GST TAX LEDGER & LIABILITY KPI CARDS */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-3" data-reticle-target="admin-gst-liability-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 border-b border-slate-800 pb-2">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              🏛️ Total GST Tax Liability & Collection Ledger
            </h3>
            <p className="text-slate-400 text-xs">Automated CGST (50%) + SGST (50%) vs IGST (100%) breakdown</p>
          </div>

          <button 
            onClick={handleDownloadGstCSV}
            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            data-reticle-target="export-gst-csv-btn"
          >
            <Download size={14} /> Export GST CSV (for CA)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total GST Collected</span>
            <div className="text-xl font-black text-emerald-400">₹{(analytics?.totalGstCollected || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Includes CGST, SGST & IGST</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Central Tax (CGST 50%)</span>
            <div className="text-xl font-black text-blue-400">₹{(analytics?.totalCgstCollected || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Intra-State Central Tax</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">State Tax (SGST 50%)</span>
            <div className="text-xl font-black text-purple-400">₹{(analytics?.totalSgstCollected || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Intra-State State Tax</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Integrated Tax (IGST 100%)</span>
            <div className="text-xl font-black text-amber-400">₹{(analytics?.totalIgstCollected || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Inter-State Integrated Tax</span>
          </div>
        </div>
      </div>

      {/* LIVE ADMIN SYSTEM NOTIFICATIONS & ALERT CENTER */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4" data-reticle-target="admin-system-alerts">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <span className="animate-bounce">🔔</span> Live System Notifications & Alert Center
            </h3>
            <p className="text-xs text-slate-400">Direct real-time alerts for low stock, new orders, customer review moderation, and store operations.</p>
          </div>
          <span className="bg-amber-950 text-amber-300 border border-amber-800/80 text-[10px] font-black px-3 py-1 rounded-full uppercase">
            ACTIVE MONITORING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* ALERT 1: LOW STOCK WARNING */}
          <div 
            onClick={() => setActiveTab('inventory')}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
              lowStockCount > 0 
                ? 'bg-amber-950/40 border-amber-800/80 hover:bg-amber-950/70' 
                : 'bg-slate-850 border-slate-800 hover:border-slate-700'
            }`}
            data-reticle-target="alert-card-low-stock"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-amber-400">⚠️ Low Stock Alerts</span>
              <span className="bg-amber-900/80 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {lowStockCount} Items
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {lowStockCount > 0 
                ? `${lowStockCount} product/variant item(s) are below safety stock margin (<50 units).`
                : 'All catalog stock inventory items are healthy!'}
            </p>
            <div className="text-amber-400 font-bold text-[11px] flex items-center gap-1 pt-1">
              Open Inventory Matrix →
            </div>
          </div>

          {/* ALERT 2: ORDERS NEEDING DISPATCH */}
          <div 
            onClick={() => setActiveTab('orders')}
            className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
            data-reticle-target="alert-card-orders"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-emerald-400">📦 Customer Orders</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.length} Total
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {orders.filter(o => o.order_status === 'PROCESSING' || o.order_status === 'PENDING' || !o.order_status).length} order(s) currently marked PROCESSING and ready for dispatch.
            </p>
            <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 pt-1">
              Manage Sales & Orders →
            </div>
          </div>

          {/* ALERT 3: CUSTOMER REVIEWS MODERATION */}
          <div 
            onClick={() => setActiveTab('reviews')}
            className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
            data-reticle-target="alert-card-reviews"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-purple-400">⭐ Customer Reviews</span>
              <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {reviews.length} Total
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {reviews.filter(r => r.status === 'PENDING').length || reviews.length} customer ratings available for official reply and moderation.
            </p>
            <div className="text-purple-400 font-bold text-[11px] flex items-center gap-1 pt-1">
              Open Reviews Moderation →
            </div>
          </div>

          {/* ALERT 4: PAYMENT ARCHITECTURE STATUS */}
          <div 
            onClick={() => setActiveTab('payment')}
            className="p-4 bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-2 cursor-pointer transition-all"
            data-reticle-target="alert-card-payment"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-blue-400">💳 Payment Controls</span>
              <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                COD ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Full COD mode & Partial Deposit breakdown system active and accepting orders.
            </p>
            <div className="text-blue-400 font-bold text-[11px] flex items-center gap-1 pt-1">
              View Payment Settings →
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE GRAPH */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md" data-reticle-target="revenue-chart-card">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" /> Revenue Graph
        </h3>
        <div className="h-64">
          {salesChartData && (
            <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          )}
        </div>
      </div>
    </div>
  );
}
