import React from 'react';
import { Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../../../utils/resolveImgUrl';
import { convertInrToUsd, sanitizeNumericInput } from '../../../../utils/currency';

export default function ProductVariantsSection({
  productForm,
  setProductForm,
  newVariantForm,
  setNewVariantForm,
  adminFetch,
  showToast
}) {
  return (
    <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-white text-sm">Product Variants & Stock Breakdown</h3>
          <p className="text-xs text-slate-400">Add variant options like different pack sizes (e.g. 250g, 500g, 1Kg) with title, image, price & compare price in INR & USD.</p>
        </div>
        <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
          {productForm.variants?.length || 0} VARIANTS
        </span>
      </div>

      {productForm.variants && productForm.variants.length > 0 && (
        <div className="overflow-x-auto border border-slate-800 rounded-xl custom-scrollbar">
          <table className="w-full text-xs text-left text-slate-300 min-w-[680px]">
            <thead className="bg-slate-900 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Image</th>
                <th className="p-2.5">Variant Title</th>
                <th className="p-2.5 text-emerald-400">Price (₹)</th>
                <th className="p-2.5 text-blue-400">Price ($)</th>
                <th className="p-2.5 text-slate-400">Compare (₹)</th>
                <th className="p-2.5 text-blue-300">Compare ($)</th>
                <th className="p-2.5">Stock</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-850">
              {productForm.variants.map((v, vIdx) => (
                <tr key={v.id || vIdx} className="hover:bg-slate-800/50">
                  <td className="p-2.5">
                    <div className="flex items-center gap-1.5">
                      {v.image_url ? (
                        <img src={resolveImgUrl(typeof v.image_url === 'object' ? v.image_url.image_url : v.image_url)} alt="Variant" className="w-8 h-8 object-cover rounded-lg border border-slate-700 bg-slate-900" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-[9px] text-slate-500 font-bold">No Img</div>
                      )}
                      <label className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        Upload
                        <input 
                          type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('image', file);
                            try {
                              const res = await adminFetch('/api/upload', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.imageUrl) {
                                const updated = [...productForm.variants];
                                updated[vIdx] = { ...updated[vIdx], image_url: data.imageUrl };
                                setProductForm({ ...productForm, variants: updated });
                              }
                            } catch (err) {}
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="text" value={v.variant_name || v.name || ''} 
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        updated[vIdx] = { ...updated[vIdx], variant_name: e.target.value };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-full min-w-[100px] p-1.5 bg-slate-800 border border-slate-700 rounded text-white font-bold"
                      placeholder="e.g. 500g Pack"
                    />
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="number" min="0" value={v.price_inr !== undefined ? v.price_inr : (v.price || '')} 
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        const pVal = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                        const autoUsd = (pVal !== '' && pVal > 0) ? convertInrToUsd(pVal) : '';
                        updated[vIdx] = { ...updated[vIdx], price_inr: pVal, price: pVal, discount_inr: pVal, price_usd: autoUsd, discount_usd: autoUsd };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold"
                    />
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="number" min="0" step="0.01" value={v.price_usd !== undefined ? v.price_usd : ''} 
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        const pVal = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                        updated[vIdx] = { ...updated[vIdx], price_usd: pVal, discount_usd: pVal };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-400 font-bold"
                    />
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="number" min="0" value={v.compare_price_inr !== undefined ? v.compare_price_inr : ''} 
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        const pVal = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                        const autoUsd = (pVal !== '' && pVal > 0) ? convertInrToUsd(pVal) : '';
                        updated[vIdx] = { ...updated[vIdx], compare_price_inr: pVal, compare_price_usd: autoUsd };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-300"
                      placeholder="₹ MRP"
                    />
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="number" min="0" step="0.01" value={v.compare_price_usd !== undefined ? v.compare_price_usd : ''} 
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        const pVal = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                        updated[vIdx] = { ...updated[vIdx], compare_price_usd: pVal };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-300"
                      placeholder="$ MRP"
                    />
                  </td>
                  <td className="p-2.5">
                    <input 
                      type="number" min="0" value={v.stock !== undefined ? v.stock : 50} 
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        updated[vIdx] = { ...updated[vIdx], stock: Number(e.target.value) };
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="w-14 p-1.5 bg-slate-800 border border-slate-700 rounded text-white text-center font-bold"
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    <button 
                      type="button"
                      onClick={() => {
                        const updated = productForm.variants.filter((_, i) => i !== vIdx);
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      className="p-1.5 bg-rose-950/50 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <h4 className="text-xs font-bold text-slate-300 mb-2">➕ Add New Variant Pill</h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Variant Title *</label>
            <input 
              type="text" placeholder="e.g. 1Kg Pack"
              value={newVariantForm.variant_name || ''}
              onChange={(e) => setNewVariantForm(prev => ({ ...prev, variant_name: e.target.value }))}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] text-emerald-400 mb-0.5 font-bold">Price INR (₹) *</label>
            <input 
              type="number" min="0" placeholder="₹ Price"
              value={newVariantForm.price_inr || ''}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                const autoUsd = (val !== '' && val > 0) ? convertInrToUsd(val) : '';
                setNewVariantForm(prev => ({ ...prev, price_inr: val, price_usd: autoUsd }));
              }}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Compare (₹)</label>
            <input 
              type="number" min="0" placeholder="₹ MRP"
              value={newVariantForm.compare_price_inr || ''}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                const autoUsd = (val !== '' && val > 0) ? convertInrToUsd(val) : '';
                setNewVariantForm(prev => ({ ...prev, compare_price_inr: val, compare_price_usd: autoUsd }));
              }}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-blue-300 mb-0.5 font-bold">Compare ($)</label>
            <input 
              type="number" min="0" step="0.01" placeholder="$ MRP"
              value={newVariantForm.compare_price_usd || ''}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                setNewVariantForm(prev => ({ ...prev, compare_price_usd: val }));
              }}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-32">
            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Stock Qty</label>
            <input 
              type="number" min="0" placeholder="100"
              value={newVariantForm.stock || ''}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => {
                const sVal = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
                setNewVariantForm(prev => ({ ...prev, stock: sVal }));
              }}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
            />
          </div>
          <div className="flex-1 pt-4">
            <button 
              type="button"
              onClick={() => {
                if (!newVariantForm.variant_name || !newVariantForm.variant_name.trim()) {
                  if (showToast) showToast('warning', 'Variant Title Required', 'Please enter a Variant Title (e.g. 500g, 1Kg, Pack of 5)');
                  return;
                }
                const vPrice = Number(newVariantForm.price_inr || productForm.price_inr || 0);
                const vPriceUsd = newVariantForm.price_usd !== '' && Number(newVariantForm.price_usd) > 0 ? Number(newVariantForm.price_usd) : convertInrToUsd(vPrice);
                const vCompInr = Number(newVariantForm.compare_price_inr || 0);
                const vCompUsd = newVariantForm.compare_price_usd !== '' && Number(newVariantForm.compare_price_usd) > 0 ? Number(newVariantForm.compare_price_usd) : (vCompInr > 0 ? convertInrToUsd(vCompInr) : 0);
                const vStock = Number(newVariantForm.stock || 100);
                const newV = {
                  id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  variant_name: newVariantForm.variant_name.trim(),
                  price_inr: vPrice,
                  price: vPrice,
                  discount_inr: vPrice,
                  price_usd: vPriceUsd,
                  discount_usd: vPriceUsd,
                  compare_price_inr: vCompInr || null,
                  compare_price_usd: vCompUsd || null,
                  stock: vStock,
                  sku: `OB-VAR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                  image_url: productForm.images && productForm.images.length > 0 ? (typeof productForm.images[0] === 'object' ? productForm.images[0].image_url : productForm.images[0]) : null
                };
                setProductForm(prev => ({ ...prev, variants: [...(prev.variants || []), newV] }));
                setNewVariantForm({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });
                if (showToast) showToast('success', 'Variant Pill Added', `Variant "${newV.variant_name}" added to list!`);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer uppercase tracking-wider"
            >
              Save & Create Variant Pill ➕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
