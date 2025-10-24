// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Authorize from './pages/Authorize';
import ServicesAdmin from './pages/ServicesAdmin';
import UsersManagement from './pages/admin/UsersManagement';
import RolesPermissions from './pages/admin/RolesPermissions';
import RateLimiting from './pages/admin/RateLimiting';
import AuditTrail from './pages/admin/AuditTrail';
import WebhooksManager from './pages/admin/WebhooksManager';
import AdminDashboard from './pages/admin/AdminDashboard';
import LogsViewer from './pages/admin/LogsViewer';
import SystemHealth from './pages/admin/SystemHealth';
import PerformanceMetrics from './pages/admin/PerformanceMetrics';
import Dependencies from './pages/admin/Dependencies';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Routes protégées */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authorize"
              element={
                <ProtectedRoute>
                  <Authorize />
                </ProtectedRoute>
              }
            />
            {/* Routes Admin avec Layout */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="roles" element={<RolesPermissions />} />
              <Route path="rate-limit" element={<RateLimiting />} />
              <Route path="audit" element={<AuditTrail />} />
              <Route path="webhooks" element={<WebhooksManager />} />
              <Route path="logs" element={<LogsViewer />} />
              <Route path="health" element={<SystemHealth />} />
              <Route path="performance" element={<PerformanceMetrics />} />
              <Route path="dependencies" element={<Dependencies />} />
            </Route>

            {/* Services Admin (sans layout pour l'instant) */}
            <Route
              path="/services-admin"
              element={
                <AdminRoute>
                  <ServicesAdmin />
                </AdminRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Conteneur des toasts - Affiché globalement */}
          <ToastContainer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;