import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as dashboardService from '../../services/dashboardService.js';
import { subscribeToErpUpdates } from '../../services/socket.js';
import KPICard from '../../components/ui/KPICard.jsx';
import { 
  ShoppingCart, Truck, Factory, AlertTriangle, FileText, 
  CheckCircle, Package, AlertCircle, Archive, Box, Clock, Plus, Zap, Activity, DollarSign, UserCheck, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { formatRelativeTime, formatCurrency } from '../../utils/formatters.js';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5E3C'];

export default function Dashboard() {
  const { currentUser, hasPermission } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize current user role
  const rawRole = currentUser?.role || 'ADMINISTRATOR';
  const role = String(rawRole).toUpperCase().trim();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getFullDashboard();
      setDashboardData(res || {});
    } catch (e) {
      console.error('Error loading role dashboard data:', e);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshCounter, currentUser]);

  useEffect(() => {
    const unsubscribe = subscribeToErpUpdates(() => {
      fetchDashboardData();
      triggerRefresh();
    });
    return () => unsubscribe();
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="page-container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-600)' }}>
          Retrieving real-time {role.toLowerCase().replace('_', ' ')} metrics from PostgreSQL...
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.dashboard?.kpis || {};
  const charts = dashboardData?.dashboard?.charts || {};
  const alerts = dashboardData?.dashboard?.alerts || [];
  const recentActivity = dashboardData?.dashboard?.recentActivity || [];

  // Determine Dashboard Title & Subtitle based on authenticated role
  let dashboardTitle = 'Operations Dashboard';
  let dashboardSubtitle = 'Real-time overview & metrics';

  if (role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER') {
    dashboardTitle = 'Enterprise & Executive Dashboard';
    dashboardSubtitle = 'Complete high-level overview of company performance and logistics';
  } else if (role === 'SALES_EXECUTIVE' || role === 'SALES') {
    dashboardTitle = 'Sales & Distribution Overview';
    dashboardSubtitle = 'Track customer pipelines, confirmed orders, and quotation conversions';
  } else if (role === 'PURCHASE_MANAGER' || role === 'PURCHASE') {
    dashboardTitle = 'Procurement & Vendor Overview';
    dashboardSubtitle = 'Track raw material spending, supplier status, and requisitions';
  } else if (role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING') {
    dashboardTitle = 'Production Scheduling Dashboard';
    dashboardSubtitle = 'Manage factory production lines, BOMs, and work order exceptions';
  } else if (role === 'INVENTORY_MANAGER' || role === 'INVENTORY') {
    dashboardTitle = 'Inventory & Warehouse Overview';
    dashboardSubtitle = 'Real-time stock balance, incoming materials, and low-stock alerts';
  } else if (role === 'QUALITY_MANAGER' || role === 'QUALITY') {
    dashboardTitle = 'Quality Control Dashboard';
    dashboardSubtitle = 'Monitor defect rates, inspection logs, and raw material audits';
  } else if (role === 'DELIVERY_MANAGER' || role === 'DELIVERY') {
    dashboardTitle = 'Dispatch & Logistics Dashboard';
    dashboardSubtitle = 'Monitor active shipments, carrier status, and delivery schedules';
  } else if (role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') {
    dashboardTitle = 'Accounts & Finance Overview';
    dashboardSubtitle = 'Track sales invoices, outstanding customer balances, and A/P';
  }

  return (
    <div className="page-container" style={{ padding: '24px 16px' }}>
      {/* HEADER SECTION */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {dashboardTitle}
            </h1>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '12px', 
              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
              color: '#059669' 
            }}>
              <Zap size={11} /> Real-Time Live
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Welcome back, <strong style={{ color: 'var(--color-primary-dark)' }}>{currentUser?.name}</strong>. {dashboardSubtitle}
          </p>
        </div>
      </div>

      {/* ALERTS SECTION (Exceptions panel) */}
      {alerts.length > 0 && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: 'var(--color-error-bg)', 
          color: 'var(--color-error)', 
          borderRadius: '8px', 
          border: '1px solid rgba(192, 57, 43, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
            <ShieldAlert size={16} /> <span>Attention Required (Real-time exceptions)</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', fontWeight: 600 }}>
            {alerts.map((alt, idx) => <li key={idx}>{alt}</li>)}
          </ul>
        </div>
      )}

      {/* ----------------------------------------------------
          A. KPI CARDS LAYOUT (Role-specific statistics)
          ---------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* 1. ADMINISTRATOR & BUSINESS OWNER KPIs */}
        {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER') && (
          <>
            <KPICard title="Total Users" value={kpis.totalUsers} icon={UserCheck} onClick={() => navigate('/users')} />
            <KPICard title="Active Accounts" value={kpis.activeUsers} icon={CheckCircle} onClick={() => navigate('/users')} />
            <KPICard title="Active Products" value={kpis.totalProducts} icon={Package} onClick={() => navigate('/products')} />
            <KPICard title="Sales Revenue" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} onClick={() => navigate('/finance')} />
            <KPICard title="Low Stock alerts" value={kpis.lowStockProducts} icon={AlertCircle} onClick={() => navigate('/inventory')} />
          </>
        )}

        {/* 2. SALES ROLE KPIs */}
        {(role === 'SALES_EXECUTIVE' || role === 'SALES') && (
          <>
            <KPICard title="Today's Sales Value" value={formatCurrency(kpis.todaySales)} icon={DollarSign} onClick={() => navigate('/sales')} />
            <KPICard title="Monthly Sales total" value={formatCurrency(kpis.monthlySales)} icon={ShoppingCart} onClick={() => navigate('/sales')} />
            <KPICard title="Quotation Drafts" value={kpis.pendingQuotations} icon={FileText} onClick={() => navigate('/sales')} />
            <KPICard title="Confirmed Orders" value={kpis.confirmedSalesOrders} icon={CheckCircle} onClick={() => navigate('/sales')} />
          </>
        )}

        {/* 3. PURCHASE ROLE KPIs */}
        {(role === 'PURCHASE_MANAGER' || role === 'PURCHASE') && (
          <>
            <KPICard title="Draft PO Requests" value={kpis.pendingPurchaseRequests} icon={FileText} onClick={() => navigate('/purchase')} />
            <KPICard title="Pending PO Deliveries" value={kpis.pendingPurchaseOrders} icon={Clock} onClick={() => navigate('/purchase')} />
            <KPICard title="Procurement Spent" value={formatCurrency(kpis.totalProcurementValue)} icon={DollarSign} onClick={() => navigate('/purchase')} />
            <KPICard title="Low Stock Reorders" value={kpis.productsToReorder} icon={AlertCircle} onClick={() => navigate('/inventory')} />
          </>
        )}

        {/* 4. PRODUCTION MANAGER KPIs */}
        {(role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING') && (
          <>
            <KPICard title="Active Production runs" value={kpis.activeProductionOrders} icon={Factory} onClick={() => navigate('/manufacturing')} />
            <KPICard title="In Progress" value={kpis.inProgress} icon={Clock} onClick={() => navigate('/manufacturing')} />
            <KPICard title="Completed runs" value={kpis.completed} icon={CheckCircle} onClick={() => navigate('/manufacturing')} />
            <KPICard title="Delayed runs" value={kpis.delayedProduction} icon={AlertTriangle} onClick={() => navigate('/manufacturing')} />
          </>
        )}

        {/* 5. INVENTORY ROLE KPIs */}
        {(role === 'INVENTORY_MANAGER' || role === 'INVENTORY') && (
          <>
            <KPICard title="Active Products count" value={kpis.totalProducts} icon={Package} onClick={() => navigate('/products')} />
            <KPICard title="Low Stock Items" value={kpis.lowStockItems} icon={AlertCircle} onClick={() => navigate('/inventory')} />
            <KPICard title="Out of Stock Items" value={kpis.outOfStockItems} icon={AlertTriangle} onClick={() => navigate('/inventory')} />
            <KPICard title="Stock Value" value={formatCurrency(kpis.stockValue)} icon={DollarSign} onClick={() => navigate('/inventory')} />
          </>
        )}

        {/* 6. QUALITY ROLE KPIs */}
        {(role === 'QUALITY_MANAGER' || role === 'QUALITY') && (
          <>
            <KPICard title="Today's QA Audits" value={kpis.inspectionsToday} icon={Package} onClick={() => navigate('/quality')} />
            <KPICard title="Passed Quality Runs" value={kpis.passedInspections} icon={CheckCircle} onClick={() => navigate('/quality')} />
            <KPICard title="Failed / Defect Runs" value={kpis.failedInspections} icon={AlertTriangle} onClick={() => navigate('/quality')} />
            <KPICard title="Pending QA Backlog" value={kpis.pendingInspections} icon={Clock} onClick={() => navigate('/quality')} />
          </>
        )}

        {/* 7. DELIVERY ROLE KPIs */}
        {(role === 'DELIVERY_MANAGER' || role === 'DELIVERY') && (
          <>
            <KPICard title="Pending Shipments" value={kpis.pendingDeliveries} icon={Truck} onClick={() => navigate('/delivery')} />
            <KPICard title="In Transit" value={kpis.inTransit} icon={Clock} onClick={() => navigate('/delivery')} />
            <KPICard title="Delivered Orders" value={kpis.delivered} icon={CheckCircle} onClick={() => navigate('/delivery')} />
            <KPICard title="Delayed Shipments" value={kpis.delayed} icon={AlertTriangle} onClick={() => navigate('/delivery')} />
          </>
        )}

        {/* 8. FINANCE ROLE KPIs */}
        {(role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') && (
          <>
            <KPICard title="Total Revenue collected" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} onClick={() => navigate('/finance')} />
            <KPICard title="Accounts Receivable" value={formatCurrency(kpis.accountsReceivable)} icon={Clock} onClick={() => navigate('/finance')} />
            <KPICard title="Accounts Payable" value={formatCurrency(kpis.accountsPayable)} icon={AlertCircle} onClick={() => navigate('/finance')} />
            <KPICard title="Outstanding Invoices" value={kpis.outstandingInvoices} icon={FileText} onClick={() => navigate('/finance')} />
          </>
        )}
      </div>

      {/* ----------------------------------------------------
          B. QUICK ACTIONS (Role-specific operational links)
          ---------------------------------------------------- */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>Quick Operations</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/users/new')}>+ Create User</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/settings')}>System Configuration</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/audit-logs')}>View Audit Trail</button>
            </>
          )}
          {(role === 'SALES_EXECUTIVE' || role === 'SALES') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/new')}>+ New Sales Order</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sales')}>Manage Quotations</button>
            </>
          )}
          {(role === 'PURCHASE_MANAGER' || role === 'PURCHASE') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/purchase/new')}>+ New Purchase Order</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/purchase')}>Manage Suppliers</button>
            </>
          )}
          {(role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/manufacturing/new')}>+ New Production Order</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bom')}>Manage BOM Files</button>
            </>
          )}
          {(role === 'INVENTORY_MANAGER' || role === 'INVENTORY') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/products/new')}>+ Register Product</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/inventory/ledger')}>View Stock Movements</button>
            </>
          )}
          {(role === 'QUALITY_MANAGER' || role === 'QUALITY') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/quality/new')}>+ Add Inspection</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quality')}>Inspection History</button>
            </>
          )}
          {(role === 'DELIVERY_MANAGER' || role === 'DELIVERY') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/delivery/new')}>+ Create Dispatch</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/delivery')}>Active Shipments</button>
            </>
          )}
          {(role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/finance/new')}>+ Create Invoice</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/finance')}>View Payments ledger</button>
            </>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          C. CHARTS SECTION (Role-specific charts)
          ---------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Sales Chart (Admin, Owner, Sales, Finance) */}
        {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER' || role === 'SALES_EXECUTIVE' || role === 'SALES' || role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Sales Orders Trend (Live)</h3>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.salesChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip formatter={(val, name) => [name === 'Revenue (₹)' ? `₹${val.toLocaleString()}` : val, name]} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Revenue (₹)" stroke="#8B5E3C" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="orders" name="Order Count" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Inventory Chart (Admin, Owner, Purchase, Production, Inventory) */}
        {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER' || role === 'PURCHASE_MANAGER' || role === 'PURCHASE' || role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING' || role === 'INVENTORY_MANAGER' || role === 'INVENTORY') && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Warehouse Stock Levels</h3>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.inventoryChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onHand" name="On Hand Stock" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Manufacturing Chart (Admin, Owner, Production) */}
        {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER' || role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING') && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Manufacturing Statuses</h3>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={charts.manufacturingChart || []} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, value }) => `${name}: ${value}`}
                  >
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
        )}

        {/* Purchase Chart (Admin, Owner, Purchase, Finance) */}
        {(role === 'ADMINISTRATOR' || role === 'BUSINESS_OWNER' || role === 'PURCHASE_MANAGER' || role === 'PURCHASE' || role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card__title" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Purchase Pipeline</h3>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.purchaseChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="PO Count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          D. ROLE-SPECIFIC ACTIVITY FEED
          ---------------------------------------------------- */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card__title" style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--color-primary)' }} /> Live Audit & Operations Feed
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>Latest Job Updates</span>
        </div>

        {recentActivity.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '13px' }}>
            No recent operational transactions matches your workspace profile.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.slice(0, 10).map(act => (
              <div
                key={act.id}
                onClick={() => act.entityId && navigate(`/${act.entity.toLowerCase()}/${act.entityId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  cursor: act.entityId ? 'pointer' : 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{act.user?.name || act.user || 'System'}</span>{' '}
                    <span style={{ color: 'var(--color-gray-600)' }}>performed</span>{' '}
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{act.action}</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                  {formatRelativeTime(act.timestamp || act.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
