import React from 'react';

export default function DiscountLimitsCard({
  limitTotalUses,
  setLimitTotalUses,
  limitTotalUsesVal,
  setLimitTotalUsesVal,
  limitOnePerCustomer,
  setLimitOnePerCustomer
}) {
  return (
    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
      <span className="font-extrabold text-sm text-white block">Maximum discount uses</span>

      <div className="space-y-2 text-slate-200 text-xs">
        <div>
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input 
              type="checkbox" 
              checked={limitTotalUses} 
              onChange={(e) => setLimitTotalUses(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded" 
            />
            <span>Limit number of times this discount can be used in total</span>
          </label>
          {limitTotalUses && (
            <div className="mt-2 pl-6">
              <input 
                type="number" 
                value={limitTotalUsesVal}
                onChange={(e) => setLimitTotalUsesVal(Number(e.target.value))}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs"
                placeholder="e.g. 100 uses total"
              />
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-medium pt-1">
          <input 
            type="checkbox" 
            checked={limitOnePerCustomer} 
            onChange={(e) => setLimitOnePerCustomer(e.target.checked)}
            className="accent-emerald-500 w-4 h-4 rounded" 
          />
          <span>Limit to one use per customer</span>
        </label>
      </div>
    </div>
  );
}
