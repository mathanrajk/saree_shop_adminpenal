import React, { useEffect } from 'react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`admin-modal-container admin-modal-${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title-box">
            <span className="admin-modal-accent" aria-hidden="true" />
            <div>
              <h3 className="admin-modal-title">{title}</h3>
              {subtitle && <p className="admin-modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body">{children}</div>

        {/* Modal Footer */}
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
