import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as manufacturingService from '../../services/manufacturingService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { exportManufacturingOrders } from '../../utils/csvExport.js';
import { Eye, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function ManufacturingList() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await manufacturingService.getManufacturingOrders();
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      const enriched = rawList.map(mo => ({
        ...mo,
        id: mo.id,
        productionNumber: mo.productionNumber || mo.id,
        productName: mo.product?.name || mo.productId || 'N/A',
        qty: mo.plannedQuantity || mo.qty || 0,
        bomId: mo.product?.bom?.bomNumber || mo.bom?.bomNumber || 'Standard BOM',
        status: mo.status || 'PLANNED',
        createdAt: mo.createdAt
      }));
      setOrders(enriched);
    } catch (e) {
      console.error('Failed to load manufacturing orders:', e);
      setFetchError(e.message || 'Failed to load manufacturing orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshCounter]);

  const columns = [
    { 
      key: 'productionNumber', 
      label: 'MO Number', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
          {row.productionNumber}
        </span>
      )
    },
    { key: 'productName', label: 'Product to Manufacture', sortable: true },
    { key: 'qty', label: 'Planned Qty', sortable: true },
    { key: 'bomId', label: 'BoM Reference' },
    {
      key: 'status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/manufacturing/${row.id}`)}
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
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Manufacturing Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Live production orders and work center schedules
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/manufacturing/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Production Order
        </button>
      </div>

      {fetchError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fetchError}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchOrders}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable
        searchPlaceholder="Search MO number or product..."
        emptyTitle="No Manufacturing Orders"
        emptyDescription="No production orders found in the database."
        emptyAction={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/manufacturing/new')}>
            <Plus size={14} /> Create Production Order
          </button>
        }
        onExport={exportManufacturingOrders}
      />
    </div>
  );
}
