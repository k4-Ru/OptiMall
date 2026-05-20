import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function CartPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, checkout } = useCommerce();

  const breakdown = useMemo(() => {
    const subtotal = cartTotal;
    const serviceFee = cart.length ? 35 : 0;
    const simulatedDiscount = subtotal >= 5000 ? subtotal * 0.05 : 0;
    const grandTotal = subtotal + serviceFee - simulatedDiscount;
    return { subtotal, serviceFee, simulatedDiscount, grandTotal };
  }, [cartTotal, cart.length]);

  function handleCheckout() {
    const order = checkout();
    if (order) navigate(`/orders/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#cbd8ee] bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-[#b4c5e3] active:scale-[0.97]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
        </div>

        {/* Dashboard Header Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-[#d5dded] bg-gradient-to-r from-[#1A2A54] to-[#2A3A6A] p-6 text-white shadow-sm">
          {/* Subtle Orange Glow Blob */}
          <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-[#FF6B00]/15 blur-2xl" />
          
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B8C7EB]">Checkout Journey</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Review & Complete Order</h1>
          <p className="mt-2 text-sm text-[#B8C7EB] max-w-xl">
            Review your bundle choices, verify totals, and execute a simulated instant payment checkout.
          </p>
        </section>

        {cart.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-[#d5dded] bg-white p-8 text-center shadow-sm max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef8] text-[#1A2A54] mb-4">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
              Looks like you haven't added any products to your workspace yet. Let's find some great items!
            </p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-6 rounded-xl bg-[#1A2A54] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#2A3A6A] transition shadow-md shadow-[#1A2A54]/10 active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Cart Items Card */}
            <div className="rounded-2xl border border-[#d5dded] bg-white p-5 shadow-sm">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1A2A54] border-b border-slate-100 pb-3">
                Items in Cart ({cartCount})
              </h2>
              
              <div className="mt-4 space-y-3">
                {cart.map((item) => {
                  const initial = item.name ? item.name.substring(0, 2).toUpperCase() : 'PR';
                  return (
                    <article key={item.id} className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 flex items-center justify-between gap-4 transition hover:border-[#cbd8ee]">
                      <div className="flex items-center gap-4">
                        {/* Product thumbnail — real image or initials fallback */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          {item.image_path ? (
                            <img
                              src={item.image_path}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-extrabold text-sm text-[#1A2A54]">
                              {initial}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{item.category || 'Uncategorized'}</p>
                          <p className="mt-1.5 text-xs font-extrabold text-[#FF6B00]">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded bg-[#f8fafc] text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-800">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-[#f8fafc] text-slate-600 transition hover:bg-slate-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-[0.95]"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Payment / Simulation Summary Details */}
            <aside className="rounded-2xl border border-[#d5dded] bg-white p-5 shadow-sm h-fit">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1A2A54] border-b border-slate-100 pb-3">
                Payment Simulation
              </h2>
              
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between font-medium text-slate-550">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-bold">{formatPrice(breakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-550">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="text-slate-800 font-bold">{formatPrice(breakdown.serviceFee)}</span>
                </div>
                {breakdown.simulatedDiscount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Bundle Discount (5%)</span>
                    <span>- {formatPrice(breakdown.simulatedDiscount)}</span>
                  </div>
                )}
                
                <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between font-extrabold text-sm">
                  <span className="text-slate-800">Total Amount</span>
                  <span className="text-[#FF6B00]">{formatPrice(breakdown.grandTotal)}</span>
                </div>
              </div>

              {/* Simulation Alert Info */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-orange-50/60 p-3 text-[11px] font-semibold text-slate-700 border border-orange-100/50">
                <CreditCard className="h-4 w-4 shrink-0 text-[#FF6B00] mt-0.5" />
                <p className="leading-normal">
                  Confirming checkout sets the order status to paid and instantly triggers order status tracking.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-[#FF6B00]/25 transition duration-150 hover:bg-[#E65C00] active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Checkout
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
