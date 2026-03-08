import React from 'react';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight,
    Plus, FileText, Bell, Settings, DollarSign, BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useProducts } from '../../contexts/ProductContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

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
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const totalProducts = products.length;

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;

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
        { icon: TrendingUp, title: 'Wholesale Inquiries', description: 'Manage bulk order requests', link: '/admin/wholesale', color: 'text-green-600', bgColor: 'bg-green-100', hoverColor: 'hover:bg-green-200' },
        { icon: FileText, title: 'View Products', description: 'Edit, delete, manage products', link: '/admin/products', color: 'text-blue-600', bgColor: 'bg-blue-100', hoverColor: 'hover:bg-blue-200' },
        { icon: Bell, title: 'All Orders', description: 'See all customer orders', link: '/admin/orders', color: 'text-purple-600', bgColor: 'bg-purple-100', hoverColor: 'hover:bg-purple-200' },
        { icon: Settings, title: 'Settings', description: 'Store configuration', link: '/admin', color: 'text-gray-600', bgColor: 'bg-gray-100', hoverColor: 'hover:bg-gray-200' },
    ];

    const recentOrders = orders.slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-beige">Welcome back! Here's your store overview.</p>
                        </div>
                        <div className="flex gap-3">
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
            </div>
        </div>
    );
};
