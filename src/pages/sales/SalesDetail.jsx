import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as salesService from '../../services/salesService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';
import { api } from '../../services/apiClient.js';
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Calendar, DollarSign, Package, AlertTriangle, Truck, Clock } from 'lucide-react';

export default function SalesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const so = await salesService.getSalesOrder(id);
        if (so) {
          setOrder(so);
          try {
            const availRes = await api.get(`/sales-orders/${id}/availability`);
            const availData = availRes?.data?.itemsBreakdown ? availRes.data : (availRes?.data || availRes);
            if (availData && availData.itemsBreakdown) {
              setAvailability(availData);
            }
          } catch (ae) {
            console.warn('Could not fetch availability breakdown:', ae.message);
          }
        } else {
          showError('Sales Order not found in database');
        }
      } catch (e) {
        console.error('Error loading sales order:', e);
        showError(e.message || 'Failed to load Sales Order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, refreshCounter]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await salesService.confirmSalesOrder(id);
      showSuccess('Sales Order confirmed successfully!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this sales order?')) return;
    setActionLoading(true);
    try {
      await salesService.cancelSalesOrder(id);
      showSuccess('Sales Order cancelled.');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-600)' }}>
          Loading Sales Order details from database...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-error)' }}>Sales Order Not Found</h2>
        <p style={{ color: 'var(--color-gray-500)', marginBottom: '20px' }}>The requested sales order could not be located in PostgreSQL.</p>
        <button className="btn btn-primary" onClick={() => navigate('/sales')}>
          Back to Sales Orders
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const totalVal = parseFloat(order.total) || 0;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <button
            onClick={() => navigate('/sales')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Sales Orders
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {order.orderNumber || order.id}
            </h1>
            <StatusBadge status={order.status || 'DRAFT'} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Created on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {order.status === 'DRAFT' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={15} /> Cancel Order
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={15} /> Confirm Order
              </button>
            </>
          )}
          {order.status === 'READY_FOR_FULFILLMENT' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/delivery')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10B981', borderColor: '#059669' }}
            >
              <Truck size={16} /> Dispatch Delivery
            </button>
          )}
        </div>
      </div>

      {/* READY FOR FULFILLMENT BANNER */}
      {order.status === 'READY_FOR_FULFILLMENT' && (
        <div style={{ padding: '16px 20px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} style={{ color: '#10B981', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Required stock is now available!</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>All required inventory has been allocated and reserved for this order. It is now ready for fulfillment and delivery dispatch.</div>
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/delivery')}
            style={{ backgroundColor: '#059669', borderColor: '#047857', whiteSpace: 'nowrap' }}
          >
            Create Delivery →
          </button>
        </div>
      )}

      {/* WAITING FOR STOCK BANNER */}
      {order.status === 'WAITING_FOR_STOCK' && (
        <div style={{ padding: '16px 20px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #F59E0B', color: '#92400E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={24} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Waiting for Stock</div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>Stock shortage detected. Automated procurement (Manufacturing Order / Purchase Order) has been initiated. You will receive an instant real-time notification once required stock is received into inventory.</div>
          </div>
        </div>
      )}

      {/* Customer & Order Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Customer Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--color-primary)' }} /> Customer Information
          </h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>
              {order.customer?.companyName || order.customer?.name || 'Customer'}
            </div>
            {order.customer?.customerCode && (
              <div style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>Code: {order.customer.customerCode}</div>
            )}
            {order.customer?.email && <div>Email: {order.customer.email}</div>}
            {order.customer?.phone && <div>Phone: {order.customer.phone}</div>}
            {order.customer?.address && <div style={{ color: 'var(--color-gray-600)' }}>Address: {order.customer.address}</div>}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} /> Order Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Order Status:</span>
              <StatusBadge status={order.status || 'DRAFT'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Line Items Count:</span>
              <span style={{ fontWeight: 600 }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
              <span style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Total Value:</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {formatCurrency(totalVal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Availability Breakdown Card */}
      {availability && availability.itemsBreakdown && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#FAFAFA' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: 'var(--color-primary)' }} /> Stock Availability & Shortage Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '8px 12px' }}>Product</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Required</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Physical Stock</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Available (Free)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Shortage</th>
                  <th style={{ padding: '8px 12px' }}>Procurement Action</th>
                </tr>
              </thead>
              <tbody>
                {availability.itemsBreakdown.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.productName} ({item.productSku})</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{item.required}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.physicalStock}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: item.available >= item.required ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{item.available}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: item.shortage > 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                      {item.shortage > 0 ? `-${item.shortage}` : '0 (Fulfilled)'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: item.shortage > 0 ? '#FEF3C7' : '#D1FAE5', color: item.shortage > 0 ? '#92400E' : '#065F46', fontWeight: 500 }}>
                        {item.procurementStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: 'var(--color-primary)' }} /> Ordered Products Pricing
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 12px' }}>Product</th>
                <th style={{ padding: '8px 12px' }}>SKU</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                    {item.product?.name || item.productId || 'Item'}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-gray-500)' }}>
                    {item.product?.sku || '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                    {formatCurrency(item.lineTotal || (item.quantity * item.unitPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
