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
    { key: 'invoiceNumber', label: 'Invoice #', render: (row) => row?.invoiceNumber || row?.id || '—' },
    { key: 'customer', label: 'Customer', render: (row) => row?.customer?.companyName || row?.customer?.name || row?.customerName || '—' },
    { key: 'salesOrder', label: 'Sales Order', render: (row) => row?.salesOrder?.orderNumber || (typeof row?.salesOrder === 'string' ? row.salesOrder : '—') },
    { key: 'total', label: 'Amount', render: (row) => `₹${parseFloat(row?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { key: 'paidAmount', label: 'Paid', render: (row) => {
        const paid = (parseFloat(row?.total || 0) - parseFloat(row?.balanceDue || 0));
        return `₹${Math.max(0, paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      }
    },
    { key: 'balanceDue', label: 'Balance', render: (row) => `₹${parseFloat(row?.balanceDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { key: 'dueDate', label: 'Due Date', render: (row) => {
        const d = row?.createdAt || row?.dueDate;
        return d ? new Date(d).toLocaleDateString() : '—';
      }
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row?.status || 'DRAFT'} /> }
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
          onClick={() => navigate('/finance/new')}
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
            onRowClick={(row) => navigate(`/finance/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
