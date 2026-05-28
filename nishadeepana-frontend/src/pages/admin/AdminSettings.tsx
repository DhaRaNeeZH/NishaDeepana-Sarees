import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft, Save, RefreshCw, CheckCircle, Gift, Tag, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../lib/api';

type PriceRange = { label: string; min: number; max: number };

export const AdminSettings: React.FC = () => {
    const [charges, setCharges] = useState({ tamilnadu: 50, nearby: 80, others: 100 });
    const [freeShipping, setFreeShipping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Price ranges state
    const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
    const [savingRanges, setSavingRanges] = useState(false);
    const [savedRanges, setSavedRanges] = useState(false);
    const [newRange, setNewRange] = useState({ label: '', min: '', max: '' });

    useEffect(() => {
        api.getDeliveryCharges()
            .then(data => { setCharges(data); setFreeShipping(data.freeShipping ?? false); })
            .catch(() => setError('Failed to load delivery charges'))
            .finally(() => setLoading(false));

        api.getPriceRanges()
            .then(ranges => { if (ranges && ranges.length) setPriceRanges(ranges); })
            .catch(() => {});
    }, []);

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            await api.updateDeliveryCharges({ ...charges, freeShipping } as any);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRanges = async () => {
        setSavingRanges(true);
        try {
            await api.updatePriceRanges(priceRanges);
            setSavedRanges(true);
            setTimeout(() => setSavedRanges(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save price ranges');
        } finally {
            setSavingRanges(false);
        }
    };

    const addPriceRange = () => {
        const min = Number(newRange.min);
        const max = Number(newRange.max);
        if (!newRange.label.trim() || isNaN(min) || isNaN(max)) return;
        setPriceRanges(prev => [...prev, { label: newRange.label.trim(), min, max }]);
        setNewRange({ label: '', min: '', max: '' });
    };

    const removePriceRange = (idx: number) => {
        setPriceRanges(prev => prev.filter((_, i) => i !== idx));
    };

    const zones = [
        {
            key: 'tamilnadu' as const,
            label: 'Tamil Nadu',
            description: 'Tamil Nadu & Puducherry',
            emoji: '🏠',
            states: ['Tamil Nadu', 'Puducherry'],
            color: 'border-t-maroon',
            badge: 'bg-maroon/10 text-maroon',
        },
        {
            key: 'nearby' as const,
            label: 'Neighbouring States',
            description: 'Kerala, Karnataka, Andhra Pradesh',
            emoji: '🗺️',
            states: ['Kerala', 'Karnataka', 'Andhra Pradesh'],
            color: 'border-t-yellow-500',
            badge: 'bg-yellow-100 text-yellow-700',
        },
        {
            key: 'others' as const,
            label: 'Other States',
            description: 'All other states across India',
            emoji: '🇮🇳',
            states: ['Delhi', 'Maharashtra', 'West Bengal', '...all others'],
            color: 'border-t-blue-500',
            badge: 'bg-blue-100 text-blue-700',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin">
                            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Truck className="h-8 w-8" /> Delivery Settings
                            </h1>
                            <p className="text-beige mt-1">Manage delivery charges and offers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="h-8 w-8 animate-spin text-maroon" />
                    </div>
                ) : (
                    <>
                        {/* Zone Cards */}
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Zone-Based Delivery Charges</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {zones.map((zone) => (
                                <Card key={zone.key} className={`border-t-4 ${zone.color} hover:shadow-lg transition-shadow`}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span>{zone.emoji}</span> {zone.label}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500">{zone.description}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                Delivery Charge (₹)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={charges[zone.key]}
                                                    onChange={(e) => setCharges(prev => ({
                                                        ...prev,
                                                        [zone.key]: Number(e.target.value),
                                                    }))}
                                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-xl font-bold text-maroon focus:border-maroon focus:ring-2 focus:ring-maroon/10 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {zone.states.map(state => (
                                                <span key={state} className={`inline-block text-xs px-2 py-0.5 rounded-full mr-1 mb-1 ${zone.badge}`}>
                                                    {state}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Summary */}
                        <Card className="mb-8 bg-amber-50 border-amber-200">
                            <CardContent className="py-4">
                                <p className="text-sm text-amber-800 font-medium text-center">
                                    🚚 Current: Tamil Nadu & Puducherry <strong>₹{charges.tamilnadu}</strong> · Neighbouring States <strong>₹{charges.nearby}</strong> · Other States <strong>₹{charges.others}</strong>
                                </p>
                            </CardContent>
                        </Card>

                        {/* Free Shipping Toggle */}
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Festival / Special Offer</h2>
                        <Card className={`mb-8 border-2 transition-all ${freeShipping ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                            <CardContent className="py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${freeShipping ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <Gift className={`h-6 w-6 ${freeShipping ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Free Delivery for All Orders</p>
                                            <p className="text-sm text-gray-500">Enable during festivals or special offers — overrides all zone charges</p>
                                        </div>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => setFreeShipping(prev => !prev)}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${freeShipping ? 'bg-green-500' : 'bg-gray-300'}`}
                                        aria-label="Toggle free shipping"
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${freeShipping ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                {freeShipping && (
                                    <div className="mt-3 bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg font-medium">
                                        🎉 Free delivery is ON — all customers will get FREE shipping regardless of state!
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Save Delivery Button */}
                        <div className="flex justify-end gap-3 mb-12">
                            {saved && (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <CheckCircle className="h-5 w-5" /> Saved successfully!
                                </div>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-maroon hover:bg-maroon-dark text-beige px-8 py-3 text-base font-semibold"
                            >
                                {saving ? (
                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" /> Save Delivery Settings</>
                                )}
                            </Button>
                        </div>

                        {/* ─── Price Range Editor ─── */}
                        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-maroon" /> Collection Filter — Price Ranges
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            These ranges appear in the Collections page filter sidebar. Customers use them to narrow by budget.
                        </p>

                        <Card className="mb-6 border-t-4 border-t-maroon">
                            <CardHeader className="pb-2 bg-maroon/5">
                                <CardTitle className="text-base text-maroon">Current Price Ranges</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {priceRanges.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">No price ranges set. Add one below.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {priceRanges.map((range, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2">
                                                <span className="flex-1 font-medium text-sm text-gray-800">{range.label}</span>
                                                <span className="text-xs text-gray-500 bg-white border rounded px-2 py-0.5">₹{range.min.toLocaleString()} – {range.max >= 999999 ? '∞' : '₹' + range.max.toLocaleString()}</span>
                                                <button
                                                    onClick={() => removePriceRange(idx)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add new range */}
                                <div className="mt-4 border-t pt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Add New Range</p>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <Input
                                            placeholder="Label e.g. Under ₹1,000"
                                            value={newRange.label}
                                            onChange={e => setNewRange(p => ({ ...p, label: e.target.value }))}
                                            className="col-span-3 h-9 text-sm"
                                        />
                                        <Input
                                            placeholder="Min ₹"
                                            type="number"
                                            min={0}
                                            value={newRange.min}
                                            onChange={e => setNewRange(p => ({ ...p, min: e.target.value }))}
                                            className="h-9 text-sm"
                                        />
                                        <Input
                                            placeholder="Max ₹"
                                            type="number"
                                            min={0}
                                            value={newRange.max}
                                            onChange={e => setNewRange(p => ({ ...p, max: e.target.value }))}
                                            className="h-9 text-sm"
                                        />
                                        <Button
                                            type="button"
                                            onClick={addPriceRange}
                                            className="bg-maroon hover:bg-maroon-dark text-beige h-9 text-sm"
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Add
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400">For "Above ₹X", set Max to 999999</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            {savedRanges && (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <CheckCircle className="h-5 w-5" /> Price ranges saved!
                                </div>
                            )}
                            <Button
                                onClick={handleSaveRanges}
                                disabled={savingRanges || priceRanges.length === 0}
                                className="bg-maroon hover:bg-maroon-dark text-beige px-8 py-3 text-base font-semibold"
                            >
                                {savingRanges ? (
                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" /> Save Price Ranges</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
