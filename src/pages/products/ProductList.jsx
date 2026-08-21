import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import { useToast } from '../../hooks/useToast.js';
import { useConfirm } from '../../hooks/useConfirm.js';
import * as productService from '../../services/productService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { exportProducts } from '../../utils/csvExport.js';

export default function ProductList() {
  const { hasPermission } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductsWithInventory();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        showError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [refreshCounter]);

  const handleDelete = async (product) => {
    if (await confirm({ title: 'Delete Product', message: `Are you sure you want to delete ${product.name}?` })) {
      try {
        productService.deleteProduct(product.id);
        showSuccess('Product deleted');
        triggerRefresh();
      } catch (e) {
        showError(e.message || 'Deletion failed');
      }
    }
  };

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true,
      render: (row) => row.category?.name || row.category || 'N/A'
    },
    { key: 'salesPrice', label: 'Sales Price', render: (row) => formatCurrency(row.salesPrice), sortable: true },
    { key: 'costPrice', label: 'Cost Price', render: (row) => formatCurrency(row.costPrice), sortable: true },
    { key: 'onHand', label: 'On Hand', sortable: true },
    { key: 'reserved', label: 'Reserved', sortable: true },
    { key: 'freeToUse', label: 'Free To Use', sortable: true },
    { key: 'procurementStrategy', label: 'Strategy' },
    { key: 'procurementType', label: 'Type' },
    { key: 'active', label: 'Status', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const canDel = row.canDelete !== false;
        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/products/${row.id}`)}
              title="View Details"
            >
              <Eye size={15} />
            </button>
            {hasPermission('products', 'full') && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/products/${row.id}/edit`)}
                title="Edit Product"
              >
                <Edit size={15} />
              </button>
            )}
            {hasPermission('products', 'full') && canDel && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleDelete(row)}
                title="Delete Product"
                style={{ color: 'var(--color-error)' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage finished goods, raw materials, components & inventory strategy</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => exportProducts(products)}>
            Export CSV
          </button>
          {hasPermission('products', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
              + New Product
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search products by name, SKU, or category..."
        onExport={() => exportProducts(products)}
      />
    </div>
  );
}
