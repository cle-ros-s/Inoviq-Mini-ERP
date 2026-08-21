import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as userService from '../../services/userService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';
import { Plus, Users, RefreshCw, UserCheck, Shield } from 'lucide-react';

const formatRole = (roleStr) => {
  if (!roleStr) return 'User';
  return roleStr
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function UserList() {
  const navigate = useNavigate();
  const { hasPermission, currentUser } = useAuth();
  const { refreshCounter, triggerRefresh } = useRefresh();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await userService.getUsers();
      const rawList = Array.isArray(res) ? res : (res?.data || []);
      const enriched = rawList.map((u, idx) => ({
        ...u,
        displayId: `USR-${String(idx + 1).padStart(4, '0')}`,
        formattedRole: formatRole(u.role),
        status: u.status || (u.active ? 'ACTIVE' : 'INACTIVE')
      }));
      setUsers(enriched);
    } catch (e) {
      console.error('Failed to load users from database:', e);
      setFetchError(e.message || 'Failed to load system users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshCounter]);

  const handleToggleStatus = async (user) => {
    try {
      await userService.deactivateUser(user.id);
      showSuccess(`Status updated for ${user.name}`);
      triggerRefresh();
    } catch (err) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const columns = [
    { 
      key: 'displayId', 
      label: 'User ID', 
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-gray-700)' }}>
          {row.displayId}
        </span>
      )
    },
    { 
      key: 'name', 
      label: 'Full Name', 
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-surface)',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px'
          }}>
            {(row.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{row.name}</div>
            {row.email === currentUser?.email && (
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>(You)</span>
            )}
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email Address', sortable: true },
    {
      key: 'formattedRole', 
      label: 'System Role', 
      sortable: true,
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          backgroundColor: row.role?.includes('ADMIN') ? 'rgba(139, 94, 60, 0.12)' : 'var(--color-gray-100)',
          color: row.role?.includes('ADMIN') ? 'var(--color-primary-dark)' : 'var(--color-gray-800)',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {row.role?.includes('ADMIN') && <Shield size={12} />}
          {row.formattedRole}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Account Status', 
      sortable: true,
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> 
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (row) => formatDate(row.createdAt) 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
            style={{ fontSize: '12px' }}
          >
            {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} /> User Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Manage ERP users, roles, and administrative active accounts from PostgreSQL
          </p>
        </div>
        
        {hasPermission('users', 'full') && (
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/users/new')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> New User
          </button>
        )}
      </div>

      {fetchError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fetchError}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchUsers}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable
        searchPlaceholder="Search name, email, or role..."
        emptyTitle="No Users Found"
        emptyDescription="No system users found in the database."
      />
    </div>
  );
}
