import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as manufacturingService from '../../services/manufacturingService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { exportManufacturingOrders } from '../../utils/csvExport.js';
import { Eye } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function ManufacturingList() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = manufacturingService.getManufacturingOrders();
      const prods = productService.getProducts();
      const prodMap = {};
      prods.forEach(p => prodMap[p.id] = p);

      const enriched = (data || []).map(mo => ({
        ...mo,
        productName: prodMap[mo.productId]?.name || mo.productId,
        isDelayed: manufacturingService.isDelayed(mo),
      }));
      setOrders(enriched);
    } catch (e) {
      showError('Failed to load Manufacturing Orders');
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const columns = [
    { key: 'id', label: 'MO ID', sortable: true },
    { key: 'productName', label: 'Product', sortable: true },
    { key: 'qty', label: 'Qty', sortable: true },
    { key: 'bomId', label: 'BoM ID' },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <StatusBadge status={row.status} />
          {row.isDelayed && <StatusBadge status="Delayed" />}
        </div>
      )
    },
    {
      key: 'plannedDate', label: 'Planned Target Date', sortable: true,
      render: (row) => (
        <span style={{ color: row.isDelayed ? 'var(--color-error)' : 'inherit', fontWeight: row.isDelayed ? 600 : 'normal' }}>
          {formatDate(row.plannedDate)}
        </span>
      )
    },
    { key: 'assignee', label: 'Assignee' },
    {
      key: 'actions', label: 'Actions',
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manufacturing Orders</h1>
          <p className="page-subtitle">Track shop floor production, component reservations, and work orders</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportManufacturingOrders(orders)}>
            Export CSV
          </button>
          {hasPermission('manufacturing', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/manufacturing/new')}>
              + New MO
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search MOs..."
        onExport={() => exportManufacturingOrders(orders)}
      />
    </div>
  );
}
