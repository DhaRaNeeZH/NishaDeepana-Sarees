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
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
            <div className="w-full px-8 xl:px-16">
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
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-maroon ${isActive(link.path)
                                        ? 'text-maroon'
                                        : 'text-gray-700'
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
                                        className="text-sm font-medium text-gray-700 hover:text-maroon"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        className="text-sm font-medium text-gray-700 hover:text-maroon"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-sm font-semibold text-gold-dark hover:text-maroon flex items-center gap-1"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Admin Panel
                                </Link>
                            )}
                            {isAuthenticated ? (
                                <>
                                    <div className="text-sm text-gray-600">
                                        Logged in as: {user?.name}
                                    </div>
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
                )}
            </div>
        </nav>
    );
};
