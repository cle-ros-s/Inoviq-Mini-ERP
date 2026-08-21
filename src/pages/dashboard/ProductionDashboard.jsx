import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { Factory, Clock, CheckCircle, AlertTriangle, Cpu, FileText, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

export default function ProductionDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ Create Manufacturing Order', path: '/manufacturing/new', primary: true },
    { label: 'Manage BOM Files', path: '/bom', primary: false },
    { label: 'View Production Orders', path: '/manufacturing', primary: false },
    { label: 'Work Center Scheduling', path: '/manufacturing', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Production Scheduling & Manufacturing
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Factory assembly lines, bill of materials (BOM), and manufacturing order exceptions.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Active Production Orders" value={kpis.activeProductionOrders} icon={Factory} onClick={() => navigate('/manufacturing')} />
        <KPICard title="Planned Runs" value={kpis.plannedProduction} icon={FileText} onClick={() => navigate('/manufacturing')} />
        <KPICard title="In Progress" value={kpis.inProgress} icon={Clock} onClick={() => navigate('/manufacturing')} />
        <KPICard title="Completed Runs" value={kpis.completed} icon={CheckCircle} onClick={() => navigate('/manufacturing')} />
        <KPICard title="Delayed Orders" value={kpis.delayedProduction} icon={AlertTriangle} onClick={() => navigate('/manufacturing')} />
        <KPICard title="Production Efficiency" value={`${kpis.productionEfficiency || 100}%`} icon={Zap} onClick={() => navigate('/manufacturing')} />
        <KPICard title="Work Centers" value={kpis.workCenterStatus || 'Active'} icon={Cpu} onClick={() => navigate('/manufacturing')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* MANUFACTURING CHART */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Manufacturing Run Statuses</h3>
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

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Active Assembly Lines & BOM Summary</h3>
          <div style={{ padding: '12px', background: 'var(--color-surface-secondary, #F8FAFC)', borderRadius: '6px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Registered Bill of Materials (BOM)</span>
              <strong>{kpis.totalBomsCount || 0} Files</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Woodworking & Cutting Line</span>
              <strong style={{ color: '#059669' }}>Operational</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Varnish & Finishing Station</span>
              <strong style={{ color: '#059669' }}>Operational</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Assembly & Quality Station</span>
              <strong style={{ color: '#059669' }}>Operational</strong>
            </div>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Production Activity Feed" />
    </div>
  );
}
