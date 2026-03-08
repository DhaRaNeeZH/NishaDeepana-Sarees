import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Clock, Ban, ExternalLink, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { OrderStatus } from '../types/order';

const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-600',
};

export const MyOrdersPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        setLoading(true);
        api.getOrders(user.email)
            .then(data => {
                setOrders(data.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            })
            .catch(err => setError(err.message || 'Failed to load orders'))
            .finally(() => setLoading(false));
    }, [user, isAuthenticated]);

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <LogIn className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                        <p className="text-gray-500 mb-6">Please log in to view your order history.</p>
                        <Link to="/login">
                            <Button className="bg-maroon hover:bg-maroon-dark text-beige w-full" size="lg">
                                <LogIn className="h-4 w-4 mr-2" /> Login Now
                            </Button>
                        </Link>
                        <Link to="/track-order" className="block mt-3 text-sm text-gray-400 hover:text-maroon">
                            Track an order without logging in &rarr;
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleCancel = async (orderId: string) => {
        if (!confirm('Cancel this order?')) return;
        try {
            await api.cancelOrder(orderId);
            setOrders(prev => prev.map(o =>
                o._id === orderId ? { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() } : o
            ));
        } catch (err: any) {
            alert(err.message || 'Failed to cancel order');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-maroon" style={{ fontFamily: 'Playfair Display, serif' }}>
                            My Orders
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, {user.name} —{' '}
                            {loading ? 'loading...' : orders.length === 0
                                ? 'no orders yet'
                                : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setLoading(true);
                            api.getOrders(user.email)
                                .then(data => setOrders(data.sort((a: any, b: any) =>
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                )))
                                .catch(err => setError(err.message))
                                .finally(() => setLoading(false));
                        }}
                        className="p-2 text-gray-400 hover:text-maroon transition-colors"
                        title="Refresh orders"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-5">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-red-500">{error}</p>
                        </CardContent>
                    </Card>
                ) : orders.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardContent className="p-12 text-center">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                            <p className="text-gray-400 mb-6">Start shopping to see your orders here.</p>
                            <Link to="/collections">
                                <Button className="bg-maroon hover:bg-maroon-dark text-beige">
                                    Browse Collection
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <Card key={order._id} className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-mono text-xs font-semibold text-gray-700 truncate max-w-[180px]">
                                                    #{order._id}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status as OrderStatus]}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment?.status === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {order.payment?.method === 'cod' ? 'COD' : 'Online'} — {order.payment?.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-400 mb-3">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                            </p>

                                            <div className="space-y-1">
                                                {order.items.slice(0, 2).map((item: any, i: number) => (
                                                    <p key={i} className="text-sm text-gray-600">
                                                        {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                                                    </p>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-xs text-gray-400">+{order.items.length - 2} more item(s)</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <p className="text-xl font-bold text-maroon">{formatCurrency(order.total)}</p>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-maroon text-maroon hover:bg-maroon hover:text-beige text-xs"
                                                onClick={() => navigate(`/track-order?orderId=${order._id}`)}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Track Order
                                            </Button>

                                            {(order.status === 'pending' || order.status === 'paid') && (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <Ban className="h-3 w-3" /> Cancel
                                                </button>
                                            )}

                                            {order.status === 'cancelled' && order.cancelledAt && (
                                                <p className="text-xs text-gray-400">
                                                    <Clock className="h-3 w-3 inline mr-0.5" />
                                                    Cancelled {new Date(order.cancelledAt).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
