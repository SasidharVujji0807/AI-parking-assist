import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Pages
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { ParkingDetailPage } from '../pages/ParkingDetailPage';
import { AssistantPage } from '../pages/AssistantPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '../pages/AuthPages';
import { DashboardPage, ProfilePage } from '../pages/UserPages';
import { FavoritesPage } from '../pages/FavoritesPage';
import { HistoryPage } from '../pages/HistoryPage';
import { OperatorDashboardPage } from '../pages/OperatorDashboardPage';
import { ParkingFormPage } from '../pages/ParkingFormPage';
import { AdminDashboardPage, AdminReportsPage, AdminUsersPage } from '../pages/AdminPages';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/parking/:id" element={<ParkingDetailPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Operator routes */}
          <Route path="/operator" element={
            <ProtectedRoute requiredRole="operator">
              <OperatorDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/operator/parking" element={
            <ProtectedRoute requiredRole="operator">
              <OperatorDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/operator/parking/new" element={
            <ProtectedRoute requiredRole="operator">
              <ParkingFormPage />
            </ProtectedRoute>
          } />
          <Route path="/operator/parking/:id/edit" element={
            <ProtectedRoute requiredRole="operator">
              <ParkingFormPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminReportsPage />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
