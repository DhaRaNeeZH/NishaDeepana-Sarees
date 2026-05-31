import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const { wishlist } = useWishlist();

    const wishlistCount = wishlist.length;

    const isActive = (path: string) => location.pathname === path;

    const tabs = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/collections', label: 'Collections', icon: ShoppingBag },
        { path: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-4 h-16">
                {tabs.map(({ path, label, icon: Icon, badge }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                            isActive(path) ? 'text-maroon' : 'text-gray-400'
                        }`}
                    >
                        <div className="relative">
                            <Icon className={`h-5 w-5 transition-transform ${isActive(path) ? 'scale-110' : ''}`} />
                            {badge != null && badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-medium ${isActive(path) ? 'text-maroon' : 'text-gray-400'}`}>
                            {label}
                        </span>
                        {isActive(path) && (
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-maroon rounded-full" />
                        )}
                    </Link>
                ))}
            </div>
        </nav>
    );
};
