import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Saree } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BlouseBadge } from './BlouseBadge';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
    saree: Saree;
}

export const ProductCard: React.FC<ProductCardProps> = ({ saree }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const { addItem } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const isLiked = isWishlisted(saree.id);

    const handleAddToCart = () => {
        addItem(saree, 1);
    };

    return (
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/product/${saree.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                        src={saree.image}
                        alt={saree.name}
                        className={`w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-1">
                        {saree.featured && (
                            <Badge className="bg-primary text-white text-[9px] sm:text-xs px-1.5 py-0.5">Featured</Badge>
                        )}
                    </div>

                    {/* Like button */}
                    <button
                        className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(saree.id);
                        }}
                    >
                        <Heart
                            className={`h-5 w-5 ${isLiked
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                                }`}
                        />
                    </button>

                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-medium">View Details</span>
                    </div>
                </div>
            </Link>

            <CardContent className="p-3 sm:p-4">
                <Link to={`/product/${saree.id}`}>
                    <h3 className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {saree.name}
                    </h3>
                </Link>
                <div className="text-[11px] text-gray-500 mb-1 sm:hidden">
                    {saree.fabric}
                </div>
                <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                    <span className="font-medium text-maroon">{saree.sareeType}</span>
                    <span>•</span>
                    <span className="truncate">{saree.fabric}</span>
                </div>
                <div className="mb-2">
                    <BlouseBadge blouseType={saree.blouseIncluded} className="text-[9px] sm:text-xs px-1.5 py-0.5" />
                </div>
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                    <span className="text-xl font-bold text-maroon">{formatCurrency(saree.price)}</span>
                    {saree.originalPrice && saree.originalPrice > saree.price && (
                        <span className="text-sm text-gray-400 line-through font-medium leading-none mt-1">
                            {formatCurrency(saree.originalPrice)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-sm text-gray-500">{saree.color}</span>
                </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0">
                <Button
                    className="w-full group/btn bg-maroon hover:bg-maroon-dark text-beige text-xs sm:text-sm py-1.5 sm:py-2"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5 sm:h-4 sm:w-4 sm:mr-2 group-hover/btn:animate-bounce" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
};
