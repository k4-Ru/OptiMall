import { useClerk } from '@clerk/clerk-react';
import {
  Bell,
  ShoppingCart,
  Search,
  Store,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0E172A]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#1F398A] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#F97315] p-2 shadow-md">
              <Store className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                OptiMall
              </h1>
              <p className="text-xs text-blue-100">
                Optimizing every peso
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search products, bundles, stores..."
                className="w-full rounded-xl border border-transparent bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#F97315]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-xl p-2 text-white transition hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </button>

            <button className="rounded-xl p-2 text-white transition hover:bg-white/10">
              <ShoppingCart className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                window.location.assign('/login');
              }}
              className="rounded-xl bg-[#F97315] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm outline-none"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[2fr_1fr]">
        {/* Main Banner */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F398A] to-[#0E172A] p-8 text-white shadow-xl">
          <div className="max-w-xl">
            <span className="rounded-full bg-[#F97315]/20 px-4 py-1 text-xs font-semibold text-orange-200">
              AI-Powered Shopping
            </span>

            <h2 className="mt-5 text-4xl font-black leading-tight">
              Smarter shopping,
              <br />
              personalized for you.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              Discover optimized product bundles, personalized
              recommendations, and AI-assisted shopping experiences.
            </p>

            <button className="mt-6 flex items-center gap-2 rounded-2xl bg-[#F97315] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]">
              Explore Now
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Side Cards */}
        <div className="grid gap-6">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F398A]/10">
              <ShoppingCart className="h-6 w-6 text-[#1F398A]" />
            </div>

            <h3 className="font-bold text-[#0E172A]">
              Smart Bundles
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              AI-generated product combinations based on your budget
              and preferences.
            </p>
          </div>

          <div className="rounded-3xl bg-[#F97315] p-6 text-white shadow-md">
            <h3 className="text-lg font-bold">
              Daily Deals
            </h3>

            <p className="mt-2 text-sm text-orange-100">
              Limited-time recommendations curated for your interests.
            </p>

            <button className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#F97315]">
              View Deals
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0E172A]">
            Recommended For You
          </h2>

          <button className="text-sm font-semibold text-[#1F398A] hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-square bg-slate-100" />

              <div className="p-4">
                <p className="line-clamp-2 text-sm font-medium text-[#0E172A]">
                  Product Name Example #{item}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#F97315]">
                    ₱999
                  </span>

                  <button className="rounded-lg bg-[#1F398A] px-3 py-1 text-xs font-semibold text-white">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}