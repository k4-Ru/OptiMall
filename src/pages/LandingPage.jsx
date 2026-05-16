import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-6 text-center">
      <h1 className="text-5xl font-black text-slate-900">OptiMall</h1>
      <p className="max-w-xl text-base text-slate-600">
        Intelligent shopping recommendations, bundle optimization, and real-time behavior insights.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/signup"
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Create account
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
