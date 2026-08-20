import { getCollection, getItem, updateItem } from '../data/storage.js';
import { logAction, ACTIONS } from './auditService.js';

export function login(email, password, rememberMe) {
  const users = getCollection('users');
  const user = users.find(u => u.email === email && u.active);
  if (!user || user.password !== password) throw new Error('Invalid credentials');
  
  const session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  if (rememberMe) {
    localStorage.setItem('sfw:session', JSON.stringify(session));
  } else {
    sessionStorage.setItem('sfw:session', JSON.stringify(session));
  }
  
  logAction({ action: ACTIONS.LOGIN, entity: 'User', entityId: user.id, description: 'User logged in', userId: user.id });
  return { user, session };
}

export function logout() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    logAction({ action: ACTIONS.LOGOUT, entity: 'User', entityId: currentUser.userId, description: 'User logged out', userId: currentUser.userId });
  }
  localStorage.removeItem('sfw:session');
  sessionStorage.removeItem('sfw:session');
}

export function getCurrentUser() {
  const sStr = sessionStorage.getItem('sfw:session') || localStorage.getItem('sfw:session');
  if (!sStr) return null;
  const session = JSON.parse(sStr);
  if (new Date(session.expiresAt) < new Date()) {
    logout();
    return null;
  }
  return session;
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function updateProfile(userId, data) {
  return updateItem('users', userId, data);
}
