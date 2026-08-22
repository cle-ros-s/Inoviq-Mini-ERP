import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as bomService from '../../services/bomService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { Eye, Edit } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export default function BomList() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoms = async () => {
      setLoading(true);
      try {
        const data = await bomService.getBoms();
        const rawList = Array.isArray(data) ? data : (data?.data || []);
        const enriched = rawList.map(b => ({
          ...b,
          rawId: b.id,
          id: b.bomNumber || b.id,
          productName: b.product?.name || b.productId || 'N/A',
          components: b.items || b.components || [],
          operations: b.operations || [],
          status: b.status || 'ACTIVE'
        }));
        setBoms(enriched);
      } catch (e) {
        showError('Failed to load BoMs');
      } finally {
        setLoading(false);
      }
    };
    fetchBoms();
  }, [refreshCounter]);

  const columns = [
    { key: 'id', label: 'BoM ID', sortable: true },
    { key: 'productName', label: 'Finished Product', sortable: true },
    { key: 'version', label: 'Version' },
    { key: 'components', label: 'Components', render: (row) => row.components?.length || 0 },
    { key: 'operations', label: 'Operations', render: (row) => row.operations?.length || 0 },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/bom/${row.rawId || row.id}`)}
            title="View Details"
          >
            <Eye size={15} /> View
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/bom/${row.rawId || row.id}/edit`)}
            title="Edit BoM"
          >
            <Edit size={15} /> Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills of Materials (BoM)</h1>
          <p className="page-subtitle">Manage multi-level component breakdowns and operation routings</p>
        </div>
        <div>
          {hasPermission('bom', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/bom/new')}>
              + New BoM
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={boms}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search BoMs..."
      />
    </div>
  );
}
