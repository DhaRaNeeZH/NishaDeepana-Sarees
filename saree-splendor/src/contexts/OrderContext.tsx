import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Order, OrderStatus } from '../types/order';
import { api } from '../lib/api';

const STORAGE_KEY = 'nd_orders_v1';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Order) => void;
    getOrderById: (id: string) => Order | undefined;
    getOrdersByEmail: (email: string) => Order[];
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    updateOrder: (id: string, partial: Partial<Order>) => void;
    cancelOrder: (id: string) => void;
    markRefunded: (id: string) => void;
    addOrderNote: (id: string, note: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored) as Order[];
        } catch {
            // ignore parse errors
        }
        return [];
    });

    // Fetch orders from backend on mount
    useEffect(() => {
        api.getOrders()
            .then((data) => {
                if (data.length > 0) {
                    const mapped = data.map((o: any) => ({ ...o, id: o._id || o.id }));
                    setOrders(mapped);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
                }
            })
            .catch(() => {
                // Backend unavailable — use localStorage
            });
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        } catch {
            // ignore storage errors
        }
    }, [orders]);

    const addOrder = (order: Order) => {
        setOrders(prev => [order, ...prev]);
        // Sync to backend
        api.createOrder(order).catch(() => { });
    };

    const getOrderById = (id: string) =>
        orders.find(o => o.id === id);

    const getOrdersByEmail = (email: string) =>
        orders.filter(o => o.email.toLowerCase() === email.toLowerCase());

    const updateOrderStatus = (id: string, status: OrderStatus) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
            )
        );
        // Sync to backend
        api.updateOrderStatus(id, status).catch(() => { });
    };

    const updateOrder = (id: string, partial: Partial<Order>) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === id
                    ? { ...o, ...partial, updatedAt: new Date().toISOString() }
                    : o
            )
        );
    };

    const cancelOrder = (id: string) => {
        const now = new Date().toISOString();
        setOrders(prev =>
            prev.map(o =>
                o.id === id
                    ? { ...o, status: 'cancelled' as OrderStatus, cancelledAt: now, updatedAt: now }
                    : o
            )
        );
        // Sync to backend
        api.cancelOrder(id).catch(() => { });
    };

    const markRefunded = (id: string) => {
        const now = new Date().toISOString();
        setOrders(prev =>
            prev.map(o =>
                o.id === id
                    ? {
                        ...o,
                        status: 'refunded' as OrderStatus,
                        payment: { ...o.payment, status: 'refunded', paidAt: o.payment.paidAt },
                        updatedAt: now
                    }
                    : o
            )
        );
        // Sync to backend
        api.refundOrder(id).catch(() => { });
    };

    const addOrderNote = (id: string, note: string) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === id
                    ? { ...o, notes: note, updatedAt: new Date().toISOString() }
                    : o
            )
        );
        // Sync to backend
        api.addOrderNote(id, note).catch(() => { });
    };

    return (
        <OrderContext.Provider value={{
            orders,
            addOrder,
            getOrderById,
            getOrdersByEmail,
            updateOrderStatus,
            updateOrder,
            cancelOrder,
            markRefunded,
            addOrderNote,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const ctx = useContext(OrderContext);
    if (!ctx) throw new Error('useOrders must be used within OrderProvider');
    return ctx;
}
