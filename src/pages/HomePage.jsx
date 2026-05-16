import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

/* ───────────────────── Mock Data ───────────────────── */
const hotBundles = [
  {
    id: 1,
    name: 'WiFi Setup Bundle',
    items: 'Router + Extender + Charger',
    price: 4299,
    originalPrice: 5000,
    discount: 20,
    aiPick: true,
    images: ['/images/earbuds_1778761100549.png', '/images/laptop_stand_1778761221119.png', '/images/smart_bulb_1778761335652.png'],
  },
  {
    id: 2,
    name: 'Morning Ritual',
    items: 'Coffee + Snacks + Bottle',
    price: 899,
    originalPrice: 1200,
    discount: 25,
    aiPick: false,
    images: ['/images/vacuum_flask_1778762004829.png', '/images/smart_bulb_1778761335652.png', '/images/earbuds_1778761100549.png'],
  },
  {
    id: 3,
    name: 'Work From Home',
    items: 'Keyboard + Mouse + Mousepad',
    price: 1999,
    originalPrice: 2800,
    discount: 29,
    aiPick: true,
    images: ['/images/laptop_stand_1778761221119.png', '/images/alarm_clock_1778761477434.png', '/images/earbuds_1778761100549.png'],
  },
  {
    id: 4,
    name: 'Fitness Essentials',
    items: 'Bottle + Towel + Band',
    price: 749,
    originalPrice: 1000,
    discount: 25,
    aiPick: false,
    images: ['/images/vacuum_flask_1778762004829.png', '/images/smart_bulb_1778761335652.png', '/images/bluetooth_speaker_1778761745117.png'],
  },
];

const categories = ['All', 'Tech', 'Home', 'Lifestyle', 'Accessories'];

const products = [
  { id: 1, name: 'Wireless Earbuds Pro Max', price: 1299, rating: 4.8, reviews: 245, category: 'Tech', image: '/images/earbuds_1778761100549.png' },
  { id: 2, name: 'Laptop Stand Foldable', price: 599, rating: 4.5, reviews: 128, category: 'Tech', image: '/images/laptop_stand_1778761221119.png' },
  { id: 3, name: 'Smart LED Bulb', price: 299, rating: 4.7, reviews: 312, category: 'Home', image: '/images/smart_bulb_1778761335652.png' },
  { id: 4, name: 'Digital Alarm Clock', price: 499, rating: 4.3, reviews: 84, category: 'Home', image: '/images/alarm_clock_1778761477434.png' },
  { id: 5, name: 'Bluetooth Speaker', price: 1099, rating: 4.6, reviews: 210, category: 'Tech', image: '/images/bluetooth_speaker_1778761745117.png' },
];

function formatPrice(price) {
  return `₱${price.toLocaleString()}`;
}

function StarRating({ rating, reviews }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < full ? 'text-[#FF6B00]' : i === full && hasHalf ? 'text-[#FF8C33]' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-medium text-gray-400">({reviews})</span>
    </div>
  );
}


/* ─────────── Smart Bundles Banner ─────────── */
function SmartBundlesBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-8 pt-8">
      <div className="relative flex items-center justify-between overflow-hidden rounded-xl bg-[#2A3A6A] px-8 py-5 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="text-3xl">✨</div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Bundles for You</h2>
            <p className="mt-0.5 text-sm text-[#B4C5E3]">AI-picked deals based on your activity</p>
          </div>
        </div>
        <Link to="/smart-bundles" className="rounded-lg bg-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#E65C00]">
          View All
        </Link>
      </div>
    </section>
  );
}

/* ────────────── Bundle Card ────────────── */
function BundleCard({ bundle }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-shadow hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)]">
      {/* Images container */}
      <div className="relative mb-5 flex justify-between gap-3">
         {bundle.aiPick && (
            <span className="absolute -right-2 -top-2 z-10 rounded bg-[#FF6B00] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              AI Pick
            </span>
          )}
        {bundle.images.map((img, idx) => (
          <div key={idx} className="flex h-[72px] w-1/3 items-center justify-center rounded-xl bg-[#FFFDF9] p-2 border border-[#FFE8D6]">
             <img src={img} alt="Bundle item" className="max-h-full max-w-full object-contain mix-blend-multiply" />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <h3 className="text-sm font-bold text-gray-900">{bundle.name}</h3>
        <p className="mt-1 text-xs text-gray-500">{bundle.items}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#FF6B00]">{formatPrice(bundle.price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</span>
        </div>
        <span className="mt-1 text-[11px] font-bold text-[#00B074]">
          Save {bundle.discount}%
        </span>

        <button className="mt-5 w-full rounded-lg bg-[#1A2A54] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#101B3A]">
          Add Bundle to Cart
        </button>
      </div>
    </div>
  );
}

/* ──────────── Hot Bundles Section ──────────── */
function HotBundlesSection() {
  return (
    <section id="bundles" className="mx-auto max-w-[1440px] px-8 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src="/images/fire.png" alt="Hot" className="h-6 w-6 object-contain" />
          <h2 className="text-xl font-extrabold text-gray-900">Hot Bundles</h2>
        </div>
        <button className="group flex items-center gap-1 text-sm font-semibold text-[#FF6B00] hover:text-[#E65C00]">
          See all
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Grid for desktop */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hotBundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  );
}

/* ──────────── Product Card ──────────── */
function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]">
      <div className="relative mb-5 flex h-[160px] items-center justify-center">
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="flex flex-col">
        <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 min-h-[38px]">{product.name}</h3>
        <div className="mt-2">
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-3">
          <span className="text-lg font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────── You Might Like Section ─────── */
function YouMightLikeSection() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="mx-auto max-w-[1440px] px-8 pb-16 pt-10">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#FFE8D6] bg-[#FFF5ED] px-3 py-1.5 text-xs font-semibold text-[#FF6B00]">
        <img src="/images/pin.png" alt="Pin" className="h-4 w-4 object-contain" />
        <span>Picked for you based on recent views</span>
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-extrabold text-gray-900">You Might Like</h2>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-bold transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1A2A54] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
           <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ Main Page ═══════════════ */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <SmartBundlesBanner />
      <HotBundlesSection />
      <YouMightLikeSection />
    </div>
  );
}
