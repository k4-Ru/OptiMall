import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Star, Store, Sparkles, BadgeInfo, MessageSquareQuote, Wallet } from 'lucide-react';
import Header from '../components/Header';
import { getProductReviews, getProducts, getRelatedProducts, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
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

function computeDynamicBundleDiscount({ bundle, budget, totalCost }) {
  const safeBundle = Array.isArray(bundle) ? bundle : [];
  const safeBudget = Math.max(1, Number(budget || 1));
  const safeTotal = Math.max(0, Number(totalCost || 0));
  const spendRatio = Math.min(1.25, safeTotal / safeBudget);
  const itemCount = safeBundle.length;
  const avgRating = safeBundle.length
    ? safeBundle.reduce((sum, item) => sum + Number(item?.rating || 0), 0) / safeBundle.length
    : 0;
  const categories = new Set(
    safeBundle.map((item) => String(item?.category || '').trim().toLowerCase()).filter(Boolean)
  );
  const diversity = safeBundle.length ? Math.min(1, categories.size / Math.min(5, safeBundle.length)) : 0;

  const budgetFitScore = Math.max(0, Math.min(100, Math.round(55 + (Math.min(1, spendRatio) * 40) - Math.max(0, (1 - Math.min(1, spendRatio)) * 20))));
  const qualityScore = Math.max(0, Math.min(100, Math.round((avgRating / 5) * 100)));
  const diversityScore = Math.max(0, Math.min(100, Math.round(diversity * 100)));
  const finalScore = Math.max(0, Math.min(100, Math.round(
    (budgetFitScore * 0.45) +
    (qualityScore * 0.35) +
    (diversityScore * 0.2)
  )));

  const itemCountFactor = itemCount >= 6 ? 0.018 : itemCount >= 4 ? 0.013 : itemCount >= 2 ? 0.008 : 0;
  const spendFitFactor = spendRatio >= 0.95 ? 0.018 : spendRatio >= 0.85 ? 0.014 : spendRatio >= 0.7 ? 0.009 : 0.004;
  const qualityFactor = (qualityScore / 100) * 0.012;
  const diversityFactor = (diversityScore / 100) * 0.008;
  const budgetFitFactor = (budgetFitScore / 100) * 0.01;
  const scoreFactor = (finalScore / 100) * 0.012;
  const dynamicRate = 0.08 + itemCountFactor + spendFitFactor + qualityFactor + diversityFactor + budgetFitFactor + scoreFactor;
  const discountRate = itemCount >= 2 ? Math.max(0.08, Math.min(0.35, dynamicRate)) : 0;
  const discountValue = safeTotal * discountRate;

  return {
    discountRate,
    discountValue: Number(discountValue.toFixed(2)),
    discountedTotal: Number((safeTotal - discountValue).toFixed(2)),
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { addToCart, addBundleToCart } = useCommerce();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [error, setError] = useState('');
  const [bundleSets, setBundleSets] = useState([]);
  const [expandedBundleTiers, setExpandedBundleTiers] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [dbReviews, setDbReviews] = useState([]);

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
  const productRating = Number(product?.rating || 0);
  const sellerRating = Number(product?.seller_rating || 0);
  const productTags = useMemo(() => parseTags(product?.tags), [product?.tags]);
  const productTagVector = useMemo(() => parseTags(product?.tag_vector), [product?.tag_vector]);
  const effectiveTags = useMemo(
    () => (productTagVector.length ? productTagVector : productTags),
    [productTagVector, productTags]
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
  const resolvedPairsWellWith = useMemo(
    () => (relatedProducts.length ? relatedProducts : pairsWellWith),
    [relatedProducts, pairsWellWith]
  );

  const balancedTier = useMemo(
    () => bundleSets.find((tier) => tier.key === 'balanced') || bundleSets[0] || null,
    [bundleSets]
  );

  const budgetCompletionSuggestions = useMemo(() => {
    if (!balancedTier) return { remaining: 0, items: [] };
    const remaining = Math.max(0, Number(balancedTier.remaining || 0));
    const bundleIds = new Set((balancedTier.bundle || []).map((item) => Number(item.id)));
    const items = resolvedPairsWellWith
      .filter((item) => !bundleIds.has(Number(item.id)) && Number(item.price || 0) <= remaining)
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 4);
    return { remaining, items };
  }, [balancedTier, resolvedPairsWellWith]);

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
            const productById = new Map(products.map((item) => [Number(item.id), item]));
            const enrichedBundle = (bundleOpt.bundle || []).map((item) => {
              const fallback = productById.get(Number(item?.id || 0)) || {};
              return {
                ...fallback,
                ...item,
                image_path: item?.image_path || fallback?.image_path || null,
              };
            });
            const originalTotal = Number(bundleOpt.total_cost || 0);
            const discountMeta = computeDynamicBundleDiscount({
              bundle: enrichedBundle,
              budget,
              totalCost: originalTotal,
            });
            return {
              ...tier,
              budget,
              original_total: originalTotal,
              total: discountMeta.discountedTotal,
              remaining: Number((budget - discountMeta.discountedTotal).toFixed(2)),
              discount_rate: discountMeta.discountRate,
              discount_value: discountMeta.discountValue,
              score: Number(bundleOpt.bundle_score || 0),
              bundle: enrichedBundle,
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

  useEffect(() => {
    let active = true;
    async function loadRelatedAndReviews() {
      if (!product?.id) {
        setRelatedProducts([]);
        setDbReviews([]);
        return;
      }
      try {
        const [related, reviews] = await Promise.all([
          getRelatedProducts(product.id),
          getProductReviews(product.id),
        ]);
        if (active) {
          setRelatedProducts(Array.isArray(related) ? related : []);
          setDbReviews(Array.isArray(reviews) ? reviews : []);
        }
      } catch {
        if (active) {
          setRelatedProducts([]);
          setDbReviews([]);
        }
      }
    }
    loadRelatedAndReviews();
    return () => {
      active = false;
    };
  }, [product?.id]);

  return (
    <div className="min-h-screen font-sans pb-12">
      <Header />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {loading && <p className="text-slate-600">Loading product...</p>}
        {!!error && <p className="text-red-600">{error}</p>}
        {!loading && !product && <p className="text-slate-600">Product not found.</p>}

        {!loading && product && (
          <>
            <section className="relative overflow-hidden rounded-2xl bg-[#1A2A54] p-5 text-white sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#3f5b9b]/30 blur-3xl" />
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="opti-press rounded-full border border-white/35 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10"
              >
                Back
              </button>
              <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-[#B8C7EB]">PRODUCT VIEW</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">{product.name}</h1>
              <p className="mt-1 text-sm text-[#D8E3FA]">{product.category || 'Uncategorized'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold">
                  <Star className="h-3.5 w-3.5 text-[#FFD166]" />
                  Product {productRating > 0 ? productRating.toFixed(1) : '-'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold">
                  <Store className="h-3.5 w-3.5 text-[#9EC5FF]" />
                  Seller {sellerRating > 0 ? sellerRating.toFixed(1) : '-'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#93E1B9]" />
                  Verified listing
                </span>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-4 sm:p-6">
              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                <div className="group flex h-64 items-center justify-center rounded-xl bg-[#f8fbff] ring-1 ring-[#e6eef9] transition duration-300 hover:ring-[#c7d8f2]">
                  {product.image_path ? (
                    <img src={product.image_path} alt={product.name} className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="text-xs font-semibold text-slate-400">No Image</div>
                  )}
                </div>
                <div className="flex min-h-[256px] flex-col">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Price</p>
                  <p className="text-4xl font-black text-[var(--brand)]">{formatPrice(product.price)}</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p className="rounded-lg bg-[#f8fbff] px-3 py-2"><span className="font-semibold text-slate-500">Stock:</span> {product.stock ?? '-'}</p>
                    <p className="rounded-lg bg-[#f8fbff] px-3 py-2"><span className="font-semibold text-slate-500">Seller:</span> {sellerName}</p>
                  </div>
                  <div className="mt-3 rounded-xl border border-[#d5dded] bg-[#fafdff] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Seller Profile</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">{sellerName}</p>
                      <p className="inline-flex items-center gap-1 text-sm font-extrabold text-[#1A2A54]">
                        <Star className="h-3.5 w-3.5 text-[#FFB547]" />
                        {sellerRating > 0 ? sellerRating.toFixed(1) : '-'}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Trusted seller performance based on catalog and activity quality.</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="opti-press inline-flex items-center gap-1 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Add Product to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1);
                        navigate('/cart');
                      }}
                      className="opti-press rounded-lg bg-[#1A2A54] px-4 py-2 text-sm font-bold text-white hover:bg-[#142042]"
                    >
                      Buy now
                    </button>
                    <Link
                      to="/cart"
                      className="opti-press rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#f8fbff]"
                    >
                      Go to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">Bundle Scenarios by Budget</h2>
              <p className="mt-1 text-sm text-slate-600">Compare tiers and add items directly from each generated bundle.</p>
              {!isSignedIn && <p className="mt-2 text-sm text-slate-500">Sign in to generate bundle scenarios.</p>}
              {loadingBundles && <p className="mt-2 text-sm text-slate-500">Generating scenarios...</p>}
              {isSignedIn && !loadingBundles && (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {bundleSets.map((tier) => (
                    <article key={tier.key} className="rounded-xl border border-[#d5dded] bg-[#fdfefe] p-4">
                      <p className="text-xs font-semibold text-slate-500">{tier.label}</p>
                      <p className="mt-1 text-lg font-extrabold text-[var(--primary)]">{formatPrice(tier.budget)}</p>
                      <p className="text-xs text-slate-500">Bundle: {formatPrice(tier.total)} • Remaining: {formatPrice(tier.remaining)}</p>
                      {!!Number(tier.discount_value || 0) && (
                        <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                          Discount ({Math.round(Number(tier.discount_rate || 0) * 100)}%): -{formatPrice(tier.discount_value)}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        {(expandedBundleTiers[tier.key] ? tier.bundle : tier.bundle.slice(0, 4)).map((item) => (
                          <div key={`${tier.key}-${item.id}`} className="flex items-center justify-between gap-2 rounded border border-[#d5dded] bg-white px-2 py-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              {item.image_path ? (
                                <img
                                  src={item.image_path}
                                  alt={item.name}
                                  className="h-8 w-8 shrink-0 rounded border border-[#d5dded] bg-white object-contain p-0.5"
                                />
                              ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#d5dded] bg-[#f8fbff] text-[9px] font-bold text-slate-400">
                                  N/A
                                </div>
                              )}
                              <span className="truncate text-xs font-semibold text-slate-700">{item.name}</span>
                            </div>
                            <button type="button" onClick={() => addToCart(item, 1)} className="rounded bg-[#1A2A54] px-2 py-1 text-[10px] font-bold text-white">
                              Add
                            </button>
                          </div>
                        ))}
                        {!tier.bundle.length && <p className="text-xs text-slate-400">No items for this tier.</p>}
                        {tier.bundle.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setExpandedBundleTiers((prev) => ({ ...prev, [tier.key]: !prev[tier.key] }))}
                            className="text-left text-[11px] font-bold text-[#1A2A54] hover:text-[#2a3f78]"
                          >
                            {expandedBundleTiers[tier.key] ? 'Show less' : `Show ${tier.bundle.length - 4} more`}
                          </button>
                        )}
                      </div>
                      {!!tier.bundle.length && (
                        <button
                          type="button"
                          onClick={() => addBundleToCart(tier.bundle, { name: `${product.name} - ${tier.label}`, total: tier.total, scenarioKey: tier.key })}
                          className="mt-3 w-full rounded bg-[#FF6B00] px-2 py-1.5 text-[11px] font-bold text-white"
                        >
                          Add Tier Bundle
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">Pairs Well With</h2>
              <p className="mt-1 text-sm text-slate-600">Complementary picks based on category, tags, and bundle compatibility.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedPairsWellWith.map((item) => (
                  <article key={`pair-${item.id}`} className="rounded-xl border border-[#d5dded] bg-[#fcfdff] p-3">
                    <div className="flex items-center gap-3">
                      {item.image_path ? (
                        <img src={item.image_path} alt={item.name} className="h-14 w-14 rounded border border-[#d5dded] bg-white object-contain p-1" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded border border-[#d5dded] bg-white text-[10px] font-bold text-slate-400">N/A</div>
                      )}
                      <div className="min-w-0">
                        <Link to={`/products/${item.id}`} className="block line-clamp-2 text-sm font-bold text-slate-800">{item.name}</Link>
                        <p className="text-xs font-semibold text-[#FF6B00]">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {budgetCompletionSuggestions.items.length > 0 && (
              <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-6">
                <h2 className="text-lg font-extrabold text-slate-900">Budget Completion Suggestions</h2>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d5dded] bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-slate-700">
                  <Wallet className="h-3.5 w-3.5 text-[#1A2A54]" />
                  Remaining balanced-tier budget: <span className="font-extrabold text-[#1A2A54]">{formatPrice(budgetCompletionSuggestions.remaining)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {budgetCompletionSuggestions.items.map((item) => (
                    <div key={`budget-${item.id}`} className="flex items-center justify-between rounded-lg border border-[#d5dded] bg-[#f8fbff] px-3 py-2">
                      <Link to={`/products/${item.id}`} className="text-sm font-semibold text-slate-800">{item.name}</Link>
                      <span className="text-xs font-bold text-[#FF6B00]">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">Why This Was Recommended</h2>
              <p className="mt-1 text-sm text-slate-600">Transparent reasoning from category, tags, and bundle compatibility signals.</p>
              <div className="mt-3 grid gap-2">
                {explanationLines.map((line, idx) => (
                  <div key={`exp-${idx}`} className="flex items-start gap-2 rounded-lg border border-[#e1e9f6] bg-[#f8fbff] px-3 py-2 text-sm text-slate-700">
                    <BadgeInfo className="mt-0.5 h-4 w-4 shrink-0 text-[#1A2A54]" />
                    <p>{line}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#d5dded] bg-white p-6">
              <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <MessageSquareQuote className="h-5 w-5 text-[#1A2A54]" />
                Reviews
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Product rating: <span className="font-bold text-slate-900">{Number(product.rating || 0).toFixed(1)} / 5</span>
                <span className="ml-2 text-xs text-slate-500">({dbReviews.length} verified review{dbReviews.length === 1 ? '' : 's'} loaded)</span>
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {dbReviews.length > 0 ? dbReviews.slice(0, 6).map((review) => (
                  <p key={`rv-${review.id}`} className="rounded-lg bg-[#f8fbff] px-3 py-2">
                    “{review.review_text || 'User rated this product highly.'}”
                    <span className="ml-2 text-xs font-semibold text-slate-500">— {review.reviewer_name || 'OptiMall User'}</span>
                  </p>
                )) : (
                  <p className="rounded-lg border border-dashed border-[#d5dded] bg-[#fcfdff] px-3 py-2 text-slate-500">
                    No verified buyer reviews yet for this item.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
