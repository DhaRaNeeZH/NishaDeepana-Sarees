import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, LogIn, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { items } = useCart();
    const { wishlist } = useWishlist();

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlist.length;

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/collections', label: 'Collections' },
        { path: '/wholesale', label: 'Wholesale' },
        { path: '/about', label: 'About Us' },
        { path: '/contact', label: 'Contact' },
        { path: '/track-order', label: 'Track Order' },
    ];

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="w-full px-4 sm:px-8 xl:px-16">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="text-xl md:text-2xl font-serif font-bold">
                                <span className="text-maroon">NishaDeepana</span>
                                {' '}
                                <span className="text-gold">Sarees</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-maroon ${isActive(link.path)
                                        ? 'text-maroon'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {/* User authentication */}
                            {isAuthenticated ? (
                                <div className="hidden md:flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        {user?.name}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="border-maroon text-maroon hover:bg-maroon hover:text-beige"
                                    >
                                        <LogOut className="h-4 w-4 mr-1" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <Link to="/login" className="hidden md:block">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-maroon text-maroon hover:bg-maroon hover:text-beige"
                                    >
                                        <LogIn className="h-4 w-4 mr-1" />
                                        Login
                                    </Button>
                                </Link>
                            )}

                            {/* Admin Panel button — only for admins */}
                            {isAdmin && (
                                <Link to="/admin" className="hidden md:block">
                                    <Button
                                        size="sm"
                                        className="bg-gold hover:bg-gold-dark text-maroon font-semibold"
                                    >
                                        <LayoutDashboard className="h-4 w-4 mr-1" />
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}

                            {/* Profile link */}
                            <Link to="/profile" className="hidden md:block">
                                <Button variant="ghost" size="icon" className="hover:bg-maroon-light/10" title="My Profile">
                                    <UserIcon className="h-5 w-5 text-maroon" />
                                </Button>
                            </Link>

                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative hidden md:block">
                                <Button variant="ghost" size="icon" className="hover:bg-red-50">
                                    <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-maroon'}`} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative">
                                <Button variant="ghost" size="icon" className="hover:bg-gold-light/20">
                                    <ShoppingCart className="h-5 w-5 text-maroon" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-maroon text-beige text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 text-maroon"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Open menu"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Left-Slide Drawer Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-slide-in-left">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-maroon/5 to-gold/5">
                            <div className="text-lg font-serif font-bold">
                                <span className="text-maroon">NishaDeepana</span>{' '}
                                <span className="text-gold">Sarees</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <div className="flex-1 overflow-y-auto py-4 px-4">
                            <div className="space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'bg-maroon text-white'
                                            : 'text-gray-700 hover:bg-maroon/10 hover:text-maroon'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                {isAuthenticated && (
                                    <>
                                        <Link
                                            to="/my-orders"
                                            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-maroon/10 hover:text-maroon transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Orders
                                        </Link>
                                    </>
                                )}

                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-gold-dark hover:bg-gold/10 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer — Login/Logout */}
                        <div className="p-4 border-t">
                            {isAuthenticated ? (
                                <>
                                    <p className="text-xs text-gray-500 mb-3">Logged in as: <span className="font-medium text-gray-700">{user?.name}</span></p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="border-maroon text-maroon hover:bg-maroon hover:text-beige w-full"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-maroon text-maroon hover:bg-maroon hover:text-beige w-full"
                                    >
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Login
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
