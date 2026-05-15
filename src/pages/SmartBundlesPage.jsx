import React, { useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const categories = ['All Categories', 'Tech', 'Home', 'Fitness', 'Lifestyle', 'Accessories'];
const sortOptions = ['Best Match', 'Lowest Price', 'Highest Discount', 'Trending'];
const discountOptions = ['10% and above', '20% and above', '30% and above', '40% and above'];

const bundles = [
  { id: 1, name: 'WiFi Setup Bundle', items: 'Router + Extender + Charger', price: 4299, originalPrice: 5000, discount: 20, aiPick: true, images: ['/images/router.png', '/images/extender.png', '/images/cable.png'] },
  { id: 2, name: 'Morning Ritual', items: 'Coffee + Snacks + Bottle', price: 899, originalPrice: 1200, discount: 25, aiPick: true, images: ['/images/coffee.png', '/images/snacks.png', '/images/croissant.png'] },
  { id: 3, name: 'Work From Home', items: 'Keyboard + Mouse + Mousepad', price: 1999, originalPrice: 2800, discount: 29, aiPick: true, images: ['/images/keyboard.png', '/images/mouse.png', '/images/mousepad.png'] },
  { id: 4, name: 'Fitness Essentials', items: 'Bottle + Towel + Band', price: 749, originalPrice: 1000, discount: 25, aiPick: false, images: ['/images/bottle.png', '/images/towel.png', '/images/band.png'] },
  { id: 5, name: 'Gaming Starter Pack', items: 'Headset + Mouse + Mousepad', price: 2499, originalPrice: 3500, discount: 28, aiPick: true, images: ['/images/headset.png', '/images/gaming_mouse.png', '/images/gaming_mousepad.png'] },
  { id: 6, name: 'Student Essentials', items: 'Backpack + Notebook + Pens', price: 999, originalPrice: 1500, discount: 33, aiPick: false, images: ['/images/backpack.png', '/images/notebook.png', '/images/pens.png'] },
  { id: 7, name: 'Travel Kit', items: 'Trolley + Bottle + Neck Pillow', price: 2199, originalPrice: 3200, discount: 31, aiPick: false, images: ['/images/trolley.png', '/images/travel_bottle.png', '/images/neck_pillow.png'] },
  { id: 8, name: 'Smart Home Combo', items: 'Smart Bulb + Plug + Speaker', price: 1799, originalPrice: 2600, discount: 31, aiPick: true, images: ['/images/smart_bulb.png', '/images/smart_plug.png', '/images/smart_speaker.png'] },
  { id: 9, name: 'Content Creator Bundle', items: 'Ring Light + Tripod + Mic', price: 2999, originalPrice: 4500, discount: 33, aiPick: true, images: ['/images/ring_light.png', '/images/tripod.png', '/images/mic.png'] },
  { id: 10, name: 'Office Productivity Pack', items: 'Laptop Stand + Planner + Organizer', price: 1299, originalPrice: 1900, discount: 31, aiPick: false, images: ['/images/laptop_stand.png', '/images/planner.png', '/images/organizer.png'] },
  { id: 11, name: 'Home Cleaning Kit', items: 'Vacuum + Cleaner + Cloth', price: 1499, originalPrice: 2200, discount: 31, aiPick: false, images: ['/images/vacuum.png', '/images/cleaner.png', '/images/cloth.png'] },
  { id: 12, name: 'Self Care Essentials', items: 'Diffuser + Candle + Eye Mask', price: 999, originalPrice: 1400, discount: 28, aiPick: false, images: ['/images/diffuser.png', '/images/candle.png', '/images/eye_mask.png'] },
];

export default function SmartBundlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['All Categories']);
  const [selectedSort, setSelectedSort] = useState('Best Match');
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16 font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="mx-auto flex max-w-[1440px] gap-8 px-8 py-8">
        
        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-800">Filters</h2>
            
            {/* Categories */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-bold text-gray-800">Categories</h3>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          }
                        }}
                        className="peer h-4 w-4 appearance-none rounded border border-gray-300 checked:border-blue-900 checked:bg-blue-900 focus:outline-none"
                      />
                      <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className={`text-sm ${selectedCategories.includes(cat) ? 'font-medium text-blue-900' : 'text-gray-600'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-bold text-gray-800">Sort By</h3>
              <div className="flex flex-col gap-3">
                {sortOptions.map((sort) => (
                  <label key={sort} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="sort"
                        value={sort}
                        checked={selectedSort === sort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 checked:border-blue-900 focus:outline-none"
                      />
                      <div className="absolute h-2 w-2 rounded-full bg-blue-900 opacity-0 peer-checked:opacity-100"></div>
                    </div>
                    <span className={`text-sm ${selectedSort === sort ? 'font-medium text-blue-900' : 'text-gray-600'}`}>{sort}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-bold text-gray-800">Discount</h3>
              <div className="flex flex-col gap-3">
                {discountOptions.map((discount) => (
                  <label key={discount} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDiscounts([...selectedDiscounts, discount]);
                          } else {
                            setSelectedDiscounts(selectedDiscounts.filter(d => d !== discount));
                          }
                        }}
                        className="peer h-4 w-4 appearance-none rounded border border-gray-300 checked:border-blue-900 checked:bg-blue-900 focus:outline-none"
                      />
                      <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className={`text-sm ${selectedDiscounts.includes(discount) ? 'font-medium text-blue-900' : 'text-gray-600'}`}>{discount}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          
          {/* Header Banner */}
          <div className="mb-8 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-2xl">✨</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Bundles for You</h1>
                <p className="text-sm text-gray-500">AI-picked deals based on your activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search bundles..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-4 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Best Match</option>
                    <option>Lowest Price</option>
                    <option>Highest Discount</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bundles Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                
                {/* Images */}
                <div className="relative mb-5 flex h-32 justify-between gap-2">
                  {bundle.aiPick && (
                    <span className="absolute -right-2 -top-2 z-10 rounded bg-[#FF6B00] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      AI Pick
                    </span>
                  )}
                  {bundle.images.map((img, idx) => (
                    <div key={idx} className="flex flex-1 items-center justify-center rounded-lg border border-gray-100 bg-[#F9FAFB] p-2">
                      <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden relative">
                         {/* Placeholder for actual images */}
                         <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900">{bundle.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{bundle.items}</p>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-extrabold text-[#FF6B00]">₹{bundle.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{bundle.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className="mt-1 text-[11px] font-bold text-[#00B074]">
                    Save {bundle.discount}%
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                  <button className="flex-1 rounded-lg bg-[#1A2A54] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#101B3A]">
                    Add Bundle to Cart
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom info & Pagination */}
          <div className="flex items-center justify-between">
             <p className="text-sm text-gray-500">Showing 1 - 12 of 24 bundles</p>
             <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A2A54] text-sm font-medium text-white">1</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">2</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}
