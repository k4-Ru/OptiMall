import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const categories = [
  'All Categories', 'Electronics', 'Home & Kitchen', 'Fashion',
  'Beauty', 'Fitness', 'Accessories', 'Toys & Games'
];

const brandTypes = [
  'All Brands', 'Top Brands', 'Premium Brands', 'New Brands'
];

const sortOptions = [
  'Alphabetical (A-Z)', 'Alphabetical (Z-A)', 'Most Popular', 'Newly Added'
];

const allBrands = [
  { id: 1, name: 'Apple', logo: '', tag: 'Top Brand', tagColor: 'bg-blue-100 text-blue-700', description: 'Innovative technology and premium design.', products: 128 },
  { id: 2, name: 'Samsung', logo: <span className="font-bold text-[#034EA2] tracking-tighter text-xl">SAMSUNG</span>, tag: 'Top Brand', tagColor: 'bg-blue-100 text-blue-700', description: 'Experience next-level innovation with Samsung.', products: 156 },
  { id: 3, name: 'boAt', logo: <span className="font-bold tracking-tight text-2xl">boAt</span>, tag: 'Popular', tagColor: 'bg-green-100 text-green-700', description: 'Plug into Nirvana with boAt audio products.', products: 98 },
  { id: 4, name: 'JBL', logo: <span className="font-bold text-white bg-[#FF4500] px-2 py-0.5 rounded text-xl">JBL</span>, tag: 'Popular', tagColor: 'bg-green-100 text-green-700', description: 'Powerful sound that moves you.', products: 112 },
  { id: 5, name: 'Philips', logo: <span className="font-bold text-[#0B5EAA] text-xl">PHILIPS</span>, description: 'Innovation and you. Discover Philips products.', products: 89 },
  { id: 6, name: 'Sony', logo: <span className="font-serif font-bold text-2xl">SONY</span>, description: 'Experience entertainment like never before.', products: 77 },
  { id: 7, name: 'Xiaomi', logo: <span className="font-bold text-white bg-[#FF6900] px-3 py-2 rounded-xl text-xl">mi</span>, description: 'Smart living for everyone.', products: 102 },
  { id: 8, name: 'Dell', logo: <span className="font-bold text-[#0076CE] border-[3px] border-[#0076CE] rounded-full px-2 py-1 text-lg">DELL</span>, description: 'Technology that drives you forward.', products: 64 },
  { id: 9, name: 'LG', logo: <span className="font-bold text-[#A50034] text-2xl">LG</span>, description: 'Life\'s Good with LG electronics.', products: 58 },
  { id: 10, name: 'Lenovo', logo: <span className="font-bold text-white bg-[#E2231A] px-2 py-1 text-xl">Lenovo</span>, description: 'Smarter technology for all.', products: 73 },
  { id: 11, name: 'Realme', logo: <span className="font-bold text-[#FFC915] text-2xl">realme</span>, description: 'Dare to Leap with realme.', products: 45 },
  { id: 12, name: 'OnePlus', logo: <span className="font-bold text-[#F50100] border-2 border-[#F50100] px-2 py-1 text-xl">1+</span>, description: 'Never Settle.', products: 37 },
];

const popularBrands = [
  { name: 'Apple', logo: '', products: 128 },
  { name: 'Samsung', logo: <span className="font-bold text-[#034EA2] tracking-tighter">SAMSUNG</span>, products: 156 },
  { name: 'boAt', logo: <span className="font-bold tracking-tight text-lg">boAt</span>, products: 98 },
  { name: 'JBL', logo: <span className="font-bold text-white bg-[#FF4500] px-1.5 py-0.5 rounded text-sm">JBL</span>, products: 112 },
  { name: 'Philips', logo: <span className="font-bold text-[#0B5EAA]">PHILIPS</span>, products: 89 },
  { name: 'Sony', logo: <span className="font-serif font-bold text-lg">SONY</span>, products: 77 },
  { name: 'Dell', logo: <span className="font-bold text-[#0076CE] border-2 border-[#0076CE] rounded-full px-1.5 py-0.5 text-sm">DELL</span>, products: 64 },
  { name: 'Xiaomi', logo: <span className="font-bold text-white bg-[#FF6900] px-2 py-1 rounded-lg text-sm">mi</span>, products: 102 },
];

