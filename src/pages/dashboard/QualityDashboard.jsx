import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/ui/KPICard.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { CheckSquare, Clock, CheckCircle, XCircle, Award, Percent } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function QualityDashboard({ data, user }) {
  const navigate = useNavigate();
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  const quickActions = [
    { label: '+ New Quality Inspection', path: '/quality/new', primary: true },
    { label: 'View Inspection Logs', path: '/quality', primary: false },
    { label: 'Pending Audits', path: '/quality', primary: false }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Quality Control & Assurance Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>. Batch quality audits, inspection passes, rejection rates, and defect tracking.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard title="Total Inspections" value={kpis.totalInspections} icon={CheckSquare} onClick={() => navigate('/quality')} />
        <KPICard title="Pending Inspections" value={kpis.pendingInspections} icon={Clock} onClick={() => navigate('/quality')} />
        <KPICard title="Passed Audit Runs" value={kpis.passedInspections} icon={CheckCircle} onClick={() => navigate('/quality')} />
        <KPICard title="Failed Batches" value={kpis.failedInspections} icon={XCircle} onClick={() => navigate('/quality')} />
        <KPICard title="Quality Pass Rate" value={`${kpis.passRate || 95}%`} icon={Award} onClick={() => navigate('/quality')} />
        <KPICard title="Defect Rate" value={`${kpis.defectRate || 5}%`} icon={Percent} onClick={() => navigate('/quality')} />
      </div>

      <QuickActions actions={quickActions} />

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Inspection Status & Defect Breakdown</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.qualityChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Inspections Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentActivity recentActivity={recentActivity} title="Quality Control Inspection Feed" />
    </div>
  );
}
