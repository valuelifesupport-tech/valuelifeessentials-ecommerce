import { useState, useEffect } from 'react';

/**
 * Order-specific state, filtering, details fetching, and status/shipping handlers.
 */
export default function useOrderActions({ adminFetch, fetchAdminData, showToast, setSelectedOrderDetails, setOrderNoteInput, setCourierInput, setTrackingInput, setAdminOrderStatusInput, setAdminCancelReasonInput }) {
  // Filters & pagination
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const orderItemsPerPage = 10;

  // Loading states
  const [updatingShippingStatus, setUpdatingShippingStatus] = useState(false);
  const [savingOrderNote, setSavingOrderNote] = useState(false);

  // Pagination reset
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearchQuery, orderStatusFilter, orderPaymentFilter]);

  const handleFetchOrderDetails = async (order) => {
    setSelectedOrderDetails(order);
    setOrderNoteInput(order.admin_note || '');
    setCourierInput(order.courier_name || '');
    setTrackingInput(order.tracking_number || '');
    setAdminOrderStatusInput(order.order_status || 'PROCESSING');
    setAdminCancelReasonInput(order.cancel_reason || '');
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`);
      if (res.ok) {
        const fullOrder = await res.json();
        setSelectedOrderDetails(fullOrder);
        setOrderNoteInput(fullOrder.admin_note || order.admin_note || '');
        setCourierInput(fullOrder.courier_name || order.courier_name || '');
        setTrackingInput(fullOrder.tracking_number || order.tracking_number || '');
        setAdminOrderStatusInput(fullOrder.order_status || order.order_status || 'PROCESSING');
        setAdminCancelReasonInput(fullOrder.cancel_reason || order.cancel_reason || '');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleUpdateOrderShippingAndStatus = async (e) => {
    const { selectedOrderDetails: orderDetails, courierInput: courier, trackingInput: tracking, adminOrderStatusInput: status, adminCancelReasonInput: cancelReason } = e;
    if (!orderDetails) return;
    setUpdatingShippingStatus(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderDetails.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: status,
          courier_name: courier,
          tracking_number: tracking,
          cancel_reason: status === 'CANCELLED' ? cancelReason : ''
        })
      });
      if (res.ok) {
        const updated = await res.json().catch(() => null);
        if (updated) setSelectedOrderDetails(prev => ({ ...prev, ...updated }));
        fetchAdminData();
        if (showToast) showToast('success', 'Order Updated', `Order #${orderDetails.id} status → ${status}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Update Failed', errData.error || `Server returned ${res.status}`);
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
    } finally {
      setUpdatingShippingStatus(false);
    }
  };

  const handleSaveOrderNotes = async (e) => {
    const { selectedOrderDetails: orderDetails, orderNoteInput: note } = e;
    if (!orderDetails) return;
    setSavingOrderNote(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderDetails.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: note })
      });
      if (res.ok) {
        const updated = await res.json().catch(() => null);
        if (updated) setSelectedOrderDetails(prev => ({ ...prev, admin_note: note, ...updated }));
        if (showToast) showToast('success', 'Note Saved', 'Admin note saved to order record.');
      } else {
        if (showToast) showToast('error', 'Note Failed', 'Could not save admin note.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Note Error', err.message);
    } finally {
      setSavingOrderNote(false);
    }
  };

  const handleOrderStatus = async (id, order_status) => {
    try {
      let res = await adminFetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status })
      });
      if (!res.ok) {
        res = await adminFetch(`/api/admin/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_status })
        });
      }
      fetchAdminData();
      if (showToast) showToast('success', 'Order Updated', `Order #${id} status changed to ${order_status}`);
    } catch (err) {
      if (showToast) showToast('error', 'Update Error', err.message || 'Failed to update order status');
    }
  };

  return {
    orderSearchQuery, setOrderSearchQuery,
    orderStatusFilter, setOrderStatusFilter,
    orderPaymentFilter, setOrderPaymentFilter,
    orderPage, setOrderPage,
    orderItemsPerPage,
    updatingShippingStatus,
    savingOrderNote,
    handleFetchOrderDetails,
    handleUpdateOrderShippingAndStatus,
    handleSaveOrderNotes,
    handleOrderStatus
  };
}
