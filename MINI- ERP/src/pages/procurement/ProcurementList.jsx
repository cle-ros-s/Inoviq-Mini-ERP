import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as procurementService from '../../services/procurementService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { Eye } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function ProcurementList() {
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = procurementService.getProcurements();
      const prods = productService.getProducts();
      const prodMap = {};
      prods.forEach(p => prodMap[p.id] = p);

      const enriched = (data || []).map(p => ({
        ...p,
        productName: prodMap[p.productId]?.name || p.productId,
      }));
      setProcurements(enriched);
    } catch (e) {
      showError('Failed to load Procurement Requests');
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const columns = [
    { key: 'id', label: 'PROC ID', sortable: true },
    { key: 'productName', label: 'Product', sortable: true },
    { key: 'shortageQty', label: 'Shortage Qty', sortable: true },
    { key: 'procurementType', label: 'Type' },
    {
      key: 'sourceId', label: 'Source',
      render: (row) => `${row.sourceType || 'Order'} (${row.sourceId || 'N/A'})`
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Created Date', render: (row) => formatDate(row.createdAt), sortable: true },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/procurement/${row.id}`)}
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
          <h1 className="page-title">Procurement Requests</h1>
          <p className="page-subtitle">Auto-generated replenishment requirements from Make-To-Order demand shortages</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={procurements}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search procurement requests..."
      />
    </div>
  );
}
