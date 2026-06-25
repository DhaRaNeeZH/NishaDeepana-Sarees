import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, LayoutGrid, Grid3X3, ChevronDown, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { useProducts } from '../contexts/ProductContext';
import { useCategories } from '../contexts/CategoryContext';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

const DEFAULT_PRICE_RANGES = [
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
    { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
    { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
    { label: 'Above ₹10,000', min: 10000, max: 999999 },
];

const SORT_OPTIONS = [
    { label: 'Featured', value: 'featured', desc: 'Our hand-picked top picks first' },
    { label: 'Most Relevant', value: 'relevant', desc: 'Best match shown first' },
    { label: 'Best Selling', value: 'best-selling', desc: 'Most ordered sarees first' },
    { label: 'Price: Low to High', value: 'price-low', desc: 'Cheapest first' },
    { label: 'Price: High to Low', value: 'price-high', desc: 'Most expensive first' },
    { label: 'Name (A-Z)', value: 'name-az', desc: 'Alphabetical order' },
    { label: 'Name (Z-A)', value: 'name-za', desc: 'Reverse alphabetical' },
    { label: 'Newest', value: 'newest', desc: 'Latest added sarees first' },
    { label: 'Oldest', value: 'oldest', desc: 'Earliest added sarees first' },
];

const SCROLL_KEY = 'nd_collections_scroll';

export const CollectionsPage: React.FC = () => {
    const { products } = useProducts();
    const { categories: adminCategories } = useCategories();
    const [searchParams, setSearchParams] = useSearchParams();
    const [priceRanges, setPriceRanges] = useState(DEFAULT_PRICE_RANGES);
    const [bestSellingIds, setBestSellingIds] = useState<string[]>([]);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
    // Floating filter button visibility
    const [showFloatingFilter, setShowFloatingFilter] = useState(false);

    useEffect(() => {
        api.getPriceRanges().then(ranges => {
            if (ranges && ranges.length > 0) setPriceRanges(ranges);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        api.getBestSellingIds().then(data => {
            setBestSellingIds(data.map((d: { productId: string }) => d.productId));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
                setSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Show floating filter button when scrolled past 300px
    useEffect(() => {
        const onScroll = () => setShowFloatingFilter(window.scrollY > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const selectedCategory = searchParams.get('category') ?? 'all';
    const selectedSubType = searchParams.get('subtype') ?? 'all';
    const priceRange = searchParams.get('price') ?? 'all';
    const sortBy = searchParams.get('sort') ?? 'featured';
    const searchText = searchParams.get('search') ?? '';
    const currentPage = parseInt(searchParams.get('page') ?? '1', 10);
    const [showFilters, setShowFilters] = React.useState(false);
    const [showMobileSort, setShowMobileSort] = React.useState(false);
    const [gridCols, setGridCols] = React.useState<1 | 2>(2);

    const productCategories = useMemo(() =>
        Array.from(new Set(products.map(p => p.category))).sort(),
        [products]
    );
    const categories = adminCategories.length > 0
        ? adminCategories.map(c => c.name).sort()
        : productCategories;

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: products.length };
        for (const p of products) {
            counts[p.category] = (counts[p.category] || 0) + 1;
        }
        return counts;
    }, [products]);

    const getSubTypes = useCallback((cat: string) => {
        const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
        return Array.from(new Set(filtered.map(p => p.sareeType).filter(Boolean))).sort();
    }, [products]);

    const getSubTypeCounts = useCallback((cat: string) => {
        const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
        const counts: Record<string, number> = {};
        for (const p of filtered) {
            if (p.sareeType) counts[p.sareeType] = (counts[p.sareeType] || 0) + 1;
        }
        return counts;
    }, [products]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setFilter = useCallback((key: string, value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === 'all' || value === 'featured') {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            if (key === 'category') next.delete('subtype');
            next.set('page', '1');
            return next;
        }, { replace: true });
        scrollToTop();
    }, [setSearchParams]);

    const clearAllFilters = useCallback(() => {
        setSearchParams({}, { replace: true });
        scrollToTop();
    }, [setSearchParams]);

    const toggleCatExpand = useCallback((cat: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    }, []);

    const filteredSarees = useMemo(() => {
        let result = [...products];

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

        if (selectedCategory !== 'all') {
            result = result.filter(s => s.category === selectedCategory);
        }

        if (selectedSubType !== 'all') {
            result = result.filter(s => s.sareeType === selectedSubType);
        }

        if (priceRange !== 'all') {
            const idx = parseInt(priceRange, 10);
            const range = priceRanges[idx];
            if (range) {
                result = result.filter(s => s.price >= range.min && s.price < range.max);
            }
        }

        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-az':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-za':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                break;
            case 'best-selling':
                if (bestSellingIds.length > 0) {
                    const rankMap: Record<string, number> = {};
                    bestSellingIds.forEach((id, idx) => { rankMap[id] = idx; });
                    result.sort((a, b) => {
                        const ra = rankMap[a.id] ?? 9999;
                        const rb = rankMap[b.id] ?? 9999;
                        return ra - rb;
                    });
                } else {
                    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                }
                break;
            case 'relevant':
            case 'featured':
            default:
                result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        return result;
    }, [products, selectedCategory, selectedSubType, priceRange, sortBy, searchText, priceRanges, bestSellingIds]);

    const hasActiveFilters = selectedCategory !== 'all' || selectedSubType !== 'all' || priceRange !== 'all' || searchText !== '';

    // Remove legacy visibility logic. Pagination relies on URL state, which is preserved automatically on back!

    // Restore scroll position when coming back from product page
    React.useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const savedScroll = sessionStorage.getItem(SCROLL_KEY);
        if (savedScroll) {
            setTimeout(() => window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' }), 100);
            sessionStorage.removeItem(SCROLL_KEY);
        }

        return () => {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);

    // Save scroll position before leaving to product page
    const handleProductClick = React.useCallback(() => {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    }, []);

    const ITEMS_PER_PAGE = 24;
    const totalPages = Math.ceil(filteredSarees.length / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));
    const paginatedSarees = filteredSarees.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const setPage = (p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
        scrollToTop();
    };

    const filterBtnCls = (active: boolean) =>
        `flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-sm transition-colors font-medium ${active
            ? 'bg-maroon text-beige'
            : 'hover:bg-gold/10 text-gray-700'
        }`;

    const subFilterBtnCls = (active: boolean) =>
        `flex items-center justify-between w-full text-left pl-6 pr-3 py-1.5 rounded-md text-sm transition-colors ${active
            ? 'bg-maroon/80 text-beige font-medium'
            : 'hover:bg-gold/10 text-gray-600'
        }`;

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Featured';

    const renderCategoryFilter = (onSelect: () => void) => (
        <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</h3>
            <div className="space-y-1">
                <button
                    onClick={() => { setFilter('category', 'all'); onSelect(); }}
                    className={filterBtnCls(selectedCategory === 'all' && selectedSubType === 'all')}
                >
                    <span>All Sarees</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${selectedCategory === 'all' ? 'bg-white/20 text-beige' : 'bg-gray-100 text-gray-500'}`}>
                        {categoryCounts['all'] ?? 0}
                    </span>
                </button>

                {categories.map(cat => {
                    const subTypes = getSubTypes(cat);
                    const subCounts = getSubTypeCounts(cat);
                    const isExpanded = expandedCats.has(cat) || selectedCategory === cat;
                    const hasSubTypes = subTypes.length > 1;

                    return (
                        <div key={cat}>
                            <button
                                onClick={() => {
                                    setFilter('category', cat);
                                    if (hasSubTypes) toggleCatExpand(cat);
                                    onSelect();
                                }}
                                className={filterBtnCls(selectedCategory === cat && selectedSubType === 'all')}
                            >
                                <span className="flex items-center gap-1">
                                    {hasSubTypes && (
                                        <span className="text-current opacity-60">
                                            {isExpanded
                                                ? <ChevronDown className="h-3 w-3 inline" />
                                                : <ChevronRight className="h-3 w-3 inline" />}
                                        </span>
                                    )}
                                    {cat}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal flex-shrink-0 ${selectedCategory === cat && selectedSubType === 'all' ? 'bg-white/20 text-beige' : 'bg-gray-100 text-gray-500'}`}>
                                    {categoryCounts[cat] ?? 0}
                                </span>
                            </button>

                            {hasSubTypes && isExpanded && (
                                <div className="mt-1 space-y-0.5 mb-1">
                                    {subTypes.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => {
                                                setSearchParams(prev => {
                                                    const next = new URLSearchParams(prev);
                                                    next.set('category', cat);
                                                    next.set('subtype', sub);
                                                    next.set('page', '1');
                                                    return next;
                                                }, { replace: true });
                                                scrollToTop();
                                                onSelect();
                                            }}
                                            className={subFilterBtnCls(selectedCategory === cat && selectedSubType === sub)}
                                        >
                                            <span>{sub}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal flex-shrink-0 ${selectedCategory === cat && selectedSubType === sub ? 'bg-white/20 text-beige' : 'bg-gray-100 text-gray-500'}`}>
                                                {subCounts[sub] ?? 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderPriceFilter = (onSelect: () => void) => (
        <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Price Range</h3>
            <div className="space-y-1">
                <button onClick={() => { setFilter('price', 'all'); onSelect(); }} className={filterBtnCls(priceRange === 'all')}>
                    <span>All Prices</span>
                </button>
                {priceRanges.map((range, idx) => (
                    <button key={idx} onClick={() => { setFilter('price', String(idx)); onSelect(); }} className={filterBtnCls(priceRange === String(idx))}>
                        <span>{range.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
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

                    {showFilters && (
                        <div className="fixed inset-0 z-[60] flex lg:hidden">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                            <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-slide-in-left">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h2 className="text-base font-semibold flex items-center gap-2 text-maroon">
                                        <Filter className="h-4 w-4" />
                                        Filters
                                    </h2>
                                    <button onClick={() => setShowFilters(false)} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close filters">
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {hasActiveFilters && (
                                        <button onClick={() => { clearAllFilters(); setShowFilters(false); }} className="text-xs text-red-500 flex items-center gap-1 mb-4">
                                            <X className="h-3 w-3" /> Clear all filters
                                        </button>
                                    )}
                                    {renderCategoryFilter(() => setShowFilters(false))}
                                    {renderPriceFilter(() => setShowFilters(false))}
                                </div>
                            </div>
                        </div>
                    )}

                    <aside className="hidden lg:block lg:w-56 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-semibold flex items-center gap-2 text-maroon">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </h2>
                                {hasActiveFilters && (
                                    <button onClick={clearAllFilters} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1" aria-label="Clear all filters">
                                        <X className="h-3 w-3" /> Clear all
                                    </button>
                                )}
                            </div>
                            {renderCategoryFilter(() => {})}
                            {renderPriceFilter(() => {})}
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
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

                            <div className="flex items-center gap-3 ml-auto">
                                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                    <button
                                        onClick={() => setGridCols(1)}
                                        className={`p-2 transition-colors ${gridCols === 1 ? 'bg-maroon text-white' : 'text-gray-400 hover:text-maroon hover:bg-gray-50'}`}
                                        title="Single column view"
                                        aria-label="1 column grid"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setGridCols(2)}
                                        className={`p-2 transition-colors ${gridCols === 2 ? 'bg-maroon text-white' : 'text-gray-400 hover:text-maroon hover:bg-gray-50'}`}
                                        title="2-column view"
                                        aria-label="2 column grid"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="relative" ref={sortDropdownRef}>
                                    <button
                                        onClick={() => setSortDropdownOpen(v => !v)}
                                        className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white hover:border-maroon transition-colors"
                                        aria-haspopup="listbox"
                                        aria-expanded={sortDropdownOpen}
                                    >
                                        <span className="text-gray-500 text-xs whitespace-nowrap hidden sm:inline">Sort:</span>
                                        <span className="font-medium text-gray-800 whitespace-nowrap">{currentSortLabel}</span>
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sortDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[220px]">
                                            {SORT_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setFilter('sort', opt.value);
                                                        setSortDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-maroon/5 border-b border-gray-50 last:border-0 ${sortBy === opt.value ? 'bg-maroon/10' : ''}`}
                                                    role="option"
                                                    aria-selected={sortBy === opt.value}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className={`text-sm font-medium ${sortBy === opt.value ? 'text-maroon' : 'text-gray-800'}`}>{opt.label}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                                                        </div>
                                                        {sortBy === opt.value && (
                                                            <span className="h-2 w-2 rounded-full bg-maroon flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                {selectedSubType !== 'all' && (
                                    <Badge
                                        className="bg-maroon/10 text-maroon border border-maroon/20 px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-maroon/20"
                                        onClick={() => { setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('subtype'); next.set('page', '1'); return next; }, { replace: true }); scrollToTop(); }}
                                        role="listitem"
                                    >
                                        {selectedSubType}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}
                                {priceRange !== 'all' && (
                                    <Badge
                                        className="bg-gold/10 text-maroon border border-gold/30 px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-gold/20"
                                        onClick={() => setFilter('price', 'all')}
                                        role="listitem"
                                    >
                                        {priceRanges[parseInt(priceRange, 10)]?.label}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {filteredSarees.length > 0 ? (
                            <>
                                <div className={`grid gap-4 ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-2'}`}>
                                    {paginatedSarees.map(saree => (
                                        <ProductCard key={saree.id} saree={saree} onClick={handleProductClick} />
                                    ))}
                                </div>
                                
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-10 mb-24 lg:mb-10">
                                        <Button
                                            variant="outline"
                                            disabled={safePage === 1}
                                            onClick={() => setPage(safePage - 1)}
                                            className="border-maroon/20 text-maroon hover:bg-maroon hover:text-white"
                                        >
                                            Prev
                                        </Button>
                                        
                                        <div className="flex items-center gap-1 hidden sm:flex">
                                            {Array.from({ length: totalPages }).map((_, i) => {
                                                const p = i + 1;
                                                // Show first, last, current, and +/- 1 from current
                                                if (p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1)) {
                                                    return (
                                                        <Button
                                                            key={p}
                                                            variant={safePage === p ? 'default' : 'outline'}
                                                            onClick={() => setPage(p)}
                                                            className={`w-10 h-10 p-0 ${safePage === p ? 'bg-maroon text-white' : 'border-maroon/20 text-maroon hover:bg-maroon/10'}`}
                                                        >
                                                            {p}
                                                        </Button>
                                                    );
                                                }
                                                if (p === safePage - 2 || p === safePage + 2) {
                                                    return <span key={p} className="text-gray-400 px-1">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 sm:hidden">
                                            Page {safePage} of {totalPages}
                                        </span>

                                        <Button
                                            variant="outline"
                                            disabled={safePage === totalPages}
                                            onClick={() => setPage(safePage + 1)}
                                            className="border-maroon/20 text-maroon hover:bg-maroon hover:text-white"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-6xl mb-4">🔍</p>
                                <p className="text-gray-600 text-lg font-medium mb-2">No sarees found</p>
                                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                                <Button onClick={clearAllFilters} className="bg-maroon hover:bg-maroon-dark text-beige">
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Filter + Sort bar — mobile only, visible when scrolled down */}
            {showFloatingFilter && (
                <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center lg:hidden pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 bg-maroon text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold active:scale-95 transition-transform"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter {hasActiveFilters && <span className="bg-white text-maroon text-xs px-1.5 py-0.5 rounded-full font-bold">✓</span>}
                        </button>
                        <button
                            onClick={() => setShowMobileSort(true)}
                            className="flex items-center gap-2 bg-white border border-maroon text-maroon px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold active:scale-95 transition-transform"
                        >
                            <ChevronDown className="h-4 w-4" />
                            {currentSortLabel}
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Sort Bottom Sheet */}
            {showMobileSort && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSort(false)} />
                    <div className="relative w-full bg-white rounded-t-2xl shadow-2xl pb-8 animate-in slide-in-from-bottom-full duration-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-base font-semibold text-maroon">Sort By</h2>
                            <button onClick={() => setShowMobileSort(false)} className="p-1 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setFilter('sort', opt.value);
                                        setShowMobileSort(false);
                                    }}
                                    className={`w-full text-left px-5 py-4 transition-colors border-b border-gray-50 last:border-0 ${sortBy === opt.value ? 'bg-maroon/5' : ''}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className={`text-sm font-medium ${sortBy === opt.value ? 'text-maroon' : 'text-gray-800'}`}>{opt.label}</p>
                                        {sortBy === opt.value && <span className="h-2.5 w-2.5 rounded-full bg-maroon" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
