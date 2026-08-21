import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as inventoryService from '../../services/inventoryService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { exportInventory } from '../../utils/csvExport.js';
import { AlertTriangle } from 'lucide-react';

export default function InventoryOverview() {
  const { refreshCounter } = useRefresh();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.getInventoryOverview();
        setInventory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Inventory load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [refreshCounter]);

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');

  const columns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'onHand', label: 'On Hand', sortable: true },
    { key: 'reserved', label: 'Reserved', sortable: true },
    { key: 'freeToUse', label: 'Free To Use', sortable: true },
    { key: 'reorderLevel', label: 'Reorder Level', sortable: true },
    {
      key: 'status', label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Overview</h1>
          <p className="page-subtitle">{inventory.length} products tracked</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportInventory(inventory)}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/ledger')}>
            View Stock Ledger
          </button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: '6px', marginBottom: '16px' }}>
          <AlertTriangle size={16} />
          <span><strong>{lowStockItems.length} product(s)</strong> are low stock or out of stock and need attention.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={inventory}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search products..."
        emptyTitle="No inventory records"
        emptyDescription="Products will appear here once inventory is tracked."
        onExport={() => exportInventory(inventory)}
      />
    </div>
  );
}
