import { useState } from 'react';
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

  function handleCheckout() {
    const order = checkout();
    if (order) navigate(`/orders/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Your Cart ({cartCount})</h1>

        {cart.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!!cart.length && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="space-y-3">
                {cart.map((item) => (
                  <article key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category || 'Uncategorized'}</p>
                      <p className="mt-1 text-sm font-bold text-[#FF6B00]">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="h-8 w-8 rounded border">-</button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="h-8 w-8 rounded border">+</button>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="ml-2 text-xs font-semibold text-red-600">Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">Items</span>
                <span className="font-semibold">{cartCount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Total</span>
                <span className="font-extrabold text-[#FF6B00]">{formatPrice(cartTotal)}</span>
              </div>
              <p className="mt-4 text-xs text-slate-500">Checkout is simulated: payment is marked done immediately.</p>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 w-full rounded bg-[#FF6B00] py-2 text-sm font-bold text-white"
              >
                Checkout (Simulated Payment)
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
