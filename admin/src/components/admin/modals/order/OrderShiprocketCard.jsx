import React, { useState, useEffect } from 'react';
import { CheckCircle2, MapPin, RefreshCw, Truck, FileText, Printer, Calendar } from 'lucide-react';

export default function OrderShiprocketCard({
  selectedOrderDetails,
  setSelectedOrderDetails,
  adminFetch,
  fetchAdminData,
  showToast,
  setCourierInput,
  setTrackingInput,
  setAdminOrderStatusInput
}) {
  const [srLoading, setSrLoading] = useState(false);
  const [srActionMsg, setSrActionMsg] = useState('');
  const [couriersList, setCouriersList] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [srTrackingData, setSrTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [pickupDateInput, setPickupDateInput] = useState('');
  const [schedulingPickup, setSchedulingPickup] = useState(false);

  const [pincodeInput, setPincodeInput] = useState('');

  useEffect(() => {
    const rawPin = selectedOrderDetails?.shipping_pincode || (() => {
      if (!selectedOrderDetails?.shipping_address) return '';
      const match = selectedOrderDetails.shipping_address.match(/\b\d{6}\b/);
      return match ? match[0] : '';
    })();
    setPincodeInput(rawPin || '');
    setCouriersList([]);
    setSrTrackingData(null);
    setShowTracking(false);
  }, [selectedOrderDetails?.id, selectedOrderDetails]);

  const handleCheckCouriers = async () => {
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      if (showToast) showToast('warning', 'Pincode Required', 'Please enter a valid 6-digit Indian delivery pincode.');
      return;
    }
    setLoadingCouriers(true);
    try {
      const res = await adminFetch('/api/shipping/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_pincode: pincodeInput.trim(),
          cod: selectedOrderDetails?.remaining_amount > 0 ? 1 : 0,
          weight: 0.5
        })
      });
      const data = await res.json();
      if (data.serviceable && data.couriers && data.couriers.length > 0) {
        setCouriersList(data.couriers);
        if (!selectedCourierId) {
          setSelectedCourierId(String(data.couriers[0].id));
        }
        if (showToast) showToast('success', 'Serviceable', `Found ${data.couriers.length} courier options for pincode ${pincodeInput}.`);
      } else {
        setCouriersList([]);
        if (showToast) showToast('error', 'Not Serviceable', data.message || 'Pincode not serviceable by Shiprocket couriers.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Serviceability Check Failed', err.message);
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleQuickFulfillShiprocket = async () => {
    setSrLoading(true);
    setSrActionMsg('Preparing Shiprocket order...');
    try {
      let shipmentId = selectedOrderDetails?.shiprocket_shipment_id;
      if (!shipmentId) {
        setSrActionMsg('Creating shipment in Shiprocket...');
        const createRes = await adminFetch('/api/shipping/shiprocket/create-shipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: selectedOrderDetails.id })
        });
        const createData = await createRes.json();
        if (!createRes.ok || !createData.success) {
          throw new Error(createData.error || 'Failed to create shipment in Shiprocket');
        }
        shipmentId = createData.shipment_id;
      }

      setSrActionMsg('Assigning courier & generating AWB...');
      const awbRes = await adminFetch('/api/shipping/shiprocket/assign-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderDetails.id,
          shipment_id: shipmentId,
          courier_id: selectedCourierId || undefined
        })
      });
      const awbData = await awbRes.json();
      if (!awbRes.ok || !awbData.success) {
        throw new Error(awbData.error || 'Failed to assign AWB in Shiprocket');
      }

      setSelectedOrderDetails(prev => ({
        ...prev,
        shiprocket_awb: awbData.awb_code,
        shiprocket_courier_name: awbData.courier_name,
        courier_name: awbData.courier_name,
        tracking_number: awbData.awb_code,
        order_status: 'SHIPPED',
        shiprocket_status: 'AWB_ASSIGNED'
      }));
      setAdminOrderStatusInput('SHIPPED');
      setCourierInput(awbData.courier_name || '');
      setTrackingInput(awbData.awb_code || '');

      if (fetchAdminData) fetchAdminData();
      if (showToast) showToast('success', 'Order Dispatched via Shiprocket! 🚀', `AWB #${awbData.awb_code} generated (${awbData.courier_name}). Notification sent to customer.`);
    } catch (err) {
      if (showToast) showToast('error', 'Shiprocket Fulfillment Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handlePrintLabel = async () => {
    setSrLoading(true);
    setSrActionMsg('Fetching Shipping Label PDF...');
    try {
      const res = await adminFetch('/api/shipping/shiprocket/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrderDetails.id })
      });
      const data = await res.json();
      if (data.label_url) {
        window.open(data.label_url, '_blank');
        if (showToast) showToast('success', 'Shipping Label Ready', 'Label opened in a new tab.');
      } else {
        throw new Error(data.message || 'No label URL returned by Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Label Generation Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handlePrintInvoice = async () => {
    setSrLoading(true);
    setSrActionMsg('Fetching Tax Invoice PDF...');
    try {
      const res = await adminFetch('/api/shipping/shiprocket/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrderDetails.id })
      });
      const data = await res.json();
      if (data.invoice_url) {
        window.open(data.invoice_url, '_blank');
        if (showToast) showToast('success', 'Tax Invoice Ready', 'Invoice opened in a new tab.');
      } else {
        throw new Error(data.message || 'No invoice URL returned by Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Invoice Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handleSchedulePickup = async () => {
    setSchedulingPickup(true);
    try {
      const res = await adminFetch('/api/shipping/shiprocket/request-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderDetails.id,
          pickup_date: pickupDateInput || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('success', 'Pickup Scheduled! 📦', data.message || 'Courier pickup scheduled with Shiprocket.');
        if (fetchAdminData) fetchAdminData();
      } else {
        throw new Error(data.error || 'Failed to schedule pickup');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Pickup Schedule Failed', err.message);
    } finally {
      setSchedulingPickup(false);
    }
  };

  const handleFetchTracking = async () => {
    const awb = selectedOrderDetails?.shiprocket_awb || selectedOrderDetails?.tracking_number || selectedOrderDetails?.order_number;
    if (!awb) {
      if (showToast) showToast('warning', 'AWB Required', 'No AWB number assigned to this order yet.');
      return;
    }
    setLoadingTracking(true);
    setShowTracking(true);
    try {
      const res = await adminFetch(`/api/shipping/shiprocket/track/${encodeURIComponent(awb)}`);
      const data = await res.json();
      if (data.success && data.tracking) {
        setSrTrackingData(data.tracking);
      } else {
        throw new Error(data.error || 'Unable to fetch tracking details from Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Tracking Error', err.message);
    } finally {
      setLoadingTracking(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-4 rounded-xl border border-indigo-700/60 space-y-3.5 text-xs shadow-lg" data-reticle-target="admin-shiprocket-card">
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-sm">
            🚀
          </span>
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest font-mono">
              LOGISTICS AUTOMATION (SHIPROCKET API V2)
            </span>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              1-Click Courier Fulfillment & AWB Generation
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedOrderDetails.shiprocket_awb ? (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-md font-mono text-[11px] font-black flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> AWB: {selectedOrderDetails.shiprocket_awb}
            </span>
          ) : (
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-md text-[11px] font-bold">
              ⚡ Ready to Dispatch
            </span>
          )}
        </div>
      </div>

      {!selectedOrderDetails.shiprocket_awb ? (
        <div className="space-y-3">
          <div className="bg-slate-850/90 p-3 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                <MapPin size={13} className="text-indigo-400" /> Destination Pincode Serviceability:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560001"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none text-center"
                />
                <button
                  type="button"
                  onClick={handleCheckCouriers}
                  disabled={loadingCouriers}
                  className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/50 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {loadingCouriers ? <RefreshCw size={12} className="animate-spin" /> : '🔍 Check Couriers & Rates'}
                </button>
              </div>
            </div>

            {couriersList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">
                  Select Courier Partner (Ranked by Speed & Cost):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {couriersList.map((c) => (
                    <label
                      key={c.id}
                      className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                        String(selectedCourierId) === String(c.id)
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shiprocket_courier"
                          value={c.id}
                          checked={String(selectedCourierId) === String(c.id)}
                          onChange={() => setSelectedCourierId(String(c.id))}
                          className="accent-indigo-500"
                        />
                        <div>
                          <span className="font-bold text-xs block">{c.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {c.etd ? `ETD: ${c.etd}` : `${c.estimated_delivery_days || 3} days`} • ⭐ {c.rating || 4.5}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-extrabold text-emerald-400 text-xs">
                        ₹{c.rate}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-400">
              Will push to Shiprocket, generate courier AWB, update order to SHIPPED, and email tracking details to customer.
            </span>
            <button
              type="button"
              onClick={handleQuickFulfillShiprocket}
              disabled={srLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all text-xs"
            >
              {srLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> {srActionMsg || 'Processing...'}
                </>
              ) : (
                <>
                  <span>🚀 1-Click Shiprocket Fulfillment</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-850 p-3 rounded-xl border border-slate-800 text-center font-mono">
            <div className="p-2 bg-slate-800 rounded-lg">
              <span className="text-[9px] uppercase text-slate-400 block">Courier Partner</span>
              <span className="font-bold text-indigo-300 text-xs truncate block">
                {selectedOrderDetails.shiprocket_courier_name || selectedOrderDetails.courier_name || 'Assigned'}
              </span>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg">
              <span className="text-[9px] uppercase text-slate-400 block">AWB / Tracking #</span>
              <span className="font-bold text-emerald-400 text-xs truncate block">
                {selectedOrderDetails.shiprocket_awb || selectedOrderDetails.tracking_number}
              </span>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg">
              <span className="text-[9px] uppercase text-slate-400 block">Shiprocket Status</span>
              <span className="font-bold text-blue-400 text-xs truncate block">
                {selectedOrderDetails.shiprocket_status || 'AWB_ASSIGNED'}
              </span>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg">
              <span className="text-[9px] uppercase text-slate-400 block">Pickup Schedule</span>
              <span className="font-bold text-amber-400 text-xs truncate block">
                {selectedOrderDetails.pickup_scheduled_date ? `Scheduled (${selectedOrderDetails.pickup_scheduled_date})` : 'Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handlePrintLabel}
              disabled={srLoading}
              className="bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <FileText size={14} /> Print AWB Label
            </button>

            <button
              type="button"
              onClick={handlePrintInvoice}
              disabled={srLoading}
              className="bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Printer size={14} /> Print Tax Invoice
            </button>

            <button
              type="button"
              onClick={handleSchedulePickup}
              disabled={schedulingPickup}
              className="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              {schedulingPickup ? <RefreshCw size={14} className="animate-spin" /> : <Calendar size={14} />} Schedule Pickup
            </button>

            <button
              type="button"
              onClick={handleFetchTracking}
              disabled={loadingTracking}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              {loadingTracking ? <RefreshCw size={14} className="animate-spin" /> : <Truck size={14} />} Live Tracking
            </button>
          </div>

          {showTracking && (
            <div className="p-3.5 bg-slate-900 border border-indigo-600/60 rounded-xl space-y-2.5 mt-2 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-extrabold text-indigo-400 flex items-center gap-1.5 text-xs">
                  📡 Real-Time Courier Checkpoints & Scans
                </span>
                <button
                  type="button"
                  onClick={() => setShowTracking(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {loadingTracking ? (
                <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-indigo-400" /> Fetching live tracking from Shiprocket...
                </div>
              ) : srTrackingData ? (
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">Current Status:</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {srTrackingData.current_status || 'IN TRANSIT'}
                      </span>
                    </div>
                    {srTrackingData.etd && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-mono">Estimated Delivery:</span>
                        <span className="font-bold text-white text-xs">{srTrackingData.etd}</span>
                      </div>
                    )}
                  </div>

                  {srTrackingData.scans && srTrackingData.scans.length > 0 ? (
                    <div className="relative pl-4 space-y-3 pt-2 border-l-2 border-indigo-600/40 ml-2">
                      {srTrackingData.scans.map((scan, sIdx) => (
                        <div key={sIdx} className="relative">
                          <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${sIdx === 0 ? 'bg-indigo-400 ring-4 ring-indigo-500/30' : 'bg-slate-600'}`}></div>
                          <div className="text-white font-bold text-xs">{scan.activity || scan['sr-status-label']}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{scan.date}</span>
                            {scan.location && <span>• 📍 {scan.location}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic text-center py-2">
                      Order has been booked with courier ({selectedOrderDetails.shiprocket_courier_name || 'Courier'}). Awaiting first transit hub scan.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-xs text-center py-2">
                  No tracking scans available yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
