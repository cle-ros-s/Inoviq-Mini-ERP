import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as inventoryService from '../../services/inventoryService.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { formatDate } from '../../utils/formatters.js';
import { exportStockLedger } from '../../utils/csvExport.js';
import { ArrowLeft, Download, RefreshCw, Layers, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

const formatMovementType = (typeStr) => {
  if (!typeStr) return 'Transaction';
  return typeStr.replace(/_/g, ' ');
};

export default function StockLedger() {
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await inventoryService.getLedger();
      const rawList = Array.isArray(data) ? data : (data?.data || []);

      const enriched = rawList.map(tx => {
        const isPositive = ['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType);
        return {
          ...tx,
          id: tx.id,
          date: tx.timestamp || tx.createdAt,
          productName: tx.product?.name || tx.productId,
          sku: tx.product?.sku || '',
          uom: tx.product?.unitOfMeasure || 'PCS',
          movementType: formatMovementType(tx.transactionType || tx.movementType),
          isPositive,
          displayQty: isPositive ? `+${tx.quantity}` : `-${tx.quantity}`,
          reference: tx.referenceId || tx.referenceType || 'Direct Transaction'
        };
      });

      setLedger(enriched);
    } catch (e) {
      console.error('Ledger load error:', e);
      setFetchError(e.message || 'Failed to load stock movements');
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [refreshCounter]);

  const getRefLink = (row) => {
    const ref = row.referenceId;
    if (!ref) return <span style={{ color: 'var(--color-gray-400)' }}>—</span>;

    let path = null;
    if (ref.startsWith('SO-') || row.referenceType === 'SALES_ORDER') path = `/sales/${ref}`;
    else if (ref.startsWith('PO-') || row.referenceType === 'PURCHASE_ORDER') path = `/purchase/${ref}`;
    else if (ref.startsWith('MO-') || row.referenceType === 'PRODUCTION_ORDER') path = `/manufacturing/${ref}`;

    if (path) {
      return (
        <button
          className="btn-link"
          onClick={() => navigate(path)}
          style={{ color: 'var(--color-primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, fontSize: '12px' }}
        >
          {ref}
        </button>
      );
    }
    return <span style={{ color: 'var(--color-gray-700)', fontSize: '12px' }}>{ref}</span>;
  };

  const columns = [
    {
      key: 'date', 
      label: 'Date & Time', 
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--color-gray-700)' }}>
          {formatDate(row.date)}
        </span>
      )
    },
    {
      key: 'productName', 
      label: 'Product', 
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{row.productName}</div>
          {row.sku && <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>SKU: {row.sku}</div>}
        </div>
      )
    },
    {
      key: 'movementType', 
      label: 'Movement Type', 
      sortable: true,
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: row.isPositive ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          color: row.isPositive ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {row.isPositive ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
          {row.movementType}
        </span>
      )
    },
    {
      key: 'quantity', 
      label: 'Quantity Changed', 
      sortable: true,
      render: (row) => (
        <span style={{ 
          color: row.isPositive ? 'var(--color-success)' : 'var(--color-error)', 
          fontWeight: 700,
          fontSize: '14px'
        }}>
          {row.displayQty} {row.uom}
        </span>
      )
    },
    {
      key: 'reference', 
      label: 'Reference / Source', 
      render: (row) => (
        <div>
          <div>{getRefLink(row)}</div>
          {row.referenceType && row.referenceType !== row.referenceId && (
            <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{row.referenceType}</div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/inventory')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Inventory
          </button>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={24} style={{ color: 'var(--color-primary)' }} /> Stock Ledger
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Audited audit trail of all warehouse stock movements and inventory transactions from PostgreSQL
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportStockLedger(ledger)}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={fetchLedger}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {fetchError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fetchError}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchLedger}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={ledger}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search product name, SKU, movement type, or reference..."
        emptyTitle="No stock movements"
        emptyDescription="Stock ledger entries will appear here after purchase receipts, sales deliveries, or manufacturing."
        onExport={() => exportStockLedger(ledger)}
        defaultPageSize={20}
      />
    </div>
  );
}
