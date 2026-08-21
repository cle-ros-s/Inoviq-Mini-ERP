import { api } from './apiClient.js';

export const getDeliveries = async () => {
  try {
    const res = await api.get('/deliveries');
    return res.data || [];
  } catch (err) {
    return [];
  }
};

export const getDeliveryById = async (id) => {
  try {
    const res = await api.get(`/deliveries/${id}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const createDelivery = async (data) => {
  const res = await api.post('/deliveries', data);
  return res.data;
};

export const updateDelivery = async (id, data) => {
  const res = await api.patch(`/deliveries/${id}/status`, data);
  return res.data;
};

export const deleteDelivery = async (id) => {
  return { success: true };
};

export const getDeliveryStats = async () => {
  const deliveries = await getDeliveries();
  return {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.status === 'DISPATCHED').length,
    delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
    delayed: 0,
  };
};
