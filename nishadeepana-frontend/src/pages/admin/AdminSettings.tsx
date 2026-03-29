import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';

export const AdminSettings: React.FC = () => {
    const [charges, setCharges] = useState({ tamilnadu: 50, nearby: 80, others: 100 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getDeliveryCharges()
            .then(setCharges)
            .catch(() => setError('Failed to load delivery charges'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            await api.updateDeliveryCharges(charges);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const zones = [
        {
            key: 'tamilnadu' as const,
            label: 'Tamil Nadu',
            description: 'Home state — lowest delivery rate',
            emoji: '🏠',
            states: ['Tamil Nadu'],
            color: 'border-t-maroon',
            badge: 'bg-maroon/10 text-maroon',
        },
        {
            key: 'nearby' as const,
            label: 'Nearby States',
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
                                <Truck className="h-8 w-8" /> Delivery Charge Settings
                            </h1>
                            <p className="text-beige mt-1">Set delivery charges by customer location zone</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        <Card className="mb-6 bg-amber-50 border-amber-200">
                            <CardContent className="py-4">
                                <p className="text-sm text-amber-800 font-medium text-center">
                                    🚚 Current: Tamil Nadu <strong>₹{charges.tamilnadu}</strong> · Nearby States <strong>₹{charges.nearby}</strong> · Other States <strong>₹{charges.others}</strong>
                                </p>
                            </CardContent>
                        </Card>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end gap-3">
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
                                    <><Save className="h-4 w-4 mr-2" /> Save Delivery Charges</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
