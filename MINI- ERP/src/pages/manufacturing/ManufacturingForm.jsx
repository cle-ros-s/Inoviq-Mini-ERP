import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as manufacturingService from '../../services/manufacturingService.js';
import * as productService from '../../services/productService.js';
import * as userService from '../../services/userService.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import DatePicker from '../../components/ui/DatePicker.jsx';
import QuantityInput from '../../components/ui/QuantityInput.jsx';
import Select from '../../components/ui/Select.jsx';

export default function ManufacturingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    productId: '', qty: 1, bomId: 'BOM-001', plannedDate: new Date().toISOString().split('T')[0], assigneeId: ''
  });

  useEffect(() => {
    try { setProducts(productService.getProductsWithInventory().filter(p => p.procurementType === 'Manufacturing')); } catch(e) { console.error(e); }
    try { setUsers(userService.getUsers()); } catch(e) { console.error(e); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mo = await manufacturingService.createManufacturingOrder(formData, user.id);
      showSuccess('MO created');
      navigate(`/manufacturing/${mo.id}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Manufacturing Order</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Product" options={products.map(p => ({value: p.id, label: p.name}))} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} />
          <QuantityInput label="Quantity" min={1} value={formData.qty} onChange={v => setFormData({...formData, qty: v})} />
          <Input label="BoM ID (Stub)" value={formData.bomId} onChange={e => setFormData({...formData, bomId: e.target.value})} />
          <DatePicker label="Planned Date" value={formData.plannedDate} onChange={e => setFormData({...formData, plannedDate: e.target.value})} />
          <Select label="Assignee" options={users.map(u => ({value: u.id, label: u.name}))} value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} />
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create MO</button>
        </div>
      </form>
    </div>
  );
}
