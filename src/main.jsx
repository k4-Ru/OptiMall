import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
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
import AdminPage from './pages/AdminPage';
import { CommerceProvider } from './lib/commerceContext';
import { fetchAuthAccess } from './lib/authApi';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env');
}

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const location = useLocation();
  const [forcingLogout, setForcingLogout] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
        const response = await fetchAuthAccess(token);
        if (response.status === 403) {
          const data = await response.json().catch(() => ({}));
          if (data?.error_type === 'SUSPICIOUS_USER_BLOCKED') {
            if (active) setForcingLogout(true);
            return;
          }
        }
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          if (active) setIsAdmin(Boolean(data?.is_admin || String(data?.role || '').toLowerCase() === 'admin'));
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
    return <main className="min-h-screen" />;
  }

  if (forcingLogout) {
    return <Navigate to="/security-logout" replace />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && location.pathname === '/home') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!isLoaded || !isSignedIn) {
        if (active) setChecking(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (active) setChecking(false);
          return;
        }
        const response = await fetchAuthAccess(token);
        const data = await response.json().catch(() => ({}));
        if (active) setIsAdmin(Boolean(data?.is_admin || String(data?.role || '').toLowerCase() === 'admin'));
      } catch {
        // fallthrough to not-admin path
      } finally {
        if (active) setChecking(false);
      }
    }
    run();
    return () => { active = false; };
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || checking) return <main className="min-h-screen" />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
}

function RequireNonAdmin({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!isLoaded || !isSignedIn) {
        if (active) setChecking(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (active) setChecking(false);
          return;
        }
        const response = await fetchAuthAccess(token);
        const data = await response.json().catch(() => ({}));
        if (active) setIsAdmin(Boolean(data?.is_admin || String(data?.role || '').toLowerCase() === 'admin'));
      } catch {
        // fallthrough to non-admin path
      } finally {
        if (active) setChecking(false);
      }
    }
    run();
    return () => { active = false; };
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || checking) return <main className="min-h-screen" />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
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
    <main className="grid min-h-screen place-items-center px-4">
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
          <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="cart" element={<RequireNonAdmin><CartPage /></RequireNonAdmin>} />
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
