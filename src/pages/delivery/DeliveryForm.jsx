import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Truck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { getDeliveryById, createDelivery, updateDelivery } from '../../services/deliveryService';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    salesOrder: '',
    customer: '',
    address: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    driver: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    if (isEditMode) {
      async function load() {
        const existing = await getDeliveryById(id);
        if (existing) {
          setFormData({
            salesOrder: existing.salesOrder || '',
            customer: existing.customer || '',
            address: existing.address || '',
            deliveryDate: existing.deliveryDate || '',
            driver: existing.driver || '',
            status: existing.status || 'Scheduled',
            notes: existing.notes || ''
          });
        }
      }
      load();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await updateDelivery(id, formData);
    } else {
      await createDelivery(formData);
    }
    navigate('/delivery');
  };

  const statuses = ['Scheduled', 'Ready for Dispatch', 'In Transit', 'Delivered'];

  return (
    <div className="page-container" style={{ maxWidth: '800px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/delivery')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Deliveries
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>{isEditMode ? 'Edit Delivery' : 'New Dispatch Order'}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            {isEditMode ? 'Edit Delivery' : 'New Dispatch Order'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: 'var(--color-primary)' }} /> Dispatch Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Sales Order ID"
              name="salesOrder"
              value={formData.salesOrder}
              onChange={handleChange}
              placeholder="Type SO number (e.g. SO-000001)..."
              required
            />
            <Input
              label="Customer Name"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="Type customer name..."
              required
            />
            <Input
              label="Driver / Vehicle Details"
              name="driver"
              value={formData.driver}
              onChange={handleChange}
              placeholder="Type driver name or vehicle number..."
            />
            <Input
              label="Delivery Date"
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
              Dispatch Status
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {statuses.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                  style={{
                    padding: '8px 14px',
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

          <div style={{ marginTop: '16px' }}>
            <Input
              label="Destination Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Type delivery address, city, pin..."
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Type any special handling or delivery notes..."
              rows={3}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/delivery')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Delivery
          </button>
        </div>
      </form>
    </div>
  );
}
