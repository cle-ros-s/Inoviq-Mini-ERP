import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as salesService from '../../services/salesService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { exportSalesOrders } from '../../utils/csvExport.js';
import { Eye, XCircle } from 'lucide-react';
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

  useEffect(() => {
    setLoading(true);
    try {
      const data = salesService.getSalesOrders();
      const enriched = (data || []).map(so => {
        const summary = salesService.getOrderSummary(so.id);
        return {
          ...so,
          grandTotal: summary?.totals?.grandTotal || 0,
          customerName: so.customerId || so.customerName || 'N/A'
        };
      });
      setSales(enriched);
    } catch (e) {
      showError('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const handleCancel = async (order) => {
    if (await confirm({ title: 'Cancel Order', message: `Cancel sales order ${order.id}?` })) {
      try {
        salesService.cancelSalesOrder(order.id, currentUser?.userId);
        showSuccess('Order cancelled');
        triggerRefresh();
      } catch (e) {
        showError(e.message || 'Failed to cancel order');
      }
    }
  };

  const columns = [
    { key: 'id', label: 'SO ID', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    {
      key: 'lines', label: 'Items',
      render: (row) => row.lines?.length || 0
    },
    {
      key: 'grandTotal', label: 'Total Value', sortable: true,
      render: (row) => formatCurrency(row.grandTotal)
    },
    { key: 'status', label: 'Order Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'deliveryStatus', label: 'Delivery Status', render: (row) => <StatusBadge status={row.deliveryStatus} /> },
    { key: 'createdAt', label: 'Created Date', render: (row) => formatDate(row.createdAt), sortable: true },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/sales/${row.id}`)}
            title="View Order Details"
          >
            <Eye size={15} />
          </button>
          {row.status === 'Draft' && hasPermission('sales', 'full') && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleCancel(row)}
              title="Cancel Draft Order"
              style={{ color: 'var(--color-error)' }}
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">Track demand, order reservations, and delivery fulfillment</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportSalesOrders(sales)}>
            Export CSV
          </button>
          {hasPermission('sales', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
              + New Sales Order
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search sales orders..."
        onExport={() => exportSalesOrders(sales)}
      />
    </div>
  );
}
