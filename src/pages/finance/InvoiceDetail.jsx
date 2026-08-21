import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, updateInvoice, recordPayment } from '../../services/financeService.js';
import Card from '../../components/ui/Card.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
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
      const data = await getInvoiceById(id);
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
        await updateInvoice(id, { status: 'Cancelled' });
        loadInvoice();
      } catch (error) {
        console.error('Error cancelling invoice', error);
      }
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await recordPayment(id, paymentAmount);
      setPaymentModalOpen(false);
      setPaymentAmount('');
      loadInvoice();
    } catch (error) {
      console.error('Error recording payment', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <button className="btn btn-icon" onClick={() => navigate('/finance/invoices')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Invoice {invoice.id}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="header-actions">
          {invoice.status !== 'Cancelled' && invoice.balance > 0 && (
            <button className="btn btn-primary" onClick={() => setPaymentModalOpen(true)}>
              <DollarSign size={16} /> Record Payment
            </button>
          )}
          {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && (
            <button className="btn btn-danger" onClick={handleCancelInvoice}>
              <XCircle size={16} /> Cancel Invoice
            </button>
          )}
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Card title="Invoice Details">
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Customer</span>
              <span className="detail-value">{invoice.customer}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Sales Order</span>
              <span className="detail-value">{invoice.salesOrder || '-'}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Due Date</span>
              <span className="detail-value">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Notes</span>
              <span className="detail-value">{invoice.notes || '-'}</span>
            </div>
          </Card>
          
          <Card title="Financial Summary">
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Total Amount</span>
              <span className="detail-value">${parseFloat(invoice.amount).toFixed(2)}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Amount Paid</span>
              <span className="detail-value text-success">${parseFloat(invoice.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label font-bold">Balance Due</span>
              <span className="detail-value text-danger">${parseFloat(invoice.balance || 0).toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </div>

      {paymentModalOpen && (
        <Modal 
          title="Record Payment" 
          isOpen={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)}
        >
          <form onSubmit={handleRecordPayment}>
            <div style={{ marginBottom: '1rem' }}>
              <p>Current Balance: <strong>${parseFloat(invoice.balance).toFixed(2)}</strong></p>
            </div>
            <Input
              label="Payment Amount"
              type="number"
              step="0.01"
              max={invoice.balance}
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
