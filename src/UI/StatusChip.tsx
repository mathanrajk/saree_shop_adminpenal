import React from 'react';
import './StatusChip.css';

export type StatusVariant =
  | 'paid'
  | 'completed'
  | 'delivered'
  | 'in-stock'
  | 'active'
  | 'pending'
  | 'processing'
  | 'low-stock'
  | 'waiting'
  | 'shipping'
  | 'cancelled'
  | 'out-of-stock'
  | 'refunded'
  | 'failed'
  | 'phonepe'
  | 'razorpay'
  | 'custom'
  | 'brand';

export interface StatusChipProps {
  label: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'brand',
  icon,
  pulse = false,
  className = '',
}) => {
  return (
    <span className={`status-chip status-chip-${variant} ${className}`.trim()}>
      {pulse && <span className="status-chip-dot" />}
      {icon && <span className="status-chip-icon">{icon}</span>}
      <span className="status-chip-text">{label}</span>
    </span>
  );
};

export default StatusChip;
