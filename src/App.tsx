import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/pages/Layout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import Index from '@/pages/Index';
import Analytics from '@/pages/Analytics';
import Transactions from '@/pages/Transactions';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';
import Learn from '@/pages/Learn';
import LoanAlert from '@/pages/LoanAlert';
import Products from '@/pages/Products';
import Spending from '@/pages/Spending';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <I18nProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes with layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/spending" element={
                  <ProtectedRoute>
                    <Layout>
                      <Spending />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/loan-alert" element={
                  <ProtectedRoute>
                    <Layout>
                      <LoanAlert />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/learn" element={
                  <ProtectedRoute>
                    <Layout>
                      <Learn />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </I18nProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;