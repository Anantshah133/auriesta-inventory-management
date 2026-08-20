import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import { DashboardLayout } from './layouts/DashboardLayout';

// Public pages
import { Login } from './pages/Login';

// Protected pages
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/products/ProductsPage';
import { AddProductPage } from './pages/products/AddProductPage';
import { EditProductPage } from './pages/products/EditProductPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { AddCategoryPage } from './pages/categories/AddCategoryPage';
import { ManufacturersPage } from './pages/manufacturers/ManufacturersPage';
import { AddManufacturerPage } from './pages/manufacturers/AddManufacturerPage';

// Route guards
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected — all wrapped in DashboardLayout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Products */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />

        {/* Categories */}
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/add" element={<AddCategoryPage />} />

        {/* Manufacturers */}
        <Route path="manufacturers" element={<ManufacturersPage />} />
        <Route path="manufacturers/add" element={<AddManufacturerPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#111827',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;