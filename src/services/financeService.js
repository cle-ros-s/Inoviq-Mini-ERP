import { api } from './apiClient.js';

export const getInvoices = async () => {
  try {
    const res = await api.get('/invoices');
    return res.data || [];
  } catch (err) {
    return [];
  }
};

export const getInvoiceById = async (id) => {
  try {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const createInvoice = async (invoiceData) => {
  const res = await api.post('/invoices', invoiceData);
  return res.data;
};

export const recordPayment = async (id, paymentAmount, paymentMethod = 'BANK_TRANSFER') => {
  const res = await api.post(`/invoices/${id}/payment`, { amount: paymentAmount, paymentMethod });
  return res.data;
};

export const deleteInvoice = async (id) => {
  return { success: true };
};
