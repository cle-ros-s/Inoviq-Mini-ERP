import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, updateInvoice, recordPayment } from '../../services/financeService.js';
import Card from '../../components/ui/Card.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { ArrowLeft, DollarSign, XCircle } from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const res = await getInvoiceById(id);
      const data = res?.data || res;
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      try {
        await updateInvoice(id, { status: 'CANCELLED' });
        loadInvoice();
      } catch (error) {
        console.error('Error cancelling invoice', error);
      }
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await recordPayment(id, parseFloat(paymentAmount));
      setPaymentModalOpen(false);
      setPaymentAmount('');
      loadInvoice();
    } catch (error) {
      console.error('Error recording payment', error);
    }
  };

  if (loading) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading invoice...</div>;
  if (!invoice) return <div className="page-loading" style={{ padding: '40px', textAlign: 'center' }}>Invoice not found</div>;

  const invNum = invoice.invoiceNumber || invoice.id;
  const customerName = invoice.customer?.companyName || invoice.customer?.name || invoice.customer || 'Customer';
  const soNum = invoice.salesOrder?.orderNumber || invoice.salesOrder?.id || invoice.salesOrder || '—';
  const totalAmount = parseFloat(invoice.amount || 0);
  const paidAmount = parseFloat(invoice.paidAmount || 0);
  const balance = Math.max(0, totalAmount - paidAmount);

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/finance')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Finance & Invoices
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {invNum}
            </h1>
            <StatusBadge status={invoice.status || 'UNPAID'} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Created on {formatDate(invoice.createdAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && balance > 0 && (
            <button className="btn btn-primary" onClick={() => setPaymentModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} /> Record Payment
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card title="Invoice Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Customer:</span>
              <span style={{ fontWeight: 700 }}>{customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Sales Order:</span>
              <span style={{ fontWeight: 600 }}>{soNum}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Due Date:</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </Card>
        
        <Card title="Financial Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Total Invoice Amount:</span>
              <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-primary-dark)' }}>{formatCurrency(totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>Amount Paid:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(paidAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Remaining Balance Due:</span>
              <span style={{ fontWeight: 700, fontSize: '16px', color: balance > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{formatCurrency(balance)}</span>
            </div>
          </div>
        </Card>
      </div>

      {paymentModalOpen && (
        <Modal 
          title="Record Payment" 
          isOpen={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)}
        >
          <form onSubmit={handleRecordPayment}>
            <div style={{ marginBottom: '1rem' }}>
              <p>Current Remaining Balance: <strong>{formatCurrency(balance)}</strong></p>
            </div>
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              max={balance}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
            <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
