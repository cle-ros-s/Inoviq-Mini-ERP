import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { Truck, Clock, Navigation, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DeliveryDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ Schedule Dispatch', path: '/delivery/new', primary: true },
    { label: 'View Delivery Orders', path: '/delivery', primary: false },
    { label: 'Out for Delivery', path: '/delivery', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Logistics & Delivery Dispatch
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Customer shipment dispatches, driver routes, scheduled deliveries, and fulfillment rates.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Shipments" value={kpis.totalDeliveries} icon={Truck} onClick={() => navigate('/delivery')} />
        <KPICard title="Planned Dispatches" value={kpis.planned} icon={Clock} onClick={() => navigate('/delivery')} />
        <KPICard title="In Transit / Active" value={kpis.inTransit} icon={Navigation} onClick={() => navigate('/delivery')} />
        <KPICard title="Delivered Orders" value={kpis.delivered} icon={CheckCircle} onClick={() => navigate('/delivery')} />
        <KPICard title="Scheduled Dispatches" value={kpis.todayDispatches} icon={Clock} onClick={() => navigate('/delivery')} />
        <KPICard title="On-Time Delivery Rate" value={`${kpis.onTimeDeliveryRate || 98}%`} icon={Award} onClick={() => navigate('/delivery')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Delivery & Logistics Status Pipeline</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.deliveryChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Shipment Count" fill="#0EA5E9" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Dispatch & Delivery Activity Feed" />
    </div>
  );
}
