import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as manufacturingService from '../../services/manufacturingService.js';
import * as productService from '../../services/productService.js';
import { api } from '../../services/apiClient.js';
import { useToast } from '../../hooks/useToast.js';
import { useRefresh } from '../../hooks/useRefresh.js';
import QuantityInput from '../../components/ui/QuantityInput.jsx';
import { Factory } from 'lucide-react';

export default function ManufacturingForm() {
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await productService.getProductsWithInventory();
        const pList = Array.isArray(prodData) ? prodData : (prodData?.data || []);
        setProducts(pList);
        if (pList.length > 0) {
          setProductId(pList[0].id);
        }

        const bomRes = await api.get('/boms');
        const bList = Array.isArray(bomRes.data) ? bomRes.data : [];
        setBoms(bList);
      } catch (err) {
        console.error('Failed to load manufacturing meta:', err);
      }
    }
    loadData();
  }, []);

  const selectedBom = boms.find(b => b.productId === productId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      showError('Please select a product to manufacture from the dropdown box');
      return;
    }
    if (!selectedBom) {
      showError('This product does not have a Bill of Materials configured. Please create a BOM first.');
      return;
    }

    setLoading(true);
    try {
      const mo = await manufacturingService.createManufacturingOrder({
        productId,
        plannedQuantity: parseInt(plannedQuantity, 10) || 1
      });
      showSuccess('Production Order created successfully!');
      triggerRefresh();
      navigate(`/manufacturing/${mo.id || mo.productionNumber || ''}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '750px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/manufacturing')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Manufacturing Orders
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Order</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>New Production Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={18} style={{ color: 'var(--color-primary)' }} /> Production Plan
          </h3>

          {/* Product Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Select Product to Manufacture <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <select
              className="select"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <QuantityInput 
              label="Planned Quantity" 
              min={1} 
              value={plannedQuantity} 
              onChange={v => setPlannedQuantity(v)} 
            />

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Linked Active BOM
              </label>
              <div style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: selectedBom ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                color: selectedBom ? 'var(--color-success)' : 'var(--color-warning)',
                fontWeight: 600,
                fontSize: '13px'
              }}>
                {selectedBom ? `${selectedBom.bomNumber} (Active)` : '⚠ No BOM Found'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/manufacturing')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
            {loading ? 'Creating Order...' : 'Create Production Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
