import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from '../components/Header';
import { getAdminReport, patchAdminUserFlag } from '../lib/api';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  async function loadReportOnce() {
    setLoading(true);
    setError('');
    const token = await getToken();
    if (!token) throw new Error('Authentication expired.');
    const data = await getAdminReport(token);
    setReport(data);
  }

  useEffect(() => {
    let active = true;
    async function loadReport() {
      try {
        await loadReportOnce();
      } catch (err) {
        if (active) setError(err.message || 'Failed to load admin report.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReport();
    return () => { active = false; };
  }, [getToken]);

  const topProducts = useMemo(
    () => Array.isArray(report?.product_analytics) ? report.product_analytics.slice(0, 25) : [],
    [report]
  );

  async function handleUnflagUser(user) {
    const userId = Number(user?.id || 0);
    if (!userId) return;
    try {
      setActionLoadingById((prev) => ({ ...prev, [userId]: true }));
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      await patchAdminUserFlag(userId, { is_flagged: false, flag_reason: '' }, token);
      await loadReportOnce();
    } catch (err) {
      setError(err.message || 'Failed to update user flag.');
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [userId]: false }));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-[#d5dded] bg-white p-6">
          <h1 className="text-2xl font-extrabold text-[var(--ink)]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Operational reports, flagged users, and product performance.</p>
        </section>

        {loading && (
          <section className="mt-4 rounded-2xl border border-[#d5dded] bg-white p-6 text-sm text-[var(--ink-soft)]">
            Loading admin report...
          </section>
        )}

        {!!error && (
          <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
            {error}
          </section>
        )}

        {!loading && !error && report && (
          <>
            <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <article className="rounded-xl border border-[#d5dded] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Users</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">{Number(report?.kpis?.total_users || 0)}</p>
              </article>
              <article className="rounded-xl border border-[#d5dded] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Products</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">{Number(report?.kpis?.total_products || 0)}</p>
              </article>
              <article className="rounded-xl border border-[#d5dded] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Orders</p>
                <p className="mt-2 text-2xl font-black text-[var(--ink)]">{Number(report?.kpis?.total_orders || 0)}</p>
              </article>
              <article className="rounded-xl border border-[#d5dded] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Revenue</p>
                <p className="mt-2 text-2xl font-black text-[var(--brand)]">{formatPrice(report?.kpis?.total_revenue || 0)}</p>
              </article>
              <article className="rounded-xl border border-[#d5dded] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Flagged Users</p>
                <p className="mt-2 text-2xl font-black text-red-600">{Number(report?.kpis?.flagged_users || 0)}</p>
              </article>
            </section>

            <section className="mt-4 rounded-2xl border border-[#d5dded] bg-white p-4 sm:p-5">
              <h2 className="text-lg font-extrabold text-[var(--ink)]">Flagged users</h2>
              {!Array.isArray(report?.flagged_users) || report.flagged_users.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--ink-soft)]">No flagged users found.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e4ebf6] text-[var(--ink-soft)]">
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">User</th>
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Email</th>
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Role</th>
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Reason</th>
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Flagged At</th>
                        <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.flagged_users.map((user) => (
                        <tr key={`flagged-${user.id}`} className="border-b border-[#f0f4fb]">
                          <td className="px-2 py-2 font-semibold text-[var(--ink)]">{user.name || user.clerk_user_id}</td>
                          <td className="px-2 py-2 text-[var(--ink-soft)]">{user.email || '-'}</td>
                          <td className="px-2 py-2 text-[var(--ink-soft)]">{user.role || 'customer'}</td>
                          <td className="px-2 py-2 text-red-700">{user.flag_reason || '-'}</td>
                          <td className="px-2 py-2 text-[var(--ink-soft)]">{user.flagged_at ? new Date(user.flagged_at).toLocaleString() : '-'}</td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              onClick={() => handleUnflagUser(user)}
                              disabled={Boolean(actionLoadingById[user.id])}
                              className="rounded-lg border border-[#cfd9eb] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink)] transition hover:border-[#b8c7e4] hover:bg-[#f7faff] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoadingById[user.id] ? 'Updating...' : 'Remove Flag'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-[#d5dded] bg-white p-4 sm:p-5">
              <h2 className="text-lg font-extrabold text-[var(--ink)]">Product analytics</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Top products ranked by purchases, add-to-carts, and views.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e4ebf6] text-[var(--ink-soft)]">
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Product</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Category</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Price</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Views</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Clicks</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Add to carts</th>
                      <th className="px-2 py-2 font-bold uppercase tracking-[0.12em]">Purchases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={`analytics-${product.id}`} className="border-b border-[#f0f4fb]">
                        <td className="px-2 py-2 font-semibold text-[var(--ink)]">{product.name}</td>
                        <td className="px-2 py-2 text-[var(--ink-soft)]">{product.category || '-'}</td>
                        <td className="px-2 py-2 font-bold text-[var(--brand)]">{formatPrice(product.price)}</td>
                        <td className="px-2 py-2 text-[var(--ink-soft)]">{product.views}</td>
                        <td className="px-2 py-2 text-[var(--ink-soft)]">{product.clicks}</td>
                        <td className="px-2 py-2 text-[var(--ink-soft)]">{product.add_to_carts}</td>
                        <td className="px-2 py-2 font-semibold text-[var(--ink)]">{product.purchases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
