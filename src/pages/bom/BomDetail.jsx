import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as bomService from '../../services/bomService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';
import { ArrowLeft, FileText, Package } from 'lucide-react';

export default function BomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await bomService.getBomById(id);
        const data = res?.data || res;
        setBom(data);
      } catch (e) {
        showError('Failed to load Bill of Materials');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Bill of Materials...</div>;
  if (!bom) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Bill of Materials Not Found</div>;

  const bomNum = bom.bomNumber || bom.id;
  const productName = bom.product?.name || bom.productName || bom.productId || 'Finished Product';
  const productSku = bom.product?.sku || bom.sku || '—';
  const components = bom.items || bom.components || [];

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/bom')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Bill of Materials
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {bomNum}
            </h1>
            <StatusBadge status={bom.status || 'ACTIVE'} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--color-primary-dark)' }} /> BoM Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Finished Product:</span>
              <span style={{ fontWeight: 700 }}>{productName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Product SKU:</span>
              <span style={{ fontWeight: 600 }}>{productSku}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Total Components:</span>
              <span style={{ fontWeight: 700 }}>{components.length} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} style={{ color: 'var(--color-primary-dark)' }} /> Raw Material Components
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 12px' }}>#</th>
                <th style={{ padding: '8px 12px' }}>Component Product</th>
                <th style={{ padding: '8px 12px' }}>SKU</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Required Qty</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c, i) => {
                const compName = c.product?.name || c.productName || c.productId || 'Component';
                const compSku = c.product?.sku || c.sku || '—';
                const reqQty = c.quantity || c.qty || 0;

                return (
                  <tr key={c.id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', color: 'var(--color-gray-500)' }}>{i + 1}</td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-gray-900)' }}>{compName}</td>
                    <td style={{ padding: '12px', color: 'var(--color-gray-500)' }}>{compSku}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{reqQty}</td>
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
