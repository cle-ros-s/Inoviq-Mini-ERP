import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as dashboardService from '../../services/dashboardService.js';
import * as auditService from '../../services/auditService.js';
import KPICard from '../../components/ui/KPICard.jsx';
import { ShoppingCart, Truck, Factory, AlertTriangle, FileText, CheckCircle, Package, AlertCircle, Archive, Box, Clock, Plus } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters.js';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [inventoryChart, setInventoryChart] = useState([]);
  const [manufacturingChart, setManufacturingChart] = useState([]);
  const [purchaseChart, setPurchaseChart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiData = dashboardService.getKPIs();
        const actData = auditService.getRecentActivity(15);
        const sChart = dashboardService.getSalesChartData(30);
        const iChart = dashboardService.getInventoryChartData();
        const mChart = dashboardService.getManufacturingChartData();
        const pChart = dashboardService.getPurchaseChartData();

        setKpis(kpiData);
        setActivity(actData || []);
        setSalesChart(sChart || []);
        setInventoryChart(iChart || []);
        setManufacturingChart(mChart || []);
        setPurchaseChart(pChart || []);
      } catch (e) {
        console.error('Error fetching dashboard data', e);
      }
    };
    fetchData();
  }, [refreshCounter]);

  const kpiConfig = [
    { key: 'totalSalesOrders', title: 'Total Sales Orders', icon: ShoppingCart, link: '/sales' },
    { key: 'pendingDeliveries', title: 'Pending Deliveries', icon: Truck, link: '/sales' },
    { key: 'manufacturingOrders', title: 'Manufacturing Orders', icon: Factory, link: '/manufacturing' },
    { key: 'delayedOrders', title: 'Delayed Orders', icon: AlertTriangle, link: '/manufacturing' },
    { key: 'purchaseOrders', title: 'Purchase Orders', icon: FileText, link: '/purchase' },
    { key: 'partialReceipts', title: 'Partial Receipts', icon: CheckCircle, link: '/purchase' },
    { key: 'totalProducts', title: 'Total Products', icon: Package, link: '/products' },
    { key: 'lowStock', title: 'Low Stock Alerts', icon: AlertCircle, link: '/inventory' },
    { key: 'reservedStock', title: 'Reserved Stock', icon: Archive, link: '/inventory' },
    { key: 'freeStock', title: 'Free Stock', icon: Box, link: '/inventory' },
    { key: 'pendingProcurement', title: 'Pending Procurement', icon: Clock, link: '/procurement' }
  ];

  return (
    <div className="page-container">
      {/* Top Header & Quick Action Buttons */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time supply chain operational overview & KPIs</p>
        </div>

        {/* Separated Quick Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {hasPermission('sales', 'full') && (
            <button
              onClick={() => navigate('/sales/new')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Sales Order
            </button>
          )}
          {hasPermission('purchase', 'full') && (
            <button
              onClick={() => navigate('/purchase/new')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Purchase Order
            </button>
          )}
          {hasPermission('manufacturing', 'full') && (
            <button
              onClick={() => navigate('/manufacturing/new')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Manufacturing Order
            </button>
          )}
          {hasPermission('products', 'full') && (
            <button
              onClick={() => navigate('/products/new')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Product
            </button>
          )}
          {hasPermission('bom', 'full') && (
            <button
              onClick={() => navigate('/bom/new')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> BoM
            </button>
          )}
        </div>
      </div>

      {/* Responsive Multi-Column KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {kpiConfig.map(c => (
          <KPICard
            key={c.key}
            title={c.title}
            value={kpis ? kpis[c.key] : null}
            icon={c.icon}
            onClick={() => navigate(c.link)}
            loading={!kpis}
          />
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px' }}>Sales Order Trend (30 Days)</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Sales Orders" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px' }}>Inventory Stock Distribution</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Stock Units" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px' }}>Manufacturing Order Statuses</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={manufacturingChart} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={85} fill="#F59E0B" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card__title" style={{ marginBottom: '16px' }}>Purchase Order History</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={purchaseChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="purchases" name="Purchase Orders" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Recent Audit Activity Feed</h3>
        </div>
        <div className="card__body" style={{ padding: '8px 0' }}>
          {activity.map(act => (
            <div
              key={act.id}
              onClick={() => act.entityId && act.entityId !== 'N/A' && navigate(`/${act.entity.toLowerCase()}/${act.entityId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: '1px solid var(--color-gray-100)',
                cursor: act.entityId && act.entityId !== 'N/A' ? 'pointer' : 'default',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{act.user}</span>{' '}
                  <span style={{ color: 'var(--color-gray-600)' }}>{act.action}</span>{' '}
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{act.entity} {act.entityId}</span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                {formatRelativeTime(act.createdAt || act.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
