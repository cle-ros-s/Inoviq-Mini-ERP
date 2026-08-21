import React from 'react';
import { 
  FileEdit, CheckCircle, Clock, AlertTriangle, 
  XCircle, Circle, Truck, ShoppingCart, Factory, Zap, Slash, ShieldCheck
} from 'lucide-react';

const STATUS_MAP = {
  'draft': { label: 'Draft', icon: FileEdit, colorClass: 'status-gray' },
  'confirmed': { label: 'Confirmed', icon: CheckCircle, colorClass: 'status-info' },
  'pending': { label: 'Pending', icon: Clock, colorClass: 'status-gray' },
  'in progress': { label: 'In Progress', icon: Circle, colorClass: 'status-warning' },
  'in_progress': { label: 'In Progress', icon: Circle, colorClass: 'status-warning' },
  'completed': { label: 'Completed', icon: CheckCircle, colorClass: 'status-success' },
  'cancelled': { label: 'Cancelled', icon: XCircle, colorClass: 'status-error' },
  'delayed': { label: 'Delayed', icon: AlertTriangle, colorClass: 'status-error' },
  'partially delivered': { label: 'Partially Delivered', icon: Truck, colorClass: 'status-warning' },
  'fully delivered': { label: 'Fully Delivered', icon: CheckCircle, colorClass: 'status-success' },
  'partially received': { label: 'Partially Received', icon: Truck, colorClass: 'status-warning' },
  'fully received': { label: 'Fully Received', icon: CheckCircle, colorClass: 'status-success' },
  'received': { label: 'Received', icon: CheckCircle, colorClass: 'status-success' },
  'healthy': { label: 'Healthy', icon: CheckCircle, colorClass: 'status-success' },
  'low stock': { label: 'Low Stock', icon: AlertTriangle, colorClass: 'status-warning' },
  'out of stock': { label: 'Out of Stock', icon: XCircle, colorClass: 'status-error' },
  'active': { label: 'Active', icon: CheckCircle, colorClass: 'status-success' },
  'inactive': { label: 'Inactive', icon: XCircle, colorClass: 'status-gray' },
  'planned': { label: 'Planned', icon: Clock, colorClass: 'status-info' },
  'passed': { label: 'Passed', icon: CheckCircle, colorClass: 'status-success' },
  'failed': { label: 'Failed', icon: XCircle, colorClass: 'status-error' },
};

const StatusBadge = ({ status, variant }) => {
  const norm = String(status || '').toLowerCase().trim();
  const mapping = STATUS_MAP[norm] || { label: status || 'Unknown', icon: Circle, colorClass: 'status-gray' };
  const Icon = mapping.icon;
  const colorClass = variant ? `status-${variant}` : mapping.colorClass;
  const displayLabel = mapping.label || status;

  return (
    <span className={`status-badge ${colorClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
      <Icon size={13} />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
