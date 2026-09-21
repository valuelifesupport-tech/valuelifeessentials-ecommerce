import React, { useState, useEffect } from 'react';
import GstConfigCard from './taxes/GstConfigCard';
import MonthlyReconciliationKpis from './taxes/MonthlyReconciliationKpis';
import OrderTaxLedger from './taxes/OrderTaxLedger';
import StateTaxRatesTable from './taxes/StateTaxRatesTable';
import CollectionTaxOverrides from './taxes/CollectionTaxOverrides';

export default function TaxesTab({
  settingsForm = {},
  setSettingsForm,
  updateAndSaveSettingToggle,
  handleDownloadGstCSV,
  onUpdateSettings,
  selectedGstMonth,
  setSelectedGstMonth,
  gstSummaryData,
  handleResetStateTaxRates,
  handleSaveStateTaxRates,
  stateTaxRates = [],
  setStateTaxRates,
  taxOverrides = [],
  taxPage = 1,
  setTaxPage,
  taxesPerPage = 12,
  newOverrideForm = {},
  setNewOverrideForm,
  handleCreateTaxOverride,
  handleDeleteTaxOverride,
  collections = [],
  orders = [],
  handleFetchOrderDetails,
  adminFetch,
  showToast
}) {
  const [ledgerOrders, setLedgerOrders] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchLedgerData = async () => {
    if (!adminFetch) return;
    try {
      setLedgerLoading(true);
      const res = await adminFetch(`/api/admin/taxes/orders-ledger?month=${selectedGstMonth}`);
      if (res.ok) {
        const data = await res.json();
        setLedgerOrders(data.orders || []);
        setLedgerSummary(data.summary || null);
      }
    } catch (e) {
      console.warn('Failed to fetch tax ledger:', e);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [selectedGstMonth]);

  const effectiveOrdersList = ledgerOrders.length > 0 ? ledgerOrders : orders.map(o => {
    const taxAmt = Number(o.tax_amount || o.gst_amount || 0);
    const isCancelled = o.order_status === 'CANCELLED' || o.payment_status === 'REFUNDED';
    const isIntra = !o.state_name || o.state_name.toLowerCase() === 'maharashtra';
    const taxableVal = Math.max(0, Number(o.total_amount || 0) - taxAmt);
    const cgst = Number(o.cgst_amount || 0) || (isIntra ? taxAmt / 2 : 0);
    const sgst = Number(o.sgst_amount || 0) || (isIntra ? taxAmt / 2 : 0);
    const igst = Number(o.igst_amount || 0) || (!isIntra ? taxAmt : 0);

    return {
      id: o.id,
      order_number: o.order_number,
      created_at: o.created_at,
      customer_name: o.customer_name || 'Guest Customer',
      customer_phone: o.customer_phone || '',
      customer_email: o.customer_email || '',
      customer_gstin: o.customer_gstin || '',
      shipping_address: o.shipping_address || '',
      state_name: o.state_name || 'Maharashtra',
      is_intra_state: isIntra,
      tax_type: isIntra ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)',
      taxable_value: taxableVal,
      tax_rate: 5,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      total_tax: taxAmt,
      total_amount: Number(o.total_amount || 0),
      order_status: o.order_status || 'PROCESSING',
      payment_status: o.payment_status || 'PENDING',
      is_return: isCancelled,
      tax_status: isCancelled ? 'REVERSED' : 'COLLECTED',
      credit_note_number: isCancelled ? `CN-${o.order_number}` : null
    };
  });

  const grossTax = ledgerSummary?.gross_tax_collected ?? (gstSummaryData?.grossGst ?? 0);
  const reversedTax = ledgerSummary?.tax_reversed_on_returns ?? (gstSummaryData?.reversedGst ?? 0);
  const netTax = ledgerSummary?.net_tax_payable ?? (gstSummaryData?.totalGst ?? 0);
  const netTaxable = ledgerSummary?.net_taxable_turnover ?? (gstSummaryData?.netTaxableTurnover ?? 0);
  const creditNotesCount = ledgerSummary?.credit_notes_count ?? (effectiveOrdersList.filter(o => o.tax_status === 'REVERSED').length);
  const availableMonths = ledgerSummary?.available_months || gstSummaryData?.availableMonths || ['2026-09', '2026-08'];

  return (
    <div className="space-y-6 w-full max-w-5xl" data-reticle-target="admin-taxes-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">INDIAN GST & REGIONAL TAX STUDIO</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">🏛️ Taxes & GST Management Center</h3>
        <p className="text-xs text-slate-400">Configure global GSTIN, State-wise regional tax rates, track order-level taxes, and manage return/refund tax reversals.</p>
      </div>

      <GstConfigCard 
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        updateAndSaveSettingToggle={updateAndSaveSettingToggle}
        onUpdateSettings={onUpdateSettings}
        handleDownloadGstCSV={handleDownloadGstCSV}
        selectedGstMonth={selectedGstMonth}
      />

      <MonthlyReconciliationKpis 
        selectedGstMonth={selectedGstMonth}
        setSelectedGstMonth={setSelectedGstMonth}
        handleDownloadGstCSV={handleDownloadGstCSV}
        grossTax={grossTax}
        reversedTax={reversedTax}
        netTax={netTax}
        netTaxable={netTaxable}
        creditNotesCount={creditNotesCount}
        availableMonths={availableMonths}
      />

      <OrderTaxLedger 
        effectiveOrdersList={effectiveOrdersList}
        handleFetchOrderDetails={handleFetchOrderDetails}
        orders={orders}
        creditNotesCount={creditNotesCount}
      />

      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-5 shadow-md">
        <StateTaxRatesTable 
          settingsForm={settingsForm}
          setSettingsForm={setSettingsForm}
          updateAndSaveSettingToggle={updateAndSaveSettingToggle}
          stateTaxRates={stateTaxRates}
          setStateTaxRates={setStateTaxRates}
          taxPage={taxPage}
          setTaxPage={setTaxPage}
          taxesPerPage={taxesPerPage}
          handleResetStateTaxRates={handleResetStateTaxRates}
          handleSaveStateTaxRates={handleSaveStateTaxRates}
        />
        <CollectionTaxOverrides 
          collections={collections}
          newOverrideForm={newOverrideForm}
          setNewOverrideForm={setNewOverrideForm}
          handleCreateTaxOverride={handleCreateTaxOverride}
          taxOverrides={taxOverrides}
          handleDeleteTaxOverride={handleDeleteTaxOverride}
          stateTaxRates={stateTaxRates}
        />
      </div>
    </div>
  );
}
