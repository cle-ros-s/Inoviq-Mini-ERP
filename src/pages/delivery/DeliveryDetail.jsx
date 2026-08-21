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

  useEffect(() => {
    const data = getDeliveryById(id);
    setDelivery(data);
  }, [id]);

  if (!delivery) {
    return <div className="p-8 text-center text-gray-500">Delivery not found.</div>;
  }

  const timelineEvents = [
    {
      title: 'Delivery Scheduled',
      description: 'Order has been scheduled for delivery.',
      date: delivery.createdAt,
      icon: <Calendar size={16} />,
      status: 'completed'
    },
    {
      title: 'Ready for Dispatch',
      description: 'Items are packed and ready.',
      date: delivery.updatedAt || delivery.createdAt,
      icon: <Package size={16} />,
      status: ['Ready for Dispatch', 'Dispatched', 'In Transit', 'Delivered'].includes(delivery.status) ? 'completed' : 'pending'
    },
    {
      title: 'Dispatched',
      description: `Dispatched with driver: ${delivery.driver || 'Unassigned'}`,
      date: delivery.updatedAt,
      icon: <Clock size={16} />,
      status: ['Dispatched', 'In Transit', 'Delivered'].includes(delivery.status) ? 'completed' : 'pending'
    },
    {
      title: 'Delivered',
      description: 'Package has been delivered to customer.',
      date: delivery.status === 'Delivered' ? delivery.updatedAt : null,
      icon: <MapPin size={16} />,
      status: delivery.status === 'Delivered' ? 'completed' : 'pending'
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
              Delivery {delivery.id}
              <StatusBadge status={delivery.status} />
            </h1>
            <p className="text-sm text-gray-500">Order: {delivery.salesOrder}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/delivery/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Edit size={18} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Delivery Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <User size={16} /> Customer
                </h3>
                <p className="text-gray-900 font-medium">{delivery.customer}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <MapPin size={16} /> Destination
                </h3>
                <p className="text-gray-900">{delivery.address}</p>
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
                  <User size={16} /> Driver
                </h3>
                <p className="text-gray-900">{delivery.driver || 'Unassigned'}</p>
              </div>
            </div>

            {delivery.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes & Instructions</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{delivery.notes}</p>
              </div>
            )}
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
