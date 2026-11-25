import React from 'react';
import { ORDER_STATUS, type OrderStatus } from '../types/order';
import './OrderStatusNav.css';

export interface OrderStatusNavProps {
  selectedStatus: OrderStatus | 'all';
  onSelectStatus: (status: OrderStatus | 'all') => void;
  statusCounts?: Record<OrderStatus | 'all', number>;
  className?: string;
}

interface StatusTabConfig {
  key: OrderStatus | 'all';
  label: string;
  icon: React.ReactNode;
}

const statusTabs: StatusTabConfig[] = [
  {
    key: 'all',
    label: 'All Orders',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: 'notStarted',
    label: 'Not Started',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    ),
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
      </svg>
    ),
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

const OrderStatusNav: React.FC<OrderStatusNavProps> = ({
  selectedStatus,
  onSelectStatus,
  statusCounts,
  className = '',
}) => {
  return (
    <nav
      className={`order-status-nav ${className}`.trim()}
      aria-label="Order Status Navigation"
    >
      <div className="order-status-nav-scroll">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          const count = statusCounts ? statusCounts[tab.key] : undefined;

          return (
            <button
              key={tab.key}
              type="button"
              className={`order-status-tab ${isActive ? 'active' : ''} status-tab-${tab.key}`}
              onClick={() => onSelectStatus(tab.key)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="order-status-icon">{tab.icon}</span>
              <span className="order-status-label">{tab.label}</span>
              {typeof count === 'number' && (
                <span
                  className={`order-status-pill ${
                    isActive ? 'pill-active' : 'pill-inactive'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default OrderStatusNav;
export { ORDER_STATUS };
