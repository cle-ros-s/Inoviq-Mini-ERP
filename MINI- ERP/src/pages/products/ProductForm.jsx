import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import CurrencyInput from '../../components/ui/CurrencyInput.jsx';
import QuantityInput from '../../components/ui/QuantityInput.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import SearchSelect from '../../components/ui/SearchSelect.jsx';

export default function ProductForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', description: '',
    salesPrice: 0, costPrice: 0, openingStock: 0, reorderLevel: 0,
    procurementStrategy: 'MTS', procurementType: 'Purchase',
    vendorId: '', bomId: '', active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = await productService.createProduct(formData, user.id);
      showSuccess('Product created');
      navigate(`/products/${newProduct.id}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="SKU" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <Input label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
        </div>
        <Textarea label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput label="Sales Price" min={0} value={formData.salesPrice} onChange={val => setFormData({...formData, salesPrice: val})} />
          <CurrencyInput label="Cost Price" min={0} value={formData.costPrice} onChange={val => setFormData({...formData, costPrice: val})} />
          <QuantityInput label="Opening Stock" min={0} value={formData.openingStock} onChange={val => setFormData({...formData, openingStock: val})} />
          <QuantityInput label="Reorder Level" min={0} value={formData.reorderLevel} onChange={val => setFormData({...formData, reorderLevel: val})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Procurement Strategy" options={[{value:'MTS', label:'MTS'}, {value:'MTO', label:'MTO'}]} value={formData.procurementStrategy} onChange={e => setFormData({...formData, procurementStrategy: e.target.value})} />
          <Select label="Procurement Type" options={[{value:'Purchase', label:'Purchase'}, {value:'Manufacturing', label:'Manufacturing'}]} value={formData.procurementType} onChange={e => setFormData({...formData, procurementType: e.target.value})} />
          
          {formData.procurementType === 'Purchase' && (
             <Input label="Vendor ID (Stub)" value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} />
          )}
          {formData.procurementType === 'Manufacturing' && (
             <Input label="BoM ID (Stub)" value={formData.bomId} onChange={e => setFormData({...formData, bomId: e.target.value})} />
          )}
        </div>
        <Checkbox label="Active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
        
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create Product</button>
        </div>
      </form>
    </div>
  );
}
