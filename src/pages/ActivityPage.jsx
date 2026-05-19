import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from '../components/Header';
import { postActivity } from '../lib/api';

const EVENT_HELP = {
  view_product: 'Use when a shopper views a product page.',
  click_product: 'Use when a shopper clicks a product card or result.',
  add_to_cart: 'Use when a shopper adds any product to cart.',
  purchase: 'Use when checkout is completed.',
  search: 'Use when a shopper performs a search.',
};

export default function ActivityPage() {
  const { getToken, isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('view_product');
  const [productId, setProductId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitActivity(event) {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      if (!isSignedIn) throw new Error('Sign in first to record activity signals.');

      const token = await getToken();
      if (!token) throw new Error('Authentication expired. Please sign in again.');

      await postActivity(
        {
          event_type: eventType,
          product_id: productId ? Number(productId) : null,
          search_query: searchValue || null,
          weight_score: 1,
        },
        token
      );
      setStatus('Activity signal saved. Recommendation engines can use this in the next run.');
    } catch (err) {
      setError(err.message || 'Could not save activity signal.');
    }
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[920px] px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-[#d5dded] bg-[#f8fbff] p-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Activity Signals</h1>
          <p className="mt-1 text-sm text-slate-600">Record shopper behavior events to improve recommendation quality.</p>

          <form className="mt-4 grid gap-3" onSubmit={submitActivity}>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Event type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded-lg border border-[#d5dded] bg-white px-3 py-2"
            >
              <option value="view_product">view_product</option>
              <option value="click_product">click_product</option>
              <option value="add_to_cart">add_to_cart</option>
              <option value="purchase">purchase</option>
              <option value="search">search</option>
            </select>
            <p className="text-xs text-slate-500">{EVENT_HELP[eventType]}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="rounded-lg border border-[#d5dded] bg-white px-3 py-2"
                placeholder="Product ID (optional)"
              />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="rounded-lg border border-[#d5dded] bg-white px-3 py-2"
                placeholder="Search query (optional)"
              />
            </div>

            <button type="submit" className="w-fit rounded-lg bg-[#1A2A54] px-4 py-2 text-sm font-bold text-white hover:bg-[#142042]">
              Save activity signal
            </button>
          </form>

          {!!status && <p className="mt-3 text-sm font-semibold text-emerald-700">{status}</p>}
          {!!error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        </section>
      </main>
    </div>
  );
}
