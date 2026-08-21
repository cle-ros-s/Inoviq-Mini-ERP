import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, RefreshCw } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import { getDeliveries } from '../../services/deliveryService';
import { formatDate } from '../../utils/formatters';

const DeliveryList = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await getDeliveries();
      const list = Array.isArray(data) ? data : (data?.data || []);
      const enriched = list.map(del => ({
        ...del,
        id: del.id,
        deliveryNumber: del.deliveryNumber || del.id,
        customerName: del.customer?.companyName || del.customer?.name || del.customerName || 'Customer',
        orderNumber: del.salesOrder?.orderNumber || del.salesOrder?.id || del.salesOrderId || '—'
      }));
      setDeliveries(enriched);
    } catch (error) {
      console.error('Failed to load deliveries', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'deliveryNumber', 
      label: 'Delivery #', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark, #8B5E3C)' }}>
          {row.deliveryNumber}
        </span>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'orderNumber', label: 'Sales Order', sortable: true },
    { 
      key: 'deliveryDate', 
      label: 'Scheduled Date', 
      sortable: true,
      render: (row) => formatDate(row.scheduledDate || row.deliveryDate || row.createdAt)
    },
    { 
      key: 'driver', 
      label: 'Driver / Carrier', 
      render: (row) => row.driverName || row.driver || 'Unassigned'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.status || 'SCHEDULED'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={(e) => { e.stopPropagation(); navigate(`/delivery/${row.id}`); }} 
            title="View Details"
          >
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Deliveries & Shipments</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500, #64748B)', margin: '4px 0 0 0' }}>
            Manage order dispatches, delivery tracking, and carrier status
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={loadDeliveries} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigate('/delivery/new')}
          >
            <Plus size={14} /> New Shipment
          </button>
        </div>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={deliveries} 
          loading={loading}
          searchable={true}
          searchPlaceholder="Search delivery number or customer..."
          emptyTitle="No Deliveries Found"
          emptyDescription="You haven't created any delivery shipments yet."
        />
      </Card>
    </div>
  );
};

export default DeliveryList;