export default function BrandsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrandType, setSelectedBrandType] = useState(['All Brands']);
  const [selectedSort, setSelectedSort] = useState('Alphabetical (A-Z)');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16 font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="mx-auto flex max-w-[1440px] gap-8 px-8 py-8">

        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-800">Filters</h2>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Category</h3>
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </div>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 checked:border-blue-600 focus:outline-none"
                      />
                      <div className="absolute h-2 w-2 rounded-full bg-blue-600 opacity-0 peer-checked:opacity-100"></div>
                    </div>
                    <span className={`text-sm ${selectedCategory === cat ? 'font-medium text-blue-600' : 'text-gray-600'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Type Filter */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-bold text-gray-800">Brand Type</h3>
              <div className="flex flex-col gap-3">
                {brandTypes.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedBrandType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrandType([...selectedBrandType, type]);
                          } else {
                            setSelectedBrandType(selectedBrandType.filter((t) => t !== type));
                          }
                        }}
                        className="peer h-4 w-4 appearance-none rounded border border-gray-300 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                      />
                      <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className={`text-sm ${selectedBrandType.includes(type) ? 'font-medium text-blue-600' : 'text-gray-600'}`}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By Filter */}
            <div>
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
                        className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 checked:border-blue-600 focus:outline-none"
                      />
                      <div className="absolute h-2 w-2 rounded-full bg-blue-600 opacity-0 peer-checked:opacity-100"></div>
                    </div>
                    <span className={`text-sm ${selectedSort === sort ? 'font-medium text-blue-600' : 'text-gray-600'}`}>{sort}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">

          {/* Header Banner */}
          <div className="relative mb-10 overflow-hidden rounded-xl bg-white p-8 shadow-sm">
            <div className="relative z-10 w-full max-w-2xl">
              <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Brands</h1>
              <p className="mb-6 text-gray-500">Shop from 500+ trusted brands across all categories.</p>
              <div className="relative max-w-md">
                <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="w-full rounded-lg border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Decorative Graphics */}
            <div className="absolute right-0 top-0 bottom-0 flex w-[400px] items-center justify-end overflow-hidden pr-8">
              <div className="relative h-full w-full">
                {/* Floating abstract shapes/logos */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 rounded-2xl bg-[#E8F0FE] p-8 shadow-lg transform rotate-12 transition-transform hover:rotate-0">
                  <svg className="h-16 w-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z" /></svg>
                </div>
                <div className="absolute right-32 top-8 rounded-full bg-white p-3 shadow-md">
                  <span className="font-bold text-xl">NIKE</span>
                </div>
                <div className="absolute right-12 top-10 rounded-full bg-white p-3 shadow-md">
                  <span className="font-bold text-xl tracking-tighter">adidas</span>
                </div>
                <div className="absolute right-40 bottom-12 rounded-full bg-white p-3 shadow-md">
                  <span className="font-bold text-lg text-red-500">boAt</span>
                </div>
                {/* Sparkles */}
                <svg className="absolute right-64 top-16 h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
                <svg className="absolute right-20 bottom-8 h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
              </div>
            </div>
          </div>

          {/* Popular Brands Section */}
          <div className="mb-10">
            <h2 className="mb-5 text-xl font-bold text-gray-900">Popular Brands</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {popularBrands.map((brand, idx) => (
                <div key={idx} className="flex min-w-[120px] cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex h-12 items-center justify-center text-4xl">
                    {brand.logo}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">{brand.name}</h3>
                  <p className="mt-1 text-[11px] text-gray-500">{brand.products} products</p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing 1-24 of 120 brands</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Most Popular</option>
                    <option>Alphabetical (A-Z)</option>
                    <option>Newly Added</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                <button className="rounded bg-[#EEF2FF] p-1.5 text-blue-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allBrands.map((brand) => (
              <div key={brand.id} className="flex flex-col rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-start text-5xl">
                  {brand.logo}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                  {brand.tag && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${brand.tagColor}`}>
                      {brand.tag}
                    </span>
                  )}
                </div>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-500">
                  {brand.description}
                </p>
                <div className="mb-5 mt-auto flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{brand.products} products</span>
                </div>
                <button className="w-full rounded-lg border border-blue-600 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50">
                  View Products
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A2A54] text-sm font-medium text-white">1</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">2</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">3</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">4</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">5</button>
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
