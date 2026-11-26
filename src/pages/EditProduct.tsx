import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import client from '../api/client';
import {
  ITags,
  IDressTypes,
  type Tags,
  type DressType,
  type IProductInput,
} from '../types/product';
import type { Product } from '../components/Home/Card';
import './Product.css';

const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // State from location if navigated from Card
  const initialProduct = (location.state as { product?: Product } | null)?.product;

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState<number | ''>(
    initialProduct?.price !== undefined ? initialProduct.price : ''
  );
  const [newPrice, setNewPrice] = useState<number | ''>(
    initialProduct?.newPrice !== undefined ? initialProduct.newPrice : ''
  );
  const [stock, setStock] = useState<number | ''>(
    initialProduct?.stock !== undefined ? initialProduct.stock : 0
  );
  const [tag, setTag] = useState<Tags>((initialProduct?.tag as Tags) || 'new');
  const [dressType, setDressType] = useState<DressType>(
    (initialProduct?.dressType as DressType) || 'saree'
  );
  const [offer, setOffer] = useState(initialProduct?.offer || false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialProduct?.images?.url || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [fetching, setFetching] = useState(!initialProduct);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // If page is refreshed or accessed directly by URL, fetch product details
  useEffect(() => {
    if (!initialProduct && productId) {
      client
        .get(`/products/${productId}`)
        .then(({ data }) => {
          const prod: Product = data?.product || data;
          if (prod) {
            setTitle(prod.title || '');
            setDescription(prod.description || '');
            setPrice(prod.price !== undefined ? prod.price : '');
            setNewPrice(prod.newPrice !== undefined ? prod.newPrice : '');
            setStock(prod.stock !== undefined ? prod.stock : 0);
            if (prod.tag) setTag(prod.tag as Tags);
            if (prod.dressType) setDressType(prod.dressType as DressType);
            setOffer(prod.offer || false);
            if (prod.images?.url) setCurrentImageUrl(prod.images.url);
          }
        })
        .catch((err) => {
          console.error('Failed to load product:', err);
          setMessage({
            type: 'error',
            text: 'Failed to fetch product details from server.',
          });
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [productId, initialProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveNewImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setLoading(true);
    setMessage(null);

    // 1. Construct FormData for PATCH
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('tag', tag);
    formData.append('dressType', dressType);
    formData.append('offer', String(offer));

    if (newPrice !== '' && newPrice !== undefined) {
      formData.append('newPrice', String(newPrice));
    } else {
      formData.append('newPrice', '0');
    }

    if (imageFile) {
      formData.append('images', imageFile);
    }

    // Structured Product Object
    const productData: IProductInput = {
      title,
      description,
      price: Number(price) || 0,
      tag,
      dressType,
      offer,
      stock: Number(stock) || 0,
      ...(newPrice !== '' ? { newPrice: Number(newPrice) } : {}),
    };

    console.group('✏️ Edit Product - Submitted Data');
    console.log('Product ID:', productId);
    console.log('Updated Object:', productData);
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.groupEnd();

    try {
      const { data } = await client.patch(`/products/${productId}`, formData);
      console.log('✓ Server Response:', data);

      setMessage({ type: 'success', text: 'Product updated successfully!' });

      // Invalidate queries so AllProduct list refreshes
      queryClient.invalidateQueries({ queryKey: ['getCartAllProduct'] });

      // Update current image URL if server returned new product image
      if (data?.product?.images?.url) {
        setCurrentImageUrl(data.product.images.url);
        handleRemoveNewImage();
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to update product.';
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Error updating product:', err);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="product-page">
        <div className="product-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading Product Details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-card">
        <div className="product-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="product-header-title-box">
              <span className="product-header-accent" aria-hidden="true" />
              <h2>Edit Saree Details</h2>
            </div>
            <p>Update saree information, fabric details, stock count, and pricing</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            ← Back to Sarees
          </button>
        </div>

        {message && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
            {message.type === 'success' ? '✓ ' : '✕ '}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Product Title *</label>
            <input
              id="title"
              type="text"
              required
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              required
              rows={4}
              placeholder="Enter product details, fabric, dimensions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Pricing & Stock Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                id="stock"
                type="number"
                min="0"
                required
                placeholder="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Dress Type and Tag Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dressType">Dress Type *</label>
              <select
                id="dressType"
                value={dressType}
                onChange={(e) => setDressType(e.target.value as DressType)}
                disabled={loading}
              >
                {IDressTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() +
                      type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tag">Tag *</label>
              <select
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value as Tags)}
                disabled={loading}
              >
                {ITags.map((t) => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Offer and New Price */}
          <div className="form-row align-center">
            <div className="form-group checkbox-group">
              <label className="checkbox-label" htmlFor="offer">
                <input
                  id="offer"
                  type="checkbox"
                  checked={offer}
                  onChange={(e) => setOffer(e.target.checked)}
                  disabled={loading}
                />
                <span>Special Offer Available</span>
              </label>
            </div>

            {offer && (
              <div className="form-group">
                <label htmlFor="newPrice">Offer Price (₹)</label>
                <input
                  id="newPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Discounted price"
                  value={newPrice}
                  onChange={(e) =>
                    setNewPrice(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Image Upload / Replacement */}
          <div className="form-group">
            <label>Product Image</label>
            <div className="file-upload-box">
              {currentImageUrl && !imagePreview && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginBottom: '0.35rem' }}>
                    Current Image:
                  </span>
                  <img
                    src={currentImageUrl}
                    alt="Current product"
                    className="product-img-preview"
                  />
                </div>
              )}

              <input
                id="edit-image-file"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-file-input"
                disabled={loading}
              />
              <label htmlFor="edit-image-file" className="file-upload-button">
                📁 {imageFile ? imageFile.name : currentImageUrl ? 'Change Product Image' : 'Choose Image File'}
              </label>
              <span className="file-help-text">Leave untouched to keep current image</span>

              {imagePreview && (
                <div className="preview-container">
                  <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                    New Image Selected:
                  </span>
                  <img
                    src={imagePreview}
                    alt="New preview"
                    className="product-img-preview"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewImage}
                    className="btn-remove-image"
                    disabled={loading}
                  >
                    Cancel New Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-add-product" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
