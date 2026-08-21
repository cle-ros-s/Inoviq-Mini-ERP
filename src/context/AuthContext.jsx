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

// Permission matrix
const PERMISSIONS = {
  admin: {
    dashboard: 'full', products: 'full', sales: 'full', purchase: 'full',
    manufacturing: 'full', bom: 'full', inventory: 'full', procurement: 'full',
    quality: 'full', delivery: 'full', finance: 'full',
    audit: 'full', users: 'full', settings: 'full', reports: 'full',
  },
  sales: {
    dashboard: 'full', products: 'view', sales: 'full', purchase: null,
    manufacturing: null, bom: null, inventory: 'view', procurement: 'view',
    quality: null, delivery: 'view', finance: 'view',
    audit: null, users: null, settings: null, reports: 'view',
  },
  purchase: {
    dashboard: 'full', products: 'view', sales: null, purchase: 'full',
    manufacturing: null, bom: null, inventory: 'view', procurement: 'full',
    quality: null, delivery: null, finance: 'view',
    audit: null, users: null, settings: null, reports: 'view',
  },
  manufacturing: {
    dashboard: 'full', products: 'view', sales: null, purchase: null,
    manufacturing: 'full', bom: 'full', inventory: 'view', procurement: 'full',
    quality: 'view', delivery: null, finance: null,
    audit: null, users: null, settings: null, reports: 'view',
  },
  inventory: {
    dashboard: 'full', products: 'full', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'full', procurement: 'view',
    quality: null, delivery: null, finance: null,
    audit: null, users: null, settings: null, reports: 'view',
  },
  quality: {
    dashboard: 'full', products: 'view', sales: null, purchase: null,
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: null,
    quality: 'full', delivery: null, finance: null,
    audit: null, users: null, settings: null, reports: 'view',
  },
  delivery: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: null,
    manufacturing: null, bom: null, inventory: 'view', procurement: null,
    quality: null, delivery: 'full', finance: null,
    audit: null, users: null, settings: null, reports: 'view',
  },
  finance: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: null, bom: null, inventory: 'view', procurement: null,
    quality: null, delivery: null, finance: 'full',
    audit: null, users: null, settings: null, reports: 'view',
  },
  owner: {
    dashboard: 'full', products: 'view', sales: 'view', purchase: 'view',
    manufacturing: 'view', bom: 'view', inventory: 'view', procurement: 'view',
    quality: 'view', delivery: 'view', finance: 'view',
    audit: 'full', users: null, settings: null, reports: 'full',
  },
};

export function checkPermission(role, module, action = 'full') {
  const normalizedRole = (role || 'admin').toLowerCase().replace('administrator', 'admin');
  const rolePerms = PERMISSIONS[normalizedRole] || PERMISSIONS.admin;
  if (!rolePerms) return false;
  const perm = rolePerms[module];
  if (!perm) return false;
  if (action === 'view') return perm === 'view' || perm === 'full';
  if (action === 'full') return perm === 'full';
  return false;
}

export { PERMISSIONS };
