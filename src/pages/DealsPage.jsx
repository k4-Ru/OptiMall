import { useState } from 'react';
import Header from '../components/Header';

/* ───────────────────── Mock Data ───────────────────── */
const deals = [
  { id: 1, name: 'Wireless Earbuds Pro Max', desc: 'High-quality sound with noise cancellation', rating: 4.8, reviews: 245, price: 1299, originalPrice: 2599, discount: '50% OFF', timer: 'Ends in 02h : 45m : 12s', badge: 'Top Deal', image: '/images/earbuds_1778761100549.png' },
  { id: 2, name: 'Bluetooth Speaker', desc: 'Powerful bass & 20H playtime', rating: 4.6, reviews: 210, price: 1099, originalPrice: 2199, discount: '50% OFF', timer: 'Ends in 03h : 15m : 20s', badge: 'Best Seller', image: '/images/bluetooth_speaker_1778761745117.png' },
  { id: 3, name: 'Smart Watch Series 5', desc: 'Track your fitness and stay connected', rating: 4.5, reviews: 98, price: 2999, originalPrice: 5999, discount: '50% OFF', timer: 'Ends in 01d : 04h : 20m', badge: 'Mega Deal', image: '/images/alarm_clock_1778761477434.png' },
  { id: 4, name: 'Laptop Stand Foldable', desc: 'Ergonomic design & sturdy build', rating: 4.7, reviews: 128, price: 599, originalPrice: 1199, discount: '50% OFF', timer: 'Ends in 05h : 30m : 45s', badge: 'Limited Time', image: '/images/laptop_stand_1778761221119.png' },
  { id: 5, name: 'Wireless Headphones', desc: 'Immersive sound experience', rating: 4.6, reviews: 156, price: 1599, originalPrice: 3199, discount: '50% OFF', timer: 'Ends in 02d : 03h : 10m', badge: 'Hot Deal', image: '/images/earbuds_1778761100549.png' },
  { id: 6, name: 'Power Bank 10000mAh', desc: 'Fast charging & compact design', rating: 4.8, reviews: 156, price: 799, originalPrice: 1599, discount: '50% OFF', timer: 'Ends in 04h : 25m : 30s', badge: '', image: '/images/vacuum_flask_1778762004829.png' },
  { id: 7, name: 'Coffee Maker Machine', desc: 'Brew perfect coffee every time', rating: 4.4, reviews: 87, price: 2499, originalPrice: 4999, discount: '50% OFF', timer: 'Ends in 01d : 02h : 40m', badge: '', image: '/images/vacuum_flask_1778762004829.png' },
  { id: 8, name: 'Yoga Mat with Strap', desc: 'Non-slip & eco-friendly material', rating: 4.6, reviews: 64, price: 649, originalPrice: 1299, discount: '50% OFF', timer: 'Ends in 03h : 55m : 15s', badge: '', image: '/images/laptop_stand_1778761221119.png' },
];

const categories = [
  { name: 'All Deals', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { name: 'Electronics', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { name: 'Mobiles', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { name: 'Laptops', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Kitchen', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'Fashion', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { name: 'Beauty', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Fitness', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Accessories', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
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

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen font-sans pb-16">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-[1440px] px-8 pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">Top deals & offers handpicked for you. Limited time only!</p>
        </div>

        {/* Categories Carousel */}
        <div className="mb-10 flex items-center justify-between overflow-x-auto scrollbar-hide border-b border-gray-100 pb-8">
          <div className="flex gap-10">
            {categories.map((cat, idx) => {
              const isActive = idx === 0;
              return (
                <div key={cat.name} className="flex flex-col items-center gap-3 cursor-pointer group">
                  <div className={`flex h-[60px] w-[60px] items-center justify-center rounded-full border ${isActive ? 'border-[#1A2A54] text-[#1A2A54]' : 'border-gray-200 text-gray-500 group-hover:border-gray-400'} transition-colors`}>
                    <svg className={`h-6 w-6 ${isActive ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth={isActive ? 0 : 1.5} viewBox="0 0 24 24">
                      {isActive ? (
                        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      )}
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-[#1A2A54]' : 'text-gray-500 group-hover:text-gray-800'}`}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 mr-2">Filtered by:</span>
            <button className="rounded-md bg-[#1A2A54] px-4 py-1.5 text-xs font-bold text-white">All</button>
            <button className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Top Deals</button>
            <button className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Discount %</button>
            <button className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Price: Low to High</button>
            <button className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Price: High to Low</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Sort by:</span>
            <div className="relative">
              <select className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#1A2A54] focus:outline-none">
                <option>Popularity</option>
                <option>Newest</option>
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          {deals.map(deal => (
            <div key={deal.id} className="relative flex overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              {/* Badge */}
              {deal.badge && (
                <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-[#FF6B00] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                  {deal.badge}
                </span>
              )}
              
              {/* Image */}
              <div className="flex w-[40%] items-center justify-center p-2">
                <img src={deal.image} alt={deal.name} className="max-h-full w-full object-contain mix-blend-multiply" />
              </div>
              
              {/* Details */}
              <div className="flex w-[60%] flex-col justify-between pl-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{deal.name}</h3>
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-2 min-h-[32px]">{deal.desc}</p>
                  <div className="mt-2">
                    <StarRating rating={deal.rating} reviews={deal.reviews} />
                  </div>
                  
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-[#FF6B00]">{formatPrice(deal.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
                    <span className="text-[10px] font-bold text-[#00B074]">{deal.discount}</span>
                  </div>
                  
                  <div className="mt-3 inline-block rounded border border-[#00B074]/20 bg-[#00B074]/5 px-2 py-1 text-[10px] font-bold text-[#00B074]">
                    {deal.timer}
                  </div>
                </div>

                <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#101B3A]">
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Promotional Banner */}
        <div className="mt-8 flex items-center justify-between rounded-xl bg-[#F0F3F9] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A2A54] shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2A54]">Don't miss out!</h3>
              <p className="text-xs text-gray-500 mt-0.5">New deals every day. Shop now and save more!</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-[#1A2A54] bg-white px-5 py-2.5 text-xs font-bold text-[#1A2A54] transition-colors hover:bg-gray-50">
            Explore All Deals
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

      </main>
    </div>
  );
}
