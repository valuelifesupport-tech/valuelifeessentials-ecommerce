import React from 'react';
import { RefreshCw, Truck } from 'lucide-react';
import { resolveImgUrl } from '../../../api/config';

export default function ProfileOrdersTab({
  orders,
  loadingOrders,
  fetchOrders,
  customerOrderStatusFilter,
  setCustomerOrderStatusFilter,
  customerOrderPage,
  setCustomerOrderPage,
  ordersPerPage,
  onGoHome,
  onSelectOrderToCancel
}) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6" data-reticle-target="user-profile-orders-tab">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
            📦 My Orders & Live Courier Tracking
          </h2>
          <p className="text-xs text-gray-500">Track real-time shipment status, courier AWB numbers, and manage pre-shipping self-cancellations.</p>
        </div>
        <button 
          onClick={fetchOrders} 
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors cursor-pointer"
          title="Refresh Orders"
          data-reticle-target="user-orders-refresh-btn"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* STATUS FILTER PILLS & COUNT BAR */}
      {orders && orders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1" data-reticle-target="user-orders-status-filters">
          {[
            { id: 'ALL', label: `📋 All Orders (${orders.length})` },
            { id: 'PROCESSING', label: `⏳ Processing (${orders.filter(o => { const s = (o.order_status || 'PROCESSING').toUpperCase(); return s === 'PROCESSING' || s === 'PENDING'; }).length})` },
            { id: 'SHIPPED', label: `🚚 Shipped (${orders.filter(o => (o.order_status || '').toUpperCase() === 'SHIPPED').length})` },
            { id: 'DELIVERED', label: `✅ Delivered (${orders.filter(o => (o.order_status || '').toUpperCase() === 'DELIVERED').length})` },
            { id: 'CANCELLED', label: `❌ Cancelled (${orders.filter(o => (o.order_status || '').toUpperCase() === 'CANCELLED').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setCustomerOrderStatusFilter(tab.id); setCustomerOrderPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                customerOrderStatusFilter === tab.id
                  ? 'bg-[#3b6e14] text-white border-[#2d560f] shadow-md'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
              data-reticle-target={`user-orders-filter-${tab.id.toLowerCase()}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loadingOrders ? (
        <div className="py-12 text-center text-gray-400 font-bold text-xs space-y-2">
          <RefreshCw size={24} className="animate-spin mx-auto text-[#3b6e14]" />
          <p>Loading your order history...</p>
        </div>
      ) : (!orders || orders.length === 0) ? (
        <div className="py-12 text-center space-y-3 bg-gray-50 rounded-2xl border border-gray-200" data-reticle-target="user-orders-empty-state">
          <div className="text-4xl">🌱</div>
          <h3 className="font-bold text-gray-800 text-sm">No orders placed yet!</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Explore our 100% certified organic fertilizers, seeds, and gardening supplies to place your first order.</p>
          <button 
            onClick={onGoHome}
            className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
            data-reticle-target="user-orders-browse-catalog-btn"
          >
            Browse Organic Catalog
          </button>
        </div>
      ) : (() => {
        const filteredOrders = orders.filter(order => {
          if (customerOrderStatusFilter === 'ALL') return true;
          const status = (order.order_status || 'PROCESSING').toUpperCase();
          if (customerOrderStatusFilter === 'PROCESSING') return status === 'PROCESSING' || status === 'PENDING';
          return status === customerOrderStatusFilter;
        });

        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
        const paginatedOrders = filteredOrders.slice((customerOrderPage - 1) * ordersPerPage, customerOrderPage * ordersPerPage);

        if (filteredOrders.length === 0) {
          return (
            <div className="py-10 text-center space-y-2 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-xs font-bold text-gray-600">No {customerOrderStatusFilter.toLowerCase()} orders found.</p>
              <button 
                type="button" 
                onClick={() => setCustomerOrderStatusFilter('ALL')}
                className="text-xs font-bold text-[#3b6e14] underline cursor-pointer"
              >
                View All Orders
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const status = (order.order_status || 'PROCESSING').toUpperCase();
              const isPreShipping = status === 'PROCESSING' || status === 'PENDING';
              const isCancelled = status === 'CANCELLED';
              const isShipped = status === 'SHIPPED';
              const isDelivered = status === 'DELIVERED';

              return (
                <div key={order.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 hover:border-gray-300 transition-all" data-reticle-target={`profile-order-${order.id}`}>
                  {/* ORDER HEADER */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 font-mono">{order.order_number}</span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-600 mt-0.5">
                        Total: <span className="text-[#3b6e14] font-black">₹{(order.total_amount || 0).toLocaleString('en-IN')}</span> 
                        <span className="text-[10px] text-gray-400 ml-1.5 uppercase">({order.payment_mode || 'FULL'})</span>
                      </p>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="flex items-center gap-2">
                      {isCancelled && (
                        <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                          ❌ CANCELLED
                        </span>
                      )}
                      {isShipped && (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                          🚚 SHIPPED
                        </span>
                      )}
                      {isDelivered && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                          ✅ DELIVERED
                        </span>
                      )}
                      {isPreShipping && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                          ⏳ PROCESSING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ITEMIZED PRODUCTS DETAILS LIST */}
                  {order.items && order.items.length > 0 && (
                    <div className="divide-y divide-gray-100 bg-gray-50/80 rounded-xl border border-gray-200 overflow-hidden my-2">
                      {order.items.map((item, itemIdx) => {
                        const rawImg = item.item_image || item.thumbnail || item.primary_image || item.image_url;
                        const imgUrl = rawImg ? resolveImgUrl(rawImg) : null;
                        const title = item.product_title || item.title || item.name || 'Organic Product';
                        const variant = item.variant_name || item.variant_title || null;
                        const qty = item.quantity || 1;
                        const unitPrice = item.price || item.price_inr || 0;

                        return (
                          <div key={item.id || itemIdx} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-100/60 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              {imgUrl ? (
                                <img 
                                  src={imgUrl} 
                                  alt={title} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80';
                                  }}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white shrink-0 shadow-sm" 
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold shrink-0">
                                  Product
                                </div>
                              )}
                              <div className="min-w-0 space-y-0.5">
                                <h4 className="text-xs font-extrabold text-gray-900 truncate tracking-tight">{title}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {variant && (
                                    <span className="bg-emerald-100 text-[#3b6e14] border border-emerald-200 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                                      {variant}
                                    </span>
                                  )}
                                  <span className="text-gray-500 font-semibold">Qty: <strong className="text-gray-800 font-extrabold">{qty}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#3b6e14] block">₹{(unitPrice * qty).toLocaleString('en-IN')}</span>
                              {qty > 1 && (
                                <span className="text-[10px] text-gray-400 font-bold block">₹{unitPrice}/ea</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* LIVE COURIER TRACKING BOX */}
                  {order.courier_name && (
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-wrap justify-between items-center text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-blue-600" />
                        <span className="font-extrabold text-blue-950">Courier: {order.courier_name}</span>
                        {order.tracking_number && (
                          <span className="font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                            AWB: #{order.tracking_number}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-blue-700">Out for delivery soon</span>
                    </div>
                  )}

                  {/* CANCELLATION REASON DISPLAY */}
                  {isCancelled && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                      <span className="font-bold block">🚫 Status: Cancelled</span>
                      {order.cancellation_reason && (
                        <span className="font-semibold block text-rose-700">Reason: "{order.cancellation_reason}"</span>
                      )}
                      {order.cancellation_notes && <p className="text-[11px] text-rose-600">Note: {order.cancellation_notes}</p>}
                    </div>
                  )}

                  {/* CANCEL ORDER ACTION BUTTON */}
                  {isPreShipping && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectOrderToCancel(order)}
                        className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-colors cursor-pointer"
                        data-reticle-target={`profile-cancel-order-btn-${order.id}`}
                      >
                        ✕ Cancel Order (Pre-shipping)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 text-xs font-bold text-gray-700" data-reticle-target="user-orders-pagination">
                <span>
                  Showing {Math.min((customerOrderPage - 1) * ordersPerPage + 1, filteredOrders.length)} - {Math.min(customerOrderPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full py-1">
                  <button
                    type="button"
                    disabled={customerOrderPage === 1}
                    onClick={() => setCustomerOrderPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs cursor-pointer shrink-0"
                  >
                    ← Previous
                  </button>

                  {(() => {
                    const pages = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (customerOrderPage > 3) pages.push('...');
                      const start = Math.max(2, customerOrderPage - 1);
                      const end = Math.min(totalPages - 1, customerOrderPage + 1);
                      for (let i = start; i <= end; i++) {
                        if (i > 1 && i < totalPages) pages.push(i);
                      }
                      if (customerOrderPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((pNum, pIdx) => {
                      if (pNum === '...') {
                        return <span key={`dots-${pIdx}`} className="px-1.5 text-gray-400 font-extrabold text-xs select-none">...</span>;
                      }
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setCustomerOrderPage(pNum)}
                          className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                            customerOrderPage === pNum
                              ? 'bg-[#3b6e14] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    });
                  })()}

                  <button
                    type="button"
                    disabled={customerOrderPage === totalPages}
                    onClick={() => setCustomerOrderPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs cursor-pointer shrink-0"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
