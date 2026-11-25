import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../../UI/StatusChip';
import './Card.css';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  newPrice?: number;
  stock?: number;
  dressType?: string;
  offer: boolean;
  tag?: string;
  images?: {
    publicId?: string;
    url?: string;
  };
}

interface CardProps {
  product: Product;
  onDelete?: (product: Product) => void;
}

const Card: React.FC<CardProps> = ({ product, onDelete }) => {
  const navigate = useNavigate();

  const displayPrice =
    product.offer && product.newPrice ? product.newPrice : product.price;

  const discountPercent =
    product.offer && product.newPrice && product.price > product.newPrice
      ? Math.round(((product.price - product.newPrice) / product.price) * 100)
      : null;

  const handleNavigateToEdit = () => {
    navigate(`/edit-product/${product._id}`, { state: { product } });
  };

  const getStockStatus = () => {
    const stock = product.stock ?? 0;
    if (stock <= 0) return { label: 'Out of Stock', variant: 'cancelled' as const };
    if (stock <= 5) return { label: `${stock} Low Stock`, variant: 'low-stock' as const };
    return { label: `${stock} In Stock`, variant: 'in-stock' as const };
  };

  const stockInfo = getStockStatus();

  return (
    <div
      className="product-card"
      onClick={handleNavigateToEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNavigateToEdit();
        }
      }}
      title={`Click to edit ${product.title}`}
    >
      {/* Full Width Image Container */}
      <div className="product-image-container">
        {product.images?.url ? (
          <img
            src={product.images.url}
            alt={product.title}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-no-image">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>No Image</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="card-floating-badges">
          <div className="card-badges-left">
            {product.tag && (
              <span className="product-tag">{product.tag.toUpperCase()}</span>
            )}
            {product.dressType && (
              <span className="product-dresstype-tag">
                {product.dressType.replace('-', ' ')}
              </span>
            )}
          </div>
          {discountPercent !== null && (
            <span className="product-discount-badge">{discountPercent}% OFF</span>
          )}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="product-content">
        <div className="product-info-header">
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>
          <div className="product-stock-wrapper">
            <StatusChip label={stockInfo.label} variant={stockInfo.variant} />
          </div>
        </div>

        <div className="product-footer-row">
          <div className="product-price-section">
            <span className="current-price">
              ₹{displayPrice?.toLocaleString('en-IN')}
            </span>
            {product.offer && product.newPrice && (
              <span className="original-price">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="product-card-actions">
            <button
              type="button"
              className="edit-product-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToEdit();
              }}
              aria-label={`Edit ${product.title}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>

            {onDelete && (
              <button
                type="button"
                className="delete-product-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product);
                }}
                aria-label={`Delete ${product.title}`}
                title="Delete Saree"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
