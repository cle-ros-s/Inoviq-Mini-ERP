import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as purchaseService from '../../services/purchaseService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { exportPurchaseOrders } from '../../utils/csvExport.js';
import { Eye } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function PurchaseList() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = purchaseService.getPurchaseOrders();
      setPurchases(data || []);
    } catch (e) {
      showError('Failed to load Purchase Orders');
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const columns = [
    { key: 'id', label: 'PO ID', sortable: true },
    { key: 'vendorId', label: 'Vendor', sortable: true, render: (row) => row.vendorId || row.vendorName || 'N/A' },
    {
      key: 'lines', label: 'Items',
      render: (row) => row.lines?.length || 0
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'receiptStatus', label: 'Receipt Status', render: (row) => <StatusBadge status={row.receiptStatus} /> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt), sortable: true },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/purchase/${row.id}`)}
          title="View Details"
        >
          <Eye size={16} /> View
        </button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Procurement purchasing workflow & stock receipts from suppliers</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportPurchaseOrders(purchases)}>
            Export CSV
          </button>
          {hasPermission('purchase', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/purchase/new')}>
              + New Purchase Order
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search POs..."
        onExport={() => exportPurchaseOrders(purchases)}
      />
    </div>
  );
}
