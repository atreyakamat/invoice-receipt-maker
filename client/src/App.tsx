import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LinearProgress from '@mui/material/LinearProgress';
import theme from './theme';
import { queryClient } from './queryClient';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { UploadProvider } from './contexts/UploadContext';
import { TourProvider } from './components/tour/TourContext';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceReview = lazy(() => import('./pages/InvoiceReview'));
const Exports = lazy(() => import('./pages/Exports'));
const Settings = lazy(() => import('./pages/Settings'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrganizations = lazy(() => import('./pages/admin/Organizations'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));

const AppProviders = () => (
  <UploadProvider>
    <TourProvider>
      <Outlet />
    </TourProvider>
  </UploadProvider>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline enableColorScheme />
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppProviders />}>
                      <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/invoices/:id" element={<InvoiceReview />} />
                        <Route path="/invoices/:id/validate" element={<InvoiceReview />} />
                        <Route path="/vendors" element={<Vendors />} />
                        <Route path="/exports" element={<Exports />} />
                        <Route path="/reports" element={<Navigate to="/exports" replace />} />
                        <Route path="/settings" element={<Settings />} />
                      </Route>
                    </Route>

                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="organizations" element={<AdminOrganizations />} />
                      <Route path="users" element={<AdminUsers />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
