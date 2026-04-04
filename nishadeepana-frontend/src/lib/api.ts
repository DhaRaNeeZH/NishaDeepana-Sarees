// ================================================================
// API Client — centralized backend communication
// ================================================================
// Base URL defaults to localhost:5000 in development.
// In production, set VITE_API_BASE_URL environment variable.
// ================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    // Attach JWT token if exists
    const token = localStorage.getItem('nd_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorBody.error || `API Error: ${res.status}`);
    }

    return res.json();
}

// ── Typed API methods ─────────────────────────────────

export const api = {
    // Products
    getProducts: () => apiFetch<any[]>('/api/products'),
    getProduct: (id: string) => apiFetch<any>(`/api/products/${id}`),
    createProduct: (data: any) => apiFetch<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: string, data: any) => apiFetch<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: string) => apiFetch<any>(`/api/products/${id}`, { method: 'DELETE' }),

    // Orders
    getOrders: (email?: string) => apiFetch<any[]>(email ? `/api/orders?email=${encodeURIComponent(email)}` : '/api/orders'),
    trackOrder: (id: string) => apiFetch<any>(`/api/orders/track/${id}`),
    createOrder: (data: any) => apiFetch<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateOrderStatus: (id: string, status: string) => apiFetch<any>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    cancelOrder: (id: string) => apiFetch<any>(`/api/orders/${id}/cancel`, { method: 'POST' }),
    refundOrder: (id: string) => apiFetch<any>(`/api/orders/${id}/refund`, { method: 'POST' }),
    addOrderNote: (id: string, notes: string) => apiFetch<any>(`/api/orders/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ notes }) }),

    // Auth
    login: (email: string, password: string) => apiFetch<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    // User Data (cart + wishlist per email)
    getUserData: (email: string) => apiFetch<{ cart: any[]; wishlist: string[] }>(`/api/userdata/${encodeURIComponent(email)}`),
    saveCart: (email: string, cart: any[]) => apiFetch<any>(`/api/userdata/${encodeURIComponent(email)}/cart`, { method: 'PUT', body: JSON.stringify({ cart }) }),
    saveWishlist: (email: string, wishlist: string[]) => apiFetch<any>(`/api/userdata/${encodeURIComponent(email)}/wishlist`, { method: 'PUT', body: JSON.stringify({ wishlist }) }),

    // Payments (Razorpay)
    createPaymentOrder: (amount: number) =>
        apiFetch<{ orderId: string; amount: number; currency: string; key: string }>(
            '/api/payments/create-order',
            { method: 'POST', body: JSON.stringify({ amount }) }
        ),
    verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        apiFetch<{ verified: boolean; paymentId: string }>('/api/payments/verify', {
            method: 'POST', body: JSON.stringify(data),
        }),

    // Image Upload
    uploadImage: async (file: File): Promise<{ url: string }> => {
        const token = localStorage.getItem('nd_token');
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || 'Upload failed');
        }
        return res.json();
    },

    // Delivery Charge Settings
    getDeliveryCharges: () =>
        apiFetch<{ tamilnadu: number; nearby: number; others: number; freeShipping: boolean }>('/api/settings/delivery'),
    updateDeliveryCharges: (charges: { tamilnadu: number; nearby: number; others: number; freeShipping?: boolean }) =>
        apiFetch<{ message: string; value: { tamilnadu: number; nearby: number; others: number; freeShipping: boolean } }>(
            '/api/settings/delivery',
            { method: 'PUT', body: JSON.stringify(charges) }
        ),
};
