import { Link } from 'react-router-dom';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function NormalMode({
  isSignedIn,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
  sortBy,
  setSortBy,
  loadingRecommendations,
  recommendationError,
  recommendedProducts,
  addToCart,
  filteredProducts,
  loadingProducts,
}) {
  return (
    <section className="opti-slide-up space-y-5 text-center bg-white">

      <p className="text-sm text-slate-600">Browse like a classic marketplace. Tap products to see seller info and budget bundle scenarios.</p>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products, categories, bundles"
        className="w-full rounded-xl border border-[#d5dded] bg-white px-4 py-3"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
              categoryFilter === cat ? 'bg-[#1A2A54] text-white' : 'bg-white text-slate-700 border border-[#d5dded]'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="shrink-0 rounded-full border border-[#d5dded] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-700"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

{(!searchQuery.trim() && categoryFilter === 'all') && (
  <>
    <h2 className="text-lg font-extrabold text-slate-900">Recommended for you</h2>
    <p className="text-sm text-slate-600">
      {isSignedIn ? 'Based on your recent shopping activity.' : 'Sign in for activity-based recommendations.'}
    </p>
    {loadingRecommendations && <p className="text-xs text-slate-500">Refreshing recommendations...</p>}
    {!!recommendationError && <p className="text-xs text-red-600">{recommendationError}</p>}
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {loadingProducts && Array.from({ length: 6 }).map((_, idx) => (
        <div key={`rec-skeleton-${idx}`} className="w-[180px] shrink-0 animate-pulse rounded-xl border border-[#d5dded] bg-white p-3">
          <div className="h-28 w-full rounded-lg bg-slate-200/70" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-200/70" />
          <div className="mt-3 h-7 w-full rounded bg-slate-200/70" />
        </div>
      ))}
      {recommendedProducts.map((product) => (
        <article key={`rec-${product.id}`} className="flex w-[160px] shrink-0 flex-col rounded-xl border border-[#d5dded] bg-white p-3 sm:w-[180px]">
          {product.image_path ? (
            <img src={product.image_path} alt={product.name} className="h-28 w-full rounded-lg object-contain bg-[#f8fbff]" />
          ) : (
            <div className="flex h-28 items-center justify-center rounded-lg bg-[#f8fbff] text-xs text-slate-400">No image</div>
          )}
          <Link to={`/products/${product.id}`} className="mt-2 block line-clamp-2 text-sm font-bold text-slate-900">{product.name}</Link>
          <p className="mt-1 text-xs text-slate-500">{product.category || 'General'}</p>
          <p className="mt-1 text-sm font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="mt-auto w-full rounded bg-[#1A2A54] px-2 py-1.5 text-xs font-bold text-white"
          >
            Add to cart
          </button>
        </article>
      ))}
    </div>
  </>
)}

      <h2 className="text-lg font-extrabold text-slate-900">Browse listings</h2>
      {filteredProducts.length === 0 && !loadingProducts && <p className="text-sm text-slate-500">No listings found.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {loadingProducts && Array.from({ length: 12 }).map((_, idx) => (
          <div key={`listing-skeleton-${idx}`} className="animate-pulse rounded-xl border border-[#d5dded] bg-white p-2.5">
            <div className="h-24 w-full rounded bg-slate-200/70" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/70" />
          </div>
        ))}
        {filteredProducts.slice(0, 30).map((product) => (
          <article key={`listing-${product.id}`} className="flex min-h-[184px] flex-col rounded-xl border border-[#d5dded] bg-white p-2.5">
            {product.image_path ? (
              <img src={product.image_path} alt={product.name} className="h-24 w-full rounded object-contain bg-[#f8fbff]" />
            ) : (
              <div className="flex h-24 items-center justify-center rounded bg-[#f8fbff] text-xs text-slate-400">No image</div>
            )}
            <Link to={`/products/${product.id}`} className="mt-2 block line-clamp-2 text-xs font-bold text-slate-900">{product.name}</Link>
            <p className="mt-auto text-[11px] font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
