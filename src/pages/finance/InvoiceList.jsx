import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../services/financeService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Card from '../../components/ui/Card.jsx';
import { Plus } from 'lucide-react';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'salesOrder', label: 'Sales Order' },
    { key: 'amount', label: 'Amount', render: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'paidAmount', label: 'Paid', render: (val) => `$${parseFloat(val || 0).toFixed(2)}` },
    { key: 'balance', label: 'Balance', render: (val) => `$${parseFloat(val || 0).toFixed(2)}` },
    { key: 'dueDate', label: 'Due Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage billing and accounts receivable</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/finance/invoices/new')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> New Invoice
        </button>
      </div>
      <Card>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading invoices...</div>
        ) : (
          <DataTable
            data={invoices}
            columns={columns}
            onRowClick={(row) => navigate(`/finance/invoices/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
