import React from 'react';
import { MessageSquare, Printer, RefreshCw, Send } from 'lucide-react';

export default function OrderNotesForm({
  orderNoteInput,
  setOrderNoteInput,
  savingOrderNote,
  handleSaveOrderNotes
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-800">
      <span className="text-[10px] font-black uppercase text-emerald-400 block flex items-center gap-1.5">
        <MessageSquare size={14} /> Order Notes & Customer Delivery Instructions:
      </span>

      <form onSubmit={handleSaveOrderNotes} className="space-y-2">
        <textarea 
          rows={3}
          placeholder="Add delivery instructions, special customer requests, or admin shipping message..."
          value={orderNoteInput}
          onChange={(e) => setOrderNoteInput(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
        ></textarea>

        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            <Printer size={14} /> Print Invoice
          </button>

          <button 
            type="submit"
            disabled={savingOrderNote}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
          >
            {savingOrderNote ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Saving Note...
              </>
            ) : (
              <>
                <Send size={14} /> Save Order Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
