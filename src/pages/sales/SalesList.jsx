import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as salesService from '../../services/salesService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { exportSalesOrders } from '../../utils/csvExport.js';
import { Eye, XCircle, Plus, ShoppingCart, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { useConfirm } from '../../hooks/useConfirm.js';

export default function SalesList() {
  const { hasPermission, currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await salesService.getSalesOrders();
      const rawList = Array.isArray(res) ? res : (res?.data || []);
      const enriched = rawList.map(so => ({
        ...so,
        id: so.id,
        orderNumber: so.orderNumber || so.id,
        grandTotal: parseFloat(so.total) || 0,
        customerName: so.customer?.companyName || so.customer?.name || 'Customer'
      }));
      setSales(enriched);
    } catch (e) {
      console.error('Failed to load sales orders from database:', e);
      setFetchError(e.message || 'Failed to load sales orders from database');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refreshCounter]);

  const handleCancel = async (order) => {
    if (await confirm({ title: 'Cancel Order', message: `Cancel sales order ${order.orderNumber}?` })) {
      try {
        await salesService.cancelSalesOrder(order.id);
        showSuccess('Sales order cancelled');
        triggerRefresh();
      } catch (e) {
        showError(e.message || 'Failed to cancel order');
      }
    }
  };

  const columns = [
    { 
      key: 'orderNumber', 
      label: 'SO Number', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
          {row.orderNumber}
        </span>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    {
      key: 'items', 
      label: 'Items Count',
      render: (row) => row.items?.length || row.lines?.length || 0
    },
    {
      key: 'grandTotal', 
      label: 'Total Value', 
      sortable: true,
      render: (row) => formatCurrency(row.grandTotal)
    },
    { 
      key: 'status', 
      label: 'Order Status', 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      key: 'createdAt', 
      label: 'Order Date', 
      render: (row) => formatDate(row.createdAt), 
      sortable: true 
    },
    {
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/sales/${row.id}`)}
            title="View Details"
          >
            <Eye size={15} />
          </button>
          {row.status === 'DRAFT' && (
            <button
              className="btn btn-ghost btn-sm text-error"
              onClick={() => handleCancel(row)}
              title="Cancel Order"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Sales Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Real-time customer sales orders from PostgreSQL
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/sales/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Sales Order
        </button>
      </div>

      {fetchError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fetchError}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchSales}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        searchable
        searchPlaceholder="Search order number or customer..."
        emptyTitle="No Sales Orders"
        emptyDescription="No sales orders have been created in the database yet."
        emptyAction={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/new')}>
            <Plus size={14} /> Create First Sales Order
          </button>
        }
        onExport={exportSalesOrders}
      />
    </div>
  );
}
