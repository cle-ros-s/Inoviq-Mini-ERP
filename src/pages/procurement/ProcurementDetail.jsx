import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as procurementService from '../../services/procurementService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';
import { ArrowLeft } from 'lucide-react';

export default function ProcurementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [proc, setProc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await procurementService.getProcurementById(id);
        const data = res?.data || res;
        setProc(data);
      } catch (e) {
        showError('Failed to load Procurement Request');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Procurement Request...</div>;
  if (!proc) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Procurement Request Not Found</div>;

  const reqId = proc.requestNumber || proc.id;
  const prodName = proc.product?.name || proc.productId || 'Product';
  const reqQty = proc.requiredQty || proc.quantity || 0;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/procurement')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Procurement Requests
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {reqId}
            </h1>
            <StatusBadge status={proc.status || 'PENDING'} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Request Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Target Product:</span>
              <span style={{ fontWeight: 700 }}>{prodName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Required Quantity:</span>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{reqQty} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Request Status:</span>
              <StatusBadge status={proc.status || 'PENDING'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
