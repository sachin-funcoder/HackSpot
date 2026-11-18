const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', className: 'status-badge--upcoming' },
  ongoing: { label: 'Live Now', className: 'status-badge--ongoing' },
  completed: { label: 'Completed', className: 'status-badge--completed' },
};

const MODE_CONFIG = {
  online: { label: 'Online', className: 'mode-badge--online' },
  offline: { label: 'In-Person', className: 'mode-badge--offline' },
  hybrid: { label: 'Hybrid', className: 'mode-badge--hybrid' },
};

function StatusBadge({ status, mode, isDemo = false }) {
  if (isDemo) {
    return (
      <span
        className="status-badge status-badge--demo"
        title="Fictional demonstration event seeded for preview"
      >
        DEMO
      </span>
    );
  }

  if (mode) {
    const modeInfo = MODE_CONFIG[mode] || { label: mode, className: '' };
    return <span className={`status-badge mode-badge ${modeInfo.className}`}>{modeInfo.label}</span>;
  }

  const statusInfo = STATUS_CONFIG[status] || { label: status || 'Unknown', className: '' };

  return (
    <span className={`status-badge ${statusInfo.className}`}>
      {status === 'ongoing' && <span className="status-badge__pulse" aria-hidden="true" />}
      {statusInfo.label}
    </span>
  );
}

export default StatusBadge;
