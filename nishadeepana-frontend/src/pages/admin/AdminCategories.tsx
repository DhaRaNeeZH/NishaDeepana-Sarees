import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Layers, Plus, Trash2, Eye, EyeOff, RefreshCw, Image, GripVertical, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useCategories, Category } from '../../contexts/CategoryContext';

export const AdminCategories: React.FC = () => {
    const { categories, loading, refetch, addCategory, updateCategory, deleteCategory } = useCategories();
    const navigate = useNavigate();

    const [form, setForm] = React.useState({ name: '', image: '' });
    const [adding, setAdding] = React.useState(false);
    const [savingId, setSavingId] = React.useState<string | null>(null);
    const [editId, setEditId] = React.useState<string | null>(null);
    const [editForm, setEditForm] = React.useState({ name: '', image: '' });
    const [error, setError] = React.useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Category name is required'); return; }
        setAdding(true);
        setError('');
        try {
            await addCategory({ name: form.name.trim(), image: form.image.trim(), visible: true, order: categories.length });
            setForm({ name: '', image: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to add category');
        } finally {
            setAdding(false);
        }
    };

    const handleToggleVisible = async (cat: Category) => {
        setSavingId(cat._id);
        try {
            await updateCategory(cat._id, { visible: !cat.visible });
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (cat: Category) => {
        if (!confirm(`Delete category "${cat.name}"? Products in this category won't be affected.`)) return;
        setSavingId(cat._id);
        try {
            await deleteCategory(cat._id);
        } finally {
            setSavingId(null);
        }
    };

    const startEdit = (cat: Category) => {
        setEditId(cat._id);
        setEditForm({ name: cat.name, image: cat.image });
    };

    const handleSaveEdit = async (cat: Category) => {
        if (!editForm.name.trim()) return;
        setSavingId(cat._id);
        try {
            await updateCategory(cat._id, { name: editForm.name.trim(), image: editForm.image.trim() });
            setEditId(null);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Manage Categories</h1>
                            <p className="text-beige">
                                Add, edit, or hide categories. These drive the Home page "Shop by Category" section and Collection filters.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={refetch}
                                disabled={loading}
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Link to="/admin">
                                <Button className="bg-gold hover:bg-gold-dark text-maroon font-semibold">
                                    ← Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Add Category Form */}
                    <div>
                        <Card className="border-t-4 border-t-maroon sticky top-20">
                            <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                                <CardTitle className="flex items-center text-maroon">
                                    <Plus className="h-5 w-5 mr-2" /> Add New Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Category Name *
                                        </label>
                                        <Input
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            placeholder="e.g. Silk Cotton"
                                            className="border-maroon/30 focus:border-maroon"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Must match exactly with product category field
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Image URL <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <Input
                                            value={form.image}
                                            onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                                            placeholder="https://..."
                                            className="border-maroon/30 focus:border-maroon"
                                        />
                                        {form.image && (
                                            <img
                                                src={form.image}
                                                alt="preview"
                                                className="mt-2 w-full h-24 object-cover rounded-lg border"
                                                onError={e => (e.currentTarget.style.display = 'none')}
                                            />
                                        )}
                                    </div>

                                    {error && <p className="text-red-500 text-sm">{error}</p>}

                                    <Button
                                        type="submit"
                                        disabled={adding}
                                        className="w-full bg-maroon hover:bg-maroon-dark text-beige"
                                    >
                                        {adding ? 'Adding...' : <><Plus className="h-4 w-4 mr-2" />Add Category</>}
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-800 font-semibold mb-1">💡 Important</p>
                                    <p className="text-xs text-amber-700">
                                        The category name here must exactly match what you type in the product's "Category" field in Admin Products. Otherwise the filter won't work.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                        <Card className="border-t-4 border-t-yellow-500">
                            <CardHeader className="bg-gradient-to-r from-gold/10 to-transparent flex flex-row items-center justify-between">
                                <CardTitle className="text-yellow-700 flex items-center">
                                    <Tag className="h-5 w-5 mr-2" />
                                    All Categories ({categories.length})
                                </CardTitle>
                                <p className="text-xs text-gray-500">
                                    <Eye className="h-3 w-3 inline mr-1" />
                                    Visible = shown on Home page
                                </p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                                        ))}
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No categories yet</p>
                                        <p className="text-gray-400 text-sm mt-1">Add your first category using the form</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {categories.map(cat => (
                                            <div
                                                key={cat._id}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${cat.visible ? 'border-maroon/20 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                            >
                                                {/* Drag handle visual */}
                                                <GripVertical className="h-5 w-5 text-gray-300 flex-shrink-0" />

                                                {/* Image */}
                                                <div className="flex-shrink-0">
                                                    {cat.image ? (
                                                        <img
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            className="w-14 h-14 object-cover rounded-lg border"
                                                            onError={e => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-maroon/10 rounded-lg flex items-center justify-center">
                                                            <Image className="h-6 w-6 text-maroon/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details / Edit */}
                                                <div className="flex-1 min-w-0">
                                                    {editId === cat._id ? (
                                                        <div className="space-y-2">
                                                            <Input
                                                                value={editForm.name}
                                                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                                                className="h-8 text-sm border-maroon/30"
                                                                placeholder="Category name"
                                                            />
                                                            <Input
                                                                value={editForm.image}
                                                                onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))}
                                                                className="h-8 text-sm border-maroon/30"
                                                                placeholder="Image URL"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-maroon hover:bg-maroon-dark text-white text-xs h-7"
                                                                    onClick={() => handleSaveEdit(cat)}
                                                                    disabled={savingId === cat._id}
                                                                >
                                                                    {savingId === cat._id ? 'Saving...' : 'Save'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs h-7"
                                                                    onClick={() => setEditId(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge className="bg-maroon/10 text-maroon text-xs px-2 py-0">
                                                                    {cat.count} products
                                                                </Badge>
                                                                {cat.visible ? (
                                                                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0">
                                                                        Visible on Home
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-gray-100 text-gray-500 text-xs px-2 py-0">
                                                                        Hidden
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {editId !== cat._id && (
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => startEdit(cat)}
                                                            className="border-maroon/30 text-maroon hover:bg-maroon/10 h-8 px-2 text-xs"
                                                            title="Edit"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleToggleVisible(cat)}
                                                            disabled={savingId === cat._id}
                                                            className={`h-8 px-2 border ${cat.visible ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}
                                                            title={cat.visible ? 'Hide from homepage' : 'Show on homepage'}
                                                        >
                                                            {cat.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(cat)}
                                                            disabled={savingId === cat._id}
                                                            className="h-8 px-2 border-red-200 text-red-500 hover:bg-red-50"
                                                            title="Delete category"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card className="mt-4 border border-blue-100 bg-blue-50/50">
                            <CardContent className="p-4">
                                <p className="text-sm font-semibold text-blue-800 mb-2">📖 How Categories Work</p>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li><strong>Add a category</strong> here with exact name + optional image</li>
                                    <li><strong>Toggle visibility</strong> to control which 5-6 appear on the Home page</li>
                                    <li><strong>Product count</strong> auto-updates from your product list</li>
                                    <li><strong>Collections filter</strong> uses category names from your products automatically</li>
                                    <li>The category name must exactly match what's in the product's Category field</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
