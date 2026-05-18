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
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Order Tracking</h1>
        {!orders.length && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">No orders yet.</p>
            <Link to="/products" className="mt-3 inline-block text-sm font-semibold text-[#FF6B00]">Browse products</Link>
          </div>
        )}

        {!!orders.length && selectedOrder && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-xl border border-slate-200 bg-white p-4">
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

            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="text-lg font-extrabold text-slate-900">{selectedOrder.id}</p>
              <p className="mt-1 text-sm text-emerald-700">Payment: {selectedOrder.payment_status}</p>

              <div className="mt-5 space-y-3">
                {selectedOrder.tracking_steps.map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={`text-sm ${step.done ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-bold text-slate-700">Items</h3>
              <div className="mt-3 space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.name} x{item.qty}</p>
                    <p className="text-sm font-bold text-[#FF6B00]">{formatPrice(Number(item.price) * Number(item.qty))}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
