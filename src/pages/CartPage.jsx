import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';

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
    <div className="min-h-screen bg-[#EDF1F6] font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-[#112A4B] via-[#1B3F72] to-[#112A4B] p-7 text-white shadow">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-200">CHECKOUT JOURNEY</p>
          <h1 className="mt-2 text-3xl font-black">Review, Confirm, and Complete</h1>
          <p className="mt-1 text-sm text-blue-100">Cart items: {cartCount}. Final payment is simulated and marks order as paid instantly.</p>
        </section>

        {cart.length === 0 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">Your cart is empty.</p>
            <button type="button" onClick={() => navigate('/products')} className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Continue Shopping
            </button>
          </section>
        )}

        {!!cart.length && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">Cart Items</h2>
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category || 'Uncategorized'}</p>
                        <p className="mt-1 text-sm font-bold text-[#FF6B00]">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="h-8 w-8 rounded border border-slate-300">-</button>
                        <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="h-8 w-8 rounded border border-slate-300">+</button>
                        <button type="button" onClick={() => removeFromCart(item.id)} className="ml-2 text-xs font-semibold text-red-600">Remove</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">Payment Simulation</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{formatPrice(breakdown.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Service Fee</span><span>{formatPrice(breakdown.serviceFee)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Bundle Discount</span><span className="text-emerald-700">- {formatPrice(breakdown.simulatedDiscount)}</span></div>
                <div className="mt-2 border-t pt-2 flex justify-between font-extrabold">
                  <span>Total</span><span className="text-[#FF6B00]">{formatPrice(breakdown.grandTotal)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Checkout sets payment status to done and redirects to live tracking.</p>
              <button type="button" onClick={handleCheckout} className="mt-4 w-full rounded-lg bg-[#FF6B00] py-2.5 text-sm font-bold text-white">
                Confirm Checkout
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
