import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as bomService from '../../services/bomService.js';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import { Trash2 } from 'lucide-react';

export default function BomForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '', version: '1.0', status: 'Active', components: [], operations: []
  });

  useEffect(() => {
    try { setProducts(productService.getProductsWithInventory()); } catch(e) { console.error(e); }
  }, []);

  const addComponent = () => setFormData({ ...formData, components: [...formData.components, { productId: '', qty: 1, unit: 'pcs' }]});
  const removeComponent = (idx) => setFormData({ ...formData, components: formData.components.filter((_, i) => i !== idx) });
  
  const addOperation = () => setFormData({ ...formData, operations: [...formData.operations, { name: '', workCenter: '', duration: 10, sequence: formData.operations.length + 1 }]});
  const removeOperation = (idx) => setFormData({ ...formData, operations: formData.operations.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bom = await bomService.createBom(formData, user.id);
      showSuccess('BoM created');
      navigate(`/bom/${bom.id}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="text-2xl font-bold" style={{ marginBottom: '24px' }}>New Bill of Materials</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow" style={{ padding: '24px', borderRadius: '8px', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1 }}>
            <Select label="Finished Product" options={products.map(p => ({value: p.id, label: p.name}))} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <Input label="Version" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <Select label="Status" options={[{value:'Active', label:'Active'},{value:'Draft', label:'Draft'}]} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
          </div>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 className="font-bold" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Components</h3>
          {formData.components.map((c, i) => (
             <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <select className="select" style={{ width: '300px' }} value={c.productId} onChange={e => {
                  const newC = [...formData.components];
                  newC[i].productId = e.target.value;
                  setFormData({...formData, components: newC});
                }}>
                  <option value="">Select Component...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" className="input" style={{ width: '120px' }} value={c.qty} onChange={e => {
                  const newC = [...formData.components];
                  newC[i].qty = Number(e.target.value);
                  setFormData({...formData, components: newC});
                }} />
                <button type="button" onClick={() => removeComponent(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 className="h-5 w-5 text-red-500"/></button>
             </div>
          ))}
          <button type="button" onClick={addComponent} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>+ Add Component</button>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 className="font-bold" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Operations</h3>
          {formData.operations.map((o, i) => (
             <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input type="text" placeholder="Operation Name" className="input" style={{ width: '300px' }} value={o.name} onChange={e => {
                  const newO = [...formData.operations];
                  newO[i].name = e.target.value;
                  setFormData({...formData, operations: newO});
                }} />
                <input type="number" placeholder="Duration (min)" className="input" style={{ width: '120px' }} value={o.duration} onChange={e => {
                  const newO = [...formData.operations];
                  newO[i].duration = Number(e.target.value);
                  setFormData({...formData, operations: newO});
                }} />
                <button type="button" onClick={() => removeOperation(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 className="h-5 w-5 text-red-500"/></button>
             </div>
          ))}
          <button type="button" onClick={addOperation} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>+ Add Operation</button>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create BoM</button>
        </div>
      </form>
    </div>
  );
}
