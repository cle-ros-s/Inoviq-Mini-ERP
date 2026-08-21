import { api } from './apiClient.js';

export async function fetchDashboardData(roleEndpoint = '') {
  try {
    const endpoint = roleEndpoint ? `/dashboard/${roleEndpoint}` : '/dashboard';
    const res = await api.get(endpoint);
    return res.data || res || {};
  } catch (err) {
    console.error(`Failed to load dashboard data for endpoint (${roleEndpoint}):`, err);
    throw err;
  }
}

export async function getFullDashboard(roleEndpoint = '') {
  return await fetchDashboardData(roleEndpoint);
}

export async function getKPIs(roleEndpoint = '') {
  const data = await fetchDashboardData(roleEndpoint);
  return data.dashboard?.kpis || {};
}
