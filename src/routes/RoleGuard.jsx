import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AccessDenied from '../components/ui/AccessDenied.jsx';

/**
 * RoleGuard wraps a route and renders AccessDenied if the current user
 * doesn't have the required permission for the module.
 * 
 * @param {string} module - The ERP module name (products, sales, purchase, etc.)
 * @param {string} action - 'full' or 'view' (default: 'full')
 */
export default function RoleGuard({ children, module, action = 'full' }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) {
    return <AccessDenied module={module} />;
  }

  return children;
}
