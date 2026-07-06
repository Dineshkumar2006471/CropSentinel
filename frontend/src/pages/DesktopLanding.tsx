
const DesktopLanding = () => {
  return (
    <>
      
{/* TopAppBar */}
<header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-50"><div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-touch-target-min">
    <div className="flex items-center gap-2">
        <div className="flex items-center gap-stack-sm hover:bg-surface-variant/50 transition-colors scale-95 active:scale-90 transition-transform rounded-full p-2 cursor-pointer md:hidden">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="menu">menu</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">eco</span>
            <span className="font-display text-headline-md font-bold text-primary dark:text-primary-fixed tracking-tight">CropSentinel</span>
        </div>
    </div>
    <nav className="hidden md:flex items-center gap-stack-lg font-label-md text-label-md text-on-surface-variant">
        <a className="hover:text-primary transition-colors" href="#">Home</a>
        <a className="hover:text-primary transition-colors" href="#">Mandi</a>
        <a className="hover:text-primary transition-colors" href="#">Alerts</a>
        <a className="hover:text-primary transition-colors" href="#">Chat</a>
    </nav>
    <div className="flex items-center gap-2">
        <div className="flex items-center gap-stack-sm hover:bg-surface-variant/50 transition-colors scale-95 active:scale-90 transition-transform rounded-full p-2 cursor-pointer text-on-surface-variant">
            <span className="material-symbols-outlined" data-icon="translate">translate</span>
        </div>
        <div className="flex items-center gap-stack-sm hover:bg-surface-variant/50 transition-colors scale-95 active:scale-90 transition-transform rounded-full p-2 cursor-pointer text-on-surface-variant">
            <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
        </div>
    </div>
</div></header>
<main>
{/* Hero Section */}
<section className="relative h-[500px] grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-background"><div className="flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-12 z-10">
    <h1 className="font-display text-headline-lg-mobile md:text-display text-primary mb-stack-sm tracking-tight">
        AI-Powered Mandi Prices
    </h1>
    <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-md">
        Know when to sell. Know where to sell.
    </p>
    <div className="flex flex-row items-center gap-4">
        <button className="px-6 h-12 bg-primary text-on-primary font-label-md text-body-md rounded-full shadow-md hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
            <span className="">Farmer</span>
            <span className="material-symbols-outlined">agriculture</span>
        </button>
        <button className="px-6 h-12 border-2 border-primary text-primary font-label-md text-body-md rounded-full hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2">
            <span className="">Official</span>
            <span className="material-symbols-outlined">analytics</span>
        </button>
    </div>
</div>
<div className="relative h-full w-full hidden md:block">
    <div className="bg-cover bg-center w-full h-full" style={{"backgroundImage":"url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_opWu-URlvOFPiJOI5KXMcWvFXkamuaiv4Vsj_iQ-NSMaoxdjRAbC7KE1bujx8Q7y5wdiK6AoJ52ifiIk7PFuKgcYF-Tuf2voFhXSkYhwn--qnP80rNb0YgBPFjCuMZJ8-iI-Tq_3BPk2VqZ2OgsuvXFW1ywdoj5072qlRzHI0R7FpvO-Un2UoNry6oHaXsref7MiXu-m4z_qgTuPNcym0RuQMHQFPpYDFQEjLo6_cH0lxgsB4P9fQcRMGjq_Kr8T0rW9dfL1lHM')"}}></div>
</div></section>
{/* Features Section */}
<section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
<div className="max-w-6xl mx-auto">
<div className="text-center mb-16">
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">Intelligent Farming Decisions</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Actionable insights tailored to your local market, designed for both intuitive understanding and deep analysis.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
{/* Feature 1 */}
<div className="bg-surface-container-low rounded-xl p-stack-lg shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center mb-stack-md text-primary-container">
<span className="material-symbols-outlined text-[28px]">monitoring</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">Market Prediction</h3>
<p className="font-body-md text-body-md text-on-surface-variant">AI-driven forecasts to help you anticipate price trends and decide the optimal time to bring your harvest to market.</p>
</div>
{/* Feature 2 */}
<div className="bg-surface-container-low rounded-xl p-stack-lg shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-stack-md text-secondary">
<span className="material-symbols-outlined text-[28px]">warning</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">Localized Risk Alerts</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Stay ahead of localized weather disruptions, pest threats, and sudden market volatility with timely notifications.</p>
</div>
{/* Feature 3 */}
<div className="bg-surface-container-low rounded-xl p-stack-lg shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-full bg-action-blue/10 flex items-center justify-center mb-stack-md text-action-blue">
<span className="material-symbols-outlined text-[28px]">compare_arrows</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">Mandi Price Comparison</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Compare real-time rates across neighboring Mandis to ensure you secure the best possible value for your produce.</p>
</div>
</div>
</div>
</section>
{/* Social Proof Section */}

</main>
<footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-12 px-margin-mobile md:px-margin-desktop">
<div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-stack-lg">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[32px]">eco</span>
<span className="font-display text-headline-md font-bold text-primary tracking-tight">CropSentinel</span>
</div>
<div className="flex flex-wrap justify-center gap-stack-lg font-label-md text-label-md text-on-surface-variant">
<a className="hover:text-primary transition-colors" href="#">About Us</a>
<a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
<a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
<a className="hover:text-primary transition-colors" href="#">Contact</a>
</div>
<div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md cursor-pointer hover:bg-surface-variant/50 p-2 rounded-lg transition-colors">
<span className="material-symbols-outlined text-[20px]">language</span>
<span className="">English (IN)</span>
</div>
</div>
</footer>





    </>
  );
};

export default DesktopLanding;
