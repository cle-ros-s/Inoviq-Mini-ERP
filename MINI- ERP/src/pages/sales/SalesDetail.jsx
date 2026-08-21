import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as salesService from '../../services/salesService.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

export default function SalesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    try {
      const so = salesService.getSalesOrderById(id);
      if (so) {
        setOrder(so);
        setSummary(salesService.getOrderSummary(id));
      } else {
        showError('Sales Order not found');
      }
    } catch (e) {
      showError('Failed to load Sales Order');
    }
  }, [id, refreshCounter]);

  const handleConfirm = () => {
    try {
      salesService.confirmSalesOrder(id, currentUser?.userId);
      showSuccess('Sales Order confirmed! Check stock reservations & procurement');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Confirmation failed');
    }
  };

  const handleDeliver = () => {
    try {
      const deliveries = order.lines.map(l => ({ lineId: l.id, productId: l.productId, qty: l.qty - (l.deliveredQty || 0) }));
      salesService.deliverSalesOrder(id, deliveries, currentUser?.userId);
      showSuccess('Products delivered & stock updated!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Delivery failed');
    }
  };

  if (!order) return <div className="page-loading">Loading Sales Order...</div>;

  const totals = summary?.totals || { subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/sales')}>Sales Orders</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{order.id}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {order.id} — Customer: {order.customerId || order.customerName}
            <StatusBadge status={order.status} />
            <StatusBadge status={order.deliveryStatus} />
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {order.status === 'Draft' && (
            <button className="btn btn-primary" onClick={handleConfirm}>Confirm Sales Order</button>
          )}
          {['Confirmed', 'Partially Delivered'].includes(order.status) && (
            <button className="btn btn-primary" onClick={handleDeliver}>Deliver Products</button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/sales')}>
            ← Back to List
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card__header"><h3 className="card__title">Order Line Items</h3></div>
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Ordered Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Delivered Qty</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines?.map((line, i) => {
                const prod = productService.getProduct(line.productId);
                const base = line.qty * line.unitPrice;
                const disc = base * ((line.discount || 0) / 100);
                const tax = (base - disc) * ((line.tax || 0) / 100);
                const lineTotal = base - disc + tax;
                return (
                  <tr key={i}>
                    <td><strong>{prod?.name || line.productId}</strong></td>
                    <td>{line.qty}</td>
                    <td>{formatCurrency(line.unitPrice)}</td>
                    <td>{line.discount || 0}%</td>
                    <td style={{ color: (line.deliveredQty || 0) >= line.qty ? 'var(--color-success)' : 'inherit', fontWeight: 600 }}>
                      {line.deliveredQty || 0} / {line.qty}
                    </td>
                    <td>{formatCurrency(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="card" style={{ width: '320px' }}>
          <div className="card__header"><h3 className="card__title">Order Summary</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">Subtotal</span><span className="detail-value">{formatCurrency(totals.subtotal)}</span></div>
            <div className="detail-field"><span className="detail-label">Total Discount</span><span className="detail-value" style={{ color: 'var(--color-error)' }}>-{formatCurrency(totals.discountTotal)}</span></div>
            <div className="detail-field"><span className="detail-label">Total Tax</span><span className="detail-value">{formatCurrency(totals.taxTotal)}</span></div>
            <div className="detail-field" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
              <span className="detail-label">Grand Total</span>
              <span className="detail-value price-highlight">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
