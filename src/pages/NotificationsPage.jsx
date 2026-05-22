import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCommerce } from '../lib/commerceContext';

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, cartCount } = useCommerce();

  const notifications = useMemo(() => {
    const base = [
      {
        id: 'deal-1',
        title: 'Price drop on selected tech items',
        body: 'Open Deals to see discounted products that match your browsing categories.',
        cta: '/deals',
        ctaLabel: 'View deals',
      },
      {
        id: 'bundle-1',
        title: 'Your smart bundle is ready to refine',
        body: 'Run Smart Bundles and swap items before you checkout.',
        cta: '/smart-bundles',
        ctaLabel: 'Open smart bundles',
      },
    ];

    if (orders.length) {
      base.unshift({
        id: 'order-latest',
        title: 'Order update available',
        body: `You have ${orders.length} order${orders.length > 1 ? 's' : ''} in tracking.`,
        cta: '/orders',
        ctaLabel: 'Track orders',
      });
    }

    if (cartCount > 0) {
      base.unshift({
        id: 'cart-reminder',
        title: 'Items waiting in your cart',
        body: `You have ${cartCount} item${cartCount > 1 ? 's' : ''} ready for checkout.`,
        cta: '/cart',
        ctaLabel: 'Open cart',
      });
    }

    return base;
  }, [orders.length, cartCount]);

  return (
    <div className="min-h-screen pb-12">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[960px] px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-[#d5dded] bg-[#f8fbff] p-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">Updates about your cart, orders, and smart shopping opportunities.</p>
        </section>

        <section className="mt-5 space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className="rounded-xl border border-[#d5dded] bg-white p-4">
              <h2 className="text-sm font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              <Link to={item.cta} className="mt-3 inline-block rounded-lg bg-[#1A2A54] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#142042]">
                {item.ctaLabel}
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
