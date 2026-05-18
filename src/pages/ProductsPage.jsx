import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { getProducts, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function ProductsPage() {
  const { isSignedIn, getToken } = useAuth();
  const { addToCart } = useCommerce();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [maxBudget, setMaxBudget] = useState('5000');
  const [preferences, setPreferences] = useState('Tech,Home');
  const [bundleResult, setBundleResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const rows = await getProducts();
        if (mounted) setProducts(rows);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((p) => String(p.category || '').trim()).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    return products.filter((product) => {
      const byKeyword = !key || String(product.name || '').toLowerCase().includes(key) || String(product.category || '').toLowerCase().includes(key);
      const byCategory = category === 'all' || String(product.category || '').toLowerCase() === category.toLowerCase();
      const byBudget = !maxBudget || Number(product.price || 0) <= Number(maxBudget);
      return byKeyword && byCategory && byBudget;
    });
  }, [products, keyword, category, maxBudget]);

  async function runBudgetCheck() {
    setRunning(true);
    setError('');
    try {
      if (!isSignedIn) throw new Error('Sign in first to run budget checks.');
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');
      const data = await postIntelligencePipeline(
        {
          budget: Number(maxBudget),
          preferences: preferences.split(',').map((p) => p.trim()).filter(Boolean),
          products: filteredProducts,
        },
        token
      );
      setBundleResult(data?.bundle_optimization || null);
    } catch (err) {
      setError(err.message);
      setBundleResult(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Products</h2>
      <p className="mt-1 text-sm text-slate-500">Search products, apply budget/category filters, then run bundle checks.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="rounded border border-slate-300 px-3 py-2" placeholder="Search product/category" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border border-slate-300 px-3 py-2">
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
        <input type="number" min="1" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="rounded border border-slate-300 px-3 py-2" placeholder="Budget cap" />
        <input value={preferences} onChange={(e) => setPreferences(e.target.value)} className="rounded border border-slate-300 px-3 py-2" placeholder="Preferences (csv)" />
      </div>

      <div className="mt-3">
        <button type="button" onClick={runBudgetCheck} disabled={running || loading} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {running ? 'Checking...' : 'Check Budget & Build Bundle'}
        </button>
      </div>

      {loading && <p className="mt-3 text-slate-600">Loading products...</p>}
      {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {bundleResult && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-bold text-slate-900">Bundle Result</p>
          <p className="mt-1 text-xs text-slate-600">
            Total: <span className="font-semibold text-[#FF6B00]">{formatPrice(bundleResult.total_cost)}</span> • Remaining: {formatPrice(bundleResult.remaining_budget)} • Items: {(bundleResult.bundle || []).length}
          </p>
          <div className="mt-3 space-y-2">
            {(bundleResult.bundle || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-orange-200 bg-white px-3 py-2">
                <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                <button type="button" onClick={() => addToCart(item, 1)} className="rounded bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white">Add</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-4">{product.name}</td>
                  <td className="py-2 pr-4">{product.category || '-'}</td>
                  <td className="py-2 pr-4">{formatPrice(product.price)}</td>
                  <td className="py-2 pr-4">{product.stock ?? '-'}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/products/${product.id}`} className="rounded border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700">View</Link>
                      <button type="button" onClick={() => addToCart(product, 1)} className="rounded bg-[#1A2A54] px-3 py-1 text-xs font-bold text-white">Add to Cart</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
