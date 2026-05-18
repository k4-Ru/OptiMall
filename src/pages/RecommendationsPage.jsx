import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { postRecommendation } from '../lib/api';

export default function RecommendationsPage() {
  const { getToken, isSignedIn } = useAuth();
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
      if (!isSignedIn) {
        throw new Error('Sign in first to request recommendations.');
      }

      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');

      const payload = {
        budget: Number(budget),
        preferences: preferences
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      };

      const data = await postRecommendation(payload, token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm ">
      <h2 className="text-xl font-semibold">Recommendations</h2>
      <p className="mt-2 text-slate-600">Connected to `POST /api/recommendations`.</p>
      <form className="mt-4 grid gap-3 md:max-w-xl" onSubmit={handleSubmit}>
        <input
          type="number"
          min="1"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Budget"
        />
        <input
          type="text"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Preferences (comma-separated)"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </form>
      {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <pre className="mt-4 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
