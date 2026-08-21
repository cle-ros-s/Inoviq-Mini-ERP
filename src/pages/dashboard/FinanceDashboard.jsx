import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { DollarSign, FileText, CheckCircle, AlertCircle, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function FinanceDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ Create Invoice', path: '/finance/new', primary: true },
    { label: 'View Invoices List', path: '/finance', primary: false },
    { label: 'Sales Reports', path: '/reports', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Accounts & Finance Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Customer receivables, invoice status balances, overdue payments, and revenue totals.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Invoiced Value" value={formatCurrency(kpis.totalInvoiced)} icon={DollarSign} onClick={() => navigate('/finance')} />
        <KPICard title="Total Payments Received" value={formatCurrency(kpis.totalPaid)} icon={CheckCircle} onClick={() => navigate('/finance')} />
        <KPICard title="Outstanding Receivables" value={formatCurrency(kpis.totalUnpaid)} icon={AlertCircle} onClick={() => navigate('/finance')} />
        <KPICard title="Total Invoices Count" value={kpis.totalInvoicesCount} icon={FileText} onClick={() => navigate('/finance')} />
        <KPICard title="Overdue Invoices" value={kpis.overdueInvoicesCount} icon={AlertCircle} onClick={() => navigate('/finance')} />
        <KPICard title="Fully Paid Invoices" value={kpis.paidInvoicesCount} icon={CheckCircle} onClick={() => navigate('/finance')} />
        <KPICard title="Collection Efficiency" value={`${kpis.collectionRate || 92}%`} icon={TrendingUp} onClick={() => navigate('/finance')} />
        <KPICard title="Recent Payments" value={formatCurrency(kpis.recentPaymentsTotal)} icon={CreditCard} onClick={() => navigate('/finance')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Invoice Status & Receivables Breakdown</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.financeChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Invoice Count" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Financial Audit & Payment Feed" />
    </div>
  );
}
