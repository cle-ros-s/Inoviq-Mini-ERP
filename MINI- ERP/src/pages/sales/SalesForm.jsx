import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as salesService from '../../services/salesService.js';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function SalesForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);

  useEffect(() => {
    try {
      const prods = productService.getProductsWithInventory();
      setProducts(prods || []);
      const custs = productService.getProducts ? (window.localStorage.getItem('sfw:customers') ? JSON.parse(window.localStorage.getItem('sfw:customers')) : []) : [];
      setCustomers(custs);
      if (custs.length > 0) setCustomerId(custs[0].id);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addLine = () => {
    const firstProd = products[0];
    setLines([
      ...lines,
      {
        id: 'SOL-' + (lines.length + 1),
        productId: firstProd?.id || '',
        qty: 1,
        unitPrice: firstProd?.salesPrice || 0,
        discount: 0,
        tax: 18
      }
    ]);
  };

  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));
  
  const updateLine = (idx, field, val) => {
    const newLines = [...lines];
    newLines[idx][field] = val;
    if (field === 'productId') {
      const p = products.find(x => x.id === val);
      if (p) newLines[idx].unitPrice = p.salesPrice;
    }
    setLines(newLines);
  };

  const calculateTotals = () => {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    lines.forEach(line => {
      const lineBase = line.qty * line.unitPrice;
      const lineDisc = lineBase * ((line.discount || 0) / 100);
      const lineTax = (lineBase - lineDisc) * ((line.tax || 0) / 100);
      subtotal += lineBase;
      discountTotal += lineDisc;
      taxTotal += lineTax;
    });
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lines.length === 0) {
      showError('Please add at least one line item');
      return;
    }
    try {
      const so = salesService.createSalesOrder({
        customerId: customerId || 'CUST-0001',
        lines,
        notes
      }, currentUser?.userId);
      showSuccess('Sales Order created successfully!');
      navigate(`/sales/${so.id}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/sales')}>Sales Orders</button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Sales Order</span>
          </div>
          <h1 className="page-title">New Sales Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card__header"><h3 className="card__title">Customer & Notes</h3></div>
          <div className="card__body detail-fields">
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select
                className="select"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Order Notes / Delivery Instructions</label>
              <textarea
                className="input"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional order notes..."
              />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card__title">Line Items</h3>
            <button type="button" onClick={addLine} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add Product Line
            </button>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {lines.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                No line items added yet. Click "+ Add Product Line" above.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ width: '100px' }}>Qty</th>
                    <th style={{ width: '130px' }}>Unit Price (₹)</th>
                    <th style={{ width: '100px' }}>Discount %</th>
                    <th style={{ width: '100px' }}>GST Tax %</th>
                    <th>Line Total</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => {
                    const lineBase = line.qty * line.unitPrice;
                    const lineDisc = lineBase * ((line.discount || 0) / 100);
                    const lineTax = (lineBase - lineDisc) * ((line.tax || 0) / 100);
                    const lineTotal = lineBase - lineDisc + lineTax;
                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            className="select"
                            value={line.productId}
                            onChange={e => updateLine(idx, 'productId', e.target.value)}
                            required
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} [{p.sku}] (Free: {p.inventory?.freeToUse ?? 0})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={line.qty}
                            onChange={e => updateLine(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="input"
                            value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="input"
                            value={line.discount}
                            onChange={e => updateLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="input"
                            value={line.tax}
                            onChange={e => updateLine(idx, 'tax', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(lineTotal)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeLine(idx)}
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Totals & Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Sales Order
            </button>
          </div>

          <div className="card" style={{ width: '300px' }}>
            <div className="card__body detail-fields">
              <div className="detail-field"><span className="detail-label">Subtotal</span><span className="detail-value">{formatCurrency(totals.subtotal)}</span></div>
              <div className="detail-field"><span className="detail-label">Discount</span><span className="detail-value" style={{ color: 'var(--color-error)' }}>-{formatCurrency(totals.discountTotal)}</span></div>
              <div className="detail-field"><span className="detail-label">GST Tax</span><span className="detail-value">{formatCurrency(totals.taxTotal)}</span></div>
              <div className="detail-field" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                <span className="detail-label">Grand Total</span>
                <span className="detail-value price-highlight">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
