import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistItems = [], 
  onRemoveItem, 
  onAddToCart, 
  currency, 
  currencySymbol 
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay">
      <div className="drawer-content">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-amber-50/80">
          <div className="flex items-center gap-2">
            <Heart size={22} className="text-red-500 fill-red-500" />
            <h3 className="font-extrabold text-gray-900 text-lg font-['Outfit']">Your Saved Wishlist</h3>
            <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {wishlistItems.length} items
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <Heart size={32} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-base">Your Wishlist is Empty</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Click the heart icon on any product to save your favorite bio-fertilizers & garden tools for later!
              </p>
            </div>
          ) : (
            wishlistItems.map((item) => {
              const price = currency === 'INR' ? (item.discount_inr || item.price_inr) : (item.discount_usd || item.price_usd);
              return (
                <div key={item.id} className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <img 
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80'} 
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                      <span className="font-black text-sm text-[#1b4332] mt-0.5 block">{currencySymbol}{price}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button 
                        onClick={() => { onAddToCart(item); onRemoveItem(item.id); }}
                        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm flex-1 justify-center"
                      >
                        <ShoppingBag size={14} /> Move to Cart
                      </button>

                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
