import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingBag, Heart, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { items } = useCart();
    const { wishlist } = useWishlist();

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
                        <p className="text-gray-500 mb-6">You need to be logged in to view your profile</p>
                        <Button
                            className="bg-maroon hover:bg-maroon-dark text-beige"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-light to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-maroon to-maroon-dark text-white rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                            <p className="text-beige flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4" /> {user.email}
                            </p>
                            {user.role === 'admin' && (
                                <span className="inline-block mt-2 bg-gold text-maroon-dark text-xs font-bold px-3 py-1 rounded-full">
                                    ADMIN
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border-gold/20 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/cart')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="bg-maroon/10 p-3 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-maroon" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-maroon">{cartCount}</p>
                                <p className="text-gray-500 text-sm">Items in Cart</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gold/20 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/wishlist')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="bg-red-50 p-3 rounded-full">
                                <Heart className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-500">{wishlist.length}</p>
                                <p className="text-gray-500 text-sm">Wishlisted</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gold/20 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/my-orders')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="bg-green-50 p-3 rounded-full">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">View</p>
                                <p className="text-gray-500 text-sm">My Orders</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Info */}
                <Card className="border-gold/20 mb-8">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-maroon mb-6">Account Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                                <Input value={user.name} disabled className="h-12 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <Input value={user.email} disabled className="h-12 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                <Input value={user.role === 'admin' ? 'Administrator' : 'Customer'} disabled className="h-12 bg-gray-50 capitalize" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logout */}
                <Button
                    variant="outline"
                    className="w-full h-12 border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => { logout(); navigate('/'); }}
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};
