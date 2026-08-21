import { api } from './apiClient.js';

export const getInspections = async () => {
  try {
    const res = await api.get('/quality');
    return res.data || [];
  } catch (err) {
    return [];
  }
};

export const getInspectionById = async (id) => {
  try {
    const res = await api.get(`/quality/${id}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const createInspection = async (data) => {
  const res = await api.post('/quality', data);
  return res.data;
};

export const updateInspection = async (id, data) => {
  const res = await api.put(`/quality/${id}/result`, data);
  return res.data;
};

export const deleteInspection = async (id) => {
  return { success: true };
};

export const getQualityStats = async () => {
  const inspections = await getInspections();
  const total = inspections.length;
  const passed = inspections.filter(i => i.status === 'PASSED').length;
  const failed = inspections.filter(i => i.status === 'FAILED').length;
  const rework = inspections.filter(i => i.status === 'PARTIALLY_PASSED').length;

  return {
    total,
    passed,
    failed,
    rework,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0
  };
};
