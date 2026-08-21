import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as manufacturingService from '../../services/manufacturingService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';
import { formatDate } from '../../utils/formatters.js';
import { ArrowLeft, CheckCircle, Factory, Play, Package } from 'lucide-react';

export default function ManufacturingDetail() {
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
        const data = await manufacturingService.getManufacturingOrderById(id);
        if (data) {
          setOrder(data);
        } else {
          showError('Manufacturing order not found');
        }
      } catch (e) {
        showError('Failed to load Manufacturing Order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, refreshCounter]);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await manufacturingService.startManufacturingOrder(id);
      showSuccess('Production started');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Failed to start production');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await manufacturingService.completeManufacturingOrder(id);
      showSuccess('Production order completed & inventory stock updated!');
      triggerRefresh();
    } catch (e) {
      showError(e.message || 'Completion failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Manufacturing Order...</div>;
  if (!order) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Manufacturing Order Not Found</div>;

  const moNumber = order.moNumber || order.id;
  const productName = order.product?.name || order.productName || order.productId || 'Finished Product';
  const productSku = order.product?.sku || order.sku || '—';
  const qty = order.quantity || order.qty || 0;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/manufacturing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Manufacturing Orders
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {moNumber}
            </h1>
            <StatusBadge status={order.status || 'PLANNED'} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Created on {formatDate(order.createdAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['PLANNED', 'CONFIRMED', 'Draft', 'Confirmed'].includes(order.status) && (
            <button 
              className="btn btn-primary" 
              onClick={handleStart}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Play size={15} /> Start Production
            </button>
          )}
          {['IN_PROGRESS', 'In Progress'].includes(order.status) && (
            <button 
              className="btn btn-primary" 
              onClick={handleComplete}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle size={15} /> Complete Production
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Production Target Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={18} style={{ color: 'var(--color-primary-dark)' }} /> Production Target
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Finished Product:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{productName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Product SKU:</span>
              <span style={{ fontWeight: 600 }}>{productSku}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Quantity to Produce:</span>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{qty} units</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Order Metadata</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>MO Status:</span>
              <StatusBadge status={order.status || 'PLANNED'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Work Center:</span>
              <span style={{ fontWeight: 600 }}>Assembly & Woodworking</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Target Date:</span>
              <span>{formatDate(order.dueDate || order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
