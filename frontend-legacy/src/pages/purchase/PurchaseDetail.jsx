import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as purchaseService from '../../services/purchaseService.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const po = purchaseService.getPurchaseOrderById(id);
      if (po) setOrder(po);
      else showError('PO not found');
    } catch (e) {
      showError('Failed to load PO');
    }
  }, [id, refreshCounter]);

  const handleConfirm = () => {
    try {
      purchaseService.confirmPurchaseOrder(id, currentUser?.userId);
      showSuccess('Purchase Order confirmed');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Confirmation failed');
    }
  };

  const handleReceive = () => {
    try {
      const receipts = order.lines.map(l => ({ lineId: l.id, productId: l.productId, qty: l.qty - (l.receivedQty || 0) }));
      purchaseService.receivePurchaseOrder(id, receipts, currentUser?.userId);
      showSuccess('Inventory received & stock updated!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Receive failed');
    }
  };

  if (!order) return <div className="page-loading">Loading Purchase Order...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/purchase')}>Purchase Orders</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{order.id}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {order.id} — Vendor: {order.vendorId || order.vendorName}
            <StatusBadge status={order.status} />
            <StatusBadge status={order.receiptStatus} />
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {order.status === 'Draft' && (
            <button className="btn btn-primary" onClick={handleConfirm}>Confirm PO</button>
          )}
          {['Confirmed', 'Partially Received'].includes(order.status) && (
            <button className="btn btn-primary" onClick={handleReceive}>Receive Stock</button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/purchase')}>
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
                <th>Cost Price</th>
                <th>Tax %</th>
                <th>Received Qty</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines?.map((line, i) => {
                const prod = productService.getProduct(line.productId);
                const lineTotal = line.qty * line.costPrice * (1 + (line.tax || 0) / 100);
                return (
                  <tr key={i}>
                    <td><strong>{prod?.name || line.productId}</strong></td>
                    <td>{line.qty}</td>
                    <td>{formatCurrency(line.costPrice)}</td>
                    <td>{line.tax || 0}%</td>
                    <td style={{ color: (line.receivedQty || 0) >= line.qty ? 'var(--color-success)' : 'inherit', fontWeight: 600 }}>
                      {line.receivedQty || 0} / {line.qty}
                    </td>
                    <td>{formatCurrency(lineTotal)}</td>
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
