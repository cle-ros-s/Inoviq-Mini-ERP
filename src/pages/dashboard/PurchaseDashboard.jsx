import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { FileText, Clock, CheckCircle, DollarSign, Truck, AlertCircle, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PurchaseDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ New Purchase Order', path: '/purchase/new', primary: true },
    { label: 'View Suppliers', path: '/purchase', primary: false },
    { label: 'Procurement Requests', path: '/procurement', primary: false },
    { label: 'Inventory Reorders', path: '/inventory', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Procurement & Vendor Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Raw material procurement, vendor purchase requisitions, and reorder levels.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Draft PO Requests" value={kpis.pendingPurchaseRequests} icon={FileText} onClick={() => navigate('/purchase')} />
        <KPICard title="Pending Deliveries" value={kpis.pendingPurchaseOrders} icon={Clock} onClick={() => navigate('/purchase')} />
        <KPICard title="Approved Purchase Orders" value={kpis.approvedPurchaseOrders} icon={CheckCircle} onClick={() => navigate('/purchase')} />
        <KPICard title="Procurement Value" value={formatCurrency(kpis.totalProcurementValue)} icon={DollarSign} onClick={() => navigate('/purchase')} />
        <KPICard title="Active Suppliers" value={kpis.activeSuppliers} icon={Truck} onClick={() => navigate('/purchase')} />
        <KPICard title="Products to Reorder" value={kpis.productsToReorder} icon={AlertCircle} onClick={() => navigate('/inventory')} />
        <KPICard title="Supplier Rating" value={`${kpis.supplierPerformance || 95}%`} icon={Award} onClick={() => navigate('/purchase')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* RECENT PURCHASES TABLE */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Recent Purchase Orders</h3>
        {(!kpis.recentPurchases || kpis.recentPurchases.length === 0) ? (
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>No purchase orders currently recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {kpis.recentPurchases.map((po, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-surface-secondary, #F8FAFC)', borderRadius: '6px', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>{po.poNumber}</strong> - <span style={{ color: 'var(--color-gray-700)' }}>{po.supplier}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(po.total)}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: po.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: po.status === 'CONFIRMED' ? '#059669' : '#D97706' }}>
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Purchase Order Status Breakdown</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.purchaseChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="PO Count" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Material Stock & Reorder Levels</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onHand" name="Available Stock" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Procurement Audit Log" />
    </div>
  );
}
