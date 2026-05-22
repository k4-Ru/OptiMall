import { useClerk, useUser } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  LogOut,
  Mail,
  Package,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';
import { useAuth } from '@clerk/clerk-react';
import { fetchAuthAccess } from '../lib/authApi';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function AccountPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { orders, cartCount, cartTotal } = useCommerce();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return {
      ordersCount: orders.length,
      totalSpent,
    };
  }, [orders]);

  const latestOrder = orders[0] || null;

  const isPaid = latestOrder ? (latestOrder.payment_status === 'done' || latestOrder.status === 'paid') : false;
  const isShipped = latestOrder ? !!latestOrder.tracking_steps?.find((s) => s.key === 'shipped')?.done : false;
  const isDelivered = latestOrder ? !!latestOrder.tracking_steps?.find((s) => s.key === 'delivered')?.done : false;

  useEffect(() => {
    let active = true;
    async function loadAccess() {
      if (!isLoaded || !isSignedIn) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (active) setIsAdmin(false);
          return;
        }
        const response = await fetchAuthAccess(token);
        const data = await response.json().catch(() => ({}));
        if (active) setIsAdmin(Boolean(data?.is_admin || String(data?.role || '').toLowerCase() === 'admin'));
      } catch {
        if (active) setIsAdmin(false);
      }
    }
    loadAccess();
    return () => {
      active = false;
    };
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#cbd8ee] bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-[#b4c5e3] active:scale-[0.97]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
        </div>

        {/* Dashboard Header Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-[#d5dded] bg-gradient-to-r from-[#1A2A54] to-[#2A3A6A] p-6 text-white shadow-sm">
          {/* Subtle Orange Glow Blob */}
          <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-[#FF6B00]/15 blur-2xl" />
          
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B8C7EB]">Account Dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome, {user?.firstName || 'Shopper'}</h1>
          <p className="mt-2 text-sm text-[#B8C7EB] max-w-xl">
            Manage your orders, track spending milestones, and watch your deliveries in real-time.
          </p>
        </section>

        {!isAdmin && (
          <>
        {/* Stats Grid */}
        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <article className="flex items-center justify-between rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{stats.ordersCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8eef8] text-[#1A2A54]">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </article>
          
          <article className="flex items-center justify-between rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Spent</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{formatPrice(stats.totalSpent)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
              <DollarSign className="h-5 w-5" />
            </div>
          </article>
          
          <article className="flex items-center justify-between rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Cart</p>
              <div className="flex items-baseline gap-1.5">
                <p className="mt-1 text-2xl font-black text-slate-900">{cartCount} items</p>
                <p className="text-xs font-medium text-slate-500">({formatPrice(cartTotal)})</p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8eef8] text-[#1A2A54]">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </article>
        </section>

        {/* Content sections */}
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Order Status Tracker */}
          <div className="rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1A2A54] border-b border-slate-100 pb-3">
              Order Delivery Tracker
            </h2>
            
            {latestOrder ? (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                  <span>Order ID: <strong className="text-slate-800 font-mono">{latestOrder.id}</strong></span>
                  <span>Amount: <strong className="text-[#FF6B00]">{formatPrice(latestOrder.total_amount)}</strong></span>
                </div>

                {/* Timeline component */}
                <div className="relative flex items-center justify-between mt-8 mb-6 px-6">
                  {/* Background Line */}
                  <div className="absolute left-10 right-10 top-1/2 h-1 -translate-y-1/2 bg-slate-200" />
                  {/* Active Fill Line */}
                  <div
                    className="absolute left-10 top-1/2 h-1 -translate-y-1/2 bg-[#1A2A54] transition-all duration-700 ease-out"
                    style={{
                      width: isDelivered ? 'calc(100% - 5rem)' : isShipped ? '50%' : '0%'
                    }}
                  />

                  {/* Step 1: Pay */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isPaid ? 'border-[#1A2A54] bg-[#1A2A54] text-white shadow-sm' : 'border-slate-300 bg-white text-slate-400'
                    }`}>
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <span className="mt-2.5 text-xs font-extrabold text-slate-800">Pay</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">Completed</span>
                  </div>

                  {/* Step 2: Ship */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isShipped ? 'border-[#1A2A54] bg-[#1A2A54] text-white shadow-sm' : 
                      isPaid ? 'border-[#FF6B00] bg-white text-[#FF6B00] animate-pulse' : 'border-slate-300 bg-white text-slate-400'
                    }`}>
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <span className="mt-2.5 text-xs font-extrabold text-slate-800">Ship</span>
                    <span className={`text-[9px] font-bold uppercase mt-0.5 ${isShipped ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isShipped ? 'Completed' : 'Processing'}
                    </span>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isDelivered ? 'border-[#1A2A54] bg-[#1A2A54] text-white shadow-sm' : 'border-slate-300 bg-white text-slate-400'
                    }`}>
                      <Package className="h-4.5 w-4.5" />
                    </div>
                    <span className="mt-2.5 text-xs font-extrabold text-slate-800">Delivered</span>
                    <span className={`text-[9px] font-bold uppercase mt-0.5 ${isDelivered ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isDelivered ? 'Arrived' : 'In Transit'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex justify-center">
                  <Link
                    to={`/orders/${latestOrder.id}`}
                    className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B00] hover:text-[#E65C00] transition"
                  >
                    View detailed tracker →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-10 w-10 text-slate-300 mb-2.5" />
                <p className="text-sm font-bold text-slate-700">No active orders found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Start shopping to track your deliveries!</p>
                <Link
                  to="/home"
                  className="mt-5 rounded-xl bg-[#1A2A54] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2A3A6A] transition shadow-md shadow-[#1A2A54]/10 active:scale-[0.98]"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>

          {/* Profile Details Card */}
          <div className="rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1A2A54] border-b border-slate-100 pb-3">
                Profile Details
              </h2>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-bold text-slate-800">{user?.fullName || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-slate-800 break-all">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-bold text-slate-800">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button inside Profile Card */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-extrabold uppercase tracking-wider text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </section>
          </>
        )}

        {isAdmin && (
          <section className="mt-5">
            <div className="rounded-xl border border-[#d5dded] bg-white p-5 shadow-sm">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1A2A54] border-b border-slate-100 pb-3">
                Profile Details
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-bold text-slate-800">{user?.fullName || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-slate-800 break-all">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-[#1A2A54]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-bold text-slate-800">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-extrabold uppercase tracking-wider text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
