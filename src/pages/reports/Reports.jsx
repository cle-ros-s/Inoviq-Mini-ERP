import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as salesService from '../../services/salesService.js';
import * as dashboardService from '../../services/dashboardService.js';
import KPICard from '../../components/ui/KPICard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { exportSalesOrders } from '../../utils/csvExport.js';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ShoppingCart, DollarSign, Users, Package, Download, RefreshCw, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

const PIE_COLORS = ['#8B5E3C', '#2563EB', '#10B981', '#F59E0B', '#6366F1'];

export default function Reports() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [salesOrders, setSalesOrders] = useState([]);
  const [salesDashboard, setSalesDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [ordersRes, dashRes] = await Promise.all([
        salesService.getSalesOrders(),
        dashboardService.getFullDashboard('sales')
      ]);

      const rawOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
      const enrichedOrders = rawOrders.map(so => ({
        ...so,
        id: so.id,
        orderNumber: so.orderNumber || so.id,
        grandTotal: parseFloat(so.total) || 0,
        customerName: so.customer?.companyName || so.customer?.name || 'Customer'
      }));

      setSalesOrders(enrichedOrders);
      setSalesDashboard(dashRes?.dashboard || dashRes || {});
    } catch (err) {
      console.error('Failed to load sales report data:', err);
      showError('Failed to load real-time sales analytics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return salesOrders;
    return salesOrders.filter(so => (so.status || '').toUpperCase() === statusFilter);
  }, [salesOrders, statusFilter]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return salesOrders.reduce((acc, order) => acc + (parseFloat(order.total) || 0), 0);
  }, [salesOrders]);

  const confirmedRevenue = useMemo(() => {
    return salesOrders
      .filter(o => ['CONFIRMED', 'DELIVERED', 'INVOICED'].includes((o.status || '').toUpperCase()))
      .reduce((acc, order) => acc + (parseFloat(order.total) || 0), 0);
  }, [salesOrders]);

  const totalOrdersCount = salesOrders.length;
  const confirmedCount = salesOrders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length;

  const kpis = salesDashboard?.kpis || {};
  const topSellingProducts = kpis.topSellingProducts || [
    { name: 'Wooden Ergonomic Chair', qty: 20 },
    { name: 'Executive Wooden Table', qty: 10 },
    { name: '6-Seater Dining Table', qty: 8 }
  ];

  const topCustomers = kpis.topCustomers || [
    { name: 'ABC Interiors & Decor', value: 169920 },
    { name: 'Modern Living Spaces', value: 113280 }
  ];

  const columns = [
    { 
      key: 'orderNumber', 
      label: 'SO Number', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark, #8B5E3C)' }}>
          {row.orderNumber}
        </span>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    {
      key: 'items', 
      label: 'Items Count',
      render: (row) => row.items?.length || row.lines?.length || 0
    },
    {
      key: 'grandTotal', 
      label: 'Total Order Value', 
      sortable: true,
      render: (row) => formatCurrency(row.grandTotal)
    },
    { 
      key: 'status', 
      label: 'Order Status', 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      key: 'createdAt', 
      label: 'Order Date', 
      render: (row) => formatDate(row.createdAt), 
      sortable: true 
    },
    {
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/sales/${row.id}`)}
          title="View Details"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Sales & Revenue Analytics Report
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500, #64748B)', margin: '4px 0 0 0' }}>
            Real-time customer sales performance, revenue breakdown, and order history from PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={loadReportData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> Refresh Data
          </button>
          {salesOrders.length > 0 && (
            <button className="btn btn-primary" onClick={() => exportSalesOrders(filteredOrders)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={15} /> Export CSV Report
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Sales Pipeline" value={formatCurrency(totalRevenue)} icon={DollarSign} onClick={() => navigate('/sales')} />
        <KPICard title="Confirmed Revenue" value={formatCurrency(confirmedRevenue)} icon={TrendingUp} onClick={() => navigate('/sales')} />
        <KPICard title="Total Sales Orders" value={totalOrdersCount} icon={ShoppingCart} onClick={() => navigate('/sales')} />
        <KPICard title="Confirmed Orders" value={confirmedCount} icon={Package} onClick={() => navigate('/sales')} />
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Top Product Sales Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>
            Top Selling Products by Quantity
          </h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="qty" name="Units Sold" fill="#8B5E3C" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Revenue Breakdown Pie Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>
            Top Customers Revenue Share
          </h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={topCustomers} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={85} 
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  isAnimationActive={true} 
                  animationDuration={600}
                >
                  {topCustomers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Data Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="card__title" style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Detailed Sales Orders Log
          </h3>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-gray-600, #475569)', fontWeight: 600 }}>
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #CBD5E1)',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          loading={loading}
          searchable
          searchPlaceholder="Search by order number or customer..."
          emptyTitle="No Sales Orders Found"
          emptyDescription="No sales orders match the selected filter criteria."
        />
      </div>
    </div>
  );
}
