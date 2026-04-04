import React from 'react';
import { Search, Plus, Edit, Trash2, Filter, X, Save, Upload } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useProducts } from '../../contexts/ProductContext';
import { api } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────
interface ProductForm {
    name: string;
    sareeType: string;
    category: string;
    fabric: string;
    color: string;
    price: string;
    originalPrice: string;
    freeDelivery: boolean;
    image: string;
    description: string;
    featured: boolean;
    madeToOrder: boolean;
}

const EMPTY_FORM: ProductForm = {
    name: '', sareeType: '', category: '', fabric: '',
    color: '', price: '', originalPrice: '', freeDelivery: false,
    image: '', description: '',
    featured: false, madeToOrder: false,
};

// ── Edit / Add Modal ────────────────────────────────────────────────
const ProductModal: React.FC<{
    product: any | null; // null = Add mode
    onClose: () => void;
    onSaved: (updated: any) => void;
}> = ({ product, onClose, onSaved }) => {
    const isEdit = !!product;
    const [form, setForm] = React.useState<ProductForm>(
        isEdit ? {
            name: product.name ?? '',
            sareeType: product.sareeType ?? '',
            category: product.category ?? '',
            fabric: product.fabric ?? '',
            color: product.color ?? '',
            price: String(product.price ?? ''),
            originalPrice: String(product.originalPrice ?? ''),
            freeDelivery: product.freeDelivery ?? false,
            image: product.image ?? '',
            description: product.description ?? '',
            featured: product.featured ?? false,
            madeToOrder: product.madeToOrder ?? false,
        } : EMPTY_FORM
    );
    const [saving, setSaving] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const result = await api.uploadImage(file);
            setForm(prev => ({ ...prev, image: result.url }));
        } catch (err: any) {
            setError(err.message || 'Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (field: keyof ProductForm, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.price.trim()) {
            setError('Name and Price are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
            };
            let saved;
            if (isEdit) {
                // Call backend directly; context updateProduct is called in handleSaved
                saved = await api.updateProduct(product._id, payload);
            } else {
                saved = await api.createProduct(payload);
            }
            onSaved(saved);
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
            setSaving(false);
        }
    };

    const field = (label: string, key: keyof ProductForm, type = 'text', placeholder = '') => (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
            <Input
                type={type}
                placeholder={placeholder}
                value={form[key] as string}
                onChange={e => handleChange(key, e.target.value)}
                className="border-maroon/30 focus:border-maroon"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-maroon/5 to-gold/5">
                    <h2 className="text-xl font-bold text-maroon">
                        {isEdit ? `Edit — ${product.sareeType || product.name}` : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('Saree Name', 'name', 'text', 'e.g. Kanjivaram Silk Saree')}
                        {field('Saree Type', 'sareeType', 'text', 'e.g. Kanjivaram')}
                        {field('Category', 'category', 'text', 'e.g. Silk Cotton')}
                        {field('Fabric', 'fabric', 'text', 'e.g. Pure Silk')}
                        {field('Color', 'color', 'text', 'e.g. Red, Gold')}
                        {field('Selling Price (₹)', 'price', 'number', 'e.g. 1500')}
                        {field('Original Price (MRP ₹) - Optional', 'originalPrice', 'number', 'e.g. 1800')}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Product Image</label>
                        {/* Upload Button */}
                        <div className="flex gap-2 mb-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2 border-maroon/40 text-maroon hover:bg-maroon/5"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    <><Upload className="h-4 w-4" /> Upload Photo</>
                                )}
                            </Button>
                            <span className="text-xs text-gray-400 flex items-center">or paste URL below</span>
                        </div>
                        {/* URL fallback */}
                        <Input
                            placeholder="https://example.com/saree.jpg"
                            value={form.image}
                            onChange={e => handleChange('image', e.target.value)}
                            className="border-maroon/30 focus:border-maroon"
                        />
                        {form.image && (
                            <img src={form.image} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-lg border" />
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                        <textarea
                            className="w-full border border-maroon/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-maroon resize-none"
                            rows={3}
                            placeholder="Describe the saree..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={e => handleChange('featured', e.target.checked)}
                                className="w-4 h-4 accent-yellow-500"
                            />
                            <span className="text-sm font-medium">Featured Product</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.madeToOrder}
                                onChange={e => handleChange('madeToOrder', e.target.checked)}
                                className="w-4 h-4 accent-maroon"
                            />
                            <span className="text-sm font-medium">Made to Order</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.freeDelivery}
                                onChange={e => handleChange('freeDelivery', e.target.checked)}
                                className="w-4 h-4 accent-green-600"
                            />
                            <span className="text-sm font-medium">Free Delivery</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-maroon hover:bg-maroon-dark text-beige"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEdit ? 'Save Changes' : 'Add Product'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────
