import React from 'react';
import { Search, Eye } from 'lucide-react';

export default function OrdersTab({
  orders = [],
  orderSearchQuery,
  setOrderSearchQuery,
  orderStatusFilter,
  setOrderStatusFilter,
  orderPaymentFilter,
  setOrderPaymentFilter,
  orderPage,
  setOrderPage,
  orderItemsPerPage = 10,
  handleFetchOrderDetails,
  handleOrderStatus
}) {
  const filteredOrders = orders.filter(o => {
    const query = orderSearchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      (o.order_number && o.order_number.toLowerCase().includes(query)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(query)) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(query)) ||
      (o.order_notes && o.order_notes.toLowerCase().includes(query));

    const matchesStatus = orderStatusFilter === 'ALL' || o.order_status === orderStatusFilter;
    
    let matchesPayment = true;
    if (orderPaymentFilter === 'PARTIAL') matchesPayment = (o.remaining_amount || 0) > 0 && (o.paid_amount || 0) > 0;
    else if (orderPaymentFilter === 'FULL_PREPAID') matchesPayment = (o.paid_amount || 0) >= (o.total_amount || 0);
    else if (orderPaymentFilter === 'FULL_COD') matchesPayment = (o.paid_amount || 0) === 0;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrderPages = Math.ceil(filteredOrders.length / orderItemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * orderItemsPerPage, orderPage * orderItemsPerPage);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-orders-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Orders & Partial Payments Control</h3>
          <p className="text-xs text-slate-400">Manage orders, view itemized invoice details, update shipping status, and view customer notes.</p>
        </div>

        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
          Showing {filteredOrders.length} of {orders.length} Orders
        </span>
      </div>

      {/* QUICK STATUS PILLS BAR */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1" data-reticle-target="admin-order-status-pills">
        <button
          onClick={() => setOrderStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            orderStatusFilter === 'ALL'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
          }`}
          data-reticle-target="admin-order-pill-all"
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setOrderStatusFilter('PROCESSING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            orderStatusFilter === 'PROCESSING'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md'
              : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
          }`}
          data-reticle-target="admin-order-pill-processing"
        >
          Processing ({orders.filter(o => o.order_status === 'PROCESSING').length})
        </button>
        <button
          onClick={() => setOrderStatusFilter('SHIPPED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            orderStatusFilter === 'SHIPPED'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
              : 'bg-slate-800 text-blue-400 border-slate-700 hover:bg-slate-750'
          }`}
          data-reticle-target="admin-order-pill-shipped"
        >
          Shipped ({orders.filter(o => o.order_status === 'SHIPPED').length})
        </button>
        <button
          onClick={() => setOrderStatusFilter('DELIVERED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            orderStatusFilter === 'DELIVERED'
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-md'
              : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
          }`}
          data-reticle-target="admin-order-pill-delivered"
        >
          Delivered ({orders.filter(o => o.order_status === 'DELIVERED').length})
        </button>
        <button
          onClick={() => setOrderStatusFilter('CANCELLED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${
            orderStatusFilter === 'CANCELLED'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-500/50'
              : 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900/80'
          }`}
          data-reticle-target="admin-order-pill-cancelled"
        >
          Cancelled Requests ({orders.filter(o => o.order_status === 'CANCELLED').length})
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3" data-reticle-target="admin-orders-filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Order #, Name, Phone, Notes..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
              data-reticle-target="admin-order-search-input"
            />
          </div>

          {/* STATUS FILTER */}
          <div>
            <select 
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-order-status-select"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* PAYMENT TYPE FILTER */}
          <div>
            <select 
              value={orderPaymentFilter}
              onChange={(e) => setOrderPaymentFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-order-payment-select"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="PARTIAL">Partial Deposit (Balance Rest on COD)</option>
              <option value="FULL_PREPAID">100% Full Prepaid</option>
              <option value="FULL_COD">100% Full COD</option>
            </select>
          </div>
        </div>

        {(orderSearchQuery || orderStatusFilter !== 'ALL' || orderPaymentFilter !== 'ALL') && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-emerald-400 font-bold">
              Filtered {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching criteria
            </span>
            <button 
              onClick={() => {
                setOrderSearchQuery('');
                setOrderStatusFilter('ALL');
                setOrderPaymentFilter('ALL');
              }}
              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              data-reticle-target="admin-reset-order-filters"
            >
              Reset All Filters ✕
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-orders-table-container">
        <table className="w-full text-left text-xs min-w-[920px]">
          <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">GST / Tax Paid</th>
              <th className="p-3">Paid Online</th>
              <th className="p-3">COD Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3">View Details & Notes</th>
              <th className="p-3">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-slate-400">
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-800/50" data-reticle-target={`admin-order-row-${o.id}`}>
                  <td className="p-3 font-bold text-white font-mono">{o.order_number}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{o.customer_name}</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">
                      {(() => {
                        const raw = String(o.customer_phone || '').replace(/\D/g, '');
                        const clean = raw.length > 10 ? raw.slice(-10) : raw;
                        return clean ? `+91 ${clean}` : 'No phone';
                      })()}
                    </div>
                    {(o.shipping_address || o.shipping_city || o.state_name) && (
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[200px]" title={`${o.shipping_address || ''}, ${o.shipping_city || ''}, ${o.shipping_state || o.state_name || ''}`}>
                        📍 {[o.shipping_address, o.shipping_city, o.shipping_state || o.state_name].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {o.order_notes && (
                      <div className="mt-1 bg-amber-950/80 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-800/80 font-extrabold max-w-[200px] truncate" title={o.order_notes}>
                        📝 Remark: "{o.order_notes}"
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-black text-white text-sm">
                    {o.currency === 'USD' ? '$' : '₹'}{(Number(o.total_amount) || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    {(() => {
                      const taxAmt = Number(o.tax_amount || o.gst_amount || 0);
                      const isCancelled = o.order_status === 'CANCELLED' || o.payment_status === 'REFUNDED';
                      const cgst = Number(o.cgst_amount || 0);
                      const sgst = Number(o.sgst_amount || 0);
                      const igst = Number(o.igst_amount || 0);
                      const isIntra = (!o.state_name || o.state_name.toLowerCase() === 'maharashtra');
                      const taxable = Number(o.subtotal || 0) > 0 ? Number(o.subtotal) - Number(o.discount_amount || 0) : Math.max(0, Number(o.total_amount || 0) - taxAmt);

                      return (
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs flex items-center gap-1">
                            <span className={isCancelled ? 'text-rose-400 line-through' : 'text-emerald-400'}>
                              ₹{taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              GST
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono">
                            {isIntra || (cgst > 0 || sgst > 0) ? (
                              <span>CGST: ₹{(cgst || taxAmt/2).toFixed(1)} | SGST: ₹{(sgst || taxAmt/2).toFixed(1)}</span>
                            ) : (
                              <span>IGST: ₹{(igst || taxAmt).toFixed(1)}</span>
                            )}
                          </div>

                          <div className="text-[9px] text-slate-500">
                            Base: ₹{taxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>

                          {isCancelled ? (
                            <span className="inline-block bg-rose-950/80 text-rose-300 border border-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                              ↩️ Tax Reversed
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                              ✓ Tax Collected
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3 font-bold text-emerald-400 text-xs">
                    {o.currency === 'USD' ? '$' : '₹'}{(Number(o.paid_amount) || 0).toLocaleString('en-IN')}
                    <span className="text-[9px] text-slate-400 block font-normal uppercase">{o.payment_mode || 'PARTIAL'}</span>
                  </td>
                  <td className="p-3 font-bold text-amber-400 text-xs">
                    {o.currency === 'USD' ? '$' : '₹'}{(Number(o.remaining_amount) || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] border uppercase ${
                      o.order_status === 'CANCELLED' ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                      o.order_status === 'SHIPPED' ? 'bg-blue-950/80 text-blue-300 border-blue-800' :
                      o.order_status === 'DELIVERED' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                      'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}>
                      {o.order_status || 'PROCESSING'}
                    </span>
                    {o.cancellation_reason && (
                      <div className="mt-1 text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/60 truncate max-w-[150px]" title={o.cancellation_reason}>
                        🚫 {o.cancellation_reason}
                      </div>
                    )}
                    {o.courier_name && (
                      <div className="mt-1 text-[10px] text-blue-300 font-mono bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/60 truncate max-w-[150px]">
                        🚚 {o.courier_name} {o.tracking_number ? `#${o.tracking_number}` : ''}
                      </div>
                    )}
                    {o.shiprocket_awb && (
                      <div className="mt-1 text-[10px] text-indigo-300 font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/80 truncate max-w-[150px] flex items-center gap-1 font-bold" title={`Shiprocket AWB: ${o.shiprocket_awb}`}>
                        <span>🚀 AWB: {o.shiprocket_awb}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleFetchOrderDetails(o)}
                      className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      data-reticle-target={`admin-view-order-btn-${o.id}`}
                    >
                      <Eye size={14} /> View Order & Shipping
                    </button>
                  </td>
                  <td className="p-3">
                    <select 
                      value={o.order_status || 'PROCESSING'}
                      onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg p-1.5 cursor-pointer focus:border-emerald-500 focus:outline-none"
                      data-reticle-target={`admin-order-status-select-${o.id}`}
                    >
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400" data-reticle-target="admin-orders-pagination">
          <div>
            Showing <strong className="text-white">{(orderPage - 1) * orderItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(orderPage * orderItemsPerPage, filteredOrders.length)}</strong> of <strong className="text-emerald-400">{filteredOrders.length}</strong> orders
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
              disabled={orderPage === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-order-prev-page"
            >
              Previous
            </button>

            {Array.from({ length: totalOrderPages }).map((_, i) => {
              const pg = i + 1;
              return (
                <button 
                  key={pg}
                  onClick={() => setOrderPage(pg)}
                  className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    orderPage === pg 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  data-reticle-target={`admin-order-page-${pg}`}
                >
                  {pg}
                </button>
              );
            })}

            <button 
              onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
              disabled={orderPage >= totalOrderPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-order-next-page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
