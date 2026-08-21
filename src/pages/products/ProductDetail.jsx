import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import { useToast } from '../../hooks/useToast.js';
import * as productService from '../../services/productService.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { ArrowLeft, Edit, Package } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const p = await productService.getProductWithInventory(id);
        if (p) {
          setProduct(p);
        } else {
          showError('Product not found');
        }
      } catch (e) {
        showError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, refreshCounter]);

  if (loading) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Product not found</div>;

  const canEdit = hasPermission('products', 'full');
  const inv = product.inventory || product;
  const onHand = product.onHandQuantity !== undefined ? product.onHandQuantity : (inv.onHand ?? inv.quantity ?? 0);
  const salesPrice = parseFloat(product.salesPrice || 0);
  const costPrice = parseFloat(product.costPrice || 0);
  const marginPct = salesPrice > 0 ? Math.round(((salesPrice - costPrice) / salesPrice) * 100) : 0;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/products')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Products
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {product.name}
            </h1>
            <span className="badge" style={{ backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-700)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
              {product.sku}
            </span>
            <StatusBadge status={product.active !== false ? 'Active' : 'Inactive'} />
          </div>
        </div>
        <div>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => navigate(`/products/${id}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit size={16} /> Edit Product
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Product Info */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: 'var(--color-primary-dark)' }} /> General Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>SKU:</span>
              <span style={{ fontWeight: 600 }}>{product.sku}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Category:</span>
              <span>{product.category?.name || product.category || 'Standard'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Description:</span>
              <span style={{ textAlign: 'right', maxWidth: '200px' }}>{product.description || '—'}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Pricing & Stock Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Sales Price:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '16px' }}>{formatCurrency(salesPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Cost Price:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(costPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Gross Margin:</span>
              <span style={{ fontWeight: 600, color: marginPct > 20 ? 'var(--color-success)' : 'inherit' }}>{marginPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Stock On Hand:</span>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{onHand} units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
