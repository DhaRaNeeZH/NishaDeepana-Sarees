import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, Package, Truck, Star, RefreshCw, Ban } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { OrderStatus } from '../types/order';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
    paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: <Package className="h-4 w-4" /> },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: <Truck className="h-4 w-4" /> },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <Star className="h-4 w-4" /> },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: <RefreshCw className="h-4 w-4" /> },
};

const TIMELINE_STEPS: Array<{ label: string; status: OrderStatus }> = [
    { label: 'Order Placed', status: 'pending' },
    { label: 'Payment Confirmed', status: 'paid' },
    { label: 'Processing', status: 'processing' },
    { label: 'Shipped', status: 'shipped' },
    { label: 'Delivered', status: 'delivered' },
];

const STATUS_RANK: Record<OrderStatus, number> = {
    pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1, refunded: -1,
};

export const TrackOrderPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orderIdInput, setOrderIdInput] = React.useState('');
    const [trackedOrder, setTrackedOrder] = React.useState<any | null>(null);
    const [notFound, setNotFound] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const fetchOrder = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setNotFound(false);
        try {
            // Fetch all orders and find by _id match
            const orders = await api.getOrders();
            const found = orders.find((o: any) => o._id === id.trim());
            if (found) {
                setTrackedOrder(found);
                setNotFound(false);
            } else {
                setTrackedOrder(null);
                setNotFound(true);
            }
        } catch {
            setTrackedOrder(null);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const id = searchParams.get('orderId');
        if (id) {
            setOrderIdInput(id);
            fetchOrder(id);
        }
    }, [searchParams]);

    const handleCancel = async (orderId: string) => {
        if (!confirm('Cancel this order? This cannot be undone.')) return;
        try {
            await api.cancelOrder(orderId);
            setTrackedOrder((prev: any) => prev ? { ...prev, status: 'cancelled', cancelledAt: new Date().toISOString() } : null);
        } catch (err: any) {
            alert(err.message || 'Failed to cancel order');
        }
    };

    const canCancel = (status: OrderStatus) => status === 'pending' || status === 'paid';

    const getTimeline = (status: OrderStatus) => {
        if (status === 'cancelled') return [
            { label: 'Order Placed', done: true, isCancelled: false },
            { label: 'Cancelled', done: true, isCancelled: true },
        ];
        if (status === 'refunded') return [
            { label: 'Order Placed', done: true, isCancelled: false },
            { label: 'Cancelled', done: true, isCancelled: true },
            { label: 'Refunded', done: true, isCancelled: false },
        ];
        const rank = STATUS_RANK[status] ?? 0;
        return TIMELINE_STEPS.map(step => ({
            label: step.label,
            done: STATUS_RANK[step.status] <= rank,
            isCancelled: false,
        }));
    };

    const cfg = trackedOrder ? STATUS_CONFIG[trackedOrder.status as OrderStatus] : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-maroon" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Track Your Order
                    </h1>
                    <p className="text-gray-500">Enter your order ID to see live status</p>
                    {user && (
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="mt-2 text-sm text-maroon underline hover:no-underline"
                        >
                            View all my orders &rarr;
                        </button>
                    )}
                </div>

                {/* Search */}
                <Card className="mb-8 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter your Order ID (from confirmation)"
                                value={orderIdInput}
                                onChange={e => setOrderIdInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchOrder(orderIdInput)}
                                className="h-12 text-base flex-1"
                                aria-label="Order ID input"
                            />
                            <Button
                                size="lg"
                                onClick={() => fetchOrder(orderIdInput)}
                                disabled={loading}
                                className="bg-maroon hover:bg-maroon-dark text-beige"
                            >
                                {loading ? (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="h-5 w-5 mr-2" />
                                )}
                                Track
                            </Button>
                        </div>
                        {notFound && (
                            <p className="text-red-500 mt-3 text-sm">Order not found. Please check the ID and try again.</p>
                        )}
                    </CardContent>
                </Card>

                {trackedOrder && cfg && (
                    <div className="space-y-6">
                        {/* Header */}
                        <Card className="border-l-4 border-maroon shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                                        <h2 className="text-lg font-bold text-gray-900 font-mono break-all">#{trackedOrder._id}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.color}`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trackedOrder.payment?.status === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : trackedOrder.payment?.status === 'refunded'
                                                ? 'bg-gray-100 text-gray-600'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {trackedOrder.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online Pay'} — {trackedOrder.payment?.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-maroon">Order Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                                    {getTimeline(trackedOrder.status as OrderStatus).map((step, i) => (
                                        <li key={i} className="ml-6 relative">
                                            <span className={`absolute -left-8 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${step.done
                                                ? step.isCancelled ? 'bg-red-400' : 'bg-maroon'
                                                : 'bg-gray-200'
                                                }`}>
                                                {step.done ? (
                                                    step.isCancelled
                                                        ? <Ban className="h-3 w-3 text-white" />
                                                        : <CheckCircle className="h-3 w-3 text-white" />
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                )}
                                            </span>
                                            <p className={`text-sm font-semibold ${step.done ? (step.isCancelled ? 'text-red-600' : 'text-gray-900') : 'text-gray-400'}`}>
                                                {step.label}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Customer & Shipping */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-2">Customer</h4>
                                        <p className="text-gray-800 font-medium">{trackedOrder.customerName}</p>
                                        <p className="text-gray-500 text-sm">{trackedOrder.email}</p>
                                        <p className="text-gray-500 text-sm">{trackedOrder.phone}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-2">Shipping Address</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {trackedOrder.shippingAddress?.street}<br />
                                            {trackedOrder.shippingAddress?.city}, {trackedOrder.shippingAddress?.state}<br />
                                            {trackedOrder.shippingAddress?.pincode}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-maroon">Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {trackedOrder.items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-start pb-3 border-b last:border-0">
                                            <div>
                                                <p className="font-medium text-sm">{item.productName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} x {formatCurrency(item.basePrice)}</p>
                                            </div>
                                            <p className="font-semibold text-maroon text-sm">{formatCurrency(item.totalPrice)}</p>
                                        </div>
                                    ))}

                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span><span>{formatCurrency(trackedOrder.subtotal)}</span>
                                        </div>
                                        {trackedOrder.discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-700">
                                                <span>Bulk Discount</span><span>-{formatCurrency(trackedOrder.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span>{trackedOrder.shipping === 0 ? 'FREE' : formatCurrency(trackedOrder.shipping)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                                            <span>Total</span>
                                            <span className="text-maroon">{formatCurrency(trackedOrder.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {canCancel(trackedOrder.status as OrderStatus) && (
                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-400 text-red-600 hover:bg-red-50"
                                            onClick={() => handleCancel(trackedOrder._id)}
                                        >
                                            <Ban className="h-4 w-4 mr-2" /> Cancel Order
                                        </Button>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Orders can only be cancelled before processing begins.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
