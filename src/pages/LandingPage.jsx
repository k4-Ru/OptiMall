import {
  ArrowRight,
  CheckCircle,
  Compass,
  Cpu,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const DEMO_BUDGET = 1000;
const demoCart = [
  {
    id: 151,
    name: 'Student Planner Notebook',
    category: 'Study Essentials',
    price: 199,
    image: '/images/151.png',
  },
  {
    id: 152,
    name: 'Desk Organizer Set',
    category: 'Study Essentials',
    price: 349,
    image: '/images/152.png',
  },
  {
    id: 158,
    optimizedId: 155,
    name: 'Laptop Sleeve 14 inch',
    optimizedName: 'A4 Bond Paper Ream',
    category: 'Study Essentials',
    price: 499,
    optimizedPrice: 289,
    image: '/images/158.png',
    optimizedImage: '/images/155.png',
    note: 'Smart Swap',
  },
];

function formatPrice(value) {
  return `\u20B1${Number(value || 0).toLocaleString()}`;
}

export default function LandingPage() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const cartTotal = demoCart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const optimizedTotal = demoCart.reduce(
    (sum, item) => sum + Number(isOptimized ? item.optimizedPrice || item.price : item.price),
    0
  );
  const activeTotal = isOptimized ? optimizedTotal : cartTotal;
  const savedAmount = cartTotal - optimizedTotal;
  const overBudget = Math.max(0, activeTotal - DEMO_BUDGET);
  const progress = Math.min(100, (activeTotal / DEMO_BUDGET) * 100);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
    }, 1000);
  };

  const handleReset = () => {
    setIsOptimized(false);
  };

  return (
    <main className="opti-noise relative min-h-screen overflow-hidden bg-[#f4f7fc] px-4 pb-24 pt-16 sm:px-6 md:px-8 lg:pt-24">
      {/* Decorative Blur Blobs */}
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#1A2A54]/5 blur-[80px]" />
      <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#FF6B00]/5 blur-[100px]" />

      {/* Hero Section */}
      <section className="relative mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="opti-slide-up relative z-10 flex flex-col justify-center">
          <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-[#cbd8ee] bg-[#e8eef8]/80 px-4 py-1.5 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#1A2A54]">
              Intelligent Shopping Platform
            </p>
          </div>
          
          <h1 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#0f172a]">
            Browse Fast.<br />
            <span className="relative inline-block text-[#1A2A54]">
              Build Smarter
              <span className="absolute -bottom-1 left-0 h-1.5 w-full bg-[#FF6B00]" />
            </span> Carts.
          </h1>
          
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[#475569] sm:text-lg">
            OptiMall seamlessly blends standard product discovery with explainable bundle optimization, keeping you under budget automatically.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-full bg-[#FF6B00] px-7 py-3.5 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#FF6B00]/20 transition-all duration-200 active:scale-[0.97] hover:bg-[#E65C00] hover:shadow-xl hover:shadow-[#FF6B00]/35"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/signup"
              className="rounded-full border-2 border-[#cbd8ee] bg-white/60 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#1e293b] backdrop-blur-sm transition-all duration-200 active:scale-[0.97] hover:bg-[#e8eef8] hover:border-[#b4c5e3]"
            >
              Create Account
            </Link>
          </div>

          {/* Quick Stat Badges */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#cbd8ee]/60 pt-8">
            <div>
              <p className="text-2xl font-extrabold text-[#1A2A54] sm:text-3xl">2.5x</p>
              <p className="text-xs font-semibold text-[#64748b] mt-1">Faster Checkout</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1A2A54] sm:text-3xl">22%</p>
              <p className="text-xs font-semibold text-[#64748b] mt-1">Average Savings</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1A2A54] sm:text-3xl">100%</p>
              <p className="text-xs font-semibold text-[#64748b] mt-1">Budget Compliant</p>
            </div>
          </div>
        </div>

        {/* Interactive Cart Sandbox Mockup */}
        <div className="opti-slide-up opti-stagger-1 relative z-10 mx-auto w-full max-w-[480px]">
          {/* Decorative blur backdrop */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#1A2A54]/10 to-[#FF6B00]/10 opacity-30 blur-lg" />
          
          <div className="relative rounded-3xl border border-[#cbd8ee] bg-white p-6 shadow-2xl shadow-slate-200/80">
            {/* Mock Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A2A54] text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Demo Workspace</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Smart Optimizer Sandbox</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-1">
                <span className="text-[10px] font-bold text-slate-600">Budget:</span>
                <span className="text-[11px] font-black text-[#1A2A54]">{formatPrice(DEMO_BUDGET)}</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="mt-5 space-y-3.5">
              {demoCart.map((item) => {
                const wasSwapped = isOptimized && item.optimizedPrice;
                const name = wasSwapped ? item.optimizedName : item.name;
                const image = wasSwapped ? item.optimizedImage : item.image;
                const price = wasSwapped ? item.optimizedPrice : item.price;

                return (
                  <div key={wasSwapped ? item.optimizedId : item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3 transition-all duration-300">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={image}
                        alt={name}
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
                      />
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-slate-800">{name}</h4>
                        <p className="truncate text-[10px] font-medium text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {wasSwapped ? (
                        <>
                          <span className="mr-1.5 text-[10px] font-bold text-slate-400 line-through">{formatPrice(item.price)}</span>
                          <span className="text-xs font-extrabold text-[#FF6B00]">{formatPrice(price)}</span>
                          <span className="block text-[8px] font-bold text-emerald-600">{item.note}</span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{formatPrice(price)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget Progress Bar */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Cart Total</span>
                <span className={isOptimized ? 'text-emerald-600' : 'text-[#FF6B00]'}>
                  {formatPrice(activeTotal)}
                </span>
              </div>
              
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    isOptimized ? 'bg-emerald-500' : 'bg-[#FF6B00]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Alert Status Banner */}
              <div className="mt-3.5 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all duration-300 bg-[#fafafa]">
                {isOptimized ? (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Success! Saved {formatPrice(savedAmount)} ({Math.round(progress)}% of Budget)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#FF6B00]">
                    <span className="flex h-2 w-2 rounded-full bg-[#FF6B00] animate-ping" />
                    <span>Cart exceeds budget by {formatPrice(overBudget)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Action Button */}
            <div className="mt-5">
              {isOptimized ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd8ee] bg-white py-3 text-xs font-extrabold uppercase tracking-wider text-slate-700 transition duration-150 hover:bg-[#f4f7fc]"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#1A2A54]" />
                  Reset Simulation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A2A54] py-3 text-xs font-extrabold uppercase tracking-wider text-white transition-all duration-150 active:scale-[0.98] hover:bg-[#2A3A6A] disabled:opacity-80"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Optimizing Carts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-[#FF6B00]" />
                      Run Smart Optimizer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid section */}
      <section className="mx-auto mt-28 max-w-[1280px]">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6B00]">Built for Modern Commerce</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Why Shop with OptiMall?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Traditional retail pushes items. We analyze your goals and budget boundaries to guide your checkout process.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-[#d5dded] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8eef8] text-[#1A2A54] transition-colors group-hover:bg-[#1A2A54] group-hover:text-white">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-bold text-slate-900 text-lg">Dual-Mode Browsing</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Toggle fluidly between standard catalog browsing and goal-oriented smart matching. You stay in control of the shopping style.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-[#d5dded] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8eef8] text-[#1A2A54] transition-colors group-hover:bg-[#1A2A54] group-hover:text-white">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-bold text-slate-900 text-lg">Explainable Algorithms</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              No black boxes. OptiMall displays clear reasons for every recommended replacement, showcasing savings and alternatives.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-[#d5dded] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8eef8] text-[#1A2A54] transition-colors group-hover:bg-[#1A2A54] group-hover:text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-bold text-slate-900 text-lg">Guaranteed Guardrails</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Input a strict budget limit. Our engine ensures your calculated bundles never break that ceiling, sorting options in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="mx-auto mt-28 max-w-[1280px]">
        <div className="rounded-3xl border border-[#d5dded] bg-white p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6B00]">Simple 3-Step Process</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">How OptiMall Works</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 relative">
            <article className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2A54] text-xs font-bold text-white">
                  1
                </span>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00]">Step One</p>
              </div>
              <h3 className="mt-3 font-bold text-slate-900">Browse and Add Products</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Add preferred items from a standard catalog of electronics, kits, and kitchenware.
              </p>
            </article>

            <article className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2A54] text-xs font-bold text-white">
                  2
                </span>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00]">Step Two</p>
              </div>
              <h3 className="mt-3 font-bold text-slate-900">Activate Smart Mode</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Specify a strict budget ceiling and select optimization goals. Let our pipeline analyze deals.
              </p>
            </article>

            <article className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2A54] text-xs font-bold text-white">
                  3
                </span>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00]">Step Three</p>
              </div>
              <h3 className="mt-3 font-bold text-slate-900">Checkout Compliantly</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Review the optimal bundle details, verify total remaining cash, and confirm with ease.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Built for real shoppers section */}
      <section className="mx-auto mt-20 max-w-[1280px] rounded-3xl border border-[#d5dded] bg-white p-6 sm:p-10 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-[#e8eef8] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1A2A54]">
              Customer Focused
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Built for Real Shoppers</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              OptiMall was engineered to keep budgets transparent and practical. Whether you're configuring a study setup or stocking a new home, we keep your wallet safe from micro-expenditure creep.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                <span className="text-sm font-bold text-slate-700">No Hidden Costs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                <span className="text-sm font-bold text-slate-700">Dynamic Deal Sourcing</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src="/images/landing_shopper_hero_1.png"
                alt="Shopper checking products"
                className="h-48 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-56"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase tracking-wider">Smart Mode</p>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src="/images/landing_shopper_hero_2.png"
                alt="Shoppers deciding with recommendations"
                className="h-48 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-56"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase tracking-wider">Instant Saving</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="mx-auto mt-20 max-w-[1280px] overflow-hidden rounded-3xl bg-[#1A2A54] text-white shadow-xl relative">
        {/* Glowing Blobs */}
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-[#FF6B00]/10 blur-[80px]" />
        
        <div className="px-6 py-12 text-center sm:px-12 sm:py-16 relative z-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B8C7EB]">Ready to Start?</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-extrabold sm:text-4xl leading-tight">
            Create Your Account and Start Shopping Smarter today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#B8C7EB] leading-relaxed">
            Experience our Explainable Bundle Optimizer and see how much you can save within your budget bounds.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-[#FF6B00] px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.1em] text-white transition duration-150 hover:bg-[#E65C00] shadow-lg shadow-[#FF6B00]/25 active:scale-[0.98]"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition duration-150 hover:bg-white/10 active:scale-[0.98]"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
