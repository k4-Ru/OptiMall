import { useState } from 'react';
import Header from '../components/Header';

/* ───────────────────── Mock Data ───────────────────── */
const newProducts = [
  { id: 1, name: 'Wireless Headphones Noise Cancelling', brand: 'boAt', rating: 4.5, reviews: 128, price: 1599, image: '/images/earbuds_1778761100549.png' },
  { id: 2, name: 'Smart Watch Series 5', brand: 'Fire-Boltt', rating: 4.8, reviews: 98, price: 2999, image: '/images/alarm_clock_1778761477434.png' },
  { id: 3, name: 'UltraBook X1 Laptop', brand: 'Zebronics', rating: 4.2, reviews: 56, price: 34990, image: '/images/laptop_stand_1778761221119.png' },
  { id: 4, name: 'JBL Flip 6 Bluetooth Speaker', brand: 'JBL', rating: 4.6, reviews: 210, price: 6999, image: '/images/bluetooth_speaker_1778761745117.png' },
  { id: 5, name: 'Smart LED Bulb Wi-Fi', brand: 'Wipro', rating: 4.7, reviews: 312, price: 699, image: '/images/smart_bulb_1778761335652.png' },
  { id: 6, name: '10000mAh Power Bank', brand: 'Mi', rating: 4.5, reviews: 156, price: 799, image: '/images/vacuum_flask_1778762004829.png' },
  { id: 7, name: 'Stainless Steel Flask 750ml', brand: 'Milton', rating: 4.3, reviews: 64, price: 549, image: '/images/vacuum_flask_1778762004829.png' },
  { id: 8, name: 'Coffee Maker Machine', brand: 'Philips', rating: 4.4, reviews: 87, price: 2499, image: '/images/vacuum_flask_1778762004829.png' },
  { id: 9, name: 'TWS Earbuds Pro', brand: 'Realme', rating: 4.8, reviews: 245, price: 1299, image: '/images/earbuds_1778761100549.png' },
  { id: 10, name: 'Yoga Mat with Strap', brand: 'Boldfit', rating: 4.6, reviews: 64, price: 649, image: '/images/laptop_stand_1778761221119.png' },
  { id: 11, name: 'Beard Trimmer Pro', brand: 'Philips', rating: 4.5, reviews: 128, price: 1199, image: '/images/earbuds_1778761100549.png' },
  { id: 12, name: 'Digital Air Fryer 4.2L', brand: 'Havells', rating: 4.7, reviews: 73, price: 4999, image: '/images/alarm_clock_1778761477434.png' }
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
            className={`h-3 w-3 ${i < full ? 'text-[#FF6B00]' : i === full && hasHalf ? 'text-[#FF8C33]' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-gray-400">({reviews})</span>
    </div>
  );
}

export default function NewArrivalsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen font-sans pb-16">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-[1440px] px-8 pt-8 flex gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-[240px] flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Filters</h2>
            <button className="text-xs font-bold text-[#2052C2] hover:underline">Clear All</button>
          </div>

          {/* Category */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Category</h3>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1A2A54]">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm font-semibold text-[#1A2A54]">All Categories</span>
              </label>
              {['Electronics', 'Home & Kitchen', 'Fashion', 'Beauty', 'Fitness', 'Accessories', 'Toys & Games'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <div className="h-4 w-4 rounded border border-gray-300 bg-white"></div>
                  <span className="text-sm text-gray-600 hover:text-gray-900">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Price Range</h3>
            <div className="relative mb-6">
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded bg-gray-200"></div>
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded bg-[#1A2A54]"></div>
              <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-[#1A2A54] shadow"></div>
              <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-[#1A2A54] shadow"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                <input type="text" value="0" readOnly className="w-full rounded-md border border-gray-300 py-1.5 pl-6 pr-3 text-sm text-gray-800 focus:outline-none" />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                <input type="text" value="10,000" readOnly className="w-full rounded-md border border-gray-300 py-1.5 pl-6 pr-3 text-sm text-gray-800 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Brand</h3>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </div>
            <input type="text" placeholder="Search brands..." className="w-full mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-[#1A2A54]" />
            <div className="space-y-2.5">
              {['boAt', 'JBL', 'Apple', 'Samsung', 'Philips'].map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer">
                  <div className="h-4 w-4 rounded border border-gray-300 bg-white"></div>
                  <span className="text-sm text-gray-600 hover:text-gray-900">{brand}</span>
                </label>
              ))}
            </div>
            <button className="text-xs font-semibold text-[#2052C2] mt-3 flex items-center gap-1 hover:underline">
              Show More
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          {/* Customer Rating */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Customer Rating</h3>
            <div className="space-y-3">
              {[4, 3, 2, 1].map(stars => (
                <label key={stars} className="flex items-center gap-3 cursor-pointer">
                  <div className="h-4 w-4 flex-shrink-0 rounded border border-gray-300 bg-white"></div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`h-3.5 w-3.5 ${i < stars ? 'text-[#FF6B00]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">& above</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {/* Header */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-[28px] font-bold text-gray-900">New Arrivals</h1>
            <p className="text-sm text-gray-500 mt-1">Explore the latest products added just for you!</p>
          </div>

          {/* Controls Bar */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Showing 1-24 of 156 products</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Sort by:</span>
                <div className="relative">
                  <select className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#1A2A54] focus:outline-none">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-gray-200">
                <button className="rounded border border-[#2052C2] bg-[#F0F4FC] p-1.5 text-[#2052C2]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button className="rounded p-1.5 text-gray-400 hover:bg-gray-50">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {newProducts.map(product => (
              <div key={product.id} className="group flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                
                {/* Top actions */}
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded bg-[#00B074] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">NEW</span>
                  <button className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>

                {/* Image */}
                <div className="relative mb-4 flex h-[120px] items-center justify-center">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col">
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[32px]">{product.name}</h3>
                  <p className="mt-1 text-[10px] text-gray-500">{product.brand}</p>
                  
                  <div className="mt-2">
                    <StarRating rating={product.rating} reviews={product.reviews} />
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-[15px] font-extrabold text-[#FF6B00]">{formatPrice(product.price)}</span>
                  </div>

                  <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#101B3A]">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded bg-[#1A2A54] text-xs font-bold text-white">1</button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">2</button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">3</button>
              <span className="flex h-8 w-4 items-center justify-center text-xs text-gray-400">...</span>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">7</button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Show:</span>
              <div className="relative">
                <select className="appearance-none rounded-md border border-gray-200 bg-white py-1 pl-3 pr-7 text-xs font-semibold text-gray-800 focus:border-[#1A2A54] focus:outline-none">
                  <option>24 per page</option>
                  <option>48 per page</option>
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
