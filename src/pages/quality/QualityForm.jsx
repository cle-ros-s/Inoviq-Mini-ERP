import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, CheckCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import { getInspectionById, createInspection, updateInspection } from '../../services/qualityService';

export default function QualityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    productionOrder: '',
    product: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0],
    result: 'Passed',
    defects: '',
    notes: '',
    status: 'Completed'
  });

  useEffect(() => {
    if (isEdit) {
      async function load() {
        const existing = await getInspectionById(id);
        if (existing) setFormData(existing);
      }
      load();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updateInspection(id, formData);
    } else {
      await createInspection(formData);
    }
    navigate('/quality');
  };

  const results = ['Passed', 'Needs Rework', 'Failed'];
  const statuses = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="page-container" style={{ maxWidth: '750px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/quality')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Quality Inspections
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>{isEdit ? 'Edit Inspection' : 'New Quality Inspection'}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Edit Inspection' : 'New Quality Inspection'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} /> Inspection Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Production Order ID"
              name="productionOrder"
              value={formData.productionOrder}
              onChange={handleChange}
              placeholder="Type MO number (e.g. MO-000001)..."
              required
            />
            <Input
              label="Product Name"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="Type product name..."
              required
            />
            <Input
              label="Inspector Name"
              name="inspector"
              value={formData.inspector}
              onChange={handleChange}
              placeholder="Type inspector name..."
              required
            />
            <Input
              label="Inspection Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Inspection Result
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {results.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, result: r }))}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: formData.result === r ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: formData.result === r ? 'var(--color-primary-surface)' : '#FFFFFF',
                      color: formData.result === r ? 'var(--color-primary-dark)' : 'var(--color-gray-700)',
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Status
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {statuses.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: formData.status === s ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: formData.status === s ? 'var(--color-primary-surface)' : '#FFFFFF',
                      color: formData.status === s ? 'var(--color-primary-dark)' : 'var(--color-gray-700)',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Defects / Findings Notes
            </label>
            <textarea
              className="input"
              rows={3}
              name="defects"
              value={formData.defects}
              onChange={handleChange}
              placeholder="Type any defect observations or quality remarks..."
              style={{ width: '100%', height: '70px', padding: '8px 12px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/quality')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Inspection
          </button>
        </div>
      </form>
    </div>
  );
}
