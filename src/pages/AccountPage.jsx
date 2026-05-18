import { Link } from 'react-router-dom';

export default function AccountPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Account</h2>
      <p className="mt-2 text-slate-600">Account details page placeholder.</p>
      <Link to="/orders" className="mt-3 inline-block text-sm font-semibold text-[#FF6B00]">
        Go to Order Tracking
      </Link>
    </section>
  );
}
