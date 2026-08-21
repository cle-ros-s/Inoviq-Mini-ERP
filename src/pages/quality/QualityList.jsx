import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import { getInspections, deleteInspection } from '../../services/qualityService';

const QualityList = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await getInspections();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setInspections(list);
    } catch (e) {
      setInspections([]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      deleteInspection(id);
      loadInspections();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'product', label: 'Product' },
    { key: 'inspector', label: 'Inspector' },
    { key: 'date', label: 'Date' },
    { 
      key: 'result', 
      label: 'Result',
      render: (value) => {
        let type = 'default';
        if (value === 'Passed') type = 'success';
        if (value === 'Failed') type = 'danger';
        if (value === 'Needs Rework') type = 'warning';
        return <StatusBadge status={value} type={type} />;
      }
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/quality/${item.id}`)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/quality/${item.id}/edit`)}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
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
          <h1 className="page-title">Quality Inspections</h1>
          <p className="page-subtitle">Manage product quality checks and defects</p>
        </div>
        <button
          onClick={() => navigate('/quality/new')}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          New Inspection
        </button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={inspections}
          searchPlaceholder="Search inspections..."
        />
      </Card>
    </div>
  );
};

export default QualityList;
