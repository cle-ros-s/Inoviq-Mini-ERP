import { api } from './apiClient.js';

export async function login(email, password, rememberMe) {
  const response = await api.post('/auth/login', { email, password });
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Login failed');
  }

  const { user, accessToken, refreshToken } = response.data;
  const role = (user.role || 'admin').toLowerCase().replace('administrator', 'admin');

  const session = {
    userId: user.id,
    role: role,
    rawRole: user.role,
    name: user.name,
    email: user.email,
    token: accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('sfw:session', JSON.stringify(session));
  storage.setItem('sfw:token', accessToken);
  storage.setItem('sfw:refreshToken', refreshToken);
  localStorage.setItem('sfw:token', accessToken);
  localStorage.setItem('sfw:refreshToken', refreshToken);

  return { user, session };
}

export function logout() {
  localStorage.removeItem('sfw:session');
  localStorage.removeItem('sfw:token');
  localStorage.removeItem('sfw:refreshToken');
  sessionStorage.removeItem('sfw:session');
  sessionStorage.removeItem('sfw:token');
  sessionStorage.removeItem('sfw:refreshToken');
}

export function getCurrentUser() {
  const sStr = sessionStorage.getItem('sfw:session') || localStorage.getItem('sfw:session');
  if (!sStr) return null;
  try {
    const session = JSON.parse(sStr);
    if (new Date(session.expiresAt) < new Date()) {
      logout();
      return null;
    }
    return session;
  } catch {
    logout();
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword });
  return res;
}

export async function updateProfile(userId, data) {
  const res = await api.patch(`/users/${userId}`, data);
  return res.data;
}
