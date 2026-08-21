import { api } from './apiClient.js';

async function fetchDashboardData() {
  try {
    const res = await api.get('/dashboard/kpis');
    return res.data || {};
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    return {};
  }
}

export async function getFullDashboard() {
  return await fetchDashboardData();
}

export async function getKPIs() {
  const data = await fetchDashboardData();
  return data.dashboard?.kpis || {};
}

export async function getSalesChartData(days = 30) {
  const data = await fetchDashboardData();
  return data.dashboard?.charts?.salesChart || [];
}

export async function getInventoryChartData() {
  const data = await fetchDashboardData();
  return data.dashboard?.charts?.inventoryChart || [];
}

export async function getManufacturingChartData() {
  const data = await fetchDashboardData();
  return data.dashboard?.charts?.manufacturingChart || [];
}

export async function getPurchaseChartData() {
  const data = await fetchDashboardData();
  return data.dashboard?.charts?.purchaseChart || [];
}
