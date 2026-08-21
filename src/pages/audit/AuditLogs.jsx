import React, { useEffect, useState } from 'react';
import * as auditService from '../../services/auditService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { formatDate } from '../../utils/formatters.js';
import { exportAuditLogs } from '../../utils/csvExport.js';
import { useToast } from '../../hooks/useToast.js';

export default function AuditLogs() {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      setLogs(auditService.getLogs() || []);
    } catch (e) {
      showError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  const columns = [
    { key: 'id', label: 'Log ID', sortable: true },
    { key: 'action', label: 'Action Event', sortable: true },
    { key: 'entity', label: 'Entity Type', sortable: true },
    { key: 'entityId', label: 'Entity Reference' },
    { key: 'description', label: 'Activity Description' },
    { key: 'userId', label: 'Triggered By User', sortable: true },
    {
      key: 'createdAt', label: 'Timestamp', sortable: true,
      render: (row) => formatDate(row.createdAt || row.timestamp)
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Trail</h1>
          <p className="page-subtitle">Immutable chronological log of all stock movements, status transitions, and user actions</p>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={() => exportAuditLogs(logs)}>
            Export Audit CSV
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search audit log entries..."
        onExport={() => exportAuditLogs(logs)}
        defaultPageSize={20}
      />
    </div>
  );
}
