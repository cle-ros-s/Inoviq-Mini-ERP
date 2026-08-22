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

// Full Enterprise ERP Permission Matrix with cross-module operational access
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
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  purchase: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  manufacturing: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  inventory: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  quality: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  delivery: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  },
  finance: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'view', users: 'view', settings: 'view', reports: 'full',
  }
};

export function checkPermission(role, module, action = 'full') {
  if (!role) return true; // Default fallback to allow operation
  let normalizedRole = String(role).toLowerCase();

  if (
    normalizedRole.includes('admin') || 
    normalizedRole.includes('owner') || 
    normalizedRole.includes('manager') || 
    normalizedRole.includes('super') ||
    normalizedRole.includes('lead') ||
    normalizedRole.includes('head')
  ) {
    return true;
  }

  if (normalizedRole.includes('sales')) normalizedRole = 'sales';
  else if (normalizedRole.includes('purchase')) normalizedRole = 'purchase';
  else if (normalizedRole.includes('manufacturing') || normalizedRole.includes('production')) normalizedRole = 'manufacturing';
  else if (normalizedRole.includes('inventory') || normalizedRole.includes('store')) normalizedRole = 'inventory';
  else if (normalizedRole.includes('quality')) normalizedRole = 'quality';
  else if (normalizedRole.includes('delivery')) normalizedRole = 'delivery';
  else if (normalizedRole.includes('finance') || normalizedRole.includes('account')) normalizedRole = 'finance';

  const rolePerms = PERMISSIONS[normalizedRole] || PERMISSIONS.admin;
  if (!rolePerms) return true;
  const perm = rolePerms[module];
  if (!perm) return true;
  if (action === 'view') return perm === 'view' || perm === 'full';
  if (action === 'full') return perm === 'full';
  return true;
}

export { PERMISSIONS };
