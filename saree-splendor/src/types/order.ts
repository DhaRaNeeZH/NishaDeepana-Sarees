// Order type definitions

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentMethod = 'cod' | 'mock_pay' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Payment {
    method: PaymentMethod;
    status: PaymentStatus;
    providerOrderId?: string;
    transactionId?: string;
    paidAt?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    basePrice: number;
    selectedBlouse: {
        kind: 'running' | 'contrast' | 'matching' | 'none';
        price: number;
    };
    unitPrice: number; // After bulk discount + blouse
    totalPrice: number; // unitPrice * quantity
}

export interface Order {
    id: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    status: OrderStatus;
    payment: Payment;
    customerName: string;
    email: string;
    phone: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    notes?: string; // Admin internal notes
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}
