import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import { getDeliveries, deleteDelivery } from '../../services/deliveryService';

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
      setDeliveries(list);
    } catch (error) {
      console.error('Failed to load deliveries', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      deleteDelivery(id);
      loadDeliveries();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'salesOrder', label: 'Order' },
    { key: 'deliveryDate', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { key: 'driver', label: 'Driver' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="text-gray-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); navigate(`/delivery/${row.id}`); }} title="View">
            <Eye size={18} />
          </button>
          <button className="text-gray-500 hover:text-green-600" onClick={(e) => { e.stopPropagation(); navigate(`/delivery/${row.id}/edit`); }} title="Edit">
            <Edit size={18} />
          </button>
          <button className="text-gray-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">Manage delivery tracking and driver assignments</p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => navigate('/delivery/new')}
        >
          <Plus size={14} />
          New Delivery
        </button>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={deliveries} 
          loading={loading}
          searchable={true}
          searchPlaceholder="Search deliveries..."
          emptyTitle="No Deliveries Found"
          emptyDescription="You haven't created any deliveries yet."
        />
      </Card>
    </div>
  );
};

export default DeliveryList;
