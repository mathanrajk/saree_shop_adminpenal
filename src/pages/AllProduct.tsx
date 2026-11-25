import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchAllProduct } from '../hooks/query';
import client from '../api/client';
import {
  TopicText,
  StatCard,
  StatusChip,
  DataTable,
  Modal,
  Button,
  SkeletonCard,
  type Column,
} from '../UI';
import Card, { type Product } from '../components/Home/Card';
import { IDressTypes, ITags } from '../types/product';
import { dummyData } from '../utils/helper';
import './AllProduct.css';

const AllProduct: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useFetchAllProduct();

  // View state: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Computed KPI Metrics
  const metrics = useMemo(() => {
    const total = data.length;
    let inStock = 0;
    let lowStock = 0;
    let onOffer = 0;

    data.forEach((p: Product) => {
      const stock = p.stock ?? 0;
      if (stock > 5) inStock++;
      else if (stock > 0 && stock <= 5) lowStock++;
      if (p.offer) onOffer++;
    });

    return { total, inStock, lowStock, onOffer };
  }, [data]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return data
      .filter((product: Product) => {
        const matchesSearch =
          !searchQuery.trim() ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' ||
          product.dressType?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesTag =
          selectedTag === 'all' ||
          product.tag?.toLowerCase() === selectedTag.toLowerCase();

        const stock = product.stock ?? 0;
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in-stock' && stock > 5) ||
          (stockFilter === 'low-stock' && stock > 0 && stock <= 5) ||
          (stockFilter === 'out-of-stock' && stock <= 0);

        return matchesSearch && matchesCategory && matchesTag && matchesStock;
      })
      .sort((a: Product, b: Product) => {
        if (sortBy === 'price-asc') {
          const priceA = a.offer && a.newPrice ? a.newPrice : a.price;
          const priceB = b.offer && b.newPrice ? b.newPrice : b.price;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.offer && a.newPrice ? a.newPrice : a.price;
          const priceB = b.offer && b.newPrice ? b.newPrice : b.price;
          return priceB - priceA;
        }
        if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'stock-asc') return (a.stock || 0) - (b.stock || 0);
        return 0; // Default newest
      });
  }, [data, searchQuery, selectedCategory, selectedTag, stockFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTag !== 'all' ||
    stockFilter !== 'all' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setStockFilter('all');
    setSortBy('newest');
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await client.delete(`/products/${productToDelete._id}`);
      queryClient.invalidateQueries({ queryKey: ['getCartAllProduct'] });
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Delete product error:', err);
      setDeleteError(
        err?.response?.data?.message || err?.message || 'Failed to delete product.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns Definition
  const tableColumns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Saree / Item',
      render: (product) => (
        <div className="table-product-cell">
          {product.images?.url ? (
            <img
              src={product.images.url}
              alt={product.title}
              className="table-product-thumb"
            />
          ) : (
            <div className="table-product-thumb table-product-thumb-placeholder">
              <span>👘</span>
            </div>
          )}
          <div className="table-product-info">
            <span className="table-primary-text">{product.title}</span>
            <span className="table-secondary-text">
              ID: {product._id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'dressType',
      header: 'Category',
      render: (product) => (
        <span className="table-category-tag">
          {product.dressType ? product.dressType.replace('-', ' ') : 'General'}
        </span>
      ),
    },
    {
      key: 'tag',
      header: 'Collection Tag',
      render: (product) =>
        product.tag ? (
          <StatusChip label={product.tag.toUpperCase()} variant="brand" />
        ) : (
          <span className="table-secondary-text">—</span>
        ),
    },
    {
      key: 'stock',
      header: 'Stock Status',
      render: (product) => {
        const stock = product.stock ?? 0;
        if (stock <= 0) return <StatusChip label="Out of Stock" variant="cancelled" />;
        if (stock <= 5) return <StatusChip label={`${stock} Low Stock`} variant="low-stock" />;
        return <StatusChip label={`${stock} In Stock`} variant="in-stock" />;
      },
    },
    {
      key: 'price',
      header: 'Pricing',
      align: 'right',
      render: (product) => {
        const isOffer = product.offer && product.newPrice;
        const currentPrice = isOffer ? product.newPrice : product.price;
        return (
          <div className="table-price-cell">
            <span className="table-price-current">
              ₹{currentPrice?.toLocaleString('en-IN')}
            </span>
            {isOffer && (
              <span className="table-price-original">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (product) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="subtle"
            size="sm"
            onClick={() =>
              navigate(`/edit-product/${product._id}`, { state: { product } })
            }
          >
            Edit
          </Button>
          <button
            type="button"
            className="btn-table-delete"
            onClick={() => setProductToDelete(product)}
            title="Delete Saree"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    const dummydata = dummyData(8);
    return (
      <div className="all-products-page">
        <TopicText
          topic="Saree & Ethnic Collection"
          badge="INVENTORY"
          subtitle="Loading boutique inventory catalog..."
        />
        <div className="product-grid">
          {dummydata.map((_: string, index: number) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-products-page">
        <TopicText topic="Saree & Ethnic Collection" badge="ERROR" />
        <div className="alert-error" style={{ marginTop: '1.5rem' }}>
          <span>Failed to connect to the store backend API. Ensure the backend server is running on port 8989.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="all-products-page">
      {/* Header with Title and Actions */}
      <TopicText
        topic="Saree & Ethnic Collection"
        count={data.length}
        badge="BOUTIQUE INVENTORY"
        subtitle="Manage sarees, handloom collections, stock allocations, and pricing."
        actions={
          <div className="header-actions-group">
            {/* View Switcher Button */}
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
                aria-label="Table view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
                <span>Table</span>
              </button>
            </div>

            {/* Add Saree Primary Button */}
            <Button
              variant="primary"
              size="md"
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
              }
              onClick={() => navigate('/add-product')}
            >
              Add New Saree
            </Button>
          </div>
        }
      />

      {/* KPI Metric Cards Row */}
      <div className="product-kpi-grid">
        <StatCard
          title="Total Sarees"
          value={metrics.total}
          subtitle="Catalog cataloged"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <StatCard
          title="Ready In Stock"
          value={metrics.inStock}
          subtitle="Ample inventory"
          trend={{ value: 'Available', isPositive: true }}
          icon={
            <svg
              width="20"
              height="20"
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
          }
        />
        <StatCard
          title="Low Stock Alert"
          value={metrics.lowStock}
          subtitle="Stock ≤ 5 items"
          trend={{ value: 'Restock soon', isPositive: false }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          }
        />
        <StatCard
          title="Special Offers"
          value={metrics.onOffer}
          subtitle="Discount active"
          trend={{ value: 'Promotions', isPositive: true }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          }
        />
      </div>

      {/* Advanced Filter Bar */}
      <div className="filter-bar-container">
        <div className="filter-main-row">
          {/* Search Box */}
          <div className="search-box">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by saree title, fabric, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="filter-controls-group">
            {/* Category Filter */}
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Dress Type"
            >
              <option value="all">All Categories</option>
              {IDressTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() +
                    type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              className="filter-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              aria-label="Filter by Tag"
            >
              <option value="all">All Tags</option>
              {ITags.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              className="filter-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by Stock status"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock (&gt; 5)</option>
              <option value="low-stock">Low Stock (≤ 5)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {/* Sort Options */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="stock-asc">Stock: Low First</option>
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={resetFilters}
                title="Reset all filters"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Meta Bar */}
        <div className="filter-meta-bar">
          <span className="filter-stats-text">
            Showing <strong>{filteredProducts.length}</strong> of{' '}
            <strong>{data.length}</strong> sarees
          </span>

          {hasActiveFilters && (
            <div className="active-filter-tags">
              {searchQuery && (
                <span className="filter-pill">Search: "{searchQuery}"</span>
              )}
              {selectedCategory !== 'all' && (
                <span className="filter-pill">Type: {selectedCategory}</span>
              )}
              {selectedTag !== 'all' && (
                <span className="filter-pill">Tag: {selectedTag}</span>
              )}
              {stockFilter !== 'all' && (
                <span className="filter-pill">Stock: {stockFilter}</span>
              )}
              {sortBy !== 'newest' && (
                <span className="filter-pill">Sorted</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Grid View or Table View */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="empty-state-title">No sarees match your filters</h3>
          <p className="empty-state-desc">
            Try adjusting your search terms, changing category selection, or clearing active filters.
          </p>
          <Button variant="secondary" size="md" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="product-grid">
          {filteredProducts.map((product: Product) => (
            <Card
              key={product._id}
              product={product}
              onDelete={(prod) => setProductToDelete(prod)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          onRowClick={(item) =>
            navigate(`/edit-product/${item._id}`, { state: { product: item } })
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => {
          if (!isDeleting) setProductToDelete(null);
        }}
        title="Delete Saree Item"
        subtitle="This action cannot be undone."
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={isDeleting}
              onClick={handleDeleteProduct}
            >
              Delete Item
            </Button>
          </>
        }
      >
        <div className="delete-modal-content">
          <p>
            Are you sure you want to delete <strong>"{productToDelete?.title}"</strong>?
            This will permanently remove the saree from the store database and catalog.
          </p>
          {deleteError && (
            <div className="alert-error" style={{ marginTop: '1rem' }}>
              {deleteError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AllProduct;
