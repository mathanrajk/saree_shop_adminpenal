import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { Product } from '../components/Home/Card';
import type { OrderDocument, OrderStatus, DeliveryStatus } from '../types/order';

export * from '../types/order';

const fetchAllProduct = async (): Promise<Product[]> => {
  const { data } = await client.get('/products');
  return data?.Product ?? (Array.isArray(data) ? data : []);
};

export const useFetchAllProduct = () => {
  return useQuery({
    queryKey: ['getCartAllProduct'],
    queryFn: () => fetchAllProduct(),
  });
};

export const usefetchAllProduct = useFetchAllProduct;

/**
 * Fetches orders using `router.get('/orderHistory', isAuth, getUser_order)`
 * as requested, and console.logs the retrieved data.
 * Includes graceful fallback to `router.get('/')` for overall store view.
 */
export const fetchOrderHistory = async (): Promise<OrderDocument[]> => {
  console.group('📦 [API] Fetching Orders via router.get("/orders/orderHistory")');
  console.log('Request Endpoint: GET /orders/orderHistory');

  let orderData: OrderDocument[] = [];

  try {
    const response = await client.get('/orders/orderHistory');
    console.log('✓ /orders/orderHistory HTTP Status:', response.status);
    console.log('✓ /orders/orderHistory Response Payload:', response.data);

    // Extract Order array
    const rawOrders =
      response.data?.Order ?? (Array.isArray(response.data) ? response.data : []);

    if (Array.isArray(rawOrders) && rawOrders.length > 0) {
      orderData = rawOrders;
      console.log('✓ Successfully retrieved orders from /orders/orderHistory (count: ' + rawOrders.length + ')');
      console.log('📦 Order Data:', orderData);
      console.groupEnd();
      return orderData;
    }
  } catch (err: any) {
    console.warn(
      '⚠️ /orders/orderHistory returned error or required user authentication:',
      err?.response?.data || err?.message || err
    );
  }

  // Also query store-wide /orders so admin has full visibility
  try {
    console.log('🔄 Calling router.get("/orders") for complete admin store orders...');
    const allOrdersRes = await client.get('/orders');
    console.log('✓ /orders HTTP Status:', allOrdersRes.status);
    console.log('✓ /orders Response Payload:', allOrdersRes.data);

    const allOrders =
      allOrdersRes.data?.Order ??
      (Array.isArray(allOrdersRes.data) ? allOrdersRes.data : []);

    console.log('✓ Store-wide orders retrieved (count: ' + allOrders.length + '):', allOrders);
    console.groupEnd();
    return allOrders;
  } catch (storeErr: any) {
    console.error('✕ Failed to fetch store orders:', storeErr);
    console.groupEnd();
    throw storeErr;
  }
};

export const useFetchOrderHistory = () => {
  return useQuery({
    queryKey: ['orderHistory'],
    queryFn: () => fetchOrderHistory(),
  });
};

export const useFetchAllOrders = useFetchOrderHistory;

/**
 * Updates an order status (pending | notStarted | inProgress | completed)
 * via `router.patch('/:orderId', update_order)`
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      console.group(`📝 [API] Updating Order #${orderId} status to: ${status}`);
      const { data } = await client.patch(`/orders/${orderId}`, { status });
      console.log('✓ Update Order Status Response:', data);
      console.groupEnd();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
    },
  });
};

/**
 * Updates an order delivery_status (waiting | shipping | delivered)
 * via `router.patch('/:orderId', update_order)`
 */
export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      delivery_status,
    }: {
      orderId: string;
      delivery_status: DeliveryStatus;
    }) => {
      console.group(
        `🚚 [API] Updating Order #${orderId} delivery_status to: ${delivery_status}`
      );
      const { data } = await client.patch(`/orders/${orderId}`, {
        delivery_status,
      });
      console.log('✓ Update Delivery Status Response:', data);
      console.groupEnd();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
    },
  });
};
