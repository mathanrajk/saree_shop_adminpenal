import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`admin-btn admin-btn-${variant} admin-btn-${size} ${
        loading ? 'admin-btn-loading' : ''
      } ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="admin-btn-spinner" />
      ) : icon ? (
        <span className="admin-btn-icon">{icon}</span>
      ) : null}
      <span className="admin-btn-label">{children}</span>
    </button>
  );
};

export default Button;
