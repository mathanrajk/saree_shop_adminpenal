import React, { useState } from 'react';
import axios from 'axios';
import client from '../api/client';
import {
  ITags,
  IDressTypes,
  type Tags,
  type DressType,
  type IProductInput,
} from '../types/product';
import './Product.css';

const AddProduct: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(0);
  const [tag, setTag] = useState<Tags>('new');
  const [dressType, setDressType] = useState<DressType>('saree');
  const [offer, setOffer] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. Construct FormData
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
    }

    if (imageFile) {
      formData.append('images', imageFile);
    }

    // 2. Structured Product Object matching requested schema
    const productData: IProductInput = {
      title,
      description,
      price: Number(price) || 0,
      tag,
      dressType,
      offer,
      stock: Number(stock) || 0,
      ...(newPrice !== '' ? { newPrice: Number(newPrice) } : {}),
      ...(imageFile
        ? {
            images: {
              publicId: imageFile.name,
              url: imagePreview || '',
            },
          }
        : {}),
    };

    // 3. Log values to console
    console.group('🛒 Add Product - Submitted Data');
    console.log('Product Object:', productData);
    console.log('FormData Instance:', formData);
    console.log('FormData Entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.groupEnd();

    // 4. Send request to backend API (create_Product) using axios client
    try {
      const { data } = await client.post('/products/create', formData);

      console.log('✓ Server Response:', data);
      setMessage({ type: 'success', text: 'Product created and uploaded successfully!' });

      // Reset form on success
      setTitle('');
      setDescription('');
      setPrice('');
      setNewPrice('');
      setStock(0);
      setTag('new');
      setDressType('saree');
      setOffer(false);
      handleRemoveImage();
    } catch (err: unknown) {
      let errorMessage = 'Failed to connect to backend server. Make sure the server is running on port 8989.';
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Error creating product:', err);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-page">
      <div className="product-card">
        <div className="product-header">
          <div className="product-header-title-box">
            <span className="product-header-accent" aria-hidden="true" />
            <h2>Add New Saree</h2>
          </div>
          <p>Fill in the handcrafted saree details, fabric specifications, pricing, and stock.</p>
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
              placeholder="e.g. Traditional Banarasi Silk Saree"
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

          {/* Image Upload */}
          <div className="form-group">
            <label>Product Image</label>
            <div className="file-upload-box">
              <input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-file-input"
                disabled={loading}
              />
              <label htmlFor="image-file" className="file-upload-button">
                📁 {imageFile ? imageFile.name : 'Choose Image File'}
              </label>
              <span className="file-help-text">Supports JPG, PNG, WEBP</span>

              {imagePreview && (
                <div className="preview-container">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="product-img-preview"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-remove-image"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-add-product" disabled={loading}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
