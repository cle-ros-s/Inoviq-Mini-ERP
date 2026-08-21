import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { UserCheck, CheckCircle, Package, DollarSign, AlertCircle, ShoppingCart, Truck, Users, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5E3C'];

export default function AdminDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ Create User', path: '/users/new', primary: true },
    { label: 'System Configuration', path: '/settings', primary: false },
    { label: 'View Audit Trail', path: '/audit-logs', primary: false },
    { label: 'View All Products', path: '/products', primary: false }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Administrator & Business Overview
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. System-wide enterprise performance and operational metrics.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Users" value={kpis.totalUsers} icon={UserCheck} onClick={() => navigate('/users')} />
        <KPICard title="Active Accounts" value={kpis.activeUsers} icon={CheckCircle} onClick={() => navigate('/users')} />
        <KPICard title="Suspended Users" value={kpis.suspendedUsers} icon={AlertTriangle} onClick={() => navigate('/users')} />
        <KPICard title="Total Products" value={kpis.totalProducts} icon={Package} onClick={() => navigate('/products')} />
        <KPICard title="Total Customers" value={kpis.totalCustomers} icon={Users} onClick={() => navigate('/sales')} />
        <KPICard title="Total Suppliers" value={kpis.totalSuppliers} icon={Truck} onClick={() => navigate('/purchase')} />
        <KPICard title="Sales Orders" value={kpis.totalSalesOrders} icon={ShoppingCart} onClick={() => navigate('/sales')} />
        <KPICard title="Purchase Orders" value={kpis.totalPurchaseOrders} icon={Truck} onClick={() => navigate('/purchase')} />
        <KPICard title="Sales Revenue" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} onClick={() => navigate('/finance')} />
        <KPICard title="Pending Requisitions" value={kpis.pendingOrders} icon={AlertCircle} onClick={() => navigate('/sales')} />
        <KPICard title="Low Stock Alerts" value={kpis.lowStockProducts} icon={AlertCircle} onClick={() => navigate('/inventory')} />
        <KPICard title="Pending Approvals" value={kpis.pendingApprovals} icon={CheckCircle} onClick={() => navigate('/sales')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Sales Orders vs Purchase Orders</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.salesChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Order Count" fill="#3B82F6" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Warehouse Inventory Overview</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onHand" name="On Hand Stock" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Manufacturing Order Statuses</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.manufacturingChart || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} isAnimationActive={true} animationDuration={600}>
                  {(charts.manufacturingChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="System Audit Logs" />
    </div>
  );
}
