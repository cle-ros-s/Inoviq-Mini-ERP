import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { Package, AlertCircle, AlertTriangle, DollarSign, Truck, ShoppingCart, Warehouse } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function InventoryDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ Register Product', path: '/products/new', primary: true },
    { label: 'View Stock Ledger', path: '/inventory/ledger', primary: false },
    { label: 'View All Products', path: '/products', primary: false },
    { label: 'Inventory Reorders', path: '/inventory', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Inventory & Warehouse Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Stock balances, warehouse utilization, incoming shipments, and reorder alerts.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Product SKUs" value={kpis.totalProducts} icon={Package} onClick={() => navigate('/products')} />
        <KPICard title="Total On-Hand Stock" value={kpis.totalStockQuantity} icon={Warehouse} onClick={() => navigate('/inventory')} />
        <KPICard title="Low Stock Items" value={kpis.lowStockItems} icon={AlertCircle} onClick={() => navigate('/inventory')} />
        <KPICard title="Out of Stock Items" value={kpis.outOfStockItems} icon={AlertTriangle} onClick={() => navigate('/inventory')} />
        <KPICard title="Incoming Purchase Stock" value={kpis.incomingStock} icon={Truck} onClick={() => navigate('/purchase')} />
        <KPICard title="Outgoing Sales Orders" value={kpis.outgoingStock} icon={ShoppingCart} onClick={() => navigate('/sales')} />
        <KPICard title="Total Stock Valuation" value={formatCurrency(kpis.stockValue)} icon={DollarSign} onClick={() => navigate('/inventory')} />
        <KPICard title="Warehouse Utilization" value={`${kpis.warehouseUtilization || 75}%`} icon={Warehouse} onClick={() => navigate('/inventory')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Available On-Hand Stock Levels</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onHand" name="On-Hand Quantity" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Inventory Stock Activity Feed" />
    </div>
  );
}
