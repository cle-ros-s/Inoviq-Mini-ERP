import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleGuard from './RoleGuard.jsx';
import AppShell from '../components/layout/AppShell.jsx';

// Auth pages (not lazy - need fast load)
import Login from '../pages/auth/Login.jsx';

// Lazy-loaded pages
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard.jsx'));
const ProductList = lazy(() => import('../pages/products/ProductList.jsx'));
const ProductNew = lazy(() => import('../pages/products/ProductForm.jsx'));
const ProductDetail = lazy(() => import('../pages/products/ProductDetail.jsx'));
const ProductEdit = lazy(() => import('../pages/products/ProductEdit.jsx'));

const SalesList = lazy(() => import('../pages/sales/SalesList.jsx'));
const SalesNew = lazy(() => import('../pages/sales/SalesForm.jsx'));
const SalesDetail = lazy(() => import('../pages/sales/SalesDetail.jsx'));

const PurchaseList = lazy(() => import('../pages/purchase/PurchaseList.jsx'));
const PurchaseNew = lazy(() => import('../pages/purchase/PurchaseForm.jsx'));
const PurchaseDetail = lazy(() => import('../pages/purchase/PurchaseDetail.jsx'));

const ManufacturingList = lazy(() => import('../pages/manufacturing/ManufacturingList.jsx'));
const ManufacturingNew = lazy(() => import('../pages/manufacturing/ManufacturingForm.jsx'));
const ManufacturingDetail = lazy(() => import('../pages/manufacturing/ManufacturingDetail.jsx'));

const BomList = lazy(() => import('../pages/bom/BomList.jsx'));
const BomNew = lazy(() => import('../pages/bom/BomForm.jsx'));
const BomDetail = lazy(() => import('../pages/bom/BomDetail.jsx'));

const InventoryOverview = lazy(() => import('../pages/inventory/InventoryOverview.jsx'));
const StockLedger = lazy(() => import('../pages/inventory/StockLedger.jsx'));

const ProcurementList = lazy(() => import('../pages/procurement/ProcurementList.jsx'));
const ProcurementDetail = lazy(() => import('../pages/procurement/ProcurementDetail.jsx'));

const AuditLogs = lazy(() => import('../pages/audit/AuditLogs.jsx'));

const UserList = lazy(() => import('../pages/users/UserList.jsx'));
const UserForm = lazy(() => import('../pages/users/UserForm.jsx'));

const Settings = lazy(() => import('../pages/settings/Settings.jsx'));
const Reports = lazy(() => import('../pages/reports/Reports.jsx'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
    <div className="loading-spinner" />
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      { path: 'dashboard', element: withSuspense(Dashboard) },

      // Products
      { path: 'products', element: <RoleGuard module="products" action="view">{withSuspense(ProductList)}</RoleGuard> },
      { path: 'products/new', element: <RoleGuard module="products">{withSuspense(ProductNew)}</RoleGuard> },
      { path: 'products/:id', element: <RoleGuard module="products" action="view">{withSuspense(ProductDetail)}</RoleGuard> },
      { path: 'products/:id/edit', element: <RoleGuard module="products">{withSuspense(ProductEdit)}</RoleGuard> },

      // Sales
      { path: 'sales', element: <RoleGuard module="sales" action="view">{withSuspense(SalesList)}</RoleGuard> },
      { path: 'sales/new', element: <RoleGuard module="sales">{withSuspense(SalesNew)}</RoleGuard> },
      { path: 'sales/:id', element: <RoleGuard module="sales" action="view">{withSuspense(SalesDetail)}</RoleGuard> },

      // Purchase
      { path: 'purchase', element: <RoleGuard module="purchase" action="view">{withSuspense(PurchaseList)}</RoleGuard> },
      { path: 'purchase/new', element: <RoleGuard module="purchase">{withSuspense(PurchaseNew)}</RoleGuard> },
      { path: 'purchase/:id', element: <RoleGuard module="purchase" action="view">{withSuspense(PurchaseDetail)}</RoleGuard> },

      // Manufacturing
      { path: 'manufacturing', element: <RoleGuard module="manufacturing" action="view">{withSuspense(ManufacturingList)}</RoleGuard> },
      { path: 'manufacturing/new', element: <RoleGuard module="manufacturing">{withSuspense(ManufacturingNew)}</RoleGuard> },
      { path: 'manufacturing/:id', element: <RoleGuard module="manufacturing" action="view">{withSuspense(ManufacturingDetail)}</RoleGuard> },

      // BoM
      { path: 'bom', element: <RoleGuard module="bom" action="view">{withSuspense(BomList)}</RoleGuard> },
      { path: 'bom/new', element: <RoleGuard module="bom">{withSuspense(BomNew)}</RoleGuard> },
      { path: 'bom/:id', element: <RoleGuard module="bom" action="view">{withSuspense(BomDetail)}</RoleGuard> },

      // Inventory
      { path: 'inventory', element: <RoleGuard module="inventory" action="view">{withSuspense(InventoryOverview)}</RoleGuard> },
      { path: 'inventory/ledger', element: <RoleGuard module="inventory" action="view">{withSuspense(StockLedger)}</RoleGuard> },

      // Procurement
      { path: 'procurement', element: <RoleGuard module="procurement" action="view">{withSuspense(ProcurementList)}</RoleGuard> },
      { path: 'procurement/:id', element: <RoleGuard module="procurement" action="view">{withSuspense(ProcurementDetail)}</RoleGuard> },

      // Audit
      { path: 'audit-logs', element: <RoleGuard module="audit">{withSuspense(AuditLogs)}</RoleGuard> },

      // Users
      { path: 'users', element: <RoleGuard module="users">{withSuspense(UserList)}</RoleGuard> },
      { path: 'users/new', element: <RoleGuard module="users">{withSuspense(UserForm)}</RoleGuard> },
      { path: 'users/:id/edit', element: <RoleGuard module="users">{withSuspense(UserForm)}</RoleGuard> },

      // Settings
      { path: 'settings', element: <RoleGuard module="settings">{withSuspense(Settings)}</RoleGuard> },

      // Reports
      { path: 'reports', element: withSuspense(Reports) },

      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
