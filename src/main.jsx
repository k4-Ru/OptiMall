import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './styles.css';

import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import DealsPage from './pages/DealsPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import BrandsPage from './pages/BrandsPage';
import SmartBundlesPage from './pages/SmartBundlesPage';
import ProductsPage from './pages/ProductsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ActivityPage from './pages/ActivityPage';
import NotificationsPage from './pages/NotificationsPage';
import AccountPage from './pages/AccountPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { CommerceProvider } from './lib/commerceContext';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env');
}

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <main className="min-h-screen bg-[#eef2f6]" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login/*" element={<LoginPage />} />
          <Route path="signup/*" element={<SignupPage />} />
          <Route path="home" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="deals" element={<RequireAuth><DealsPage /></RequireAuth>} />
          <Route path="new-arrivals" element={<RequireAuth><NewArrivalsPage /></RequireAuth>} />
          <Route path="brands" element={<RequireAuth><BrandsPage /></RequireAuth>} />
          <Route path="smart-bundles" element={<RequireAuth><SmartBundlesPage /></RequireAuth>} />
          <Route path="products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
          <Route path="products/:id" element={<RequireAuth><ProductDetailPage /></RequireAuth>} />
          <Route path="recommendations" element={<RequireAuth><RecommendationsPage /></RequireAuth>} />
          <Route path="activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />
          <Route path="notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="orders" element={<RequireAuth><OrderTrackingPage /></RequireAuth>} />
          <Route path="orders/:orderId" element={<RequireAuth><OrderTrackingPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <CommerceProvider>
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/home"
      signUpFallbackRedirectUrl="/home"
    >
      <AppRouter />
    </ClerkProvider>
  </CommerceProvider>
);
