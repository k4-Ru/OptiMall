import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCommerce } from '../lib/commerceContext';

export default function Header({ searchQuery, onSearchChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCommerce();
  const path = location.pathname;
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Metro Manila');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const phLocations = ['Metro Manila', 'Cebu City', 'Davao City', 'Baguio City', 'Palawan'];
  const categories = ['Tech', 'Home', 'Lifestyle', 'Accessories'];

  return (
    <header className="bg-[#1A2A54] text-white shadow-sm">
      {/* Top row: logo + search + icons */}
      <div className="mx-auto flex max-w-[1440px] items-center gap-8 px-8 py-5">
        <Link to="/home" className="flex flex-shrink-0 items-center gap-2 text-3xl font-extrabold tracking-tight hover:opacity-90">
          <img src="/images/logo.png" alt="OptiMall Logo" className="h-20 w-auto object-contain" />
          <span>Opti<span className="text-[#FF6B00]">Mall</span></span>
        </Link>

        {/* Search bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full rounded-lg bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-lg bg-[#FF6B00] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E65C00]"
          >
            Go
          </button>
        </div>

        {/* Icons */}
        <div className="flex flex-shrink-0 items-center gap-8">
          <Link to="/notifications" className="relative flex flex-col items-center gap-1 text-gray-300 hover:text-white">
            <div className="relative">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">3</span>
            </div>
            <span className="text-[11px] font-medium">Notifications</span>
          </Link>

          <Link to="/cart" className="relative flex flex-col items-center gap-1 text-gray-300 hover:text-white">
            <div className="relative">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">{cartCount}</span>
            </div>
            <span className="text-[11px] font-medium">Cart</span>
          </Link>

          <Link to="/account" className="flex flex-col items-center gap-1 text-gray-300 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex items-center gap-1 text-[11px] font-medium">
              Account
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom row: nav menu */}
      <div className="border-t border-[#2A3A6A] bg-[#1A2A54]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-2.5">
          <div className="flex items-center gap-8">
            {/* Categories Dropdown */}
            <div className="relative z-50">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 rounded-md bg-[#2A3A6A] px-4 py-2 text-sm font-medium text-white hover:bg-[#345B9A]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                All Categories
                <svg className={`ml-2 h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/products?category=${cat.toLowerCase()}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <nav className="flex items-center gap-8 text-sm font-medium text-[#B4C5E3]">
              <Link to="/home" className={`pb-1 hover:text-white ${path.includes('/home') || path === '/' ? 'border-b-2 border-[#FF6B00] text-white' : ''}`}>Home</Link>
              <Link to="/deals" className={`pb-1 hover:text-white ${path.includes('/deals') ? 'border-b-2 border-[#FF6B00] text-white' : ''}`}>Deals</Link>
              <Link to="/new-arrivals" className={`pb-1 hover:text-white ${path.includes('/new-arrivals') ? 'border-b-2 border-[#FF6B00] text-white' : ''}`}>New Arrivals</Link>
              <Link to="/brands" className={`pb-1 hover:text-white ${path.includes('/brands') ? 'border-b-2 border-[#FF6B00] text-white' : ''}`}>Brands</Link>
              <Link to="/smart-bundles" className={`pb-1 hover:text-white ${path.includes('/smart-bundles') ? 'border-b-2 border-[#FF6B00] text-white' : ''}`}>Smart Bundles</Link>
            </nav>
          </div>

          {/* Delivery Location */}
          <div className="relative">
            <button 
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 text-sm text-[#B4C5E3] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] leading-tight text-gray-400">Deliver to</span>
                <span className="font-medium text-white flex items-center gap-1">
                  {selectedLocation} <svg className={`h-3 w-3 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </button>

            {/* Location Dropdown */}
            {isLocationOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {phLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm ${selectedLocation === loc ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
