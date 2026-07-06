import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OfficialSignIn = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/signup then redirect to dashboard
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] font-body relative overflow-hidden"
         style={{
           backgroundImage: 'linear-gradient(rgba(140, 133, 115, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(140, 133, 115, 0.1) 1px, transparent 1px)',
           backgroundSize: '40px 40px',
           backgroundPosition: 'center center'
         }}>
      
      {/* Widget Card */}
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone/10 overflow-hidden relative z-10 flex flex-col mx-16">
        
        <div className="p-32 lg:p-48">
          {/* Logo */}
          <div className="flex justify-center mb-32">
            <img src="/logo-cs.png" alt="CropSentinel Logo" className="h-[64px] w-auto object-contain" />
          </div>

          <h1 className="font-display font-bold text-[20px] text-soil-ink mb-8">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h1>
          <p className="text-[13px] text-stone mb-32">
            {isSignUp ? "Welcome to CropSentinel" : "Use the method you originally signed up with"}
          </p>

          {/* Google Button */}
          <button type="button" className="w-full flex items-center justify-center gap-12 border border-stone/30 rounded-[8px] py-12 px-16 text-[13px] font-bold text-soil-ink hover:bg-[#F9F9F9] transition-colors mb-24">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="flex items-center gap-12 mb-24">
            <div className="flex-1 h-px bg-stone/20"></div>
            <span className="text-[12px] text-stone font-medium uppercase">or</span>
            <div className="flex-1 h-px bg-stone/20"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            
            {isSignUp && (
              <div className="flex gap-12">
                <div className="flex flex-col gap-8 flex-1">
                  <label className="text-[12px] font-bold text-soil-ink">First name</label>
                  <input type="text" required className="w-full border border-stone/30 rounded-[8px] px-12 py-12 text-[13px] text-soil-ink focus:outline-none focus:border-board-green" />
                </div>
                <div className="flex flex-col gap-8 flex-1">
                  <label className="text-[12px] font-bold text-soil-ink">Last name</label>
                  <input type="text" required className="w-full border border-stone/30 rounded-[8px] px-12 py-12 text-[13px] text-soil-ink focus:outline-none focus:border-board-green" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-8">
              <label className="text-[12px] font-bold text-soil-ink">Email address</label>
              <input type="email" required placeholder="Enter your email address" className="w-full border border-stone/30 rounded-[8px] px-12 py-12 text-[13px] text-soil-ink focus:outline-none focus:border-board-green placeholder-stone/50" />
            </div>

            <button type="submit" className="w-full bg-[#4F46E5] text-white font-bold rounded-[8px] py-12 text-[13px] hover:bg-opacity-90 transition-colors mt-8 flex items-center justify-center">
              Continue <span className="ml-8 text-[16px] leading-none">›</span>
            </button>
          </form>
        </div>

        {/* Footer Area */}
        <div className="bg-[#FAFAFA] border-t border-stone/20 py-24 px-32 flex flex-col items-center justify-center gap-16">
          <p className="text-[13px] text-stone">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-[#4F46E5] font-bold hover:underline">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
          <div className="text-[11px] text-stone/60 font-medium">
            Secured by <img src="/logo-cs.png" alt="CropSentinel Logo" className="h-[28px] w-auto ml-8 object-contain" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficialSignIn;
