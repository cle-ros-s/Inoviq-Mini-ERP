import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as inventoryService from '../../services/inventoryService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { formatDate, formatRelativeTime } from '../../utils/formatters.js';
import { exportStockLedger } from '../../utils/csvExport.js';

export default function StockLedger() {
  const { refreshCounter } = useRefresh();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});

  useEffect(() => {
    setLoading(true);
    try {
      const prods = productService.getProducts();
      const prodMap = {};
      prods.forEach(p => prodMap[p.id] = p);
      setProducts(prodMap);

      const data = inventoryService.getStockLedger();
      setLedger(data || []);
    } catch (e) {
      console.error('Ledger load error:', e);
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const getRefLink = (row) => {
    if (!row.referenceId || row.referenceId === 'SEED') return row.referenceId || '-';
    const id = row.referenceId;
    let path = null;
    if (id.startsWith('SO-')) path = `/sales/${id}`;
    else if (id.startsWith('PO-')) path = `/purchase/${id}`;
    else if (id.startsWith('MO-')) path = `/manufacturing/${id}`;
    if (path) {
      return (
        <button
          className="btn-link"
          onClick={() => navigate(path)}
          style={{ color: 'var(--color-primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {id}
        </button>
      );
    }
    return id;
  };

  const columns = [
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: (row) => (
        <span title={new Date(row.createdAt).toLocaleString()}>
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      key: 'productId', label: 'Product',
      render: (row) => products[row.productId]?.name || row.productId
    },
    { key: 'movementType', label: 'Movement Type', sortable: true },
    {
      key: 'quantity', label: 'Quantity',
      render: (row) => (
        <span style={{ color: row.quantity < 0 ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
        </span>
      )
    },
    { key: 'onHandBefore', label: 'On Hand Before' },
    { key: 'onHandAfter', label: 'On Hand After' },
    { key: 'reservedBefore', label: 'Reserved Before' },
    { key: 'reservedAfter', label: 'Reserved After' },
    {
      key: 'referenceId', label: 'Reference',
      render: (row) => getRefLink(row)
    },
    { key: 'userId', label: 'User' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Ledger</h1>
          <p className="page-subtitle">Complete history of all stock movements</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportStockLedger(ledger)}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
            ← Back to Overview
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={ledger}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search ledger entries..."
        emptyTitle="No stock movements"
        emptyDescription="Stock ledger entries will appear here after transactions."
        onExport={() => exportStockLedger(ledger)}
        defaultPageSize={20}
      />
    </div>
  );
}
