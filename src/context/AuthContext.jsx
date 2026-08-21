import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/authService.js';
import { logAction, ACTIONS } from '../services/auditService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = getCurrentUser();
    if (userSession) {
      setCurrentUser(userSession);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userSession) => {
    setCurrentUser(userSession);
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      try {
        logAction({
          action: ACTIONS.LOGOUT,
          entity: 'User',
          entityId: currentUser.userId,
          description: `User ${currentUser.name} logged out`,
          userId: currentUser.userId,
        });
      } catch (e) { /* ignore audit error on logout */ }
    }
    authLogout();
    setCurrentUser(null);
  }, [currentUser]);

  const hasPermission = useCallback((module, action = 'full') => {
    if (!currentUser) return false;
    const role = currentUser.role;
    return checkPermission(role, module, action);
  }, [currentUser]);

  const userWithId = currentUser ? { ...currentUser, id: currentUser.userId } : null;

  return (
    <AuthContext.Provider value={{ currentUser: userWithId, user: userWithId, login, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Full Enterprise ERP Permission Matrix with cross-module view access
const PERMISSIONS = {
  admin: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'full', users: 'full', settings: 'full', reports: 'full',
  },
  owner: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'full', users: 'full', settings: 'full', reports: 'full',
  },
  sales: {
    dashboard: 'full', products: 'view', sales: 'full', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'view',
    quality: 'view', delivery: 'view', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  purchase: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'full',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'full',
    quality: 'view', delivery: 'view', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  manufacturing: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: 'full', bom: 'full', inventory: 'view', procurement: 'full',
    quality: 'view', delivery: 'view', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  inventory: {
    dashboard: 'full', products: 'full', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'full', procurement: 'view',
    quality: 'view', delivery: 'view', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  quality: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'view',
    quality: 'full', delivery: 'view', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  delivery: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'view',
    quality: 'view', delivery: 'full', finance: 'view',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  },
  finance: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'view',
    quality: 'view', delivery: 'view', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'view',
  }
};

export function checkPermission(role, module, action = 'full') {
  let normalizedRole = (role || 'admin').toLowerCase();
  if (normalizedRole.includes('admin')) normalizedRole = 'admin';
  else if (normalizedRole.includes('sales')) normalizedRole = 'sales';
  else if (normalizedRole.includes('purchase')) normalizedRole = 'purchase';
  else if (normalizedRole.includes('manufacturing') || normalizedRole.includes('production')) normalizedRole = 'manufacturing';
  else if (normalizedRole.includes('inventory')) normalizedRole = 'inventory';
  else if (normalizedRole.includes('quality')) normalizedRole = 'quality';
  else if (normalizedRole.includes('delivery')) normalizedRole = 'delivery';
  else if (normalizedRole.includes('finance') || normalizedRole.includes('accounts')) normalizedRole = 'finance';
  else if (normalizedRole.includes('owner')) normalizedRole = 'owner';

  const rolePerms = PERMISSIONS[normalizedRole] || PERMISSIONS.admin;
  if (!rolePerms) return true; // Default fallback to avoid blocking valid user sessions
  const perm = rolePerms[module];
  if (!perm) return action === 'view'; // Allow view fallback for cross-functional ERP navigation
  if (action === 'view') return perm === 'view' || perm === 'full';
  if (action === 'full') return perm === 'full';
  return true;
}

export { PERMISSIONS };
