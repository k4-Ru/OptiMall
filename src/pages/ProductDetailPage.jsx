import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getProducts, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

const BUDGET_MULTIPLIERS = [1, 2, 3];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isSignedIn, getToken } = useAuth();
  const { addToCart } = useCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bundleSets, setBundleSets] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const rows = await getProducts();
        if (mounted) setProducts(rows);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const product = useMemo(
    () => products.find((p) => Number(p.id) === Number(id)) || null,
    [products, id]
  );

  useEffect(() => {
    let active = true;
    async function loadBundles() {
      if (!product || !isSignedIn) {
        setBundleSets([]);
        return;
      }
      setLoadingBundles(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token.');
        const base = Math.max(500, Number(product.price || 1000));
        const budgets = BUDGET_MULTIPLIERS.map((m) => Math.round(base * m));
        const prefs = [String(product.category || '').trim()].filter(Boolean);

        const responses = await Promise.all(
          budgets.map(async (budget) => {
            const data = await postIntelligencePipeline(
              {
                budget,
                preferences: prefs,
                products,
              },
              token
            );
            return {
              budget,
              bundle: data?.bundle_optimization?.bundle || [],
              total: Number(data?.bundle_optimization?.total_cost || 0),
            };
          })
        );
        if (active) setBundleSets(responses);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load bundles');
      } finally {
        if (active) setLoadingBundles(false);
      }
    }
    loadBundles();
    return () => {
      active = false;
    };
  }, [product, products, isSignedIn, getToken]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        {loading && <p className="text-slate-600">Loading product...</p>}
        {!!error && <p className="text-red-600">{error}</p>}
        {!loading && !product && <p className="text-slate-600">Product not found.</p>}

        {!loading && product && (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                <div className="flex h-56 items-center justify-center rounded-lg bg-slate-50">
                  {product.image_path ? (
                    <img src={product.image_path} alt={product.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-xs font-semibold text-slate-400">No Image</div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">{product.category || 'Uncategorized'}</p>
                  <p className="mt-3 text-3xl font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
                  <p className="mt-1 text-sm text-slate-600">Stock: {product.stock ?? '-'}</p>
                  <button type="button" onClick={() => addToCart(product, 1)} className="mt-4 rounded bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white">
                    Add to Cart
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Bundle Ideas At Different Budgets</h2>
              {!isSignedIn && <p className="mt-2 text-sm text-slate-500">Sign in to generate personalized bundle suggestions.</p>}
              {loadingBundles && <p className="mt-2 text-sm text-slate-500">Generating bundles...</p>}
              {isSignedIn && !loadingBundles && (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {bundleSets.map((set) => (
                    <article key={set.budget} className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Budget</p>
                      <p className="text-lg font-extrabold text-[#1A2A54]">{formatPrice(set.budget)}</p>
                      <p className="mt-1 text-xs text-slate-500">Bundle total: {formatPrice(set.total)}</p>
                      <div className="mt-3 space-y-2">
                        {set.bundle.slice(0, 4).map((item) => (
                          <div key={`${set.budget}-${item.id}`} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
                            <span className="truncate text-xs font-semibold text-slate-700">{item.name}</span>
                            <button type="button" onClick={() => addToCart(item, 1)} className="rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
                              Add
                            </button>
                          </div>
                        ))}
                        {!set.bundle.length && <p className="text-xs text-slate-400">No bundle for this budget.</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
