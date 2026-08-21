import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as dashboardService from '../../services/dashboardService.js';
import { subscribeToErpUpdates } from '../../services/socket.js';

// Import Role-Specific Dashboard Views
import AdminDashboard from './AdminDashboard.jsx';
import SalesDashboard from './SalesDashboard.jsx';
import PurchaseDashboard from './PurchaseDashboard.jsx';
import ProductionDashboard from './ProductionDashboard.jsx';
import InventoryDashboard from './InventoryDashboard.jsx';
import QualityDashboard from './QualityDashboard.jsx';
import DeliveryDashboard from './DeliveryDashboard.jsx';
import FinanceDashboard from './FinanceDashboard.jsx';

// Role mapping helper
function normalizeRole(role) {
  if (!role) return 'admin';
  const r = String(role).toUpperCase().trim();
  if (r === 'ADMINISTRATOR' || r === 'BUSINESS_OWNER' || r === 'ADMIN' || r === 'OWNER') return 'admin';
  if (r === 'SALES_EXECUTIVE' || r === 'SALES') return 'sales';
  if (r === 'PURCHASE_MANAGER' || r === 'PURCHASE') return 'purchase';
  if (r === 'PRODUCTION_MANAGER' || r === 'MANUFACTURING') return 'production';
  if (r === 'INVENTORY_MANAGER' || r === 'INVENTORY') return 'inventory';
  if (r === 'QUALITY_MANAGER' || r === 'QUALITY') return 'quality';
  if (r === 'DELIVERY_MANAGER' || r === 'DELIVERY') return 'delivery';
  if (r === 'ACCOUNTS_FINANCE' || r === 'FINANCE') return 'finance';
  return 'admin';
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { roleParam } = useParams();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Authenticated user canonical role
  const userCanonicalRole = normalizeRole(currentUser?.role);

  // Endpoint to query
  const targetRole = roleParam ? normalizeRole(roleParam) : userCanonicalRole;

  // Security Check: If URL specifies a role parameter that doesn't match the user's role (unless user is admin)
  useEffect(() => {
    if (roleParam && userCanonicalRole !== 'admin' && normalizeRole(roleParam) !== userCanonicalRole) {
      console.warn(`Unauthorized attempt to view /dashboard/${roleParam} by ${userCanonicalRole}. Redirecting...`);
      navigate(`/dashboard/${userCanonicalRole}`, { replace: true });
    }
  }, [roleParam, userCanonicalRole, navigate]);

  const loadDashboardData = async () => {
    // Only show full loading spinner on initial load, background refresh will update seamlessly
    if (!dashboardData) setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch role-specific dashboard endpoint
      const endpoint = roleParam || targetRole;
      const res = await dashboardService.getFullDashboard(endpoint);
      setDashboardData(res || {});
    } catch (err) {
      console.error('Error fetching role dashboard data:', err);
      setErrorMsg(err.message || 'Failed to load dashboard statistics from backend server.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshCounter, currentUser, roleParam]);

  useEffect(() => {
    const unsubscribe = subscribeToErpUpdates(() => {
      loadDashboardData();
      triggerRefresh();
    });
    return () => unsubscribe();
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="page-container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-600)' }}>
          Loading {targetRole} dashboard metrics...
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="page-container" style={{ padding: '40px 16px' }}>
        <div style={{ padding: '20px', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.2)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>Unable to Load Dashboard</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  const dataPayload = dashboardData?.dashboard || dashboardData?.data?.dashboard || dashboardData?.data || dashboardData || {};

  const renderDashboardView = () => {
    switch (targetRole) {
      case 'sales':
        return <SalesDashboard data={dataPayload} user={currentUser} />;
      case 'purchase':
        return <PurchaseDashboard data={dataPayload} user={currentUser} />;
      case 'production':
        return <ProductionDashboard data={dataPayload} user={currentUser} />;
      case 'inventory':
        return <InventoryDashboard data={dataPayload} user={currentUser} />;
      case 'quality':
        return <QualityDashboard data={dataPayload} user={currentUser} />;
      case 'delivery':
        return <DeliveryDashboard data={dataPayload} user={currentUser} />;
      case 'finance':
        return <FinanceDashboard data={dataPayload} user={currentUser} />;
      case 'admin':
      default:
        return <AdminDashboard data={dataPayload} user={currentUser} />;
    }
  };

  return (
    <div className="dashboard-container">
      {renderDashboardView()}
    </div>
  );
}
