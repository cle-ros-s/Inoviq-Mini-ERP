import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as productService from '../../services/productService.js';
import { api } from '../../services/apiClient.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import CurrencyInput from '../../components/ui/CurrencyInput.jsx';
import QuantityInput from '../../components/ui/QuantityInput.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import { Package } from 'lucide-react';

export default function ProductForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    unitOfMeasure: 'PCS',
    salesPrice: 0,
    costPrice: 0,
    openingStock: 0,
    reorderLevel: 0,
    procurementStrategy: 'MTS',
    procurementType: 'Purchase',
    vendorId: '',
    active: true
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await api.get('/categories');
        const catList = Array.isArray(catRes.data) ? catRes.data : [];
        setCategories(catList);
        if (catList.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: catList[0].id }));
        }

        const supRes = await api.get('/suppliers');
        const supList = Array.isArray(supRes.data) ? supRes.data : [];
        setSuppliers(supList);
        if (supList.length > 0) {
          setFormData(prev => ({ ...prev, vendorId: supList[0].id }));
        }
      } catch (err) {
        console.warn('Metadata load error:', err);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showError('Product name is required');
      return;
    }
    if (!formData.categoryId) {
      showError('Please select a category from the dropdown');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        categoryId: formData.categoryId,
        description: formData.description,
        unitOfMeasure: formData.unitOfMeasure || 'PCS',
        salesPrice: parseFloat(formData.salesPrice) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        openingStock: parseInt(formData.openingStock, 10) || 0,
        reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
        procurementStrategy: formData.procurementStrategy,
        procurementType: formData.procurementType,
        vendorId: formData.vendorId || undefined,
        active: formData.active
      };

      const newProduct = await productService.createProduct(payload, user?.id);
      showSuccess('Product created successfully in PostgreSQL!');
      navigate(`/products/${newProduct.id || ''}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '850px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Products
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New Product</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1: General Details */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>General Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Product Name" 
              required 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Teak Dining Table..."
            />
            <Input 
              label="SKU / Item Code" 
              value={formData.sku} 
              onChange={e => setFormData({ ...formData, sku: e.target.value })} 
              placeholder="Leave empty to auto-generate..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            {/* Category Dropdown */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Select Category <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                className="select"
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="" disabled>-- Select a Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Unit of Measure Dropdown */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Unit of Measure (UOM)
              </label>
              <select
                className="select"
                value={formData.unitOfMeasure}
                onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="SET">SET (Sets)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="SQFT">SQFT (Square Feet)</option>
                <option value="LTR">LTR (Litres)</option>
                <option value="KGS">KGS (Kilograms)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Textarea 
              label="Description / Specifications" 
              rows={3}
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Type wood type, finish, dimensions, or technical specifications..."
            />
          </div>
        </div>

        {/* Card 2: Pricing & Stock */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Pricing & Stock Limits</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <CurrencyInput 
              label="Selling Price (₹)" 
              min={0} 
              value={formData.salesPrice} 
              onChange={val => setFormData({ ...formData, salesPrice: val })} 
            />
            <CurrencyInput 
              label="Cost / Purchase Price (₹)" 
              min={0} 
              value={formData.costPrice} 
              onChange={val => setFormData({ ...formData, costPrice: val })} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <QuantityInput 
              label="Opening Stock" 
              min={0} 
              value={formData.openingStock} 
              onChange={val => setFormData({ ...formData, openingStock: val })} 
            />
            <QuantityInput 
              label="Reorder Level" 
              min={0} 
              value={formData.reorderLevel} 
              onChange={val => setFormData({ ...formData, reorderLevel: val })} 
            />
          </div>
        </div>

        {/* Card 3: Supply Chain Configuration */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Supply Chain Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Strategy Dropdown */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Procurement Strategy
              </label>
              <select
                className="select"
                value={formData.procurementStrategy}
                onChange={e => setFormData({ ...formData, procurementStrategy: e.target.value })}
              >
                <option value="MTS">Make to Stock (MTS)</option>
                <option value="MTO">Make to Order (MTO)</option>
              </select>
            </div>

            {/* Procurement Type Dropdown */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Procurement Type
              </label>
              <select
                className="select"
                value={formData.procurementType}
                onChange={e => setFormData({ ...formData, procurementType: e.target.value })}
              >
                <option value="Purchase">Purchase (Bought-Out Material)</option>
                <option value="Manufacturing">Manufacturing (In-House Production)</option>
              </select>
            </div>
          </div>

          {formData.procurementType === 'Purchase' && (
            <div style={{ marginTop: '16px', maxWidth: '420px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Primary Supplier
              </label>
              <select
                className="select"
                value={formData.vendorId}
                onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
              >
                <option value="">-- None / Select Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.supplierCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <Checkbox 
            label="Product is Active" 
            checked={formData.active} 
            onChange={e => setFormData({ ...formData, active: e.target.checked })} 
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
