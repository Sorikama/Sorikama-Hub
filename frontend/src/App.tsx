import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { ProductProvider } from './contexts/ProductContext';
import { BlogProvider } from './contexts/BlogContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CreateStorePage } from './pages/dashboard/CreateStorePage';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { ProductEditPage } from './components/products/ProductEditPage';
import { SalesPage } from './pages/dashboard/SalesPage';
import { CustomersPage } from './pages/dashboard/CustomersPage';
import { ReviewsPage } from './pages/dashboard/ReviewsPage';
import { BlogPage } from './pages/dashboard/BlogPage';
import { BlogEditPage } from './pages/dashboard/BlogEditPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { AppearancePage } from './pages/dashboard/settings/AppearancePage';
import { StoresPage } from './pages/dashboard/settings/StoresPage';
import StoreEditPage from './pages/dashboard/settings/StoreEditPage';
import { PlaceholderPage } from './pages/dashboard/PlaceholderPage';
import { PlaceholderSettingsPage } from './pages/dashboard/PlaceholderSettingsPage';
import { StorePreviewPage } from './pages/store/StorePreviewPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <ProductProvider>
            <BlogProvider>
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="auth/login" element={<LoginPage />} />
                    <Route path="auth/register" element={<RegisterPage />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={
                      <ProtectedRoute requireStore>
                        <DashboardHome />
                      </ProtectedRoute>
                    } />
                    <Route path="products" element={
                      <ProtectedRoute requireStore>
                        <ProductsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="products/:productId/edit" element={
                      <ProtectedRoute requireStore>
                        <ProductEditPage />
                      </ProtectedRoute>
                    } />
                    <Route path="sales" element={
                      <ProtectedRoute requireStore>
                        <SalesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="customers" element={
                      <ProtectedRoute requireStore>
                        <CustomersPage />
                      </ProtectedRoute>
                    } />
                    <Route path="reviews" element={
                      <ProtectedRoute requireStore>
                        <ReviewsPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Blog - Global (pas lié à une boutique) */}
                    <Route path="blog" element={
                      <ProtectedRoute>
                        <BlogPage />
                      </ProtectedRoute>
                    } />
                    <Route path="blog/:articleId/edit" element={
                      <ProtectedRoute>
                        <BlogEditPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="revenue" element={
                      <ProtectedRoute requireStore>
                        <PlaceholderPage 
                          title="Revenus" 
                          description="Analysez vos revenus et suivez vos performances financières en détail." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="analytics" element={
                      <ProtectedRoute requireStore>
                        <PlaceholderPage 
                          title="Analytiques" 
                          description="Obtenez des insights détaillés sur vos ventes et le comportement de vos clients." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="marketing" element={
                      <ProtectedRoute requireStore>
                        <PlaceholderPage 
                          title="Marketing" 
                          description="Créez et gérez vos campagnes marketing pour promouvoir vos produits." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="automations" element={
                      <ProtectedRoute requireStore>
                        <PlaceholderPage 
                          title="Automatisations" 
                          description="Automatisez vos processus de vente et de communication client." 
                        />
                      </ProtectedRoute>
                    } />
                    
                    {/* Settings Routes - Global (pas lié à une boutique) */}
                    <Route path="settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/appearance" element={
                      <ProtectedRoute>
                        <AppearancePage />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/stores" element={
                      <ProtectedRoute>
                        <StoresPage />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/stores/edit/:id" element={
                      <ProtectedRoute>
                        <StoreEditPage />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/configurations" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Configurations" 
                          description="Définissez vos coordonnées et paramètres de support client pour vos acheteurs." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/notifications" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Notifications" 
                          description="Configurez vos alertes automatiques par Email et Telegram pour suivre votre activité." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/team" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Équipe" 
                          description="Gérez vos collaborateurs, ajoutez de nouveaux membres et suivez leur activité sur votre boutique." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/profile" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Mon Profil" 
                          description="Gérez vos informations personnelles, mot de passe et préférences de connexion." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/analytics" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Analytiques" 
                          description="Intégrez Facebook Pixel, Google Analytics ou ajoutez votre propre code JavaScript personnalisé." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/domain" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Nom de domaine" 
                          description="Connectez votre boutique à un nom de domaine personnalisé pour plus de professionnalisme." 
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="settings/pricing" element={
                      <ProtectedRoute>
                        <PlaceholderSettingsPage 
                          title="Tarification" 
                          description="Consultez votre forfait actuel et découvrez les options pour développer votre boutique." 
                        />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Store Creation - Special Route */}
                  <Route path="/dashboard/create-store" element={
                    <ProtectedRoute>
                      <CreateStorePage />
                    </ProtectedRoute>
                  } />

                  {/* Routes publiques pour les boutiques et produits */}
                  <Route path=":storeDomain" element={<StorePreviewPage />} />
                  <Route path=":storeDomain/product/:productId" element={<ProductDetailPage />} />
                  <Route path=":storeDomain/:productId" element={<ProductDetailPage />} />
                  
                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </BlogProvider>
          </ProductProvider>
        </StoreProvider>
      </AuthProvider>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: '#22c55e',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
      }} />
    </ThemeProvider>
  );
}

export default App;