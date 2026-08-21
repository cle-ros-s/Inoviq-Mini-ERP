import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as purchaseService from '../../services/purchaseService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { exportPurchaseOrders } from '../../utils/csvExport.js';
import { Eye, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function PurchaseList() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await purchaseService.getPurchaseOrders();
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      const enriched = rawList.map(po => ({
        ...po,
        id: po.id,
        poNumber: po.poNumber || po.id,
        vendorName: po.supplier?.companyName || po.supplier?.name || 'Supplier',
        itemsCount: (po.items?.length || po.lines?.length || 0),
        total: parseFloat(po.total) || 0
      }));
      setPurchases(enriched);
    } catch (e) {
      console.error('Failed to load purchase orders:', e);
      setFetchError(e.message || 'Failed to load purchase orders');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [refreshCounter]);

  const columns = [
    { 
      key: 'poNumber', 
      label: 'PO Number', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
          {row.poNumber}
        </span>
      )
    },
    { key: 'vendorName', label: 'Supplier', sortable: true },
    {
      key: 'itemsCount', 
      label: 'Items Count',
      render: (row) => row.itemsCount
    },
    {
      key: 'total', 
      label: 'Total Value', 
      sortable: true,
      render: (row) => formatCurrency(row.total)
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Order Date', render: (row) => formatDate(row.createdAt), sortable: true },
    {
      key: 'actions', 
      label: 'Actions',
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
    <div className="page-container" style={{ padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Purchase Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Real-time supplier purchase orders from PostgreSQL
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/purchase/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Purchase Order
        </button>
      </div>

      {fetchError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fetchError}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchPurchases}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        searchable
        searchPlaceholder="Search PO number or supplier..."
        emptyTitle="No Purchase Orders"
        emptyDescription="No purchase orders have been created in the database yet."
        emptyAction={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/purchase/new')}>
            <Plus size={14} /> Create First Purchase Order
          </button>
        }
        onExport={exportPurchaseOrders}
      />
    </div>
  );
}