export const AdminProducts: React.FC = () => {
    const { products, updateProduct, addProduct, deleteProduct } = useProducts();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [editProduct, setEditProduct] = React.useState<any | null>(null);  // product being edited
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    let filteredSarees = products.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedCategory !== 'All') {
        filteredSarees = filteredSarees.filter(s => s.category === selectedCategory);
    }
    const categories = ['All', ...new Set(products.map(s => s.category))];

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await api.deleteProduct(id);
            deleteProduct(id); // updates context + localStorage
        } catch (err: any) {
            alert(err.message || 'Failed to delete product');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaved = (saved: any) => {
        if (editProduct) {
            updateProduct(saved._id || saved.id, saved); // updates context + localStorage
            setEditProduct(null);
        } else {
            addProduct({ ...saved, id: saved._id || saved.id }); // adds to context + localStorage
            setShowAddModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Product Management</h1>
                            <p className="text-beige">{products.length} total products • {filteredSarees.length} showing</p>
                        </div>
                        <Button
                            className="bg-gold hover:bg-gold-dark text-maroon font-semibold"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Product
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <Card className="mb-6 border-maroon/20">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                        <CardTitle className="flex items-center text-maroon">
                            <Filter className="h-5 w-5 mr-2" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 border-maroon/30 focus:border-maroon"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? 'default' : 'outline'}
                                        onClick={() => setSelectedCategory(cat)}
                                        size="sm"
                                        className={selectedCategory === cat
                                            ? 'bg-maroon hover:bg-maroon-dark'
                                            : 'border-maroon/30 text-maroon hover:bg-maroon/10'}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card className="border-t-4 border-t-maroon">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-maroon/10 to-gold/10 border-b-2 border-maroon/20">
                                    <tr>
                                        {['Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                                            <th key={h} className={`px-6 py-4 text-xs font-bold text-maroon uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSarees.map(saree => {
                                        const s = saree as any;
                                        const sId = s._id || s.id;
                                        return (<tr key={sId} className="hover:bg-maroon/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={saree.image}
                                                            alt={saree.name}
                                                            className="h-14 w-14 rounded-lg object-cover border-2 border-gold/30"
                                                        />
                                                        {saree.featured && (
                                                            <div className="absolute -top-1 -right-1 bg-gold text-white text-xs px-1 rounded-full font-bold">★</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{saree.sareeType || saree.name}</p>
                                                        <p className="text-xs text-gray-500">{saree.fabric} • {saree.color}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="border-maroon/30 text-maroon">{saree.category}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-maroon">{formatCurrency(saree.price)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {saree.featured && <Badge className="bg-gold text-maroon text-xs">Featured</Badge>}
                                                    {saree.madeToOrder && <Badge variant="secondary" className="bg-maroon/10 text-maroon text-xs">MTO</Badge>}
                                                    {!saree.featured && !saree.madeToOrder && (
                                                        <Badge variant="outline" className="border-green-500 text-green-700 text-xs">Active</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mr-1 hover:bg-maroon/10 hover:text-maroon"
                                                    onClick={() => setEditProduct(s)}
                                                    title="Edit product"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(sId, saree.name)}
                                                    disabled={deletingId === sId}
                                                    title="Delete product"
                                                >
                                                    {deletingId === sId
                                                        ? <span className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </td>
                                        </tr>);
                                    })}
                                </tbody>
                            </table>

                            {filteredSarees.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-gray-500 mb-4">No products found.</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modal */}
            {editProduct && (
                <ProductModal
                    product={editProduct}
                    onClose={() => setEditProduct(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Add Modal */}
            {showAddModal && (
                <ProductModal
                    product={null}
                    onClose={() => setShowAddModal(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};
