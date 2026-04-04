import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, Package, RefreshCw, Star, Truck, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import type { OrderStatus } from '../types/order';

interface TimelineStep {
    label: string;
    done: boolean;
    active?: boolean;
    isError?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700', icon: <Clock /> },
    paid: { label: 'Paid', color: 'bg-blue-50 text-blue-700', icon: <CheckCircle /> },
    processing: { label: 'Processing', color: 'bg-purple-50 text-purple-700', icon: <Package /> },
    shipped: { label: 'Shipped', color: 'bg-indigo-50 text-indigo-700', icon: <Truck /> },
    delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700', icon: <Star /> },
    cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700', icon: <XCircle /> },
    refunded: { label: 'Refunded', color: 'bg-gray-50 text-gray-700', icon: <RefreshCw /> },
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

    const [orderIdInput, setOrderIdInput] = React.useState('');
    const [trackedOrder, setTrackedOrder] = React.useState<any | null>(null);
    const [notFound, setNotFound] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const fetchOrder = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setNotFound(false);
        try {
            // Fetch using the new public trackOrder endpoint
            const data = await api.trackOrder(id.trim());
            setTrackedOrder(data);
            setNotFound(false);
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

    const getTimelineSteps = (currentStatus: OrderStatus): TimelineStep[] => {
        if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
            return [
                { label: 'Order Placed', done: true },
                { label: currentStatus.toUpperCase(), done: true, isError: true }
            ];
        }
        const rank = STATUS_RANK[currentStatus] ?? 0;
        return TIMELINE_STEPS.map(step => ({
            label: step.label,
            done: STATUS_RANK[step.status] <= rank,
            active: step.status === currentStatus
        }));
    };

    const cfg = trackedOrder ? STATUS_CONFIG[trackedOrder.status as OrderStatus] : null;

