import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as bomService from '../../services/bomService.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function BomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [bom, setBom] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    try {
      const data = bomService.getBomById(id);
      if (data) {
        setBom(data);
        const prod = productService.getProduct(data.productId);
        setProduct(prod);
      } else {
        showError('BoM not found');
      }
    } catch (e) {
      showError('Failed to load BoM');
    }
  }, [id]);

  if (!bom) return <div className="page-loading">Loading BoM...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/bom')}>Bill of Materials</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{bom.id}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bom.id} — {product?.name || bom.productId}
            <StatusBadge status={bom.status} />
          </h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/bom')}>
          ← Back to BoM List
        </button>
      </div>

      <div className="detail-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card__header"><h3 className="card__title">BoM Overview</h3></div>
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">BoM ID</span><span className="detail-value">{bom.id}</span></div>
            <div className="detail-field"><span className="detail-label">Finished Product</span><span className="detail-value">{product?.name || bom.productId} ({bom.productId})</span></div>
            <div className="detail-field"><span className="detail-label">Version</span><span className="detail-value">v{bom.version || '1.0'}</span></div>
            <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><StatusBadge status={bom.status} /></span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card__header"><h3 className="card__title">Raw Material Components</h3></div>
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Component Product</th>
                <th>Required Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {bom.components?.map((c, i) => {
                const compProd = productService.getProduct(c.productId);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{compProd?.name || c.productId}</strong> <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-xs)' }}>({c.productId})</span></td>
                    <td style={{ fontWeight: 600 }}>{c.qty}</td>
                    <td>{c.unit || 'pcs'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card__header"><h3 className="card__title">Routing Operations</h3></div>
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Seq</th>
                <th>Operation Name</th>
                <th>Work Center</th>
                <th>Standard Duration</th>
              </tr>
            </thead>
            <tbody>
              {bom.operations?.map((op, i) => (
                <tr key={i}>
                  <td>{op.seq || i + 1}</td>
                  <td><strong>{op.name}</strong></td>
                  <td>{op.workCenter}</td>
                  <td>{op.duration} minutes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
