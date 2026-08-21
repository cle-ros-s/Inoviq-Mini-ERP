import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Calendar, User, Package, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Timeline from '../../components/ui/Timeline';
import { getDeliveryById } from '../../services/deliveryService';

const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getDeliveryById(id);
        const data = res?.data || res;
        setDelivery(data);
      } catch (err) {
        console.error('Error loading delivery', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading delivery details...</div>;
  if (!delivery) {
    return <div className="p-8 text-center text-gray-500">Delivery shipment not found in database.</div>;
  }

  const delNum = delivery.deliveryNumber || delivery.id;
  const customerName = delivery.customer?.companyName || delivery.customer?.name || delivery.customerName || 'Customer';
  const addressStr = delivery.deliveryAddress || delivery.address || 'Standard Delivery Address';

  const timelineEvents = [
    {
      title: 'Delivery Scheduled',
      description: 'Order has been scheduled for delivery.',
      date: delivery.createdAt,
      icon: <Calendar size={16} />,
      status: 'completed'
    },
    {
      title: 'Dispatched / In Transit',
      description: `Driver: ${delivery.driverName || delivery.driver || 'Assigned Logistics Carrier'}`,
      date: delivery.updatedAt || delivery.createdAt,
      icon: <Clock size={16} />,
      status: ['IN_TRANSIT', 'Dispatched', 'In Transit', 'DELIVERED', 'Delivered'].includes(delivery.status) ? 'completed' : 'pending'
    },
    {
      title: 'Delivered to Customer',
      description: 'Shipment handed over to customer.',
      date: ['DELIVERED', 'Delivered'].includes(delivery.status) ? delivery.updatedAt : null,
      icon: <MapPin size={16} />,
      status: ['DELIVERED', 'Delivered'].includes(delivery.status) ? 'completed' : 'pending'
    }
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/delivery')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Delivery {delNum}
              <StatusBadge status={delivery.status || 'SCHEDULED'} />
            </h1>
            <p className="text-sm text-gray-500">Sales Order: {delivery.salesOrder?.orderNumber || delivery.salesOrderId || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Delivery Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <User size={16} /> Customer
                </h3>
                <p className="text-gray-900 font-medium">{customerName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <MapPin size={16} /> Destination Address
                </h3>
                <p className="text-gray-900">{addressStr}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Scheduled Date
                </h3>
                <p className="text-gray-900">
                  {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : 'Not Set'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <User size={16} /> Driver / Carrier
                </h3>
                <p className="text-gray-900">{delivery.driverName || delivery.driver || 'Standard Logistics'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Tracking Timeline">
            <Timeline events={timelineEvents} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;
