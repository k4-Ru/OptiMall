import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function AccountPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const { signOut } = useClerk();
  const { orders, cartCount, cartTotal } = useCommerce();

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return {
      ordersCount: orders.length,
      totalSpent,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-[#d5dded] bg-[#f8fbff] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Account Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Welcome, {user?.firstName || 'Shopper'}</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your orders, track spending, and jump back into smart shopping.</p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-[#d5dded] bg-white p-4">
            <p className="text-xs text-slate-500">Orders</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats.ordersCount}</p>
          </article>
          <article className="rounded-xl border border-[#d5dded] bg-white p-4">
            <p className="text-xs text-slate-500">Total spent</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatPrice(stats.totalSpent)}</p>
          </article>
          <article className="rounded-xl border border-[#d5dded] bg-white p-4">
            <p className="text-xs text-slate-500">Active cart</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{cartCount} items</p>
            <p className="text-xs text-slate-500">{formatPrice(cartTotal)}</p>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#d5dded] bg-white p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-700">Quick Actions</h2>
            <div className="mt-3 grid gap-2">
              <Link to="/orders" className="rounded-lg border border-[#d5dded] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#eaf0fb]">Track my orders</Link>
              <Link to="/recommendations" className="rounded-lg border border-[#d5dded] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#eaf0fb]">Get smart recommendations</Link>
              <Link to="/smart-bundles" className="rounded-lg border border-[#d5dded] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#eaf0fb]">Build a smart bundle</Link>
              <Link to="/cart" className="rounded-lg bg-[#1A2A54] px-3 py-2 text-sm font-bold text-white hover:bg-[#142042]">Go to cart</Link>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: '/' })}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Log out
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#d5dded] bg-white p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-700">Profile</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Name:</span> {user?.fullName || 'Not set'}</p>
              <p><span className="font-semibold">Email:</span> {user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
              <p><span className="font-semibold">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
