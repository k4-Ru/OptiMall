import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { postActivity } from '../lib/api';

export default function ActivityPage() {
  const { getToken, isSignedIn } = useAuth();
  const [eventType, setEventType] = useState('view_product');
  const [productId, setProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitActivity(event) {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      if (!isSignedIn) {
        throw new Error('Sign in first to log activity.');
      }

      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');

      await postActivity(
        {
          event_type: eventType,
          product_id: productId ? Number(productId) : null,
          search_query: searchQuery || null,
          weight_score: 1,
        },
        token
      );
      setStatus('Activity logged.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">User Activity</h2>
      <p className="mt-2 text-slate-600">Connected to `POST /api/activity`.</p>
      <form className="mt-4 grid gap-3 md:max-w-xl" onSubmit={submitActivity}>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
        >
          <option value="view_product">view_product</option>
          <option value="click_product">click_product</option>
          <option value="add_to_cart">add_to_cart</option>
          <option value="purchase">purchase</option>
          <option value="search">search</option>
        </select>
        <input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Product ID (optional)"
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Search query (optional)"
        />
        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Log Activity
        </button>
      </form>
      {!!status && <p className="mt-3 text-sm text-emerald-700">{status}</p>}
      {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
