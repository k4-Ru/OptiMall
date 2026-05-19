import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from '../components/Header';
import { postRecommendation } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function RecommendationsPage() {
  const { getToken, isSignedIn } = useAuth();
  const { addToCart } = useCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('2000');
  const [preferences, setPreferences] = useState('Tech,Home');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (!isSignedIn) throw new Error('Sign in to generate personalized recommendations.');

      const token = await getToken();
      if (!token) throw new Error('Authentication expired. Please sign in again.');

      const payload = {
        budget: Number(budget),
        preferences: preferences.split(',').map((p) => p.trim()).filter(Boolean),
      };

      const data = await postRecommendation(payload, token);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not generate recommendations.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-[#d5dded] bg-[#f8fbff] p-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Smart Recommendations</h1>
          <p className="mt-1 text-sm text-slate-600">Set your budget and preferences to get a ready-to-shop bundle suggestion.</p>

          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
            <input
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded-lg border border-[#d5dded] bg-white px-3 py-2"
              placeholder="Budget (e.g. 5000)"
            />
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="rounded-lg border border-[#d5dded] bg-white px-3 py-2 md:col-span-2"
              placeholder="Preferences (e.g. tech, wireless, ergonomic)"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-fit rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:bg-[#E65C00] disabled:opacity-60"
            >
              {loading ? 'Generating recommendations...' : 'Generate recommendations'}
            </button>
          </form>
          {!!error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        </section>

        {result && (
          <section className="mt-5 rounded-2xl border border-[#d5dded] bg-white p-5">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-slate-600">Total cost: <span className="font-extrabold text-slate-900">{formatPrice(result.total_cost)}</span></p>
              <p className="text-sm text-slate-600">Remaining: <span className="font-extrabold text-[#1A2A54]">{formatPrice(result.remaining_budget)}</span></p>
            </div>

            <h2 className="mt-4 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-700">Recommended bundle</h2>
            {(result.bundle || []).length === 0 && <p className="mt-2 text-sm text-slate-500">No items matched this budget. Try increasing your budget or broadening preferences.</p>}

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(result.bundle || []).map((item) => (
                <article key={item.id} className="rounded-lg border border-[#d5dded] bg-[#f8fbff] p-3">
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-[#FF6B00]">{formatPrice(item.price)}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(item, Number(item.qty || 1))}
                    className="mt-2 rounded bg-[#1A2A54] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#142042]"
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
