import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="opti-noise relative overflow-hidden bg-[#f4f7fc] px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
      <section className="mx-auto grid max-w-[1220px] items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="opti-slide-up relative z-10">
          <p className="inline-block rounded-full bg-[#e8eef8] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748b]">
            Intelligent Shopping Platform
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.2rem,8vw,5.4rem)] font-extrabold leading-[0.93] tracking-[-0.04em] text-[#0f172a]">
            Browse Fast.
            <br />
            Build Smarter Carts.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-[#475569] sm:text-lg">
            OptiMall blends normal product browsing with explainable bundle intelligence, so every budget decision feels easier and more confident.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition-colors duration-150 active:scale-[0.97] active:transform hover:bg-[#E65C00]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-[#cbd8ee] bg-[#f4f7fc] px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#1e293b] transition-colors duration-150 active:scale-[0.97] active:transform hover:bg-[#e8eef8]"
            >
              Create account
            </Link>
          </div>
        </div>

      </section>

      <section className="mx-auto mt-12 max-w-[1220px]">
        <h2 className="text-2xl font-extrabold text-slate-900">How OptiMall works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#d5dded] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 1</p>
            <p className="mt-2 font-bold text-slate-900">Browse normally</p>
            <p className="mt-1 text-sm text-slate-600">Search and compare products like a familiar marketplace.</p>
          </article>
          <article className="rounded-xl border border-[#d5dded] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 2</p>
            <p className="mt-2 font-bold text-slate-900">Switch to Smart mode</p>
            <p className="mt-1 text-sm text-slate-600">Tell us your goal and budget to generate a guided bundle.</p>
          </article>
          <article className="rounded-xl border border-[#d5dded] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 3</p>
            <p className="mt-2 font-bold text-slate-900">Checkout with confidence</p>
            <p className="mt-1 text-sm text-slate-600">Review total, remaining budget, and optimized picks before paying.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[1220px] rounded-2xl border border-[#d5dded] bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Built for real shoppers</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Whether you prefer normal browsing or guided bundles, OptiMall keeps the experience understandable and practical.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <img src="/images/landing_shopper_hero_1.png" alt="Shopper checking products" className="h-44 w-full rounded-xl object-cover sm:h-52" />
          <img src="/images/landing_shopper_hero_2.png" alt="Shoppers deciding with recommendations" className="h-44 w-full rounded-xl object-cover sm:h-52" />
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[1220px] rounded-2xl bg-[#1A2A54] p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B8C7EB]">Ready to start?</p>
        <h2 className="mt-2 text-[clamp(1.6rem,6vw,2rem)] font-extrabold">Create your account and start shopping smarter.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup" className="rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-white hover:bg-[#E65C00]">
            Create account
          </Link>
          <Link to="/login" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10">
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
