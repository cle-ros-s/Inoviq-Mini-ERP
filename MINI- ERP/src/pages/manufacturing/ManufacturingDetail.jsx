import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as manufacturingService from '../../services/manufacturingService.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';
import { formatDate } from '../../utils/formatters.js';

export default function ManufacturingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    try {
      const data = manufacturingService.getManufacturingOrderById(id);
      if (data) {
        setOrder(data);
        setProduct(productService.getProduct(data.productId));
        setAvailability(manufacturingService.getMaterialAvailability(id) || []);
        setWorkOrders(manufacturingService.getWorkOrders(id) || []);
      } else {
        showError('MO not found');
      }
    } catch (e) {
      showError('Failed to load MO');
    }
  }, [id, refreshCounter]);

  const handleConfirm = () => {
    try {
      manufacturingService.confirmManufacturingOrder(id, currentUser?.userId);
      showSuccess('MO confirmed & reservations created');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Confirmation failed');
    }
  };

  const handleStart = () => {
    try {
      manufacturingService.startManufacturingOrder(id, currentUser?.userId);
      showSuccess('Production started');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Failed to start');
    }
  };

  const handleComplete = () => {
    try {
      manufacturingService.completeManufacturingOrder(id, currentUser?.userId);
      showSuccess('MO completed — stock updated!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Completion failed');
    }
  };

  const handleUpdateWoStatus = (woId, status) => {
    try {
      manufacturingService.updateWorkOrder(woId, { status }, currentUser?.userId);
      showSuccess(`Work Order marked as ${status}`);
      triggerRefresh();
    } catch (e) {
      showError(e.message);
    }
  };

  if (!order) return <div className="page-loading">Loading Manufacturing Order...</div>;

  const isDelayed = manufacturingService.isDelayed(order);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/manufacturing')}>Manufacturing Orders</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{order.id}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {order.id} — {product?.name || order.productId} (Qty: {order.qty})
            <StatusBadge status={order.status} />
            {isDelayed && <StatusBadge status="Delayed" />}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {order.status === 'Draft' && (
            <button className="btn btn-primary" onClick={handleConfirm}>Confirm MO</button>
          )}
          {order.status === 'Confirmed' && (
            <button className="btn btn-primary" onClick={handleStart}>Start Production</button>
          )}
          {order.status === 'In Progress' && (
            <button className="btn btn-primary" onClick={handleComplete}>Complete MO</button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/manufacturing')}>
            ← Back to List
          </button>
        </div>
      </div>

      <div className="detail-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Order Details</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">MO ID</span><span className="detail-value">{order.id}</span></div>
            <div className="detail-field"><span className="detail-label">Finished Product</span><span className="detail-value">{product?.name} ({order.productId})</span></div>
            <div className="detail-field"><span className="detail-label">Quantity to Produce</span><span className="detail-value">{order.qty} pcs</span></div>
            <div className="detail-field"><span className="detail-label">BoM ID</span><span className="detail-value">{order.bomId || 'N/A'}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card__header"><h3 className="card__title">Schedule & Assignment</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">Planned Target Date</span><span className="detail-value">{formatDate(order.plannedDate)}</span></div>
            <div className="detail-field"><span className="detail-label">Assignee</span><span className="detail-value">{order.assignee || 'Unassigned'}</span></div>
            <div className="detail-field"><span className="detail-label">Source</span><span className="detail-value">{order.sourceType || 'Manual'} {order.sourceProcurementId ? `(${order.sourceProcurementId})` : ''}</span></div>
            <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><StatusBadge status={order.status} /></span></div>
          </div>
        </div>
      </div>

      {/* Component Availability */}
      {availability.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card__header"><h3 className="card__title">Material Availability & Reservations</h3></div>
          <div className="card__body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Component Product</th>
                  <th>Required Qty</th>
                  <th>Available Qty</th>
                  <th>Shortage Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((c, i) => {
                  const compProd = productService.getProduct(c.productId);
                  return (
                    <tr key={i}>
                      <td><strong>{compProd?.name || c.productId}</strong></td>
                      <td>{c.required}</td>
                      <td>{c.available}</td>
                      <td style={{ color: c.shortage > 0 ? 'var(--color-error)' : 'inherit', fontWeight: c.shortage > 0 ? 600 : 'normal' }}>
                        {c.shortage}
                      </td>
                      <td>
                        <StatusBadge status={c.canFulfill ? 'Healthy' : 'Out of Stock'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Work Orders / Operations */}
      {workOrders.length > 0 && (
        <div className="card">
          <div className="card__header"><h3 className="card__title">Work Orders (Routings)</h3></div>
          <div className="card__body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>WO ID</th>
                  <th>Seq</th>
                  <th>Operation Name</th>
                  <th>Work Center</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map(wo => (
                  <tr key={wo.id}>
                    <td>{wo.id}</td>
                    <td>{wo.seq}</td>
                    <td><strong>{wo.name}</strong></td>
                    <td>{wo.workCenter}</td>
                    <td>{wo.duration} min</td>
                    <td><StatusBadge status={wo.status} /></td>
                    <td>
                      {wo.status !== 'Completed' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdateWoStatus(wo.id, 'Completed')}
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