    return (
        <div className="min-h-screen bg-[#FFFBF7] pb-20">
            {/* Elegant Header */}
            <div className="bg-white border-b border-beige/50 pt-16 pb-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-maroon" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Track Your Saree
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Enter your Order ID to see exactly where your elegant attire is in our processing journey.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8">
                {/* Search Bar — Floating Style */}
                <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 mb-12 border border-beige/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Paste Order ID here..."
                            value={orderIdInput}
                            onChange={e => setOrderIdInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchOrder(orderIdInput)}
                            className="w-full h-14 pl-12 pr-4 bg-transparent outline-none text-gray-800 font-medium"
                        />
                    </div>
                    <Button
                        size="lg"
                        onClick={() => fetchOrder(orderIdInput)}
                        disabled={loading}
                        className="bg-maroon hover:bg-maroon-dark text-beige rounded-xl px-8 h-14 shadow-lg shadow-maroon/20"
                    >
                        {loading ? 'Searching...' : 'Track Now'}
                    </Button>
                </div>

                {notFound && (
                    <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100 mb-8 animate-in fade-in slide-in-from-top-4">
                        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                        <h3 className="font-bold text-red-800">Order Not Found</h3>
                        <p className="text-red-600 text-sm">Please check the ID and try again.</p>
                    </div>
                )}

                {trackedOrder && cfg && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                        {/* Status Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="md:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-20 w-20 rounded-full flex items-center justify-center ${cfg.color} ring-8 ring-beige/10`}>
                                            {React.cloneElement(cfg.icon as React.ReactElement, { className: 'h-10 w-10' })}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                                            <h2 className="text-3xl font-extrabold text-gray-900">{cfg.label}</h2>
                                            <p className="text-sm text-gray-500 mt-1">Updated recently</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-maroon text-beige overflow-hidden relative">
                                <CardContent className="p-8">
                                    <p className="text-xs font-medium text-beige/60 uppercase tracking-widest mb-1">Total Amount</p>
                                    <h2 className="text-3xl font-bold">{formatCurrency(trackedOrder.total)}</h2>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                                        <span className="text-xs font-medium opacity-80">
                                            {trackedOrder.payment?.status === 'paid' ? 'Verified Payment' : 'Payment Pending'}
                                        </span>
                                    </div>
                                    {/* Decorative element */}
                                    <Star className="absolute -bottom-4 -right-4 h-24 w-24 text-beige/5 rotate-12" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Timeline Visualization */}
                        <Card className="border-none shadow-sm bg-white p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-maroon" /> Order Timeline
                            </h3>
                            <div className="relative">
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 hidden md:block"></div>
                                <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
                                    {getTimelineSteps(trackedOrder.status as OrderStatus).map((step, i) => (
                                        <div key={i} className="flex flex-row md:flex-col items-center gap-4 md:gap-3 md:text-center z-10 w-full md:w-auto">
                                            <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 ring-4 ring-white shadow-md ${step.done
                                                ? (step.isError ? 'bg-red-500' : 'bg-maroon')
                                                : 'bg-gray-200'
                                                }`}>
                                                {step.done ? <CheckCircle className="h-5 w-5 text-white" /> : <Clock className="h-5 w-5 text-gray-500" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {step.active && <p className="text-[10px] text-maroon font-bold uppercase tracking-tighter">Current Point</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Order Details & Summary */}
                            <div className="space-y-8">
                                {/* Ordered Items — WITH IMAGES */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                        <h3 className="text-lg font-bold text-gray-900">Your Items</h3>
                                        <Badge variant="outline" className="text-xs py-1 border-beige text-maroon">
                                            {trackedOrder.items.length} Items
                                        </Badge>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-50">
                                            {trackedOrder.items.map((item: any, i: number) => (
                                                <Link
                                                    key={i}
                                                    to={`/product/${item.productId}`}
                                                    className="flex gap-4 p-8 items-center bg-white hover:bg-beige/10 transition-all group/item border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="relative overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 flex-shrink-0">
                                                        <img
                                                            src={item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200'}
                                                            alt={item.productName}
                                                            className="w-20 h-28 object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-maroon/0 group-hover/item:bg-maroon/10 transition-colors" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover/item:text-maroon transition-colors">{item.productName}</h4>
                                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Quantity: {item.quantity}</p>
                                                        <p className="text-maroon font-extrabold text-lg">{formatCurrency(item.totalPrice)}</p>
                                                    </div>
                                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pr-4">
                                                        <ChevronRight className="h-5 w-5 text-maroon" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="bg-gray-50 p-8 space-y-3">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Subtotal</span><span>{formatCurrency(trackedOrder.subtotal)}</span>
                                            </div>
                                            {trackedOrder.discount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                                    <span>Bulk Discount</span><span>-{formatCurrency(trackedOrder.discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Shipping</span><span>{trackedOrder.shipping === 0 ? 'FREE' : formatCurrency(trackedOrder.shipping)}</span>
                                            </div>
                                            <div className="flex justify-between text-xl font-black text-maroon pt-3 border-t border-gray-200">
                                                <span>Grand Total</span><span>{formatCurrency(trackedOrder.total)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Shipping & Support */}
                            <div className="space-y-8">
                                <Card className="border-none shadow-sm bg-white p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-maroon" /> Delivery Address
                                    </h3>
                                    <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-beige/30">
                                        <p className="font-bold text-gray-900 mb-2">{trackedOrder.customerName}</p>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                            {trackedOrder.shippingAddress?.street}, {trackedOrder.shippingAddress?.city}<br />
                                            {trackedOrder.shippingAddress?.state} — {trackedOrder.shippingAddress?.pincode}
                                        </p>
                                        <div className="flex flex-col gap-1 text-xs text-gray-400 font-medium pt-4 border-t border-beige/30">
                                            <p>📞 {trackedOrder.phone}</p>
                                            <p>✉️ {trackedOrder.email}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Support Card */}
                                <Card className="border-none shadow-2xl bg-[#075E54] text-white p-8 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                                        <p className="text-white/80 text-sm mb-6">
                                            Having questions about your saree? Chat with our experts directly on WhatsApp.
                                        </p>
                                        <Button
                                            variant="secondary"
                                            className="w-full bg-white text-[#075E54] hover:bg-beige hover:text-[#075E54] font-bold h-12 shadow-xl"
                                            onClick={() => window.open('https://wa.me/919500384237', '_blank')}
                                        >
                                            Chat with Merchant
                                        </Button>
                                    </div>
                                    {/* WhatsApp background pattern decoy */}
                                    <div className="absolute top-0 right-0 opacity-10 -translate-y-4 translate-x-4">
                                        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                </Card>

                                {canCancel(trackedOrder.status as OrderStatus) && (
                                    <div className="pt-4 px-8 text-center">
                                        <button
                                            onClick={() => handleCancel(trackedOrder._id)}
                                            className="text-xs font-bold text-red-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                                        >
                                            Request Order Cancellation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Visual Placeholder if no order yet */}
                {!trackedOrder && !loading && !notFound && (
                    <div className="py-20 text-center opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
                        <Package className="h-24 w-24 mx-auto text-maroon mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold font-serif text-maroon">Waiting for your Order Details</h3>
                        <p className="text-sm max-w-xs mx-auto mt-2">Enter your reference code to visualize your saree's journey home.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
