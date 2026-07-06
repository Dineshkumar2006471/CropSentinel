import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LiveRateBoard from '../components/LiveRateBoard';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const [demoResponse, setDemoResponse] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoSubmit = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const query = preset || demoInput;
    if (!query) return;

    setIsDemoLoading(true);
    setDemoResponse(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setDemoResponse(data.response);
    } catch (err) {
      setDemoResponse("Error connecting to AI backend.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-kraft-paper text-soil-ink font-body">
      {/* 1. Nav Bar exactly like reference */}
      <nav className="w-full bg-kraft-paper flex items-center justify-between px-32 h-[80px] shadow-sm z-20 relative border-b border-stone/20">
        <div className="flex items-center gap-8">
          <img src="/logo-cs.png" alt="CropSentinel Logo" className="h-[48px] w-auto object-contain" />
        </div>
        
        <div className="hidden md:flex items-center gap-32 text-[15px] font-medium text-soil-ink">
          <a href="#" className="hover:text-board-green transition-colors">Home</a>
          <a href="#how-it-works" className="hover:text-board-green transition-colors">How It Works</a>
          <Link to="/ask" className="hover:text-board-green transition-colors">Ask CropSentinel</Link>
          <Link to="/admin/login" className="hover:text-board-green transition-colors">Dashboard</Link>
          <a href="#about" className="hover:text-board-green transition-colors">About</a>
        </div>

        <div className="flex items-center gap-16">
          <Link to="/admin/login" className="text-[14px] font-bold text-soil-ink hover:text-board-green px-24 py-8 bg-[#F3F4F6] rounded-full transition-colors">
            Login
          </Link>
          <Link to="/ask" className="text-[14px] font-bold bg-turmeric-gold text-soil-ink px-24 py-8 rounded-full hover:bg-opacity-90 transition-colors">
            Try it free
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-80px)]">
        
        {/* Left Side: Dark Grid & Widget */}
        <div className="w-full lg:w-1/2 h-full bg-board-green relative flex items-center justify-center p-32 lg:p-48 overflow-hidden border-r border-stone/20"
             style={{
               backgroundImage: 'linear-gradient(rgba(140, 133, 115, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(140, 133, 115, 0.15) 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               backgroundPosition: 'center center'
             }}>
          
          {/* Functional Widget Card */}
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-full">
            
            {/* Top Image */}
            <div className="w-full h-[240px] bg-stone relative">
              <img src="/login-widget.png" alt="Dashboard Analysis" className="w-full h-full object-cover" />
            </div>

            {/* Circular Logo overlap */}
            <div className="absolute top-[208px] left-32 w-64 h-64 bg-soil-ink rounded-full border-[6px] border-kraft-paper flex items-center justify-center shadow-md">
              <span className="font-display font-bold text-kraft-paper text-[24px]">F</span>
            </div>

            {/* Card Body */}
            <div className="flex-1 flex flex-col bg-white pt-48 px-32 pb-32 overflow-y-auto">
              {demoResponse ? (
                <div className="flex flex-col h-full animate-fade-in">
                  <h2 className="font-display text-[18px] font-bold text-soil-ink mb-12">CropSentinel AI</h2>
                  <div className="bg-[#F9F9F9] p-16 rounded-[16px] text-[15px] text-soil-ink leading-relaxed border border-stone/10">
                    {demoResponse}
                  </div>
                  <button 
                    onClick={() => { setDemoResponse(null); setDemoInput(''); }}
                    className="mt-auto self-start text-[14px] font-medium text-board-green hover:underline"
                  >
                    Ask another question
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-[24px] font-bold text-soil-ink mb-4">Ask anything</h2>
                  <p className="text-stone text-[15px] mb-24">Empowering Indian farmers with data-driven price intelligence.</p>
                  
                  <form onSubmit={handleDemoSubmit} className="flex gap-8 mb-24">
                    <input 
                      type="text" 
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      placeholder="e.g. Potato price in Warangal?"
                      className="flex-1 px-16 py-12 rounded-full border border-stone/30 text-[14px] outline-none focus:border-board-green transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={isDemoLoading}
                      className="bg-turmeric-gold w-[44px] h-[44px] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isDemoLoading ? (
                        <div className="w-5 h-5 border-2 border-soil-ink border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-soil-ink text-[20px]">arrow_upward</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-auto flex flex-col gap-12">
                    <span className="text-[12px] text-stone font-medium mb-4">Suggested:</span>
                    <button 
                      onClick={() => handleDemoSubmit(undefined, "Is it a good time to sell Tomato in Chevella?")}
                      className="text-left px-16 py-12 rounded-full border border-stone/30 text-[14px] text-soil-ink hover:bg-stone/5 transition-colors max-w-fit"
                    >
                      Is it a good time to sell Tomato in Chevella?
                    </button>
                    <button 
                      onClick={() => handleDemoSubmit(undefined, "What is the average price of Cotton?")}
                      className="text-left px-16 py-12 rounded-full border border-stone/30 text-[14px] text-soil-ink hover:bg-stone/5 transition-colors max-w-fit"
                    >
                      What is the average price of Cotton?
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Copy & CTA */}
        <div className="w-full lg:w-1/2 h-full bg-kraft-paper flex flex-col justify-center items-center text-center px-32 lg:px-64">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-8 px-16 py-8 rounded-full border border-stone/20 bg-kraft-paper shadow-sm mb-48 -mt-24">
            <span className="text-[13px] font-medium text-soil-ink">Now with Live Market Analytics</span>
          </div>

          <h1 className="font-display font-medium text-[36px] lg:text-[48px] text-soil-ink leading-[1.3] mb-24 tracking-tight max-w-[500px]">
            Don't guess the price.<br/>Know your market.
          </h1>
          
          <p className="text-soil-ink opacity-80 text-[18px] lg:text-[19px] mb-[40px] leading-relaxed max-w-[460px]">
            Real mandi prices, a straight sell-or-wait answer, and a market comparison — in your own language.
          </p>

          <div className="flex gap-16 items-center">
            <Link to="/ask" className="bg-turmeric-gold text-soil-ink font-bold px-32 py-16 rounded-full text-[18px] hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg">
              Ask CropSentinel →
            </Link>
            <Link to="/admin/login" className="border-2 border-soil-ink text-soil-ink font-bold px-32 py-16 rounded-full text-[18px] hover:bg-soil-ink hover:text-kraft-paper transition-colors shadow-sm hover:shadow-md">
              See Dashboard
            </Link>
          </div>
        </div>
      </div>

      <LiveRateBoard />

      {/* 3 Boxes Section: Why CropSentinel */}
      <section className="w-full bg-kraft-paper pt-120 px-32 lg:px-64">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32 lg:gap-64">
            
            {/* Box 1 */}
            <div className="bg-white rounded-[24px] p-48 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-[8px] transition-all duration-300 cursor-pointer group">
              <div className="w-[64px] h-[64px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-32 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[32px] text-board-green">analytics</span>
              </div>
              <h3 className="font-display text-[24px] font-semibold text-soil-ink mb-16">Real prices, every day.</h3>
              <p className="text-soil-ink opacity-70 text-[16px] leading-relaxed">Pulled straight from 3,000+ government-tracked markets, not word of mouth.</p>
            </div>

            {/* Box 2 */}
            <div className="bg-white rounded-[24px] p-48 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-[8px] transition-all duration-300 cursor-pointer group">
              <div className="w-[64px] h-[64px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-32 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[32px] text-board-green">chat</span>
              </div>
              <h3 className="font-display text-[24px] font-semibold text-soil-ink mb-16">Ask, don't dig.</h3>
              <p className="text-soil-ink opacity-70 text-[16px] leading-relaxed">Type or speak your crop and quantity — get a straight answer back.</p>
            </div>

            {/* Box 3 */}
            <div className="bg-white rounded-[24px] p-48 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-[8px] transition-all duration-300 cursor-pointer group">
              <div className="w-[64px] h-[64px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-32 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[32px] text-board-green">notifications_active</span>
              </div>
              <h3 className="font-display text-[24px] font-semibold text-soil-ink mb-16">We warn you first.</h3>
              <p className="text-soil-ink opacity-70 text-[16px] leading-relaxed">If a crop you're tracking is about to crash, you hear about it before it happens.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="w-full bg-kraft-paper pt-120 pb-120 px-32 lg:px-64 text-center">
        <h2 className="font-display text-[48px] lg:text-[64px] font-semibold text-soil-ink leading-[1.1] max-w-[1000px] mx-auto tracking-tight">
          3,000+ markets. One farmer. No time to check them all.
        </h2>
      </section>

      {/* How it Works Timeline */}
      <section id="how-it-works" className="w-full bg-[#F9F6F0] py-120 px-32 lg:px-64 border-y border-stone/10">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="text-stone uppercase text-[14px] font-bold tracking-[0.2em] mb-64 text-center">
            [01] How It Works
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-stone/20 -z-10"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center bg-[#F9F6F0] px-16 mb-64 md:mb-0 relative group w-[220px]">
              <div className="w-[96px] h-[96px] rounded-full bg-white border border-stone/20 flex items-center justify-center mb-24 shadow-sm group-hover:border-board-green group-hover:shadow-md transition-all duration-300">
                <span className="material-symbols-outlined text-[40px] text-board-green">download</span>
              </div>
              <span className="text-[18px] text-soil-ink font-semibold mb-8">Gather data</span>
              <p className="text-[14px] text-soil-ink opacity-70 leading-snug">Scraping 3,000+ government mandi records daily.</p>
            </div>
            
            {/* Arrow (Desktop) */}
            <div className="hidden md:flex text-stone/40 mb-[40px]">
               <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center bg-[#F9F6F0] px-16 mb-64 md:mb-0 relative group w-[220px]">
              <div className="w-[96px] h-[96px] rounded-full bg-white border border-stone/20 flex items-center justify-center mb-24 shadow-sm group-hover:border-board-green group-hover:shadow-md transition-all duration-300">
                <span className="material-symbols-outlined text-[40px] text-board-green">cleaning_services</span>
              </div>
              <span className="text-[18px] text-soil-ink font-semibold mb-8">Clean it</span>
              <p className="text-[14px] text-soil-ink opacity-70 leading-snug">Standardizing crop names and fixing missing units.</p>
            </div>

            {/* Arrow (Desktop) */}
            <div className="hidden md:flex text-stone/40 mb-[40px]">
               <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center bg-[#F9F6F0] px-16 mb-64 md:mb-0 relative group w-[220px]">
              <div className="w-[96px] h-[96px] rounded-full bg-white border border-stone/20 flex items-center justify-center mb-24 shadow-sm group-hover:border-board-green group-hover:shadow-md transition-all duration-300">
                <span className="material-symbols-outlined text-[40px] text-board-green">monitoring</span>
              </div>
              <span className="text-[18px] text-soil-ink font-semibold mb-8">Predict prices</span>
              <p className="text-[14px] text-soil-ink opacity-70 leading-snug">Using GPU-accelerated cuDF for instant trend forecasting.</p>
            </div>

            {/* Arrow (Desktop) */}
            <div className="hidden md:flex text-stone/40 mb-[40px]">
               <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center bg-[#F9F6F0] px-16 relative group w-[220px]">
              <div className="w-[96px] h-[96px] rounded-full bg-white border border-stone/20 flex items-center justify-center mb-24 shadow-sm group-hover:border-board-green group-hover:shadow-md transition-all duration-300">
                <span className="material-symbols-outlined text-[40px] text-board-green">campaign</span>
              </div>
              <span className="text-[18px] text-soil-ink font-semibold mb-8">Tell the farmer</span>
              <p className="text-[14px] text-soil-ink opacity-70 leading-snug">Delivering clear, actionable insights via simple chat.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Acceleration Race */}
      <section className="w-full bg-kraft-paper pt-120 pb-120 px-32 lg:px-64 text-center">
        <div className="w-full max-w-[800px] mx-auto">
          <div className="bg-white rounded-[24px] p-48 border border-stone/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-48 flex flex-col items-center w-full">
             <div className="w-full flex items-center justify-between mb-24">
               <span className="text-[16px] font-bold text-soil-ink w-[120px] text-left">cuDF (GPU)</span>
               <div className="flex-1 mx-24 h-[12px] bg-board-green rounded-full relative overflow-hidden">
                 <div className="absolute inset-y-0 left-0 bg-[#000000]/20" style={{ width: '10%' }}></div>
               </div>
               <span className="text-[16px] text-stone font-data font-bold w-[60px] text-right">0.4s</span>
             </div>
             <div className="w-full flex items-center justify-between">
               <span className="text-[16px] font-bold text-soil-ink w-[120px] text-left">Pandas (CPU)</span>
               <div className="flex-1 mx-24 h-[12px] bg-chili-vermillion rounded-full"></div>
               <span className="text-[16px] text-stone font-data font-bold w-[60px] text-right">14.2s</span>
             </div>
          </div>
          <p className="text-[24px] font-semibold text-soil-ink mb-16">See it prove itself, live</p>
          <Link to="/race" className="text-board-green text-[18px] font-bold hover:underline transition-all">View the full race →</Link>
        </div>
      </section>

      {/* Footer Section exactly 300px height */}
      <footer className="w-full h-[300px] bg-board-green text-kraft-paper flex flex-col justify-center px-32 lg:px-64 relative overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center h-full">
          
          {/* Left: Try it yourself */}
          <div className="flex flex-col items-center md:items-start mb-32 md:mb-0">
            <h2 className="font-display text-[32px] font-semibold mb-24">Try it yourself.</h2>
            <div className="flex gap-16">
              <Link to="/ask" className="bg-turmeric-gold text-soil-ink px-24 py-12 rounded-full font-bold flex items-center gap-8 hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg">
                Ask CropSentinel <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/admin/login" className="border border-kraft-paper text-kraft-paper px-24 py-12 rounded-full font-bold hover:bg-white hover:text-board-green transition-colors">
                See Dashboard
              </Link>
            </div>
          </div>

          {/* Right: Branding & Links */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right pt-24">
            <div className="mb-8">
              <img src="/logo-cs.png" alt="CropSentinel Logo" className="h-[64px] w-auto object-contain" />
            </div>
            <div className="opacity-80 text-[14px] mb-24 max-w-[300px]">
              Real prices, straight answers, for every farmer with a truck to fill.
            </div>
            <div className="flex gap-24 text-[14px] font-bold">
              <a href="#about" className="hover:text-turmeric-gold transition-colors">About</a>
              <a href="https://github.com/CropSentinel/docs" className="hover:text-turmeric-gold transition-colors">Read the technical docs</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;
