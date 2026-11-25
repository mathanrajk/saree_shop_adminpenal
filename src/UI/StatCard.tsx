import React from 'react';
import './StatCard.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accent?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = true,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`stat-card ${accent ? 'stat-card-accent' : ''} ${
        onClick ? 'stat-card-clickable' : ''
      } ${className}`.trim()}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon-container">{icon}</div>
      </div>

      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
      </div>

      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span
              className={`stat-trend-pill ${
                trend.isPositive ? 'trend-positive' : 'trend-negative'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
