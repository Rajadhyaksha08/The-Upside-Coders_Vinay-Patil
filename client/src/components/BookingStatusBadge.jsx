import React from 'react';
import { STATUS_CONFIG } from '../data/mockData';

export default function BookingStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    color: 'badge-slate',
    icon: 'ℹ️',
  };

  return (
    <span className={`badge ${config.color} text-xs font-medium`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}
