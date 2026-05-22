import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

export default function OrderTrackingPage() {
  const { orders } = useCommerce();
  const { orderId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOrder = useMemo(() => {
    if (!orders.length) return null;
    if (orderId) return orders.find((o) => o.id === orderId) || null;
    return orders[0];
  }, [orders, orderId]);

  return (
    <div className="min-h-screen font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-[#112A4B] via-[#1B3F72] to-[#112A4B] p-7 text-white shadow">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-200">ORDER JOURNEY</p>
          <h1 className="mt-2 text-3xl font-black">Track Your Purchase Lifecycle</h1>
          <p className="mt-1 text-sm text-blue-100">From payment confirmation to delivery milestones.</p>
        </section>

        {!orders.length && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">No orders yet.</p>
            <Link to="/products" className="mt-3 inline-block text-sm font-semibold text-[#FF6B00]">Browse products</Link>
          </section>
        )}

        {!!orders.length && selectedOrder && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-bold text-slate-700">Recent Orders</h2>
              <div className="space-y-2">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className={`block rounded-lg border p-3 ${selectedOrder.id === order.id ? 'border-[#FF6B00] bg-orange-50' : 'border-slate-200'}`}
                  >
                    <p className="text-xs font-bold text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="mt-1 text-sm font-extrabold text-[#FF6B00]">{formatPrice(order.total_amount)}</p>
                  </Link>
                ))}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="text-lg font-extrabold text-slate-900">{selectedOrder.id}</p>
              <p className="mt-1 text-sm text-emerald-700">Payment Status: {selectedOrder.payment_status}</p>

              <h3 className="mt-5 text-sm font-bold text-slate-700">Tracking Timeline</h3>
              <div className="mt-3 space-y-3">
                {selectedOrder.tracking_steps.map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <span className={`h-3.5 w-3.5 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={`text-sm ${step.done ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-bold text-slate-700">Order Items</h3>
              <div className="mt-3 space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.name} x{item.qty}</p>
                    <p className="text-sm font-bold text-[#FF6B00]">{formatPrice(Number(item.price) * Number(item.qty))}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
