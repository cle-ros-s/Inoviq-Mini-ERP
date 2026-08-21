import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/financeService.js';
import * as salesService from '../../services/salesService.js';
import { useRefresh } from '../../hooks/useRefresh.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { Receipt, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    customer: '',
    salesOrderId: '',
    salesOrder: '',
    amount: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    const loadSalesOrders = async () => {
      try {
        const res = await salesService.getSalesOrders();
        const list = Array.isArray(res) ? res : (res?.data || []);
        setSalesOrders(list);
      } catch (err) {
        console.error('Failed to load sales orders for invoice form:', err);
      }
    };
    loadSalesOrders();
  }, []);

  const handleSalesOrderSelect = (e) => {
    const selectedSoId = e.target.value;
    const selectedSo = salesOrders.find(so => so.id === selectedSoId || so.orderNumber === selectedSoId);

    if (selectedSo) {
      setFormData(prev => ({
        ...prev,
        salesOrderId: selectedSo.id,
        salesOrder: selectedSo.orderNumber || selectedSo.id,
        customerId: selectedSo.customerId || selectedSo.customer?.id || '',
        customer: selectedSo.customer?.companyName || selectedSo.customer?.name || prev.customer || 'General Client',
        amount: String(selectedSo.total || selectedSo.grandTotal || '10000')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        salesOrderId: selectedSoId,
        salesOrder: selectedSoId
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const finalCustomer = formData.customer.trim() || 'General Client';
      const finalAmount = parseFloat(formData.amount) || 10000;

      const payload = {
        salesOrderId: formData.salesOrderId || formData.salesOrder,
        salesOrder: formData.salesOrder,
        customerId: formData.customerId || finalCustomer,
        customer: finalCustomer,
        amount: finalAmount,
        dueDate: formData.dueDate,
        notes: formData.notes,
        status: formData.status
      };

      const res = await createInvoice(payload);
      triggerRefresh();
      showSuccess('Invoice created successfully!');

      const createdId = res?.data?.id || res?.id;
      if (createdId) {
        navigate(`/finance/${createdId}`);
      } else {
        navigate('/finance');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      const msg = error.message || 'Failed to create invoice. Please check parameters.';
      setErrorMessage(msg);
      showError(msg);
      setLoading(false);
    }
  };

  const statuses = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Issued / Sent', value: 'SENT' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Paid in Full', value: 'PAID' }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '800px', padding: '24px 16px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/finance')} style={{ background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
              Finance & Invoices
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Invoice</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Create Customer Invoice</h1>
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '6px', color: '#991B1B', fontSize: '13.5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} style={{ color: '#EF4444' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-900)' }}>
            <Receipt size={20} style={{ color: 'var(--color-primary-dark)' }} /> Billing & Order Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Sales Order Selection Dropdown (Optional Link) */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Link Sales Order (Optional)
              </label>
              <select
                value={formData.salesOrderId}
                onChange={handleSalesOrderSelect}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #CBD5E1)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="">-- Direct Invoice / Custom Sales Order --</option>
                {salesOrders.map(so => (
                  <option key={so.id} value={so.id}>
                    {so.orderNumber || so.id} - {so.customer?.companyName || so.customerName || 'Customer'} (₹{(so.total || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Customer Name *"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="e.g. Modern Living Spaces..."
              required
            />

            <Input
              label="Invoice Amount (₹) *"
              type="number"
              min="0"
              step="any"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 25000..."
              required
            />

            <Input
              label="Payment Due Date *"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Invoice Status
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {statuses.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: s.value }))}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: formData.status === s.value ? '2px solid var(--color-primary-dark, #8B5E3C)' : '1px solid var(--color-border, #E2E8F0)',
                    backgroundColor: formData.status === s.value ? 'rgba(139, 94, 60, 0.1)' : '#FFFFFF',
                    color: formData.status === s.value ? 'var(--color-primary-dark, #8B5E3C)' : 'var(--color-gray-700, #475569)',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Textarea
              label="Invoice Remarks & Payment Terms"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter bank transfer instructions, payment terms, or remarks..."
              rows={3}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/finance')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} /> {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
