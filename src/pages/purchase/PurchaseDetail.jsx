import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as purchaseService from '../../services/purchaseService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';
import { ArrowLeft, CheckCircle, Package, Truck, User, Calendar, RefreshCw } from 'lucide-react';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const po = await purchaseService.getPurchaseOrderById(id);
        if (po) {
          setOrder(po);
        } else {
          showError('Purchase Order not found in database');
        }
      } catch (e) {
        console.error('Error loading purchase order:', e);
        showError(e.message || 'Failed to load Purchase Order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, refreshCounter]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await purchaseService.confirmPurchaseOrder(id);
      showSuccess('Purchase Order confirmed!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    setActionLoading(true);
    try {
      await purchaseService.receivePurchaseOrder(id);
      showSuccess('Inventory received & stock updated in PostgreSQL database!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Receive failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-600)' }}>
          Loading Purchase Order details from database...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-error)' }}>Purchase Order Not Found</h2>
        <p style={{ color: 'var(--color-gray-500)', marginBottom: '20px' }}>The requested purchase order could not be located in PostgreSQL.</p>
        <button className="btn btn-primary" onClick={() => navigate('/purchase')}>
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  const items = order.items || order.lines || [];
  const supplier = order.supplier || {};
  const supplierName = supplier.companyName || supplier.name || order.supplierId || 'Supplier';
  const totalVal = parseFloat(order.total) || items.reduce((acc, item) => acc + (parseFloat(item.lineTotal) || (item.quantity * item.unitPrice)), 0);

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/purchase')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Purchase Orders
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {order.poNumber || order.id}
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
            <button 
              className="btn btn-primary" 
              onClick={handleConfirm}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle size={15} /> Confirm PO
            </button>
          )}
          {['CONFIRMED', 'Confirmed', 'PARTIALLY_RECEIVED', 'DRAFT'].includes(order.status) && (
            <button 
              className="btn btn-primary" 
              onClick={handleReceive}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Truck size={15} /> Receive Stock
            </button>
          )}
        </div>
      </div>

      {/* Supplier & Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Supplier Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--color-primary-dark)' }} /> Supplier / Vendor Details
          </h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>
              {supplierName}
            </div>
            {supplier.supplierCode && (
              <div style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>Code: {supplier.supplierCode}</div>
            )}
            {supplier.email && <div>Email: {supplier.email}</div>}
            {supplier.phone && <div>Phone: {supplier.phone}</div>}
            {supplier.address && <div style={{ color: 'var(--color-gray-600)' }}>Address: {supplier.address}</div>}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--color-primary-dark)' }} /> Order Summary
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

      {/* Line Items Table */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} style={{ color: 'var(--color-primary-dark)' }} /> Order Line Items
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 12px' }}>Product</th>
                <th style={{ padding: '8px 12px' }}>SKU</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ordered Qty</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cost Price</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const prodName = item.product?.name || item.productName || item.productId || 'Item';
                const prodSku = item.product?.sku || item.sku || '—';
                const qty = item.quantity || item.qty || 0;
                const price = parseFloat(item.unitPrice || item.costPrice || 0);
                const lineTotal = parseFloat(item.lineTotal || (qty * price));

                return (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                      {prodName}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-gray-500)' }}>
                      {prodSku}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                      {qty}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatCurrency(price)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
