import React from 'react';
import { Search } from 'lucide-react';
import SelectedItemsPills from './SelectedItemsPills';

export default function CustomerEligibilityCard({
  eligibilityType,
  setEligibilityType,
  discountSelections,
  setDiscountSelections,
  setShowBrowseModal,
  setBrowseTargetType,
  setBrowseTargetField
}) {
  return (
    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
      <span className="font-extrabold text-sm text-white block">Eligibility</span>
      <select 
        value={eligibilityType}
        onChange={(e) => setEligibilityType(e.target.value)}
        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
      >
        <option value="all">All customers</option>
        <option value="segments">Specific customer segments</option>
        <option value="specific">Specific customers</option>
      </select>

      {(eligibilityType === 'specific' || eligibilityType === 'segments') && (
        <div className="pt-1 space-y-2">
          <div className="flex gap-2">
            <div 
              onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
              className="relative flex-1 cursor-pointer"
            >
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" readOnly
                placeholder="Search registered customers..." 
                value={discountSelections.customers.map(c => c.name || c.email).join(', ')}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer"
              />
            </div>
            <button 
              type="button" 
              onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs shadow-md"
            >
              Browse
            </button>
          </div>

          <SelectedItemsPills 
            items={discountSelections.customers} 
            onRemove={(id) => setDiscountSelections(prev => ({ ...prev, customers: prev.customers.filter(i => i.id !== id) }))}
            labelKey="customer"
          />
        </div>
      )}
    </div>
  );
}
