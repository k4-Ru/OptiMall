import { SignUp } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function SignupPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div
      className="relative flex min-h-screen overflow-hidden font-sans"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#eef2f6]/70" />
      
      {/* Left Branding Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#1a2a54]/12 bg-[#f8fafc] text-[#0f172a] lg:flex">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(26,42,84,0.18),transparent_48%),radial-gradient(circle_at_88%_84%,rgba(255,107,0,0.16),transparent_45%)]" />

         <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto]">
            <div className="px-12 pt-12">
               <Link to="/home" className="inline-flex items-center gap-4">
                  <img src="/images/logo.png" alt="OptiMall Logo" className="h-16 w-auto object-contain" />
                  <div className="leading-none">
                    <p className="text-xs font-semibold tracking-wide text-[#475569]">Shopping intelligence</p>
                    <span className="block text-4xl font-extrabold tracking-tight text-[#1a2a54]">OptiMall</span>
                  </div>
               </Link>
            </div>

            <div className="grid content-between gap-8 px-12 py-12">
              <div>
                <p className="mb-4 inline-flex rounded-full border border-[#1a2a54]/25 bg-[#1a2a54]/8 px-3 py-1 text-xs font-semibold text-[#1a2a54]">
                  Create account
                </p>
                <h1 className="max-w-[12ch] text-[clamp(2.4rem,4vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight text-balance">
                  Start your personalized shopping experience
                </h1>
                <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[#475569]">
                  Sign up once to unlock tailored recommendations, bundle guidance, and smoother checkout across devices.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-[#1a2a54]/16 bg-white/82 px-5 py-4 shadow-[0_14px_32px_rgba(26,42,84,0.11)]">
                  <p className="text-sm font-semibold text-[#0f172a]">Preference-aware discovery</p>
                  <p className="mt-1 text-sm text-[#475569]">Get relevant products sooner based on your interests.</p>
                </div>
                <div className="rounded-2xl border border-[#ff6b00]/30 bg-white/86 px-5 py-4 shadow-[0_14px_32px_rgba(255,107,0,0.16)]">
                  <p className="text-sm font-semibold text-[#0f172a]">Smart bundle suggestions</p>
                  <p className="mt-1 text-sm text-[#475569]">Compare budget tiers with practical item combinations.</p>
                </div>
                <div className="rounded-2xl border border-[#1a2a54]/16 bg-white/82 px-5 py-4 shadow-[0_14px_32px_rgba(26,42,84,0.11)]">
                  <p className="text-sm font-semibold text-[#0f172a]">Unified cart and orders</p>
                  <p className="mt-1 text-sm text-[#475569]">Keep cart, bundles, and checkout in one consistent flow.</p>
                </div>
              </div>
            </div>

            <div className="px-12 pb-10 text-sm text-[#64748b]">
              © {new Date().getFullYear()} OptiMall. All rights reserved.
            </div>
         </div>
      </div>

      {/* Right Login Panel */}
      <div className="relative flex w-full items-center justify-center bg-[#f8fafc]/84 p-6 sm:p-12 lg:w-1/2">
         <div className="flex w-full max-w-[440px] flex-col items-center">
            
            {/* Mobile Logo Header */}
            <div className="mb-10 flex flex-col items-center justify-center lg:hidden">
               <Link to="/home" className="flex flex-col items-center gap-3 transition-transform active:scale-95">
                  <img src="/images/logo.png" alt="OptiMall Logo" className="h-20 w-auto object-contain drop-shadow-md" />
                  <span className="text-4xl font-extrabold tracking-tight text-[#1a2a54]">
                    Opti<span className="text-[#ff6b00]">Mall</span>
                  </span>
               </Link>
            </div>

            <SignUp 
              routing="path" 
              path="/signup" 
              signInUrl="/login" 
              forceRedirectUrl="/home"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full rounded-3xl border border-[#1a2a54]/18 bg-white/90 p-8 sm:p-10 shadow-[0_20px_60px_rgba(26,42,84,0.16)] backdrop-blur-md",
                  headerTitle: "text-[30px] font-extrabold text-[#0f172a] tracking-tight",
                  headerSubtitle: "text-[#475569] font-medium text-sm mt-2",
                  formButtonPrimary: "bg-[#ff6b00] hover:bg-[#e65c00] text-base font-semibold transition-all duration-300 py-3.5 rounded-xl shadow-[0_12px_28px_rgba(255,107,0,0.34)] active:scale-[0.98]",
                  formFieldInput: "rounded-xl border border-[#1a2a54]/22 focus:ring-2 focus:ring-[#1a2a54]/18 focus:border-[#1a2a54] py-3 text-base transition-all bg-white text-[#0f172a] hover:border-[#1a2a54]/34",
                  formFieldLabel: "text-[#0f172a] font-semibold mb-1.5",
                  dividerText: "text-[#64748b] font-medium text-xs",
                  dividerLine: "bg-[#1a2a54]/20",
                  socialButtonsBlockButton: "border border-[#1a2a54]/18 bg-white hover:bg-[#f8fafc] hover:border-[#1a2a54]/32 rounded-xl py-3.5 transition-all duration-300 shadow-[0_8px_20px_rgba(26,42,84,0.06)]",
                  socialButtonsBlockButtonText: "font-semibold text-[#0f172a] text-sm",
                  footerActionLink: "text-[#ff6b00] hover:text-[#e65c00] font-semibold text-sm"
                }
              }}
            />
         </div>
      </div>
    </div>
  );
}
