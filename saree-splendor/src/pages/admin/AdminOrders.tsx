import React from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Package, Truck, RefreshCw, Ban, FileText, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useOrders } from '../../contexts/OrderContext';
import type { OrderStatus } from '../../types/order';

const STATUS_COLORS: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800 border-green-300',
    shipped: 'bg-blue-100 text-blue-800 border-blue-300',
    paid: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    pending: 'bg-orange-100 text-orange-800 border-orange-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    refunded: 'bg-gray-100 text-gray-800 border-gray-300',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    delivered: <CheckCircle className="h-3.5 w-3.5" />,
    shipped: <Truck className="h-3.5 w-3.5" />,
    paid: <CheckCircle className="h-3.5 w-3.5" />,
    processing: <Package className="h-3.5 w-3.5" />,
    pending: <Clock className="h-3.5 w-3.5" />,
    cancelled: <XCircle className="h-3.5 w-3.5" />,
    refunded: <RefreshCw className="h-3.5 w-3.5" />,
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export const AdminOrders: React.FC = () => {
    const { orders, updateOrderStatus, cancelOrder, markRefunded, addOrderNote } = useOrders();

    const [activeTab, setActiveTab] = React.useState<'overview' | 'orders'>('overview');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
    const [noteInputs, setNoteInputs] = React.useState<Record<string, string>>({});

    const filteredOrders = React.useMemo(() => {
        let result = [...orders];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.customerName.toLowerCase().includes(q) ||
                o.email.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, searchQuery, statusFilter]);

    const statusCounts = React.useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        ALL_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });
        return counts;
    }, [orders]);

    const handleUpdateStatus = (id: string, status: OrderStatus) => {
        updateOrderStatus(id, status);
    };

    const handleCancel = (id: string) => {
        if (confirm('Cancel this order? This will notify the customer (if backend is connected).')) {
            cancelOrder(id);
        }
    };

    const handleRefund = (id: string) => {
        if (confirm('Mark as refunded?\n\nTODO: This would trigger a Razorpay refund API call:\nPOST /api/refund-payment { orderId, amount }\n\nFor now this only updates the status.')) {
            markRefunded(id);
        }
    };

    const handleSaveNote = (id: string) => {
        const note = noteInputs[id] ?? '';
        addOrderNote(id, note);
        alert('Note saved!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Order Management</h1>
                            <p className="text-beige">{orders.length} total orders • {filteredOrders.length} showing</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                            <Download className="h-4 w-4 mr-2" />
                            Export Orders
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['overview', 'orders'] as const).map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'outline'}
                            onClick={() => setActiveTab(tab)}
                            className={activeTab === tab ? 'bg-maroon hover:bg-maroon-dark' : 'border-maroon/30 text-maroon hover:bg-maroon/10'}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Overview cards */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                        <Card
                            className="hover:shadow-lg transition-all cursor-pointer col-span-2 sm:col-span-1"
                            onClick={() => { setStatusFilter('all'); setActiveTab('orders'); }}
                        >
                            <CardContent className="pt-5 pb-4 text-center">
                                <p className="text-3xl font-bold text-maroon mb-1">{statusCounts.all}</p>
                                <p className="text-xs text-gray-500">All</p>
                            </CardContent>
                        </Card>
                        {ALL_STATUSES.map(s => (
                            <Card
                                key={s}
                                className="hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => { setStatusFilter(s); setActiveTab('orders'); }}
                            >
                                <CardContent className="pt-5 pb-4 text-center">
                                    <p className="text-2xl font-bold text-maroon mb-1">{statusCounts[s] ?? 0}</p>
                                    <p className="text-xs text-gray-500 capitalize">{s}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-6 border-maroon/20">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5 py-4">
                        <CardTitle className="text-maroon text-base">Filter & Search</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by order ID, name, or email…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10 border-maroon/30 focus:border-maroon"
                                    aria-label="Search orders"
                                />
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {(['all', ...ALL_STATUSES]).map(s => (
                                    <Button
                                        key={s}
                                        variant={statusFilter === s ? 'default' : 'outline'}
                                        onClick={() => setStatusFilter(s)}
                                        size="sm"
                                        className={statusFilter === s ? 'bg-maroon hover:bg-maroon-dark text-xs' : 'border-maroon/30 text-maroon hover:bg-maroon/10 text-xs'}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card className="border-t-4 border-t-maroon shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-maroon/10 to-gold/10 border-b-2 border-maroon/20">
                                    <tr>
                                        {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-maroon uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredOrders.map(order => (
                                        <React.Fragment key={order.id}>
                                            <tr className="hover:bg-maroon/3 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-sm font-semibold text-maroon truncate block max-w-[140px]">
                                                        {order.id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-sm text-gray-900">{order.customerName}</div>
                                                    <div className="text-xs text-gray-500">{order.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-maroon">{formatCurrency(order.total)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs">
                                                        <span className="font-medium">{order.payment.method === 'cod' ? 'COD' : 'Online'}</span>
                                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${order.payment.status === 'paid' ? 'bg-green-100 text-green-700' : order.payment.status === 'refunded' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                                                            {order.payment.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`border ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'} flex items-center gap-1 w-fit text-xs`}>
                                                        {STATUS_ICONS[order.status]}
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Status dropdown */}
                                                        <select
                                                            value={order.status}
                                                            onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                                            className="text-xs border border-maroon/30 rounded px-1.5 py-1 text-maroon bg-white focus:outline-none focus:border-maroon"
                                                            aria-label="Update order status"
                                                        >
                                                            {ALL_STATUSES.map(s => (
                                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                            ))}
                                                        </select>

                                                        {/* Expand notes */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 hover:bg-maroon/10"
                                                            onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)}
                                                            aria-label="Toggle notes"
                                                            title="Notes"
                                                        >
                                                            <FileText className="h-3.5 w-3.5 text-maroon" />
                                                        </Button>

                                                        {/* Cancel */}
                                                        {(order.status === 'pending' || order.status === 'paid') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-red-50 text-red-500"
                                                                onClick={() => handleCancel(order.id)}
                                                                aria-label="Cancel order"
                                                                title="Cancel order"
                                                            >
                                                                <Ban className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}

                                                        {/* Refund */}
                                                        {order.status === 'cancelled' && order.payment.status !== 'refunded' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-600"
                                                                onClick={() => handleRefund(order.id)}
                                                                aria-label="Mark as refunded"
                                                                title="Mark refunded"
                                                            >
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}

                                                        {/* View */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 hover:bg-maroon/10"
                                                            onClick={() => window.open(`/track-order?orderId=${order.id}`, '_blank')}
                                                            aria-label="View order tracking"
                                                            title="View tracking"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-maroon" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded notes row */}
                                            {expandedOrder === order.id && (
                                                <tr className="bg-gold/5">
                                                    <td colSpan={8} className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                                    Internal Notes (admin only)
                                                                </label>
                                                                <textarea
                                                                    className="w-full text-sm border border-maroon/20 rounded-md px-3 py-2 focus:outline-none focus:border-maroon resize-none"
                                                                    rows={2}
                                                                    placeholder="Add internal notes about this order…"
                                                                    value={noteInputs[order.id] ?? order.notes ?? ''}
                                                                    onChange={e => setNoteInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                                    aria-label="Order notes"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 mt-5 flex-shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-maroon hover:bg-maroon-dark text-beige text-xs"
                                                                    onClick={() => handleSaveNote(order.id)}
                                                                >
                                                                    Save Note
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setExpandedOrder(null)}
                                                                    className="text-xs"
                                                                    aria-label="Close notes"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {/* Refund TODO note */}
                                                        {order.status === 'cancelled' && (
                                                            <p className="text-xs text-gray-400 mt-2 p-2 bg-white/60 rounded border border-dashed border-gray-200">
                                                                <strong>TODO:</strong> Razorpay refund integration — call{' '}
                                                                <code className="bg-gray-100 px-1 rounded">POST /api/refund-payment</code>{' '}
                                                                with <code className="bg-gray-100 px-1 rounded">{'{ orderId, amount }'}</code> to initiate refund.
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredOrders.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-500 mb-4">No orders found matching your criteria.</p>
                                <Button
                                    className="bg-maroon hover:bg-maroon-dark text-beige"
                                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
