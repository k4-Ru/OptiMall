import { useState } from 'react';
import Header from '../components/Header';

export default function CartPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-16">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Your Cart (2)</h1>

        {/* Free Delivery Banner */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#00B074]/20 bg-[#00B074]/10 px-4 py-3 text-sm font-medium text-[#00B074]">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Yay! You got free delivery on this order.
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column: Cart Items & Secure Checkout */}
          <div className="flex-1 space-y-6">

            {/* Cart Items Box */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

              {/* Header Row */}
              <div className="mb-4 grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-gray-100 pb-4 text-xs font-medium text-gray-500">
                <div>Product</div>
                <div>Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total</div>
              </div>

              {/* Item 1 */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-start border-b border-gray-50 py-6 last:border-b-0">
                {/* Product Info */}
                <div className="flex gap-4">
                  <div className="flex h-[100px] w-[100px] items-center justify-center rounded-lg bg-[#F8F9FA] p-2">
                    <img src="/images/earbuds_1778761100549.png" alt="Wireless Earbuds Pro Max" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h3 className="font-bold text-gray-900">Wireless Earbuds Pro Max</h3>
                    <span className="mt-1 text-xs text-gray-400">White</span>
                    <span className="mt-2 text-xs font-semibold text-[#00B074]">In Stock</span>
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-800">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Save for Later
                      </button>
                      <button className="flex items-center gap-1 text-[#FF6B00] hover:text-[#E65C00]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col pt-1">
                  <span className="font-bold text-[#FF6B00]">₱1,299</span>
                  <span className="mt-1 text-xs text-gray-400 line-through">₱2,599</span>
                  <span className="mt-1 text-xs font-bold text-[#00B074]">Save 50%</span>
                </div>

                {/* Quantity */}
                <div className="flex justify-center pt-1">
                  <div className="flex h-8 w-24 items-center justify-between rounded-md border border-gray-200 px-2">
                    <button className="text-gray-500 hover:text-gray-800">-</button>
                    <span className="text-sm font-medium">1</span>
                    <button className="text-gray-500 hover:text-gray-800">+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-end pt-1">
                  <span className="font-bold text-[#FF6B00]">₱1,299</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-start py-6">
                {/* Product Info */}
                <div className="flex gap-4">
                  <div className="flex h-[100px] w-[100px] items-center justify-center rounded-lg bg-[#F8F9FA] p-2">
                    <img src="/images/bluetooth_speaker_1778761745117.png" alt="Bluetooth Speaker" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h3 className="font-bold text-gray-900">Bluetooth Speaker</h3>
                    <span className="mt-1 text-xs text-gray-400">Black</span>
                    <span className="mt-2 text-xs font-semibold text-[#00B074]">In Stock</span>
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-800">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Save for Later
                      </button>
                      <button className="flex items-center gap-1 text-[#FF6B00] hover:text-[#E65C00]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col pt-1">
                  <span className="font-bold text-[#FF6B00]">₱1,099</span>
                  <span className="mt-1 text-xs text-gray-400 line-through">₱2,199</span>
                  <span className="mt-1 text-xs font-bold text-[#00B074]">Save 50%</span>
                </div>

                {/* Quantity */}
                <div className="flex justify-center pt-1">
                  <div className="flex h-8 w-24 items-center justify-between rounded-md border border-gray-200 px-2">
                    <button className="text-gray-500 hover:text-gray-800">-</button>
                    <span className="text-sm font-medium">1</span>
                    <button className="text-gray-500 hover:text-gray-800">+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-end pt-1">
                  <span className="font-bold text-[#FF6B00]">₱1,099</span>
                </div>
              </div>

            </div>

            {/* Secure Checkout Box */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <svg className="h-8 w-8 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Secure Checkout</h4>
                <p className="text-xs text-gray-500 mt-0.5">Your data is protected with 256-bit SSL encryption.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-extrabold text-gray-900">Order Summary</h2>

              <div className="space-y-4 border-b border-gray-100 pb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (2 items)</span>
                  <span className="font-medium text-gray-900">₱2,398</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00B074]">Discount</span>
                  <span className="font-medium text-[#00B074]">-₱1,199</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Delivery
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <span className="font-bold text-[#00B074]">FREE</span>
                </div>
              </div>

              <div className="py-6">
                <div className="flex items-end justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-extrabold text-[#FF6B00]">₱1,199</span>
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">
                  You save <span className="text-[#00B074]">₱1,199</span> on this order
                </p>
              </div>

              <div className="space-y-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] py-3 text-sm font-bold text-white transition-colors hover:bg-[#E65C00]">
                  Proceed to Checkout
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Continue Shopping
                </button>
              </div>

              {/* Payment Methods */}
              <div className="mt-8">
                <span className="text-[11px] text-gray-400">We accept:</span>
                <div className="mt-3 flex items-center gap-4">
                  <span className="font-black text-[#1A1F71] text-lg tracking-tighter">VISA</span>
                  <div className="flex h-5 w-8 relative">
                    <div className="absolute left-0 h-5 w-5 rounded-full bg-[#EB001B] opacity-90 mix-blend-multiply"></div>
                    <div className="absolute right-0 h-5 w-5 rounded-full bg-[#F79E1B] opacity-90 mix-blend-multiply"></div>
                  </div>
                  <span className="font-bold text-[#0052C2] text-sm flex items-center tracking-tight"><span className="text-xs">G</span>Cash</span>
                  <span className="font-bold text-[#003087] text-[13px] italic">PayPal</span>
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">You Might Also Like</h2>
            <button className="text-sm font-bold text-[#FF6B00] hover:text-[#E65C00]">View All</button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Recommendation Card 1 */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative mb-4 flex h-32 items-center justify-center">
                <img src="/images/earbuds_1778761100549.png" alt="Headphones" className="max-h-full object-contain mix-blend-multiply" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1">Wireless Headphones</h3>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center text-[#FF6B00]">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400">(128)</span>
              </div>
              <div className="mt-2 font-bold text-[#FF6B00]">₱1,599</div>
              <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-2 text-xs font-bold text-white transition-colors hover:bg-[#101B3A]">
                Add to Cart
              </button>
            </div>

            {/* Recommendation Card 2 */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative mb-4 flex h-32 items-center justify-center">
                <img src="/images/alarm_clock_1778761477434.png" alt="Smart Watch" className="max-h-full object-contain mix-blend-multiply" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1">Smart Watch Series 5</h3>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center text-[#FF6B00]">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400">(98)</span>
              </div>
              <div className="mt-2 font-bold text-[#FF6B00]">₱2,999</div>
              <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-2 text-xs font-bold text-white transition-colors hover:bg-[#101B3A]">
                Add to Cart
              </button>
            </div>

            {/* Recommendation Card 3 */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative mb-4 flex h-32 items-center justify-center">
                <img src="/images/vacuum_flask_1778762004829.png" alt="Power Bank" className="max-h-full object-contain mix-blend-multiply" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1">Power Bank 10000mAh</h3>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center text-[#FF6B00]">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3 text-[#FF8C33]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400">(156)</span>
              </div>
              <div className="mt-2 font-bold text-[#FF6B00]">₱799</div>
              <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-2 text-xs font-bold text-white transition-colors hover:bg-[#101B3A]">
                Add to Cart
              </button>
            </div>

            {/* Recommendation Card 4 */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative mb-4 flex h-32 items-center justify-center">
                <img src="/images/laptop_stand_1778761221119.png" alt="Laptop Stand" className="max-h-full object-contain mix-blend-multiply" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1">Laptop Stand Foldable</h3>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center text-[#FF6B00]">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                  <svg className="h-3 w-3 text-[#FF8C33]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400">(128)</span>
              </div>
              <div className="mt-2 font-bold text-[#FF6B00]">₱599</div>
              <button className="mt-4 w-full rounded-md bg-[#1A2A54] py-2 text-xs font-bold text-white transition-colors hover:bg-[#101B3A]">
                Add to Cart
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
