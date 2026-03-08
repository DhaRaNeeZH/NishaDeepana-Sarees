import React, { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { useProducts } from '../contexts/ProductContext';
import { Badge } from '../components/ui/badge';

const PRICE_RANGES = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹2,000', value: 'under-2000' },
    { label: '₹2,000 – ₹5,000', value: '2000-5000' },
    { label: '₹5,000 – ₹10,000', value: '5000-10000' },
    { label: 'Above ₹10,000', value: 'above-10000' },
];

const SORT_OPTIONS = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Name (A–Z)', value: 'name' },
];

export const CollectionsPage: React.FC = () => {
    const { products } = useProducts();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read filter state exclusively from URL — single source of truth
    const selectedCategory = searchParams.get('category') ?? 'all';
    const priceRange = searchParams.get('price') ?? 'all';
    const sortBy = searchParams.get('sort') ?? 'featured';
    const searchText = searchParams.get('search') ?? '';
    const [showFilters, setShowFilters] = React.useState(false);

    // Derive categories dynamically from actual product data (fixes category mismatch bug)
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category))).sort();
        return cats;
    }, [products]);

    // Write filter changes to URL params
    const setFilter = useCallback((key: string, value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === 'all' || value === 'featured') {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const clearAllFilters = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    // Apply filters
    const filteredSarees = useMemo(() => {
        let result = [...products];

        // Search text filter
        if (searchText) {
            const query = searchText.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                s.fabric.toLowerCase().includes(query) ||
                s.color.toLowerCase().includes(query) ||
                s.sareeType.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(s => s.category === selectedCategory);
        }

        // Price filter
        switch (priceRange) {
            case 'under-2000':
                result = result.filter(s => s.price < 2000);
                break;
            case '2000-5000':
                result = result.filter(s => s.price >= 2000 && s.price < 5000);
                break;
            case '5000-10000':
                result = result.filter(s => s.price >= 5000 && s.price < 10000);
                break;
            case 'above-10000':
                result = result.filter(s => s.price >= 10000);
                break;
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'featured':
            default:
                result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        return result;
    }, [products, selectedCategory, priceRange, sortBy, searchText]);

    const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || searchText !== '';

    const filterBtnCls = (active: boolean) =>
        `block w-full text-left px-3 py-2 rounded-md text-sm transition-colors font-medium ${active
            ? 'bg-maroon text-beige'
            : 'hover:bg-gold/10 text-gray-700'
        }`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gold/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-bold mb-1 text-maroon" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Our Collection
                    </h1>
                    <p className="text-gray-500">
                        {filteredSarees.length === products.length
                            ? `${products.length} exquisite sarees`
                            : `Showing ${filteredSarees.length} of ${products.length} sarees`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <aside className={`lg:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-semibold flex items-center gap-2 text-maroon">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                                        aria-label="Clear all filters"
                                    >
                                        <X className="h-3 w-3" /> Clear all
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setFilter('category', 'all')}
                                        className={filterBtnCls(selectedCategory === 'all')}
                                        aria-pressed={selectedCategory === 'all'}
                                    >
                                        All Sarees
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilter('category', cat)}
                                            className={filterBtnCls(selectedCategory === cat)}
                                            aria-pressed={selectedCategory === cat}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Price Range</h3>
                                <div className="space-y-1">
                                    {PRICE_RANGES.map(range => (
                                        <button
                                            key={range.value}
                                            onClick={() => setFilter('price', range.value)}
                                            className={filterBtnCls(priceRange === range.value)}
                                            aria-pressed={priceRange === range.value}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile filter toggle & Sort */}
                        <div className="flex items-center justify-between mb-5 gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="lg:hidden border-maroon text-maroon"
                                onClick={() => setShowFilters(v => !v)}
                                aria-expanded={showFilters}
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filters {hasActiveFilters && <span className="ml-1 bg-maroon text-white text-xs px-1.5 py-0.5 rounded-full">✓</span>}
                            </Button>

                            <div className="flex items-center gap-2 ml-auto">
                                <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">Sort by:</label>
                                <select
                                    id="sort-select"
                                    value={sortBy}
                                    onChange={e => setFilter('sort', e.target.value)}
                                    className="border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white focus:border-maroon focus:ring-1 focus:ring-maroon outline-none"
                                    aria-label="Sort products"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Filter Pills */}
                        {hasActiveFilters && (
                            <div className="mb-5 flex flex-wrap gap-2" role="list" aria-label="Active filters">
                                {selectedCategory !== 'all' && (
                                    <Badge
                                        className="bg-maroon/10 text-maroon border border-maroon/20 px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-maroon/20"
                                        onClick={() => setFilter('category', 'all')}
                                        role="listitem"
                                    >
                                        {selectedCategory}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}
                                {priceRange !== 'all' && (
                                    <Badge
                                        className="bg-gold/10 text-maroon border border-gold/30 px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-gold/20"
                                        onClick={() => setFilter('price', 'all')}
                                        role="listitem"
                                    >
                                        {PRICE_RANGES.find(r => r.value === priceRange)?.label}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Products */}
                        {filteredSarees.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredSarees.map(saree => (
                                    <ProductCard key={saree.id} saree={saree} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-6xl mb-4">🔍</p>
                                <p className="text-gray-600 text-lg font-medium mb-2">No sarees found</p>
                                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                                <Button
                                    onClick={clearAllFilters}
                                    className="bg-maroon hover:bg-maroon-dark text-beige"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
