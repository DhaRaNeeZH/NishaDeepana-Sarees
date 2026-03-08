import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '', email: '', password: '', phone: '',
    });
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                if (!formData.name.trim()) {
                    setError('Please enter your name');
                    setIsLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsLoading(false);
                    return;
                }
                const result = await register(formData.name, formData.email, formData.password, formData.phone);
                if (result.success) {
                    navigate('/');
                } else {
                    setError(result.error || 'Registration failed');
                }
            } else {
                const success = await login(formData.email, formData.password, 'customer');
                if (success) {
                    navigate('/');
                } else {
                    setError('Invalid email or password');
                }
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side — branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-maroon via-maroon-dark to-black items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 border-2 border-gold rounded-full" />
                    <div className="absolute bottom-20 right-20 w-60 h-60 border border-gold/50 rounded-full" />
                    <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-beige/30 rounded-full" />
                </div>
                <div className="relative text-center px-12">
                    <ShoppingBag className="h-16 w-16 text-gold mx-auto mb-6" />
                    <h1 className="text-4xl font-bold text-white font-playfair mb-4">
                        NishaDeepana<br />
                        <span className="text-gold">Sarees</span>
                    </h1>
                    <p className="text-beige text-lg mb-8 max-w-md">
                        Discover the finest handpicked sarees from across India.
                        Your trusted destination for authentic textiles since 2023.
                    </p>
                    <div className="flex justify-center gap-8 text-beige/70 text-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gold">13+</p>
                            <p>Saree Types</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gold">100%</p>
                            <p>Authentic</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gold">All India</p>
                            <p>Delivery</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side — form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-beige-light to-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-2xl font-bold font-playfair">
                            <span className="text-maroon">NishaDeepana</span>{' '}
                            <span className="text-gold">Sarees</span>
                        </h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {isRegister
                                ? 'Join our family of saree lovers'
                                : 'Sign in to your account'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegister && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-maroon focus:ring-2 focus:ring-maroon/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-maroon focus:ring-2 focus:ring-maroon/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:border-maroon focus:ring-2 focus:ring-maroon/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {isRegister && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-maroon focus:ring-2 focus:ring-maroon/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <span className="text-red-400">⚠</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-maroon to-maroon-dark text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-maroon/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? 'Please wait...'
                                    : isRegister
                                        ? 'Create Account'
                                        : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-maroon hover:text-maroon-dark font-medium text-sm transition-colors"
                            >
                                {isRegister
                                    ? 'Already have an account? Sign In'
                                    : "Don't have an account? Create one"}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};
