import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Zap,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getProducts, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `\u20B1${Number(value || 0).toLocaleString()}`;
}

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((t) => String(t).toLowerCase());
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((t) => String(t).toLowerCase()) : [];
  } catch {
    return [];
  }
}

const TIERS = [
  { key: 'starter', label: 'Starter Tier', mult: 1.2 },
  { key: 'balanced', label: 'Balanced Tier', mult: 2.0 },
  { key: 'max', label: 'Max Value Tier', mult: 3.0 },
];

function RatingStars({ value = 0, tone = 'brand', label }) {
  const rating = Number(value || 0);
  const activeColor = tone === 'seller' ? 'text-yellow-400' : 'text-[#FF6B00]';

  return (
    <div className="flex items-center gap-1">
      {label && <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>}
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={`${label || 'rating'}-${star}`}
          className={`h-3.5 w-3.5 ${rating >= star ? activeColor : 'text-slate-300'}`}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
      <span className="ml-1 text-xs font-extrabold text-slate-700">{rating ? rating.toFixed(1) : 'N/A'}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { addToCart } = useCommerce();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [error, setError] = useState('');
  const [bundleSets, setBundleSets] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const rows = await getProducts();
        if (mounted) setProducts(rows);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load product.');
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
  const sellerName = String(
    product?.seller_name ||
      product?.seller ||
      product?.store_name ||
      product?.brand ||
      'OptiMall Verified Seller'
  );
  const sellerLocation = product?.seller_location || null;
  const sellerRating = product?.seller_rating ? Number(product.seller_rating) : null;
  const productTags = useMemo(() => parseTags(product?.tags), [product?.tags]);
  const productTagVector = useMemo(() => parseTags(product?.tag_vector), [product?.tag_vector]);
  const effectiveTags = useMemo(
    () => (productTagVector.length ? productTagVector : productTags),
    [productTagVector, productTags]
  );
  const productsById = useMemo(
    () => new Map(products.map((item) => [Number(item.id), item])),
    [products]
  );

  const pairsWellWith = useMemo(() => {
    if (!product) return [];
    const productId = Number(product.id);
    const productCategory = String(product.category || '').toLowerCase();
    const tagSet = new Set(effectiveTags);

    const scored = products
      .filter((p) => Number(p.id) !== productId && Number(p.stock || 0) > 0)
      .map((candidate) => {
        const candidateTags = parseTags(candidate.tags);
        const overlap = candidateTags.filter((tag) => tagSet.has(tag)).length;
        const sameCategory = String(candidate.category || '').toLowerCase() === productCategory ? 1 : 0;
        const score = sameCategory * 2 + overlap + Number(candidate.rating || 0) * 0.1;
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 6).map((entry) => entry.candidate);
  }, [product, products, effectiveTags]);

  const balancedTier = useMemo(
    () => bundleSets.find((tier) => tier.key === 'balanced') || bundleSets[0] || null,
    [bundleSets]
  );

  const budgetCompletionSuggestions = useMemo(() => {
    if (!balancedTier) return { remaining: 0, items: [] };
    const remaining = Math.max(0, Number(balancedTier.remaining || 0));
    const bundleIds = new Set((balancedTier.bundle || []).map((item) => Number(item.id)));
    const items = pairsWellWith
      .filter((item) => !bundleIds.has(Number(item.id)) && Number(item.price || 0) <= remaining)
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 4);
    return { remaining, items };
  }, [balancedTier, pairsWellWith]);

  const explanationLines = useMemo(() => {
    if (!product) return [];
    const lines = [];
    const category = String(product.category || '').trim();
    if (category) lines.push(`Matches your current ${category} interest.`);
    if (Number(product.rating || 0) >= 4.5) lines.push('High value-to-rating ratio for this category.');
    if (effectiveTags.length) {
      const source = productTagVector.length ? 'metadata tag_vector' : 'product tags';
      lines.push(`Tag match context (${source}): ${effectiveTags.slice(0, 3).join(', ')}.`);
    }
    lines.push('Frequently paired with complementary products in similar bundles.');
    return lines.slice(0, 4);
  }, [product, effectiveTags, productTagVector.length]);

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
        const base = Math.max(1000, Number(product.price || 1000));
        const prefs = [String(product.category || '').trim()].filter(Boolean);

        const results = await Promise.all(
          TIERS.map(async (tier) => {
            const budget = Math.round(base * tier.mult);
            const data = await postIntelligencePipeline(
              { budget, preferences: prefs, products },
              token
            );
            const bundleOpt = data?.bundle_optimization || {};
            return {
              ...tier,
              budget,
              total: Number(bundleOpt.total_cost || 0),
              remaining: Number(bundleOpt.remaining_budget || 0),
              score: Number(bundleOpt.bundle_score || 0),
              bundle: bundleOpt.bundle || [],
            };
          })
        );
        if (active) setBundleSets(results);
      } catch (err) {
        if (active) setError(err.message || 'Failed to generate budget bundles.');
      } finally {
        if (active) setLoadingBundles(false);
      }
    }
    loadBundles();
    return () => {
      active = false;
    };
  }, [product, products, isSignedIn, getToken]);

  function addBundleToCart(bundle = []) {
    bundle.forEach((item) => addToCart(item, 1));
  }

  function getBundleImage(item) {
    return item?.image_path || productsById.get(Number(item?.id))?.image_path || '';
  }

  return (
    <div className="min-h-screen bg-[#EDF1F6] font-sans pb-12">
      <Header />
      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:py-8">
        {loading && <p className="rounded-lg bg-white p-4 text-slate-600">Loading product...</p>}
        {!!error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>}
        {!loading && !product && <p className="rounded-lg bg-white p-4 text-slate-600">Product not found.</p>}

        {!loading && product && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-[#d5dded] bg-white shadow-sm">
              <div className="bg-[#1A2A54] px-4 py-4 text-white sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </div>

              <div className="grid gap-0 lg:grid-cols-[minmax(330px,42%)_1fr]">
                <div className="border-b border-[#d5dded] bg-[#f8fbff] p-4 sm:p-6 lg:border-b-0 lg:border-r">
                  <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-[#d5dded] bg-white p-6 sm:min-h-[420px]">
                    {product.image_path ? (
                      <img src={product.image_path} alt={product.name} className="max-h-[360px] w-full object-contain" />
                    ) : (
                      <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-[#d5dded] text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#EDF1F6] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1A2A54]">
                      {product.category || 'Uncategorized'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#d5dded] px-3 py-1 text-xs font-bold text-slate-600">
                      <Package className="h-3.5 w-3.5" />
                      {product.stock ?? '-'} in stock
                    </span>
                  </div>

                  <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">{product.name}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <RatingStars value={product.rating} label="Product" />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-[#1A2A54]" />
                      Verified product
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Price</p>
                      <p className="mt-1 text-4xl font-black text-[#FF6B00] sm:text-5xl">{formatPrice(product.price)}</p>
                    </div>
                    <Link
                      to="/cart"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d5dded] bg-white px-4 text-sm font-extrabold text-[#1A2A54] transition hover:bg-[#f8fbff]"
                    >
                      View Cart
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 rounded-lg border border-[#d5dded] bg-[#f8fbff] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1A2A54] text-base font-black text-white">
                        <Store className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-extrabold text-slate-950">{sellerName}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {sellerLocation || 'Philippines'}
                            </p>
                          </div>
                          <RatingStars value={sellerRating} tone="seller" label="Seller" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-5 text-sm font-extrabold text-white transition hover:bg-[#e65c00]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1);
                        navigate('/cart');
                      }}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#1A2A54] px-5 text-sm font-extrabold text-white transition hover:bg-[#142042]"
                    >
                      <Zap className="h-4 w-4" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#d5dded] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">Bundle Scenarios by Budget</h2>
                  <p className="mt-1 text-sm text-slate-600">Compare tiers and add items directly from each generated bundle.</p>
                </div>
                {loadingBundles && <span className="text-sm font-bold text-slate-500">Generating scenarios...</span>}
              </div>
              {!isSignedIn && <p className="mt-4 rounded-lg bg-[#f8fbff] px-3 py-2 text-sm text-slate-500">Sign in to generate bundle scenarios.</p>}
              {isSignedIn && !loadingBundles && (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {bundleSets.map((tier) => (
                    <article key={tier.key} className="flex flex-col rounded-lg border border-[#d5dded] bg-[#fcfdff] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">{tier.label}</p>
                          <p className="mt-1 text-xl font-black text-[#1A2A54]">{formatPrice(tier.budget)}</p>
                        </div>
                        <span className="rounded-full bg-[#fff3e8] px-2 py-1 text-[11px] font-black text-[#FF6B00]">
                          {formatPrice(tier.remaining)} left
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-500">Bundle total: {formatPrice(tier.total)}</p>
                      <div className="mt-4 flex-1 space-y-2">
                        {tier.bundle.slice(0, 4).map((item) => (
                          <div key={`${tier.key}-${item.id}`} className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-[#d5dded] bg-white px-2.5 py-2">
                            {getBundleImage(item) ? (
                              <img
                                src={getBundleImage(item)}
                                alt={item.name}
                                className="h-10 w-10 shrink-0 rounded-md border border-[#d5dded] bg-[#f8fbff] object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#d5dded] bg-[#f8fbff] text-[9px] font-black text-slate-400">
                                N/A
                              </div>
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{item.name}</span>
                            <button type="button" onClick={() => addToCart(item, 1)} className="shrink-0 rounded-lg bg-[#1A2A54] px-3 py-1.5 text-[10px] font-black uppercase text-white">
                              Add
                            </button>
                          </div>
                        ))}
                        {!tier.bundle.length && <p className="text-xs text-slate-400">No items for this tier.</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => addBundleToCart(tier.bundle)}
                        disabled={!tier.bundle.length}
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#e65c00] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add Bundle to Cart
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-lg border border-[#d5dded] bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-extrabold text-slate-950">Pairs Well With</h2>
                <p className="mt-1 text-sm text-slate-600">Complementary picks based on category, tags, and bundle compatibility.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {pairsWellWith.map((item) => (
                    <article key={`pair-${item.id}`} className="rounded-lg border border-[#d5dded] bg-[#fcfdff] p-3">
                      <div className="flex items-center gap-3">
                        {item.image_path ? (
                          <img src={item.image_path} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg border border-[#d5dded] bg-white object-contain p-1" />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#d5dded] bg-white text-[10px] font-bold text-slate-400">N/A</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link to={`/products/${item.id}`} className="block line-clamp-2 text-sm font-extrabold leading-snug text-slate-800 hover:text-[#1A2A54]">
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm font-black text-[#FF6B00]">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-lg border border-[#d5dded] bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-lg font-extrabold text-slate-950">Budget Completion</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    You still have <span className="font-black text-[#1A2A54]">{formatPrice(budgetCompletionSuggestions.remaining)}</span> remaining in the balanced tier.
                  </p>
                  <div className="mt-4 space-y-2">
                    {budgetCompletionSuggestions.items.map((item) => (
                      <div key={`budget-${item.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#d5dded] bg-[#f8fbff] px-3 py-2">
                        <Link to={`/products/${item.id}`} className="min-w-0 truncate text-sm font-bold text-slate-800">{item.name}</Link>
                        <span className="shrink-0 text-xs font-black text-[#FF6B00]">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                    {!budgetCompletionSuggestions.items.length && (
                      <p className="rounded-lg bg-[#f8fbff] px-3 py-2 text-sm text-slate-500">No additional suggestions fit the remaining budget yet.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-[#d5dded] bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-lg font-extrabold text-slate-950">Why Recommended</h2>
                  <div className="mt-3 space-y-2">
                    {explanationLines.map((line, idx) => (
                      <p key={`exp-${idx}`} className="flex items-start gap-2 rounded-lg bg-[#f8fbff] px-3 py-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                        <span>{line}</span>
                      </p>
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <section className="rounded-lg border border-[#d5dded] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold text-slate-950">Reviews</h2>
                <RatingStars value={product.rating} label="Rating" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <p className="rounded-lg bg-[#f8fbff] px-3 py-3 text-sm text-slate-700">"Great value for the price and works well with setup bundles."</p>
                <p className="rounded-lg bg-[#f8fbff] px-3 py-3 text-sm text-slate-700">"Delivery was fast and quality is solid for daily use."</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
