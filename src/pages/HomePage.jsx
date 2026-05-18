import { useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProducts, postActivity } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

function getProductImage(product) {
  return product.image_path || null;
}

function shuffle(items, seed = Date.now()) {
  const arr = [...items];
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HomePage() {
  const { isSignedIn, getToken } = useAuth();
  const { addToCart } = useCommerce();
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());

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
    setShuffleSeed(Date.now());
    return () => {
      mounted = false;
    };
  }, []);

  async function handleTrackView(productId) {
    try {
      if (!isSignedIn) return;
      const token = await getToken();
      if (!token) return;
      await postActivity({ event_type: 'view_product', product_id: productId, weight_score: 1 }, token);
    } catch (_err) {
      // Activity logging should not block browsing.
    }
  }

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        String(product.name || '').toLowerCase().includes(keyword) ||
        String(product.category || '').toLowerCase().includes(keyword)
    );
  }, [products, searchQuery]);

  const discoveredProducts = useMemo(
    () => shuffle(filteredProducts, shuffleSeed),
    [filteredProducts, shuffleSeed]
  );
  const featuredProducts = discoveredProducts.slice(0, 8);
  const flashDeals = discoveredProducts
    .filter((product) => Number(product.stock || 0) > 10)
    .slice(0, 6);
  const trendingNow = [...discoveredProducts]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 8);
  const topCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1440px] px-8 pt-8">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#1A2A54] via-[#223B7D] to-[#1A2A54] p-7 text-white shadow-sm">
          <h1 className="text-3xl font-black tracking-tight">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''} to OptiMall
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Discover products across categories. Personalized ranking will improve as your activity grows.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topCategories.length === 0 && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Loading categories...</span>
            )}
            {topCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSearchQuery(category)}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/35"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-slate-600">Loading products...</p>}
        {!!error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900">Discover Today</h2>
                <button
                  type="button"
                  onClick={() => setShuffleSeed(Date.now())}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Refresh picks
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <article key={`featured-${product.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-slate-50">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product)} alt={product.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-slate-400">
                          <span className="text-xs font-semibold">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                    <p className="mt-2 text-lg font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await handleTrackView(product.id);
                          navigate(`/products/${product.id}`);
                        }}
                        className="rounded-md bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="rounded-md bg-[#FF6B00] py-2 text-xs font-semibold text-white hover:bg-[#E65C00]"
                      >
                        Add
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">Flash Deals</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {flashDeals.map((product) => (
                  <article key={`deal-${product.id}`} className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product)} alt={product.name} className="h-16 w-16 rounded-md bg-white object-contain p-1" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-100 text-[10px] font-semibold text-slate-400">
                          No Image
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                        <p className="text-base font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">Trending Now</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {trendingNow.map((product) => (
                  <article key={`trend-${product.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-slate-50">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product)} alt={product.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-slate-400">
                          <span className="text-xs font-semibold">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <span>{product.category || 'Uncategorized'}</span>
                      <span>•</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(product.rating || 0).toFixed(1)}</span>
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
