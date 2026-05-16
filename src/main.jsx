import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env');
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="login/*" element={<LoginPage />} />
          <Route path="signup/*" element={<SignupPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="new-arrivals" element={<NewArrivalsPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="smart-bundles" element={<SmartBundlesPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    signInUrl="/login"
    signUpUrl="/signup"
    signInFallbackRedirectUrl="/home"
    signUpFallbackRedirectUrl="/home"
  >
    <AppRouter />
  </ClerkProvider>
);
