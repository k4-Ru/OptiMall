import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* Left Branding Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1A2A54] to-[#101B3A] p-16 text-white lg:flex">
         {/* Background decorative elements */}
         <div className="absolute -mr-20 -mt-20 right-0 top-0 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-[100px]"></div>
         <div className="absolute -mb-20 -ml-20 bottom-0 left-0 h-96 w-96 rounded-full bg-[#FF6B00] opacity-20 blur-[100px]"></div>
         
         <div className="relative z-10">
            <Link to="/home" className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
               <img src="/images/logo.png" alt="OptiMall Logo" className="h-20 w-auto object-contain drop-shadow-lg" />
               <span className="text-5xl font-extrabold tracking-tight">
                 Opti<span className="text-[#FF6B00]">Mall</span>
               </span>
            </Link>
         </div>

         <div className="relative z-10 max-w-xl">
            <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight lg:text-6xl">
              Start Your Journey<br />With Us
            </h1>
            <p className="text-xl leading-relaxed text-blue-100/80 font-medium">
              Create an account to unlock AI-picked bundles, save your favorite items, and enjoy a seamless shopping experience.
            </p>
         </div>

         <div className="relative z-10 text-sm font-medium text-blue-200/60">
            © {new Date().getFullYear()} OptiMall. All rights reserved.
         </div>
      </div>

      {/* Right Login Panel */}
      <div className="relative flex w-full items-center justify-center bg-[#F4F7FA] p-6 sm:p-12 lg:w-1/2">
         <div className="flex w-full max-w-[440px] flex-col items-center">
            
            {/* Mobile Logo Header */}
            <div className="mb-10 flex flex-col items-center justify-center lg:hidden">
               <Link to="/home" className="flex flex-col items-center gap-3 transition-transform active:scale-95">
                  <img src="/images/logo.png" alt="OptiMall Logo" className="h-20 w-auto object-contain drop-shadow-md" />
                  <span className="text-4xl font-extrabold tracking-tight text-[#1A2A54]">
                    Opti<span className="text-[#FF6B00]">Mall</span>
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
                  card: "w-full shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-3xl border border-white/60 bg-white/80 p-8 sm:p-10 backdrop-blur-xl",
                  headerTitle: "text-3xl font-extrabold text-[#1A2A54] tracking-tight",
                  headerSubtitle: "text-gray-500 font-medium text-base mt-2",
                  formButtonPrimary: "bg-[#FF6B00] hover:bg-[#E65C00] text-base font-bold shadow-lg shadow-orange-500/20 transition-all py-3.5 rounded-xl",
                  formFieldInput: "rounded-xl border-gray-200 focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] py-3 text-base transition-all bg-gray-50 hover:bg-gray-100",
                  formFieldLabel: "text-gray-700 font-bold mb-1.5",
                  dividerText: "text-gray-400 font-medium",
                  dividerLine: "bg-gray-200",
                  socialButtonsBlockButton: "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 rounded-xl py-3.5 transition-all shadow-sm",
                  socialButtonsBlockButtonText: "font-semibold text-gray-700",
                  footerActionLink: "text-[#FF6B00] hover:text-[#E65C00] font-bold text-base"
                }
              }}
            />
         </div>
      </div>
    </div>
  );
}
