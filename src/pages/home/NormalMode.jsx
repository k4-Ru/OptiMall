import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

function productImage(product) {
  const rawInput = String(product?.image_path || product?.image || '').trim();
  if (!rawInput) {
    return product?.id ? `/images/${product.id}.png` : '';
  }

  const normalized = rawInput
    .replaceAll('\\', '/')
    .replace(/^\.\/+/, '')
    .replace(/^public\//i, '')
    .trim();

  if (!normalized) return product?.id ? `/images/${product.id}.png` : '';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
  if (normalized.startsWith('/')) return normalized;
  return `/${normalized}`;
}

function ImageWithFallback({ product, alt, className, placeholderClassName }) {
  const id = Number(product?.id || 0);
  const primary = productImage(product);
  const fallbacks = [
    primary,
    id ? `/images/${id}.png` : '',
    id ? `/product-images/${id}.png` : '',
  ].filter(Boolean);

  if (!fallbacks.length) {
    return <div className={placeholderClassName}>No image</div>;
  }

  return (
    <>
      <img
        src={fallbacks[0]}
        alt={alt}
        className={className}
        onError={(event) => {
          const current = event.currentTarget;
          const nextIndex = Number(current.dataset.fallbackIndex || 0) + 1;
          if (nextIndex < fallbacks.length) {
            current.dataset.fallbackIndex = String(nextIndex);
            current.src = fallbacks[nextIndex];
            return;
          }
          current.classList.add('hidden');
          const placeholder = current.nextElementSibling;
          if (placeholder) placeholder.classList.remove('hidden');
        }}
      />
      <div className={`${placeholderClassName} hidden`}>No image</div>
    </>
  );
}

export default function NormalMode({
  isSignedIn,
  searchQuery,
  setSearchQuery,
  onSubmitSearch,
  activeSearchTerm,
  searchResults,
  searchLoading,
  categoryFilter,
  setCategoryFilter,
  categories,
  sortBy,
  setSortBy,
  hasActivityRecommendations,
  loadingRecommendations,
  recommendationError,
  recommendationMeta,
  debugReco,
  recommendedProducts,
  popularBundles,
  addBundleToCart,
  filteredProducts,
  loadingProducts,
}) {
  const filtersRef = useRef(null);
  const [previewBundle, setPreviewBundle] = useState(null);

  useEffect(() => {
    if (!previewBundle) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewBundle(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewBundle]);

  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return undefined;

    let rafId = 0;
    let direction = 1;
    let userPaused = false;
    let inView = false;
    let lastTs = 0;
    const SPEED = 32; // px/sec
    const EDGE_HOLD_MS = 650;
    let edgeHoldUntil = 0;

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (inView && !userPaused && el.scrollWidth > el.clientWidth) {
        if (ts >= edgeHoldUntil) {
          el.scrollLeft += direction * SPEED * dt;
          const max = el.scrollWidth - el.clientWidth;
          if (el.scrollLeft <= 0) {
            el.scrollLeft = 0;
            direction = 1;
            edgeHoldUntil = ts + EDGE_HOLD_MS;
          } else if (el.scrollLeft >= max) {
            el.scrollLeft = max;
            direction = -1;
            edgeHoldUntil = ts + EDGE_HOLD_MS;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    const pause = () => {
      userPaused = true;
    };
    const resume = () => {
      userPaused = false;
    };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });
    el.addEventListener('wheel', pause, { passive: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
      el.removeEventListener('wheel', pause);
    };
  }, []);

  return (
    <section className="opti-slide-up space-y-5 rounded-2xl border border-[color:rgba(26,42,84,0.16)] bg-[var(--bg-soft)] p-6 text-center">



      <div className="relative opti-enter-soft">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmitSearch?.(searchQuery);
            }
          }}
          placeholder="Search products, categories, bundles"
          className="opti-focus-ring w-full rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white py-3 pl-10 pr-4 text-[var(--ink)] transition-all duration-200 ease-out focus:border-[var(--primary)]"
        />
      </div>

      <div ref={filtersRef} className="opti-enter-soft opti-stagger-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`opti-press shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
              categoryFilter === cat ? 'bg-[var(--primary)] text-white' : 'border border-[color:rgba(26,42,84,0.16)] bg-white text-[var(--ink-soft)]'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="opti-press shrink-0 rounded-full border border-[color:rgba(26,42,84,0.16)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-soft)]"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

{(!activeSearchTerm && categoryFilter === 'all' && hasActivityRecommendations) && (
  <div className="min-h-[320px]">
    <h2 className="min-h-[28px] text-lg font-extrabold leading-tight text-[var(--ink)]">Recommended for you</h2>
    <p className="-mt-1 min-h-[20px] text-sm text-[var(--ink-soft)]">
      {isSignedIn ? 'Based on your recent shopping activity.' : 'Sign in for activity-based recommendations.'}
    </p>
    {loadingRecommendations && <p className="text-xs text-[var(--ink-soft)]">Refreshing recommendations...</p>}
    {!!recommendationError && <p className="text-xs text-red-600">{recommendationError}</p>}
    {!!recommendationMeta?.active_model?.model_version && (
      <p className="text-[11px] font-semibold text-[var(--ink-soft)]">
        Model-powered: {recommendationMeta.active_model.model_version}
        {recommendationMeta?.model_applied ? ' (applied)' : ' (metadata only)'}
      </p>
    )}
    <div className="opti-enter-soft opti-stagger-2 flex min-h-[260px] gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {loadingProducts && Array.from({ length: 6 }).map((_, idx) => (
        <div key={`rec-skeleton-${idx}`} className="opti-shimmer w-[180px] min-h-[252px] shrink-0 animate-pulse rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-3">
          <div className="h-28 w-full rounded-lg bg-slate-200/70" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-200/70" />
          <div className="mt-3 h-7 w-full rounded bg-slate-200/70" />
        </div>
      ))}
      {recommendedProducts.map((product) => (
        <Link
          key={`rec-${product.id}`}
          to={`/products/${product.id}`}
          className="opti-enter-soft opti-press group flex min-h-[252px] w-[160px] shrink-0 flex-col rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[color:rgba(26,42,84,0.32)] hover:shadow-sm active:translate-y-0 active:scale-[0.995] sm:w-[180px]"
        >
          <ImageWithFallback
            product={product}
            alt={product.name}
            className="h-24 w-full rounded bg-[var(--bg-soft)] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            placeholderClassName="flex h-24 items-center justify-center rounded bg-[var(--bg-soft)] text-xs text-[var(--ink-soft)]"
          />
          <p
            className="mt-2 min-h-[2.5rem] text-left text-xs font-bold leading-5 text-[var(--ink)] group-hover:text-[var(--primary)]"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {product.name}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">{product.category || 'General'}</p>
          {!!product?._reason_chips?.length && (
            <div className="mt-1 flex flex-wrap gap-1">
              {product._reason_chips.map((reason) => (
                <span key={`${product.id}-${reason}`} className="rounded-full bg-[color:rgba(26,42,84,0.09)] px-2 py-0.5 text-center text-[10px] font-semibold text-[var(--primary)]">
                  {reason}
                </span>
              ))}
            </div>
          )}
          {debugReco && (
            <p className="mt-1 text-[10px] text-[var(--ink-soft)]">
              h={Number(product._debug_score || 0).toFixed(3)} m={Number(product._debug_model_score || 0).toFixed(3)} b={Number(product._debug_blended_score || 0).toFixed(3)}
            </p>
          )}
          <p className="mt-auto text-left text-sm font-extrabold text-[var(--brand)]">{formatPrice(product.price)}</p>
        </Link>
      ))}
    </div>
    {debugReco && (
      <div className="rounded-lg border border-dashed border-[color:rgba(26,42,84,0.2)] bg-[var(--bg-soft)] px-3 py-2 text-left text-[11px] text-[var(--ink-soft)]">
        <p>Debug: variant={recommendationMeta?.experiment?.variant || '-'} strategy={recommendationMeta?.strategy || '-'} model={recommendationMeta?.active_model?.model_version || '-'}</p>
      </div>
    )}
  </div>
)}

