import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminGuard } from './components/AdminGuard';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { WholesalePage } from './pages/WholesalePage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminWholesale } from './pages/admin/AdminWholesale';
import { AdminSettings } from './pages/admin/AdminSettings';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupportRedirect } from './pages/SupportRedirect';

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <OrderProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <BrowserRouter>
                                <Routes>
                                    {/* Auth Routes (no layout) */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/admin/login" element={<AdminLoginPage />} />

                                    <Route path="/" element={<Layout />}>
                                        {/* Customer Routes */}
                                        <Route index element={<HomePage />} />
                                        <Route path="collections" element={<CollectionsPage />} />
                                        <Route path="product/:id" element={<ProductDetailPage />} />
                                        <Route path="cart" element={<CartPage />} />
                                        <Route path="checkout" element={<CheckoutPage />} />
                                        <Route path="track-order" element={<TrackOrderPage />} />
                                        <Route path="my-orders" element={<MyOrdersPage />} />
                                        <Route path="wishlist" element={<WishlistPage />} />
                                        <Route path="about" element={<AboutPage />} />
                                        <Route path="contact" element={<ContactPage />} />
                                        <Route path="profile" element={<ProfilePage />} />
                                        <Route path="wholesale" element={<WholesalePage />} />
                                        <Route path="support" element={<SupportRedirect />} />

                                        {/* Admin Routes — protected by AdminGuard */}
                                        <Route path="admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                                        <Route path="admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                                        <Route path="admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                                        <Route path="admin/wholesale" element={<AdminGuard><AdminWholesale /></AdminGuard>} />
                                        <Route path="admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />

                                        {/* 404 */}
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        </WishlistProvider>
                    </CartProvider>
                </OrderProvider>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
