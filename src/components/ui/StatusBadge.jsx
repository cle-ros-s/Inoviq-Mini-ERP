import React from 'react';
import { 
  FileEdit, CheckCircle, Clock, AlertTriangle, 
  XCircle, Circle, Truck, ShoppingCart, Factory, Zap, Slash
} from 'lucide-react';

const STATUS_MAP = {
  'Draft': { icon: FileEdit, colorClass: 'status-gray' },
  'Confirmed': { icon: CheckCircle, colorClass: 'status-info' },
  'Pending': { icon: Clock, colorClass: 'status-gray' },
  'In Progress': { icon: Circle, colorClass: 'status-warning' },
  'Completed': { icon: CheckCircle, colorClass: 'status-success' },
  'Cancelled': { icon: XCircle, colorClass: 'status-error' },
  'Delayed': { icon: AlertTriangle, colorClass: 'status-error' },
  'Partially Delivered': { icon: Truck, colorClass: 'status-warning' },
  'Fully Delivered': { icon: CheckCircle, colorClass: 'status-success' },
  'Partially Received': { icon: Truck, colorClass: 'status-warning' },
  'Fully Received': { icon: CheckCircle, colorClass: 'status-success' },
  'Healthy': { icon: CheckCircle, colorClass: 'status-success' },
  'Low Stock': { icon: AlertTriangle, colorClass: 'status-warning' },
  'Out of Stock': { icon: XCircle, colorClass: 'status-error' },
  'Active': { icon: CheckCircle, colorClass: 'status-success' },
  'Inactive': { icon: XCircle, colorClass: 'status-gray' },
  'Purchase Created': { icon: ShoppingCart, colorClass: 'status-info' },
  'Manufacturing Created': { icon: Factory, colorClass: 'status-info' },
  'Triggered': { icon: Zap, colorClass: 'status-warning' },
  'Skipped': { icon: Slash, colorClass: 'status-gray' },
};

const StatusBadge = ({ status, variant }) => {
  const mapping = STATUS_MAP[status] || { icon: Circle, colorClass: 'status-gray' };
  const Icon = mapping.icon;
  const colorClass = variant ? `status-${variant}` : mapping.colorClass;

  return (
    <span className={`status-badge ${colorClass}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      {status}
    </span>
  );
};

export default StatusBadge;
