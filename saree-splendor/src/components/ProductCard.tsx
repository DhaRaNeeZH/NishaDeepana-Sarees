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
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                        {saree.featured && (
                            <Badge className="bg-primary text-white">Featured</Badge>
                        )}
                        <BlouseBadge blouseType={saree.blouseIncluded} />
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

            <CardContent className="p-4">
                <Link to={`/product/${saree.id}`}>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">
                        {saree.name}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="font-medium text-maroon">{saree.sareeType}</span>
                    <span>•</span>
                    <span>{saree.fabric}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                        {formatCurrency(saree.price)}
                    </span>
                    <span className="text-sm text-gray-500">{saree.color}</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full group/btn bg-maroon hover:bg-maroon-dark text-beige"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:animate-bounce" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
};
