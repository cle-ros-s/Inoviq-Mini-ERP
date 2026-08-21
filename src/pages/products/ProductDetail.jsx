import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import { useToast } from '../../hooks/useToast.js';
import * as productService from '../../services/productService.js';
import * as inventoryService from '../../services/inventoryService.js';
import Tabs from '../../components/ui/Tabs.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, currentUser } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [inv, setInv] = useState(null);

  useEffect(() => {
    try {
      const p = productService.getProductWithInventory(id);
      if (p) {
        setProduct(p);
        setInv(p.inventory);
      }
    } catch (e) {
      showError('Failed to load product');
    }
  }, [id, refreshCounter]);

  if (!product) return <div className="page-loading">Loading product...</div>;

  const canEdit = hasPermission('products', 'full');

  const tabs = [
    {
      key: 'overview', label: 'Overview & Pricing',
      content: (
        <div className="detail-grid">
          <div className="card">
            <div className="card__header"><h3 className="card__title">Product Info</h3></div>
            <div className="card__body detail-fields">
              <div className="detail-field"><span className="detail-label">SKU</span><span className="detail-value">{product.sku}</span></div>
              <div className="detail-field"><span className="detail-label">Category</span><span className="detail-value">{product.category?.name || product.category || '—'}</span></div>
              <div className="detail-field"><span className="detail-label">Description</span><span className="detail-value">{product.description || '—'}</span></div>
              <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><StatusBadge status={product.active ? 'Active' : 'Inactive'} /></span></div>
            </div>
          </div>
          <div className="card">
            <div className="card__header"><h3 className="card__title">Pricing</h3></div>
            <div className="card__body detail-fields">
              <div className="detail-field"><span className="detail-label">Sales Price</span><span className="detail-value price-highlight">{formatCurrency(product.salesPrice)}</span></div>
              <div className="detail-field"><span className="detail-label">Cost Price</span><span className="detail-value">{formatCurrency(product.costPrice)}</span></div>
              <div className="detail-field"><span className="detail-label">Margin</span><span className="detail-value">{product.salesPrice > 0 ? Math.round(((product.salesPrice - product.costPrice) / product.salesPrice) * 100) : 0}%</span></div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'inventory', label: 'Inventory',
      content: (
        <div className="card">
          <div className="card__body">
            <div className="inventory-stats-grid">
              <div className="inv-stat">
                <div className="inv-stat__label">On Hand</div>
                <div className="inv-stat__value">{inv?.onHand ?? 0}</div>
              </div>
              <div className="inv-stat">
                <div className="inv-stat__label">Reserved</div>
                <div className="inv-stat__value" style={{ color: 'var(--color-warning)' }}>{inv?.reserved ?? 0}</div>
              </div>
              <div className="inv-stat">
                <div className="inv-stat__label">Free To Use</div>
                <div className="inv-stat__value" style={{ color: 'var(--color-success)' }}>{inv?.freeToUse ?? 0}</div>
              </div>
              <div className="inv-stat">
                <div className="inv-stat__label">Reorder Level</div>
                <div className="inv-stat__value">{product.reorderLevel ?? 0}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <StatusBadge status={inventoryService.getStockStatus(id)} />
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'procurement', label: 'Procurement Config',
      content: (
        <div className="card">
          <div className="card__body detail-fields">
            <div className="detail-field"><span className="detail-label">Strategy</span><span className="detail-value"><span className="badge">{product.procurementStrategy}</span></span></div>
            <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value"><span className="badge">{product.procurementType}</span></span></div>
            {product.vendorId && <div className="detail-field"><span className="detail-label">Vendor ID</span><span className="detail-value">{product.vendorId}</span></div>}
            {product.bomId && <div className="detail-field"><span className="detail-label">BoM ID</span><span className="detail-value"><button className="btn-link" onClick={() => navigate(`/bom/${product.bomId}`)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{product.bomId}</button></span></div>}
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/products')}>Products</button>
            <span className="breadcrumb-sep"> / </span>
            <span>{product.name}</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {product.name}
            <span className="badge badge-secondary">{product.sku}</span>
            <StatusBadge status={product.active ? 'Active' : 'Inactive'} />
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => navigate(`/products/${id}/edit`)}>
              Edit Product
            </button>
          )}
          {canEdit && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (window.confirm(`Deactivate ${product.name}?`)) {
                  try {
                    productService.deactivateProduct(id, currentUser?.userId);
                    showSuccess('Product deactivated');
                    navigate('/products');
                  } catch (e) { showError(e.message); }
                }
              }}
            >
              Deactivate
            </button>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
