import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CouponsTab({
  coupons = [],
  setCoupons,
  setShowDiscountTypeModal,
  setCouponForm,
  setEditingCouponId,
  setSelectedDiscountType,
  setShowCouponModal,
  adminFetch,
  showToast
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-coupons-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">Coupons & Promo Codes Manager</h3>
          <p className="text-xs text-slate-400">Create, edit, toggle and delete percentage or flat discount promo codes. All fields are dynamic from the database.</p>
        </div>

        <button 
          onClick={() => setShowDiscountTypeModal(true)} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
          data-reticle-target="admin-create-discount-btn"
        >
          <Plus size={16} /> Create Discount
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12" data-reticle-target="admin-empty-coupons">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="text-slate-400 font-bold">No coupons created yet</p>
          <p className="text-xs text-slate-500 mt-1">Click "Create Discount" to add your first coupon code</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-coupons-table-container">
          <table className="w-full text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="text-left py-3 px-3">Code</th>
                <th className="text-left py-3 px-2">Discount</th>
                <th className="text-left py-3 px-2">Min Spend</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-center py-3 px-2">Uses</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Dates</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors" data-reticle-target={`admin-coupon-row-${c.id}`}>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    {c.description && <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate">{c.description}</p>}
                  </td>
                  <td className="py-3 px-2 font-bold text-white">
                    {c.coupon_category === 'free_shipping' ? '🚚 Free Shipping' :
                     c.discount_type === 'PERCENT' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                  </td>
                  <td className="py-3 px-2 text-slate-300">
                    {c.min_spend_inr > 0 ? `₹${c.min_spend_inr}` : '—'}
                  </td>
                  <td className="py-3 px-2">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {c.coupon_category === 'amount_off_order' ? 'Order' : 
                       c.coupon_category === 'amount_off_products' ? 'Product' :
                       c.coupon_category === 'free_shipping' ? 'Shipping' :
                       c.coupon_category === 'buy_x_get_y' ? 'BXGY' : c.coupon_category || 'Order'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-300 font-mono">
                    {c.used_count || 0}{c.max_uses > 0 ? `/${c.max_uses}` : ''}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button 
                      onClick={async () => {
                        const newActive = c.active ? 0 : 1;
                        const res = await adminFetch(`/api/coupons/${c.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ active: newActive })
                        });
                        if (res.ok) {
                          setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: newActive } : x));
                          if (showToast) showToast('success', newActive ? 'Coupon Activated' : 'Coupon Deactivated', `${c.code} is now ${newActive ? 'active' : 'inactive'}`);
                        }
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer ${
                        c.active ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700' : 'bg-red-900/40 text-red-400 border border-red-800'
                      }`}
                      data-reticle-target={`admin-coupon-toggle-${c.id}`}
                    >
                      {c.active ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-[10px] text-slate-400">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    {' → '}
                    {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '∞'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setCouponForm({
                            code: c.code,
                            discount_type: c.discount_type,
                            discount_value: c.discount_value,
                            min_spend_inr: c.min_spend_inr || 0,
                            min_spend_usd: c.min_spend_usd || 0,
                            max_uses: c.max_uses || 0,
                            one_per_customer: c.one_per_customer || 0,
                            start_date: c.start_date || '',
                            end_date: c.end_date || '',
                            description: c.description || ''
                          });
                          setEditingCouponId(c.id);
                          setSelectedDiscountType({ id: c.coupon_category || 'amount_off_order', title: 'Edit Coupon', subtitle: 'Update coupon details' });
                          setShowCouponModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 cursor-pointer" 
                        title="Edit"
                        data-reticle-target={`admin-edit-coupon-btn-${c.id}`}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={async () => { 
                          const res = await adminFetch(`/api/coupons/${c.id}`, { method: 'DELETE' }); 
                          if (res.ok) { 
                            setCoupons(prev => prev.filter(x => x.id !== c.id)); 
                            if (showToast) showToast('success', 'Coupon Deleted', `Coupon "${c.code}" removed.`); 
                          } 
                        }} 
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer" 
                        title="Delete"
                        data-reticle-target={`admin-delete-coupon-btn-${c.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
