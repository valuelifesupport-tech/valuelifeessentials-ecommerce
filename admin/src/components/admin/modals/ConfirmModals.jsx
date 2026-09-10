import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function ConfirmModals({
  confirmModal = {},
  setConfirmModal,
  deleteConfirmProduct,
  setDeleteConfirmProduct,
  deletingProductId,
  handleConfirmDeleteProduct,
  deleteConfirmCategory,
  setDeleteConfirmCategory,
  deletingCategoryId,
  handleConfirmDeleteCategory
}) {
  return (
    <>
      {/* GENERAL CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" data-reticle-target="admin-confirm-modal">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border shrink-0 text-xl ${
                confirmModal.danger 
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800' 
                  : 'bg-amber-950/80 text-amber-400 border-amber-800'
              }`}>
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white font-['Outfit']">{confirmModal.title}</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const onConf = confirmModal.onConfirm;
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (typeof onConf === 'function') {
                    await onConf();
                  }
                }}
                className={`px-5 py-2 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  confirmModal.danger 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                }`}
              >
                <Trash2 size={14} />
                <span>{confirmModal.confirmText || 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-reticle-target="admin-delete-product-modal">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase block">CONFIRM DELETION</span>
                <h3 className="text-base font-extrabold text-white">Delete Product Confirmation</h3>
              </div>
            </div>

            <div className="bg-slate-850 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {deleteConfirmProduct.thumbnail || deleteConfirmProduct.image_url ? (
                    <img src={resolveImgUrl(deleteConfirmProduct.thumbnail || deleteConfirmProduct.image_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{deleteConfirmProduct.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {deleteConfirmProduct.sku || 'N/A'}</p>
                  <p className="text-[11px] text-emerald-400 font-extrabold">₹{deleteConfirmProduct.price_inr || 0}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmProduct.title}"</strong> from your catalog? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={!!deletingProductId}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                disabled={!!deletingProductId}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingProductId ? 'Deleting...' : 'Yes, Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED DELETE CATEGORY CONFIRMATION MODAL */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-reticle-target="admin-delete-category-modal">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase block">CONFIRM CATEGORY DELETION</span>
                <h3 className="text-base font-extrabold text-white">Delete Category Confirmation</h3>
              </div>
            </div>

            <div className="bg-slate-850 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                  {deleteConfirmCategory.icon || '🌿'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{deleteConfirmCategory.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Slug: {deleteConfirmCategory.slug || 'N/A'}</p>
                  <p className="text-[11px] text-emerald-400 font-extrabold">Subcategories: {(deleteConfirmCategory.subcategories || []).length}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to permanently delete category <strong className="text-white">"{deleteConfirmCategory.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmCategory(null)}
                disabled={!!deletingCategoryId}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={!!deletingCategoryId}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingCategoryId ? 'Deleting...' : 'Yes, Delete Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
