import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as purchaseService from '../../services/purchaseService.js';
import * as productService from '../../services/productService.js';
import { api } from '../../services/apiClient.js';
import { useToast } from '../../hooks/useToast.js';
import { Plus, Trash2, ShoppingCart, AlertCircle, RefreshCw, Building2, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function PurchaseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  // Real Database Lists
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Form Fields
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Suppliers from PostgreSQL
  const fetchSuppliers = async () => {
    setSuppliersLoading(true);
    setSuppliersError(null);
    try {
      const res = await api.get('/suppliers');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSuppliers(list);

      const prefilledId = searchParams.get('supplierId') || searchParams.get('vendorId');
      if (prefilledId && list.some(s => s.id === prefilledId)) {
        setSupplierId(prefilledId);
      } else if (list.length > 0 && !supplierId) {
        setSupplierId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setSuppliersError('Unable to load suppliers from database.');
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // 2. Fetch Products from PostgreSQL
  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await productService.getProductsWithInventory();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProductsError('Unable to load products from database.');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // 3. Line Items Management
  const createBlankLine = (initialProd = null) => {
    const p = initialProd || products[0];
    const costPrice = p ? (parseFloat(p.costPrice) || 0) : 0;
    return {
      key: `line-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      productId: p ? p.id : '',
      sku: p ? p.sku : '',
      quantity: 1,
      costPrice: costPrice,
      lineTotal: costPrice
    };
  };

  useEffect(() => {
    if (lines.length === 0 && products.length > 0) {
      setLines([createBlankLine(products[0])]);
    }
  }, [products]);

  const addLine = () => {
    setLines(prev => [...prev, createBlankLine(products[0])]);
  };

  const removeLine = (lineKey) => {
    setLines(prev => prev.filter(l => l.key !== lineKey));
  };

  const handleProductSelect = (lineKey, newProdId) => {
    const selected = products.find(p => p.id === newProdId);
    const costPrice = selected ? (parseFloat(selected.costPrice) || 0) : 0;

    setLines(prev => prev.map(line => {
      if (line.key === lineKey) {
        const qty = parseInt(line.quantity, 10) || 1;
        return {
          ...line,
          productId: newProdId,
          sku: selected ? selected.sku : '',
          costPrice,
          lineTotal: qty * costPrice
        };
      }
      return line;
    }));
  };

  const handleQuantityChange = (lineKey, val) => {
    const qty = Math.max(1, parseInt(val, 10) || 1);
    setLines(prev => prev.map(line => {
      if (line.key === lineKey) {
        return {
          ...line,
          quantity: qty,
          lineTotal: qty * (parseFloat(line.costPrice) || 0)
        };
      }
      return line;
    }));
  };

  const handleCostPriceChange = (lineKey, val) => {
    const price = Math.max(0, parseFloat(val) || 0);
    setLines(prev => prev.map(line => {
      if (line.key === lineKey) {
        return {
          ...line,
          costPrice: price,
          lineTotal: (parseInt(line.quantity, 10) || 1) * price
        };
      }
      return line;
    }));
  };

  const grandTotal = lines.reduce((acc, l) => acc + (parseFloat(l.lineTotal) || 0), 0);

  // 4. Submit to PostgreSQL Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      showError('Please select a supplier from the dropdown box');
      return;
    }
    if (lines.length === 0) {
      showError('Please add at least one line item');
      return;
    }

    const invalid = lines.find(l => !l.productId);
    if (invalid) {
      showError('Please select a product for all line items');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId,
        expectedDate: expectedDate || null,
        notes: notes || null,
        items: lines.map(l => ({
          productId: l.productId,
          quantity: parseInt(l.quantity, 10),
          costPrice: parseFloat(l.costPrice)
        }))
      };

      const po = await purchaseService.createPurchaseOrder(payload);
      showSuccess('Purchase Order created successfully in PostgreSQL!');
      navigate(`/purchase/${po.id || po.poNumber || ''}`);
    } catch (err) {
      console.error('PO creation error:', err);
      showError(err.message || 'Failed to create Purchase Order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button 
              type="button" 
              className="breadcrumb-link" 
              onClick={() => navigate('/purchase')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
            >
              Purchase Orders
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Purchase Order</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--color-gray-900)' }}>
            New Purchase Order
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SUPPLIER CARD */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} /> Supplier Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Select Supplier <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>

              {suppliersLoading ? (
                <div style={{ height: '38px', display: 'flex', alignItems: 'center', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                  Loading suppliers...
                </div>
              ) : suppliers.length === 0 ? (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderRadius: '4px', fontSize: '13px' }}>
                  No suppliers found in database.
                </div>
              ) : (
                <select
                  className="select"
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select a Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.supplierCode}) {s.phone ? `| ${s.phone}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Expected Delivery Date
              </label>
              <input
                type="date"
                className="input"
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ITEM DETAILS CARD */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: 'var(--color-primary)' }} /> Item Details
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="btn btn-secondary btn-sm"
              disabled={products.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          {productsLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
              Loading products from database...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No products available in database.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/products/new')}>
                Create First Product
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
              No line items. Click "+ Add Line Item" above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 3fr) 100px 140px 140px 40px', gap: '12px', padding: '0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-600)', textTransform: 'uppercase' }}>
                <div>Select Product</div>
                <div style={{ textAlign: 'center' }}>Quantity</div>
                <div style={{ textAlign: 'right' }}>Cost Price (₹)</div>
                <div style={{ textAlign: 'right' }}>Line Total</div>
                <div></div>
              </div>

              {lines.map((line, index) => (
                <div
                  key={line.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 3fr) 100px 140px 140px 40px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Product Dropdown */}
                  <div>
                    <select
                      className="select"
                      value={line.productId}
                      onChange={e => handleProductSelect(line.key, e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Select a Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — ₹{(parseFloat(p.costPrice) || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="input"
                      value={line.quantity}
                      onChange={e => handleQuantityChange(line.key, e.target.value)}
                      required
                      style={{ textAlign: 'center', fontWeight: 600 }}
                    />
                  </div>

                  {/* Cost Price Input */}
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="input"
                      value={line.costPrice}
                      onChange={e => handleCostPriceChange(line.key, e.target.value)}
                      required
                      style={{ textAlign: 'right', fontWeight: 600 }}
                    />
                  </div>

                  {/* Line Total */}
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-900)' }}>
                    {formatCurrency(line.lineTotal)}
                  </div>

                  {/* Delete Line */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeLine(line.key)}
                      style={{ color: 'var(--color-error)' }}
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NOTES & SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Order Notes / Terms
            </label>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Type supplier instructions or delivery notes..."
              style={{ width: '100%', height: '80px', padding: '8px 12px', resize: 'vertical' }}
            />
          </div>

          <div className="card" style={{ padding: '20px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border-strong)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--color-gray-600)' }}>
              <span>Total Items:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{lines.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-gray-900)' }}>Grand Total:</span>
              <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchase')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || lines.length === 0} style={{ minWidth: '180px' }}>
            {submitting ? 'Creating in Database...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
