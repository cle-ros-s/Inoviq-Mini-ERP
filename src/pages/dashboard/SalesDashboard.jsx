import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { DollarSign, ShoppingCart, FileText, CheckCircle, HelpCircle, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SalesDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ New Sales Order', path: '/sales/new', primary: true },
    { label: 'Manage Quotations', path: '/sales', primary: false },
    { label: 'View Customers', path: '/sales', primary: false },
    { label: 'Sales Reports', path: '/reports', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Sales & Distribution Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Customer pipelines, confirmed orders, and quotation conversion metrics.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Today's Sales Value" value={formatCurrency(kpis.todaySales)} icon={DollarSign} onClick={() => navigate('/sales')} />
        <KPICard title="Monthly Sales Total" value={formatCurrency(kpis.monthlySales)} icon={ShoppingCart} onClick={() => navigate('/sales')} />
        <KPICard title="Pending Quotations" value={kpis.pendingQuotations} icon={FileText} onClick={() => navigate('/sales')} />
        <KPICard title="Confirmed Orders" value={kpis.confirmedSalesOrders} icon={CheckCircle} onClick={() => navigate('/sales')} />
        <KPICard title="Pending Enquiries" value={kpis.pendingCustomerEnquiries} icon={HelpCircle} onClick={() => navigate('/sales')} />
        <KPICard title="Quotation Conversion" value={`${kpis.conversionRate || 0}%`} icon={TrendingUp} onClick={() => navigate('/sales')} />
        <KPICard title="Outstanding Orders" value={kpis.outstandingSalesOrders} icon={Package} onClick={() => navigate('/sales')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* TOP CUSTOMERS & TOP PRODUCTS TABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Top Customers by Revenue</h3>
          {(!kpis.topCustomers || kpis.topCustomers.length === 0) ? (
            <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>No sales customer records available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {kpis.topCustomers.map((cust, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-secondary, #F8FAFC)', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{cust.name}</span>
                  <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>{formatCurrency(cust.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Top Selling Furniture Products</h3>
          {(!kpis.topSellingProducts || kpis.topSellingProducts.length === 0) ? (
            <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>No product sales transactions recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {kpis.topSellingProducts.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-secondary, #F8FAFC)', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{prod.name}</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>{prod.qty} Units Sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Sales Orders Pipeline</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.salesChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Total Value (₹)" fill="#8B5E3C" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Quotation Conversion Pipeline</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.conversionChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Document Count" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Sales Operational Logs" />
    </div>
  );
}
