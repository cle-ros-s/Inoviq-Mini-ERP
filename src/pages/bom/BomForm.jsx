import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as bomService from '../../services/bomService.js';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import { Plus, Trash2, FileText } from 'lucide-react';

export default function BomForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('');

  const [formData, setFormData] = useState({
    version: '1.0',
    quantityProduced: 1,
    notes: '',
    items: []
  });

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await productService.getProductsWithInventory();
        const pList = Array.isArray(prodData) ? prodData : (prodData?.data || []);
        setProducts(pList);

        if (id) {
          const bomRes = await bomService.getBomById(id);
          const existingBom = bomRes?.data || bomRes;
          if (existingBom) {
            setProductId(existingBom.productId || (pList.length > 0 ? pList[0].id : ''));
            setFormData({
              version: existingBom.version || '1.0',
              quantityProduced: existingBom.quantityProduced || 1,
              notes: existingBom.notes || '',
              items: (existingBom.items || existingBom.components || []).map((item, idx) => ({
                key: `item-${Date.now()}-${idx}`,
                materialId: item.materialId || item.productId || '',
                quantity: item.quantity || 1,
                unitOfMeasure: item.unitOfMeasure || 'PCS'
              }))
            });
          }
        } else if (pList.length > 0) {
          setProductId(pList[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data in BomForm:', err);
      }
    }
    loadData();
  }, [id]);

  const addComponent = () => {
    const firstP = products[0];
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
          materialId: firstP ? firstP.id : '',
          quantity: 1,
          unitOfMeasure: firstP?.unitOfMeasure || 'PCS'
        }
      ]
    }));
  };

  const removeComponent = (key) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.key !== key)
    }));
  };

  const handleComponentSelect = (key, matId) => {
    const matched = products.find(p => p.id === matId);
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => {
        if (i.key === key) {
          return {
            ...i,
            materialId: matId,
            unitOfMeasure: matched ? matched.unitOfMeasure : 'PCS'
          };
        }
        return i;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      showError('Please select a finished product');
      return;
    }
    if (formData.items.length === 0) {
      showError('Please add at least one component to the BOM');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId,
        version: formData.version,
        quantityProduced: parseInt(formData.quantityProduced, 10) || 1,
        notes: formData.notes,
        items: formData.items.map(item => ({
          materialId: item.materialId,
          quantity: parseFloat(item.quantity) || 1,
          unitOfMeasure: item.unitOfMeasure || 'PCS'
        }))
      };

      let bom;
      if (id) {
        bom = await bomService.updateBom(id, payload);
        showSuccess('Bill of Materials updated successfully!');
      } else {
        bom = await bomService.createBom(payload);
        showSuccess('Bill of Materials created successfully!');
      }
      
      const createdId = bom?.id || bom?.data?.id || id || bom?.bomNumber || '';
      navigate(`/bom/${createdId}`);
    } catch (err) {
      showError(err.message || (id ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/bom')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Bill of Materials
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>{id ? 'Edit BOM' : 'New BOM'}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            {id ? 'Edit Bill of Materials' : 'New Bill of Materials'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} /> BOM Header Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            {/* Finished Product Dropdown */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Select Finished Product <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                className="select"
                value={productId}
                onChange={e => setProductId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select a Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <Input 
              label="Version"
              value={formData.version}
              onChange={e => setFormData({ ...formData, version: e.target.value })}
            />

            <Input 
              label="Yield Quantity"
              type="number"
              min="1"
              value={formData.quantityProduced}
              onChange={e => setFormData({ ...formData, quantityProduced: e.target.value })}
            />
          </div>
        </div>

        {/* Components Table */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Components & Materials</h3>
            <button type="button" onClick={addComponent} className="btn btn-secondary btn-sm" disabled={products.length === 0}>
              <Plus size={14} /> Add Material
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
              No components added. Click "+ Add Material" above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 3fr) 120px 120px 40px', gap: '12px', padding: '0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-600)', textTransform: 'uppercase' }}>
                <div>Select Raw Material / Part</div>
                <div>Quantity</div>
                <div>Unit</div>
                <div></div>
              </div>

              {formData.items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(260px, 3fr) 120px 120px 40px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div>
                    <select
                      className="select"
                      value={item.materialId}
                      onChange={e => handleComponentSelect(item.key, e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Select a Material --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      className="input"
                      value={item.quantity}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          items: prev.items.map(i => i.key === item.key ? { ...i, quantity: val } : i)
                        }));
                      }}
                      required
                      style={{ textAlign: 'center', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      className="input"
                      value={item.unitOfMeasure}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          items: prev.items.map(i => i.key === item.key ? { ...i, unitOfMeasure: val } : i)
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeComponent(item.key)}
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/bom')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (id ? 'Updating BOM...' : 'Saving BOM...') : (id ? 'Update Bill of Materials' : 'Save Bill of Materials')}
          </button>
        </div>
      </form>
    </div>
  );
}
