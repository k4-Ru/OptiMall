import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
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
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [forcingLogout, setForcingLogout] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      if (!isLoaded || !isSignedIn) {
        if (active) setCheckedAccess(true);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (active) setCheckedAccess(true);
          return;
        }
        const response = await fetch('/api/auth/access', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 403) {
          const data = await response.json().catch(() => ({}));
          if (data?.error_type === 'SUSPICIOUS_USER_BLOCKED') {
            if (active) setForcingLogout(true);
            return;
          }
        }
      } catch {
        // ignore check errors and let route proceed
      } finally {
        if (active) setCheckedAccess(true);
      }
    }
    checkAccess();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, getToken, signOut]);

  if (!isLoaded || !checkedAccess) {
    return <main className="min-h-screen bg-[#eef2f6]" />;
  }

  if (forcingLogout) {
    return <Navigate to="/security-logout" replace />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function SecurityLogoutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      signOut({ redirectUrl: '/login' }).catch(() => {
        window.location.href = '/login';
      });
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [signOut]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f6] px-4">
      <div className="rounded-xl border border-[#d5dded] bg-white px-7 py-6 text-center shadow-sm">
        <p className="text-base font-extrabold text-slate-900">Logging out...</p>
        <p className="mt-1 text-sm font-semibold text-slate-600">Suspicious activity detected.</p>
      </div>
    </main>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login/*" element={<LoginPage />} />
          <Route path="signup/*" element={<SignupPage />} />
          <Route path="security-logout" element={<SecurityLogoutPage />} />
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

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing root container');
}

const ROOT_KEY = '__optimall_react_root__';
const root = globalThis[ROOT_KEY] || createRoot(container);
globalThis[ROOT_KEY] = root;

root.render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    signInUrl="/login"
    signUpUrl="/signup"
    signInFallbackRedirectUrl="/home"
    signUpFallbackRedirectUrl="/home"
  >
    <CommerceProvider>
      <AppRouter />
    </CommerceProvider>
  </ClerkProvider>
);