{(!activeSearchTerm && categoryFilter === 'all' && Array.isArray(popularBundles) && popularBundles.length > 0) && (
  <div className="min-h-[292px]">
    <h2 className="min-h-[28px] text-lg font-extrabold leading-tight text-[var(--ink)]">Popular bundles</h2>
    <p className="-mt-1 min-h-[20px] text-sm text-[var(--ink-soft)]">Frequently saved bundles from shopper checkouts.</p>
    <div className="opti-enter-soft opti-stagger-2 grid min-h-[236px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {popularBundles.map((bundle) => (
        <article key={`popular-bundle-${bundle.id}`} className="opti-press group flex flex-col rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgba(26,42,84,0.32)] hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-bold text-[var(--ink)] group-hover:text-[var(--primary)]">{bundle.name}</p>
            <span className="shrink-0 rounded-full bg-[color:rgba(26,42,84,0.09)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
              {Number(bundle.times_saved || 0)} saves
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[color:rgba(255,107,0,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-strong)]">
              {formatPrice(bundle.estimated_total_price)}
            </span>
            <span className="rounded-full bg-[color:rgba(26,42,84,0.09)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
              {Number(bundle.item_count || 0)} items
            </span>
          </div>
          <div className="mt-2 grid gap-1.5">
            {(bundle.items || []).slice(0, 3).map((item) => (
              <div key={`${bundle.id}-${item.id}`} className="flex items-center gap-2 rounded-lg bg-[var(--bg-soft)] px-2 py-1.5">
                <div className="h-8 w-8 overflow-hidden rounded-md border border-white bg-white">
                  <ImageWithFallback
                    product={item}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    placeholderClassName="flex h-full w-full items-center justify-center text-[9px] text-[var(--ink-soft)]"
                  />
                </div>
                <p className="line-clamp-1 text-xs font-semibold text-[var(--ink)]">{item.name}</p>
              </div>
            ))}
            {Number(bundle.item_count || 0) > 3 && (
              <p className="px-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                +{Number(bundle.item_count || 0) - 3} more items
              </p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPreviewBundle(bundle)}
              className="opti-press rounded border border-[color:rgba(26,42,84,0.2)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--primary)] hover:border-[color:rgba(26,42,84,0.38)]"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => addBundleToCart(bundle.items || [], { name: bundle.name, total: bundle.estimated_total_price, scenarioKey: `popular_${bundle.id}` })}
              className="opti-press rounded bg-[var(--primary)] px-2 py-1.5 text-xs font-bold text-white hover:bg-[#233a74]"
            >
              Add bundle
            </button>
          </div>
        </article>
      ))}
    </div>
  </div>
)}

