import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/financeService.js';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { Receipt } from 'lucide-react';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    salesOrder: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'Draft'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      const res = await createInvoice(payload);
      navigate(`/finance/invoices/${res.id || ''}`);
    } catch (error) {
      console.error('Failed to create invoice', error);
      setLoading(false);
    }
  };

  const statuses = ['Draft', 'Sent', 'Partially Paid', 'Paid'];

  return (
    <div className="page-container" style={{ maxWidth: '800px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/finance')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Finance & Invoices
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Invoice</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Create Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} style={{ color: 'var(--color-primary)' }} /> Billing Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Customer Name"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="Type customer name..."
              required
            />
            <Input
              label="Sales Order Reference"
              name="salesOrder"
              value={formData.salesOrder}
              onChange={handleChange}
              placeholder="Type SO number (e.g. SO-000001)..."
              required
            />
            <Input
              label="Invoice Amount (₹)"
              type="number"
              min="0"
              step="any"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Type total amount in INR..."
              required
            />
            <Input
              label="Due Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Invoice Status
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {statuses.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: formData.status === s ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: formData.status === s ? 'var(--color-primary-surface)' : '#FFFFFF',
                    color: formData.status === s ? 'var(--color-primary-dark)' : 'var(--color-gray-700)',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Textarea
              label="Invoice Notes / Payment Instructions"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Type bank account details, terms, or remarks..."
              rows={3}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/finance')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
