import React from 'react';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight,
    Plus, FileText, Bell, Settings, DollarSign, BarChart3, RefreshCw, CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useProducts } from '../../contexts/ProductContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const AdminDashboard: React.FC = () => {
    const { products } = useProducts();
    const [orders, setOrders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchOrders = React.useCallback(() => {
        setLoading(true);
        api.getOrders()
            .then(setOrders)
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Stats computed from real data
    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const totalProducts = products.length;

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;

    // ── Daily Revenue — last 30 days (excludes cancelled/refunded)
    const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');

    const dailyRevenueMap: Record<string, { revenue: number; orders: number }> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        dailyRevenueMap[key] = { revenue: 0, orders: 0 };
    }
    activeOrders.forEach(o => {
        if (!o.createdAt) return;
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        if (dailyRevenueMap[key]) {
            dailyRevenueMap[key].revenue += o.total || 0;
            dailyRevenueMap[key].orders += 1;
        }
    });
    const dailyChartData = Object.entries(dailyRevenueMap).map(([date, val]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: val.revenue,
        orders: val.orders,
    }));
    const todayKey = today.toISOString().slice(0, 10);
    const todayRevenue = dailyRevenueMap[todayKey]?.revenue || 0;
    const todayOrders = dailyRevenueMap[todayKey]?.orders || 0;
    // Table rows — only dates that had at least 1 order, newest first
    const revenueTableRows = [...dailyChartData].reverse().filter(d => d.orders > 0);

    const stats = [
        {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            change: `${totalOrders} orders`,
            trend: 'All time',
            icon: DollarSign,
            positive: true,
            iconBg: 'bg-maroon/10',
            iconColor: 'text-maroon',
            borderColor: 'border-t-maroon',
        },
        {
            title: 'Total Orders',
            value: totalOrders.toString(),
            change: `${pendingOrders} pending`,
            trend: 'From MongoDB',
            icon: ShoppingCart,
            positive: true,
            iconBg: 'bg-gold/10',
            iconColor: 'text-yellow-600',
            borderColor: 'border-t-yellow-500',
        },
        {
            title: 'Pending Orders',
            value: pendingOrders.toString(),
            change: pendingOrders > 0 ? 'Needs attention' : 'All clear!',
            trend: 'Requires action',
            icon: Package,
            positive: pendingOrders === 0,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-t-orange-500',
        },
        {
            title: 'Total Products',
            value: totalProducts.toString(),
            change: `${uniqueCustomers} customers`,
            trend: 'From database',
            icon: BarChart3,
            positive: true,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-t-green-500',
        },
    ];

    const quickActions = [
        { icon: Plus, title: 'Add New Product', description: 'Add a new saree to inventory', link: '/admin/products', color: 'text-maroon', bgColor: 'bg-maroon/10', hoverColor: 'hover:bg-maroon/20' },
        { icon: ShoppingCart, title: 'Process Orders', description: `${pendingOrders} pending orders`, link: '/admin/orders', color: 'text-yellow-700', bgColor: 'bg-gold/10', hoverColor: 'hover:bg-gold/20' },
        { icon: Settings, title: 'Delivery Settings', description: 'Set zone-based delivery charges', link: '/admin/settings', color: 'text-gray-600', bgColor: 'bg-gray-100', hoverColor: 'hover:bg-gray-200' },
        { icon: FileText, title: 'View Products', description: 'Edit, delete, manage products', link: '/admin/products', color: 'text-blue-600', bgColor: 'bg-blue-100', hoverColor: 'hover:bg-blue-200' },
        { icon: Bell, title: 'All Orders', description: 'See all customer orders', link: '/admin/orders', color: 'text-purple-600', bgColor: 'bg-purple-100', hoverColor: 'hover:bg-purple-200' },
        { icon: TrendingUp, title: 'Manage Categories', description: 'Add/edit Home & filter categories', link: '/admin/categories', color: 'text-orange-600', bgColor: 'bg-orange-100', hoverColor: 'hover:bg-orange-200' },
    ];

    const recentOrders = orders.slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">Admin Dashboard</h1>
                            <p className="text-beige text-sm sm:text-base">Welcome back! Here's your store overview.</p>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <Button
                                onClick={fetchOrders}
                                disabled={loading}
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Link to="/admin/products">
                                <Button className="bg-gold hover:bg-gold-dark text-maroon font-semibold">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="pt-6">
                                    <div className="h-20 bg-gray-200 rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className={`hover:shadow-xl transition-all duration-300 border-t-4 ${stat.borderColor}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                            <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                                        </div>
                                        <div className={`flex items-center text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-orange-600'}`}>
                                            {stat.positive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.trend}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <Card className="mb-8 border-maroon/20">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                        <CardTitle className="flex items-center text-maroon">
                            <Settings className="h-5 w-5 mr-2" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickActions.map((action, idx) => (
                                <Link key={idx} to={action.link} className="block">
                                    <div className={`p-5 border-2 rounded-xl ${action.bgColor} ${action.hoverColor} transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}>
                                        <action.icon className={`h-6 w-6 ${action.color} mb-3`} />
                                        <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <Card className="border-t-4 border-t-maroon">
                            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-maroon/5 to-transparent">
                                <CardTitle className="text-maroon">Recent Orders</CardTitle>
                                <Link to="/admin/orders">
                                    <Button variant="outline" size="sm" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
                                        View All <ArrowUpRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-gray-400 text-center py-8">Loading orders...</p>
                                ) : recentOrders.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No orders yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentOrders.map((order) => (
                                            <div key={order._id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-maroon hover:shadow-md transition-all duration-300">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-maroon text-xs">{order._id?.slice(-8).toUpperCase()}</span>
                                                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
                                                            {order.status?.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-maroon">{formatCurrency(order.total)}</p>
                                                    <p className="text-xs text-gray-600">{order.items?.length} items</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Products */}
                    <div>
                        <Card className="border-t-4 border-t-yellow-500">
                            <CardHeader className="bg-gradient-to-r from-gold/10 to-transparent">
                                <CardTitle className="text-yellow-700">Featured Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {products.filter((s: any) => s.featured).slice(0, 5).map((saree: any) => (
                                        <div key={saree._id || saree.id} className="flex gap-3 p-3 rounded-lg hover:bg-gold/5 transition-colors">
                                            <img src={saree.image} alt={saree.name} className="w-12 h-16 object-cover rounded border" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{saree.sareeType || saree.name}</p>
                                                <p className="text-xs text-gray-600 truncate">{saree.category}</p>
                                                <p className="text-sm font-bold text-maroon mt-1">{formatCurrency(saree.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {products.filter((s: any) => s.featured).length === 0 && (
                                        <p className="text-gray-400 text-sm text-center py-4">No featured products.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Daily Revenue Analytics ─────────────────────────── */}
                <Card className="mt-8 border-t-4 border-t-maroon">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="flex items-center text-maroon">
                                <CalendarDays className="h-5 w-5 mr-2" />
                                Daily Revenue — Last 30 Days
                            </CardTitle>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Today's Revenue</p>
                                    <p className="text-xl font-bold text-maroon">{formatCurrency(todayRevenue)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Today's Orders</p>
                                    <p className="text-xl font-bold text-yellow-600">{todayOrders}</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <p className="text-gray-400">Loading chart...</p>
                            </div>
                        ) : (
                            <>
                                {/* Bar Chart */}
                                <div className="w-full h-64 mb-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                interval={4}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                tickFormatter={(v) => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(0)}k`}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(Number(value) || 0), 'Revenue']}
                                                labelFormatter={(label) => `Date: ${label}`}
                                                contentStyle={{
                                                    background: '#fff',
                                                    border: '1px solid #800000',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#800000"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={32}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Daily History Table */}
                                {revenueTableRows.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm py-4">No revenue recorded in the last 30 days.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-maroon/20">
                                                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Date</th>
                                                    <th className="text-center py-2 px-3 text-gray-600 font-semibold">Orders</th>
                                                    <th className="text-right py-2 px-3 text-gray-600 font-semibold">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {revenueTableRows.map((row) => (
                                                    <tr key={row.date} className={`border-b border-gray-100 hover:bg-maroon/5 transition-colors ${row.date === todayKey ? 'bg-gold/10 font-semibold' : ''}`}>
                                                        <td className="py-2 px-3 text-gray-700">
                                                            {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                                            {row.date === todayKey && <span className="ml-2 text-[10px] bg-maroon text-white px-1.5 py-0.5 rounded-full">TODAY</span>}
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            <Badge variant="secondary" className="bg-gold/20 text-yellow-700">{row.orders}</Badge>
                                                        </td>
                                                        <td className="py-2 px-3 text-right font-bold text-maroon">{formatCurrency(row.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
