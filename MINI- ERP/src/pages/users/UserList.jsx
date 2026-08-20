import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefresh } from '../../hooks/useRefresh.js';
import * as userService from '../../services/userService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function UserList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { refreshCounter } = useRefresh();
  const { showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      setUsers(userService.getUsers() || []);
    } catch (e) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]);

  const columns = [
    { key: 'id', label: 'User ID', sortable: true },
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    {
      key: 'role', label: 'System Role', sortable: true,
      render: (row) => <span className="badge" style={{ textTransform: 'capitalize' }}>{row.role}</span>
    },
    { key: 'active', label: 'Status', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and administrative access permissions</p>
        </div>
        <div>
          {hasPermission('users', 'full') && (
            <button className="btn btn-primary" onClick={() => navigate('/users/new')}>
              + New User
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search users..."
      />
    </div>
  );
}
