import React, { useState, useMemo, useEffect } from 'react';
import {
  useFetchOrderHistory,
  useUpdateOrderStatus,
  useUpdateDeliveryStatus,
  type OrderDocument,
  ORDER_STATUS,
  type OrderStatus,
  DELIVERY_STATUS,
  type DeliveryStatus,
} from '../hooks/query';
import {
  TopicText,
  StatCard,
  StatusChip,
  DataTable,
  Modal,
  Button,
  type Column,
} from '../UI';
import OrderStatusNav from '../components/OrderStatusNav';
import PrintInvoiceModal from '../components/PrintInvoiceModal';
import './Order.css';

const Order: React.FC = () => {
  // Fetch orders using router.get('/orderHistory', isAuth, getUser_order) with fallback
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useFetchOrderHistory();

  // Mutations to update order status and delivery_status via router.patch('/:orderId', update_order)
  const updateStatusMutation = useUpdateOrderStatus();
  const updateDeliveryStatusMutation = useUpdateDeliveryStatus();

  // Active status filter controlled by the small navigation bar
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  // Additional Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(null);

  // Selected Order for Full Printable Invoice & Parcel Slip
  const [orderToPrint, setOrderToPrint] = useState<OrderDocument | null>(null);

  // Status updating indicators
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingDeliveryOrderId, setUpdatingDeliveryOrderId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Console Log Data as explicitly requested by USER_REQUEST
  // -------------------------------------------------------------
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.group('📦 [Appu Sarees Admin] Orders Retrieved via router.get("/orderHistory")');
      console.log('Total Orders Count:', orders.length);
      console.log('Supported ORDER_STATUS values:', ORDER_STATUS);
      console.log('Supported DELIVERY_STATUS values:', DELIVERY_STATUS);
      console.log('Current Active Filter Tab:', selectedStatus);
      console.log('Complete Orders Payload Data:', orders);
      console.table(
        orders.map((o) => ({
          'Order ID': `#${o._id.slice(-6).toUpperCase()}`,
          Customer: o.name,
          Phone: o.phone,
          Amount: `₹${o.totalAmount?.toLocaleString('en-IN')}`,
          'Order Status': o.status || 'notStarted',
          Paid: o.payment ? 'YES' : 'NO',
          'Delivery Status': o.delivery_status || 'waiting',
          Gateway: o.paymentGateway || (o.phonepeOrderId ? 'phonepe' : 'razorpay'),
        }))
      );
      console.groupEnd();
    }
  }, [orders, selectedStatus]);

  // Compute status counts for the small nav bar
  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus | 'all', number> = {
      all: orders.length,
      pending: 0,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
    };

    orders.forEach((o) => {
      const st = o.status;
      if (st && counts[st] !== undefined) {
        counts[st]++;
      } else {
        counts.notStarted++;
      }
    });

    return counts;
  }, [orders]);

  // Computed KPI Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingDeliveryCount = 0;

    orders.forEach((ord) => {
      if (ord.payment) {
        totalRevenue += ord.totalAmount || 0;
        paidCount++;
      }
      if (ord.delivery_status !== 'delivered') {
        pendingDeliveryCount++;
      }
    });

    return { totalOrders, totalRevenue, paidCount, pendingDeliveryCount };
  }, [orders]);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // 1. ORDER_STATUS filter via Small Nav Bar
        if (selectedStatus !== 'all') {
          const currentStatus = order.status || 'notStarted';
          if (currentStatus !== selectedStatus) return false;
        }

        // 2. Text Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          order.name?.toLowerCase().includes(q) ||
          order.email?.toLowerCase().includes(q) ||
          order.phone?.includes(q) ||
          order._id?.toLowerCase().includes(q) ||
          order.phonepeTransactionId?.toLowerCase().includes(q) ||
          order.razorpayPaymentId?.toLowerCase().includes(q);

        // 3. Payment filter
        const matchesPayment =
          paymentFilter === 'all' ||
          (paymentFilter === 'paid' && order.payment) ||
          (paymentFilter === 'unpaid' && !order.payment);

        // 4. Delivery filter
        const matchesDelivery =
          deliveryFilter === 'all' || order.delivery_status === deliveryFilter;

        return matchesSearch && matchesPayment && matchesDelivery;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return (b.totalAmount || 0) - (a.totalAmount || 0);
        if (sortBy === 'amount-asc') return (a.totalAmount || 0) - (b.totalAmount || 0);
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [orders, selectedStatus, searchQuery, paymentFilter, deliveryFilter, sortBy]);

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    searchQuery.trim() !== '' ||
    paymentFilter !== 'all' ||
    deliveryFilter !== 'all' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
    setPaymentFilter('all');
    setDeliveryFilter('all');
    setSortBy('newest');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Order Status Change Handler
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    e?: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (e) e.stopPropagation();
    setUpdatingOrderId(orderId);
    console.log(`🔄 Updating order ${orderId} status to "${newStatus}"...`);

    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
      console.log(`✓ Order ${orderId} status successfully updated to:`, newStatus);
    } catch (err: any) {
      console.error('✕ Failed to update order status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Delivery Status Change Handler (DELIVERY_STATUS = ["waiting", "shipping", "delivered"])
  const handleDeliveryStatusChange = async (
    orderId: string,
    newDeliveryStatus: DeliveryStatus,
    e?: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (e) e.stopPropagation();
    setUpdatingDeliveryOrderId(orderId);
    console.log(`🚚 Updating order ${orderId} delivery_status to "${newDeliveryStatus}"...`);

    try {
      await updateDeliveryStatusMutation.mutateAsync({
        orderId,
        delivery_status: newDeliveryStatus,
      });
      console.log(`✓ Order ${orderId} delivery_status successfully updated to:`, newDeliveryStatus);
    } catch (err: any) {
      console.error('✕ Failed to update delivery status:', err);
    } finally {
      setUpdatingDeliveryOrderId(null);
    }
  };

  // Table Columns
  const columns: Column<OrderDocument>[] = [
    {
      key: 'orderId',
      header: 'Order & Date',
      render: (order) => (
        <div className="order-id-cell">
          <span className="table-primary-text font-mono">
            #{order._id.slice(-6).toUpperCase()}
          </span>
          <span className="table-secondary-text">{formatDate(order.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer Details',
      render: (order) => (
        <div className="order-customer-cell">
          <span className="table-primary-text">{order.name}</span>
          <span className="table-secondary-text">{order.phone}</span>
          <span className="order-city-text">
            {order.address?.split(',').slice(-2).join(', ')}
          </span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items Ordered',
      render: (order) => {
        const totalItems = order.products?.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        const firstItem = order.products?.[0]?.product;
        return (
          <div className="order-items-cell">
            {firstItem?.images?.url ? (
              <img
                src={firstItem.images.url}
                alt={firstItem.title}
                className="order-thumb"
              />
            ) : (
              <div className="order-thumb order-thumb-fallback">👘</div>
            )}
            <div className="order-items-info">
              <span className="order-items-count">
                {totalItems} {totalItems === 1 ? 'saree' : 'sarees'}
              </span>
              <span className="order-items-title" title={firstItem?.title}>
                {firstItem?.title || 'Handloom Item'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      align: 'right',
      render: (order) => (
        <div className="order-amount-cell">
          <span className="order-amount-val">
            ₹{order.totalAmount?.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (order) => (
        <div className="order-status-selector-cell" onClick={(e) => e.stopPropagation()}>
          <select
            className={`order-status-select select-status-${order.status || 'notStarted'}`}
            value={order.status || 'notStarted'}
            disabled={updatingOrderId === order._id}
            onChange={(e) =>
              handleStatusChange(order._id, e.target.value as OrderStatus, e)
            }
            aria-label="Change order status"
          >
            {ORDER_STATUS.map((st) => (
              <option key={st} value={st}>
                {st === 'notStarted'
                  ? 'Not Started'
                  : st === 'inProgress'
                  ? 'In Progress'
                  : st === 'pending'
                  ? 'Pending'
                  : 'Completed'}
              </option>
            ))}
          </select>
          {updatingOrderId === order._id && (
            <span className="order-status-updating-dot" title="Saving status..." />
          )}
        </div>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order) => (
        <div className="order-payment-cell">
          {order.payment ? (
            <StatusChip label="Paid" variant="paid" />
          ) : (
            <StatusChip label="Unpaid" variant="pending" />
          )}
          {order.phonepeOrderId || order.paymentGateway === 'phonepe' ? (
            <StatusChip label="PhonePe" variant="phonepe" />
          ) : order.razorpayOrderId || order.paymentGateway === 'razorpay' ? (
            <StatusChip label="Razorpay" variant="razorpay" />
          ) : null}
        </div>
      ),
    },
    {
      key: 'delivery_status',
      header: 'Delivery Fulfilment',
      render: (order) => (
        <div className="order-status-selector-cell" onClick={(e) => e.stopPropagation()}>
          <select
            className={`delivery-status-select select-delivery-${order.delivery_status || 'waiting'}`}
            value={order.delivery_status || 'waiting'}
            disabled={updatingDeliveryOrderId === order._id}
            onChange={(e) =>
              handleDeliveryStatusChange(order._id, e.target.value as DeliveryStatus, e)
            }
            aria-label="Update delivery fulfilment status"
          >
            {DELIVERY_STATUS.map((ds) => (
              <option key={ds} value={ds}>
                {ds === 'waiting'
                  ? 'Waiting Dispatch'
                  : ds === 'shipping'
                  ? 'In Transit / Shipping'
                  : 'Delivered'}
              </option>
            ))}
          </select>
          {updatingDeliveryOrderId === order._id && (
            <span className="order-status-updating-dot" title="Saving delivery..." />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (order) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setSelectedOrder(order)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Print Full Invoice & Parcel Packing Slip"
            onClick={() => setOrderToPrint(order)}
            icon={
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
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
            }
          >
            Slip
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="order-page-container">
        <TopicText
          topic="Customer Orders & Fulfilment"
          badge="DISPATCH & FULFILMENT"
          subtitle="Loading real-time orders from store database..."
        />
        <div className="orders-loading-card">
          <span className="admin-table-spinner" />
          <p>Calling router.get('/orderHistory') and loading store orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page-container">
        <TopicText topic="Customer Orders & Fulfilment" badge="ERROR" />
        <div className="alert-error" style={{ marginTop: '1.5rem' }}>
          Failed to fetch orders from backend. Ensure server is running on port 8989.
        </div>
      </div>
    );
  }

  return (
    <div className="order-page-container">
      {/* Header */}
      <TopicText
        topic="Customer Orders & Fulfilment"
        count={orders.length}
        badge="ORDERS DISPATCH"
        subtitle="Track customer orders, real-time payment verification, delivery states, and invoices."
        actions={
          <Button
            variant="secondary"
            size="md"
            loading={isRefetching}
            icon={
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
            }
            onClick={() => {
              console.log('🔄 Manually refetching orders via router.get("/orderHistory")...');
              refetch();
            }}
          >
            Refresh Orders
          </Button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="order-kpi-grid">
        <StatCard
          title="Total Orders"
          value={metrics.totalOrders}
          subtitle="Lifetime orders"
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
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Gross Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Paid transactions"
          trend={{ value: 'Verified', isPositive: true }}
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
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
          }
        />
        <StatCard
          title="Completed & Paid"
          value={metrics.paidCount}
          subtitle="Ready for dispatch"
          trend={{
            value: `${Math.round(
              (metrics.paidCount / (metrics.totalOrders || 1)) * 100
            )}% Paid`,
            isPositive: true,
          }}
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
          title="Pending Fulfilment"
          value={metrics.pendingDeliveryCount}
          subtitle="Orders awaiting dispatch"
          trend={{ value: 'In Pipeline', isPositive: false }}
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
              <rect width="16" height="13" x="4" y="5" rx="2" />
              <path d="M16 2v3" />
              <path d="M8 2v3" />
              <path d="M4 11h16" />
            </svg>
          }
        />
      </div>

      {/* Small Navigation Bar for ORDER_STATUS */}
      <OrderStatusNav
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => {
          setSelectedStatus(status);
          console.log(`🔘 Order status tab selected: "${status}"`);
        }}
        statusCounts={statusCounts}
      />

      {/* Search and Secondary Filter Bar */}
      <div className="filter-bar-container">
        <div className="filter-main-row">
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
              placeholder="Search by customer name, phone, order ID, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search orders"
            />
          </div>

          <div className="filter-controls-group">
            {/* Payment Filter */}
            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              aria-label="Filter by payment"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid / Pending</option>
            </select>

            {/* Delivery Status Filter */}
            <select
              className="filter-select"
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              aria-label="Filter by delivery"
            >
              <option value="all">All Delivery States</option>
              {DELIVERY_STATUS.map((ds) => (
                <option key={ds} value={ds}>
                  {ds === 'waiting'
                    ? 'Waiting Dispatch'
                    : ds === 'shipping'
                    ? 'In Transit / Shipping'
                    : 'Delivered'}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort orders"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={resetFilters}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Meta Info */}
        <div className="filter-meta-bar">
          <span className="filter-stats-text">
            Showing <strong>{filteredOrders.length}</strong> of{' '}
            <strong>{orders.length}</strong> orders
            {selectedStatus !== 'all' && (
              <span className="active-tab-indicator">
                {' '}• Filtered by Status: <strong>{selectedStatus}</strong>
              </span>
            )}
          </span>

          {hasActiveFilters && (
            <div className="active-filter-tags">
              {selectedStatus !== 'all' && (
                <span className="filter-pill">Status: {selectedStatus}</span>
              )}
              {searchQuery && (
                <span className="filter-pill">Search: "{searchQuery}"</span>
              )}
              {paymentFilter !== 'all' && (
                <span className="filter-pill">Payment: {paymentFilter}</span>
              )}
              {deliveryFilter !== 'all' && (
                <span className="filter-pill">Delivery: {deliveryFilter}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Orders Data Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        onRowClick={(item) => setSelectedOrder(item)}
        emptyMessage={`No customer orders match status "${selectedStatus}".`}
      />

      {/* Order Details Modal Dialog */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details #${selectedOrder?._id.slice(-6).toUpperCase()}`}
        subtitle={`Placed on ${formatDate(selectedOrder?.createdAt)}`}
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setOrderToPrint(selectedOrder)}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
              }
            >
              Print Invoice &amp; Parcel Slip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setSelectedOrder(null)}
            >
              Done
            </Button>
          </>
        }
      >
        {selectedOrder && (
          <div className="order-modal-body">
            {/* Status Header Banner with In-Modal Updaters */}
            <div className="order-modal-status-banner">
              <div className="status-banner-item">
                <span className="status-banner-label">Order Status</span>
                <select
                  className={`order-status-select select-status-${selectedOrder.status || 'notStarted'}`}
                  value={selectedOrder.status || 'notStarted'}
                  onChange={async (e) => {
                    const newSt = e.target.value as OrderStatus;
                    await handleStatusChange(selectedOrder._id, newSt);
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, status: newSt } : null
                    );
                  }}
                  aria-label="Change order status"
                >
                  {ORDER_STATUS.map((st) => (
                    <option key={st} value={st}>
                      {st === 'notStarted'
                        ? 'Not Started'
                        : st === 'inProgress'
                        ? 'In Progress'
                        : st === 'pending'
                        ? 'Pending'
                        : 'Completed'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="status-banner-item">
                <span className="status-banner-label">Delivery Fulfilment</span>
                <select
                  className={`delivery-status-select select-delivery-${selectedOrder.delivery_status || 'waiting'}`}
                  value={selectedOrder.delivery_status || 'waiting'}
                  onChange={async (e) => {
                    const newDs = e.target.value as DeliveryStatus;
                    await handleDeliveryStatusChange(selectedOrder._id, newDs);
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, delivery_status: newDs } : null
                    );
                  }}
                  aria-label="Update delivery status"
                >
                  {DELIVERY_STATUS.map((ds) => (
                    <option key={ds} value={ds}>
                      {ds === 'waiting'
                        ? 'Waiting Dispatch'
                        : ds === 'shipping'
                        ? 'In Transit / Shipping'
                        : 'Delivered'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="status-banner-item">
                <span className="status-banner-label">Payment Status</span>
                {selectedOrder.payment ? (
                  <StatusChip label="Payment Verified (Paid)" variant="paid" />
                ) : (
                  <StatusChip label="Payment Pending (Unpaid)" variant="pending" />
                )}
              </div>

              <div className="status-banner-item">
                <span className="status-banner-label">Payment Gateway</span>
                {selectedOrder.phonepeOrderId ||
                selectedOrder.paymentGateway === 'phonepe' ? (
                  <StatusChip label="PhonePe Gateway" variant="phonepe" />
                ) : (
                  <StatusChip label="Razorpay Gateway" variant="razorpay" />
                )}
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="order-details-grid">
              {/* Customer Box */}
              <div className="order-detail-card">
                <h4 className="order-card-title">Customer Contact</h4>
                <div className="detail-entry">
                  <span className="detail-label">Name:</span>
                  <span className="detail-val font-semibold">
                    {selectedOrder.name}
                  </span>
                </div>
                <div className="detail-entry">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-val">{selectedOrder.phone}</span>
                </div>
                <div className="detail-entry">
                  <span className="detail-label">Email:</span>
                  <span className="detail-val">{selectedOrder.email}</span>
                </div>
                <div className="detail-entry">
                  <span className="detail-label">Customer ID:</span>
                  <span className="detail-val font-mono">
                    {selectedOrder.ownerId}
                  </span>
                </div>
              </div>

              {/* Shipping Address Box */}
              <div className="order-detail-card">
                <h4 className="order-card-title">Delivery Address</h4>
                <div className="detail-entry">
                  <span className="detail-label">Address:</span>
                  <span className="detail-val">{selectedOrder.address}</span>
                </div>
                <div className="detail-entry">
                  <span className="detail-label">Pin code:</span>
                  <span className="detail-val font-semibold">
                    {selectedOrder.pinCode}
                  </span>
                </div>
                <div className="detail-entry">
                  <span className="detail-label">Order Reference:</span>
                  <span className="detail-val font-mono">
                    #{selectedOrder._id}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Transaction IDs */}
            {(selectedOrder.phonepeTransactionId ||
              selectedOrder.razorpayPaymentId ||
              selectedOrder.phonepeOrderId) && (
              <div className="transaction-id-box">
                <h4 className="order-card-title">Gateway Transaction Audit</h4>
                {selectedOrder.phonepeTransactionId && (
                  <div className="detail-entry">
                    <span className="detail-label">PhonePe Transaction ID:</span>
                    <span className="detail-val font-mono">
                      {selectedOrder.phonepeTransactionId}
                    </span>
                  </div>
                )}
                {selectedOrder.phonepeOrderId && (
                  <div className="detail-entry">
                    <span className="detail-label">PhonePe Order ID:</span>
                    <span className="detail-val font-mono">
                      {selectedOrder.phonepeOrderId}
                    </span>
                  </div>
                )}
                {selectedOrder.razorpayPaymentId && (
                  <div className="detail-entry">
                    <span className="detail-label">Razorpay Payment ID:</span>
                    <span className="detail-val font-mono">
                      {selectedOrder.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Line Items Table */}
            <div className="order-line-items-section">
              <h4 className="order-card-title">Ordered Sarees & Handlooms</h4>
              <div className="line-items-table-wrapper">
                <table className="line-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products?.map((item, idx) => {
                      const prod = item.product;
                      const itemPrice =
                        prod?.offer && prod?.newPrice
                          ? prod.newPrice
                          : prod?.price || 0;
                      const lineTotal = itemPrice * (item.quantity || 1);
                      return (
                        <tr key={idx}>
                          <td>
                            <div className="modal-item-cell">
                              {prod?.images?.url ? (
                                <img
                                  src={prod.images.url}
                                  alt={prod.title}
                                  className="modal-item-thumb"
                                />
                              ) : (
                                <div className="modal-item-thumb modal-item-fallback">
                                  👘
                                </div>
                              )}
                              <span className="modal-item-title">
                                {prod?.title || 'Handloom Item'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {prod?.dressType?.replace('-', ' ') || 'Saree'}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>
                            {item.quantity}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            ₹{itemPrice.toLocaleString('en-IN')}
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              color: 'var(--primary)',
                            }}
                          >
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          paddingTop: '1rem',
                        }}
                      >
                        Total Order Amount:
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: 'var(--primary)',
                          paddingTop: '1rem',
                        }}
                      >
                        ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Invoice & Parcel Packing Slip */}
      <PrintInvoiceModal
        order={orderToPrint}
        isOpen={Boolean(orderToPrint)}
        onClose={() => setOrderToPrint(null)}
      />
    </div>
  );
};

export default Order;