{(!!activeSearchTerm || searchLoading) && (
  <div className="min-h-[292px]">
    <h2 className="min-h-[28px] text-lg font-extrabold leading-tight text-[var(--ink)]">Search results</h2>
    <p className="-mt-1 min-h-[20px] text-sm text-[var(--ink-soft)]">Matches for "{activeSearchTerm || searchQuery.trim()}".</p>
    {searchLoading && (
      <>
        <p className="text-xs text-[var(--ink-soft)]">Searching products...</p>
        <div className="opti-enter-soft grid min-h-[236px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={`search-skeleton-${idx}`} className="opti-shimmer min-h-[184px] animate-pulse rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-2.5">
              <div className="h-24 w-full rounded bg-slate-200/70" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/70" />
            </div>
          ))}
        </div>
      </>
    )}
    {!searchLoading && Array.isArray(searchResults) && searchResults.length === 0 && (
      <p className="text-sm text-[var(--ink-soft)]">No matches found.</p>
    )}
    {!searchLoading && Array.isArray(searchResults) && searchResults.length > 0 && (
      <div className="opti-enter-soft grid min-h-[236px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {searchResults.slice(0, 30).map((product) => (
          <Link
            key={`search-${product.id}`}
            to={`/products/${product.id}`}
            className="opti-press group flex min-h-[184px] flex-col rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgba(26,42,84,0.32)] hover:shadow-sm active:translate-y-0"
          >
            <ImageWithFallback
              product={product}
              alt={product.name}
              className="h-24 w-full rounded bg-[var(--bg-soft)] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              placeholderClassName="flex h-24 items-center justify-center rounded bg-[var(--bg-soft)] text-xs text-[var(--ink-soft)]"
            />
            <p
              className="mt-2 min-h-[2.5rem] text-left text-xs font-bold leading-5 text-[var(--ink)] group-hover:text-[var(--primary)]"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.name}
            </p>
            <p className="mt-auto text-left text-sm font-extrabold text-[var(--brand)]">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    )}
  </div>
)}

      <h2 className="min-h-[28px] text-lg font-extrabold leading-tight text-[var(--ink)]">Browse listings</h2>
      {filteredProducts.length === 0 && !loadingProducts && <p className="text-sm text-[var(--ink-soft)]">No listings found.</p>}
      <div className="opti-enter-soft opti-stagger-3 grid min-h-[236px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {loadingProducts && Array.from({ length: 12 }).map((_, idx) => (
          <div key={`listing-skeleton-${idx}`} className="opti-shimmer min-h-[184px] animate-pulse rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-2.5">
            <div className="h-24 w-full rounded bg-slate-200/70" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/70" />
          </div>
        ))}
        {filteredProducts.slice(0, 30).map((product) => (
          <Link
            key={`listing-${product.id}`}
            to={`/products/${product.id}`}
            className="opti-press group flex min-h-[184px] flex-col rounded-xl border border-[color:rgba(26,42,84,0.16)] bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgba(26,42,84,0.32)] hover:shadow-sm active:translate-y-0"
          >
            <ImageWithFallback
              product={product}
              alt={product.name}
              className="h-24 w-full rounded bg-[var(--bg-soft)] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              placeholderClassName="flex h-24 items-center justify-center rounded bg-[var(--bg-soft)] text-xs text-[var(--ink-soft)]"
            />
            <p
              className="mt-2 min-h-[2.5rem] text-left text-xs font-bold leading-5 text-[var(--ink)] group-hover:text-[var(--primary)]"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.name}
            </p>
            <p className="mt-auto text-left text-sm font-extrabold text-[var(--brand)]">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>

      {previewBundle && (
        <div
          className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#0f172a]/45 p-4"
          onClick={() => setPreviewBundle(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[color:rgba(26,42,84,0.2)] bg-white p-4 shadow-[0_24px_70px_rgba(26,42,84,0.25)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--ink)]">{previewBundle.name}</h3>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {formatPrice(previewBundle.estimated_total_price)} · {Number(previewBundle.item_count || 0)} items · {Number(previewBundle.times_saved || 0)} saves
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBundle(null)}
                className="opti-press rounded-lg border border-[color:rgba(26,42,84,0.2)] px-2.5 py-1 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 max-h-[52vh] space-y-2 overflow-auto pr-1">
              {(previewBundle.items || []).map((item) => (
                <div key={`preview-${previewBundle.id}-${item.id}`} className="flex items-center gap-3 rounded-xl border border-[color:rgba(26,42,84,0.12)] bg-[var(--bg-soft)] px-3 py-2">
                  <div className="h-11 w-11 overflow-hidden rounded-lg border border-white bg-white">
                    <ImageWithFallback
                      product={item}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      placeholderClassName="flex h-full w-full items-center justify-center text-[10px] text-[var(--ink-soft)]"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">{item.name}</p>
                    <p className="text-xs text-[var(--ink-soft)]">{item.category || 'General'}</p>
                  </div>
                  <p className="text-sm font-extrabold text-[var(--brand)]">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewBundle(null)}
                className="opti-press rounded-lg border border-[color:rgba(26,42,84,0.2)] px-3 py-2 text-xs font-bold text-[var(--primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addBundleToCart(previewBundle.items || [], {
                    name: previewBundle.name,
                    total: previewBundle.estimated_total_price,
                    scenarioKey: `popular_${previewBundle.id}`,
                  });
                  setPreviewBundle(null);
                }}
                className="opti-press rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white hover:bg-[#233a74]"
              >
                Add bundle to cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
