import { Link } from 'react-router-dom';

const MobileLanding = () => {
  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-transparent">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-headline-md font-bold text-on-primary drop-shadow-md tracking-tight">CropSentinel</h1>
        </div>
        <button aria-label="Toggle Language" className="flex items-center gap-1 bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/30 text-on-primary transition-colors h-touch-target-min">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>translate</span>
          <span className="font-label-md text-label-md">EN/HI</span>
        </button>
      </header>
      
      <main className="flex-grow relative flex flex-col w-full h-full min-h-screen">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8M1gwe-3FDAD9CGGipul3awgQGTvoFXq5uvUCbyzhIuUpm17z7OBcL6A2SF938SCP_aizrT8hDac6PfFE8iqG44HmP-IYZoq0K8VS9FsSEaz3JZNMLZ4fwVGzdC2jadji_YPHDtmyQuC4JtHcW7wMoS9AOqDBah-e7jJF_L2Ot5npvozrzbbFbDK1Vh-JyHaztQCGpnDaCh0Odgm6TpOxYp4oYX2bYKCWV5ircc745NlVXBvnnr2p5wxgbFwiOot83DfK1gbPW5k')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-inverse-surface/80 via-inverse-surface/60 to-inverse-surface/90"></div>
        </div>
        
        <div className="relative z-10 flex-grow flex flex-col justify-end pb-12 px-margin-mobile md:px-margin-desktop md:justify-center md:items-center max-w-4xl mx-auto w-full">
          <div className="text-center md:text-center mb-stack-lg animate-fade-in-up w-full">
            <h2 className="font-display text-display text-on-primary mb-stack-sm md:mb-stack-md leading-tight drop-shadow-lg">
              AI-Powered Mandi Prices
            </h2>
            <p className="font-body-lg text-body-lg text-surface-container-lowest/90 font-medium max-w-2xl mx-auto drop-shadow-md">
              Know when to sell. Know where to sell.
            </p>
          </div>
          
          <div className="flex flex-col gap-stack-md w-full max-w-md mx-auto mt-stack-lg">
            <Link to="/ask" className="pulse-btn group w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90 transition-all duration-300 rounded-hero h-16 flex items-center justify-center gap-3 shadow-xl active:scale-95 border border-primary-fixed-dim/30 backdrop-blur-sm">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              <span className="font-headline-md text-headline-md font-semibold tracking-wide">I am a Farmer</span>
            </Link>
            
            <Link to="/desktop" className="w-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 backdrop-blur-md border border-outline-variant text-on-primary transition-all duration-300 rounded-hero h-14 flex items-center justify-center gap-2 shadow-md active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>badge</span>
              <span className="font-label-md text-label-md font-medium tracking-wide">Official / FPO Login</span>
            </Link>
          </div>
          
          <div className="mt-8 text-center text-on-primary/60 font-caption text-caption">
            <p>Empowering agricultural stewardship through data.</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default MobileLanding;
