import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../contexts/WishlistContext';
import { useProducts } from '../contexts/ProductContext';

export const WishlistPage: React.FC = () => {
    const { wishlist, clearWishlist } = useWishlist();
    const { products } = useProducts();

    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-light to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-maroon font-playfair">My Wishlist</h1>
                        <p className="text-gray-600 mt-1">
                            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    {wishlistedProducts.length > 0 && (
                        <Button
                            variant="outline"
                            className="border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => {
                                if (confirm('Clear entire wishlist?')) clearWishlist();
                            }}
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Products Grid */}
                {wishlistedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistedProducts.map(saree => (
                            <ProductCard key={saree.id} saree={saree} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon</p>
                        <Link to="/collections">
                            <Button className="bg-maroon hover:bg-maroon-dark text-beige">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Browse Collection
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
