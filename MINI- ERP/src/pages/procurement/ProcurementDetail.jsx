import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as procurementService from '../../services/procurementService.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ProcurementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [proc, setProc] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    try {
      const data = procurementService.getProcurementById(id);
      if (data) {
        setProc(data);
        setProduct(productService.getProduct(data.productId));
      } else {
        showError('Procurement Request not found');
      }
    } catch (e) {
      showError('Failed to load Procurement Request');
    }
  }, [id]);

  if (!proc) return <div className="page-loading">Loading Procurement Request...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/procurement')}>Procurement Requests</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{proc.id}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {proc.id} — {product?.name || proc.productId}
            <StatusBadge status={proc.status} />
          </h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/procurement')}>
          ← Back to List
        </button>
      </div>

      <div className="detail-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Request Summary</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">Request ID</span><span className="detail-value">{proc.id}</span></div>
            <div className="detail-field"><span className="detail-label">Product</span><span className="detail-value">{product?.name} ({proc.productId})</span></div>
            <div className="detail-field"><span className="detail-label">Procurement Type</span><span className="detail-value"><span className="badge">{proc.procurementType}</span></span></div>
            <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><StatusBadge status={proc.status} /></span></div>
          </div>
        </div>

        <div className="card">
          <div className="card__header"><h3 className="card__title">Quantities & Triggered Document</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">Required Qty</span><span className="detail-value">{proc.requiredQty}</span></div>
            <div className="detail-field"><span className="detail-label">Shortage Qty</span><span className="detail-value" style={{ color: 'var(--color-error)', fontWeight: 600 }}>{proc.shortageQty}</span></div>
            <div className="detail-field"><span className="detail-label">Source Document</span><span className="detail-value">{proc.sourceType} {proc.sourceId}</span></div>
            <div className="detail-field"><span className="detail-label">Generated Order</span><span className="detail-value">{proc.targetId || 'N/A'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
