
const MarketHeatmap = () => {
  return (
    <>
      
{/* Mobile Top App Bar */}
<header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div className="font-display text-headline-md font-bold text-primary tracking-tight">CropSentinel</div>
  </div>
  <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
    <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Home</a>
    <a href="#" className="font-label-md text-label-md text-primary font-bold">Mandi</a>
    <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Alerts</a>
    <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Chat</a>
  </nav>
  <div className="flex items-center gap-4">
    <button className="text-on-surface-variant hover:bg-surface-variant/50 transition-colors p-2 rounded-full">
      <span className="material-symbols-outlined">translate</span>
    </button>
    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
      <span className="material-symbols-outlined text-[20px]">person</span>
    </div>
  </div>
</header>
{/* Desktop Navigation Drawer */}

{/* Main Content Area */}
<main className="flex-1 p-margin-mobile md:p-margin-desktop min-h-screen flex flex-col pb-24 md:pb-margin-desktop pt-16">
{/* Header */}
<div className="mb-stack-lg flex justify-between items-end">
<div>
<h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary font-bold">Market Heatmap</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time risk visualization across districts.</p>
</div>
<div className="hidden md:flex gap-4">
<button className="px-4 py-2 border border-outline rounded-lg text-primary font-label-md text-label-md hover:bg-surface-variant/50 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                </button>
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[18px]">download</span> Export Report
                </button>
</div>
</div>
{/* Split View Layout */}
<div className="flex-1 flex flex-col xl:flex-row gap-stack-lg min-h-[600px]">
{/* Left Panel: Map (70%) */}
<div className="w-full xl:w-[70%] bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden relative flex flex-col">
<div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-gray">
<h3 className="font-headline-md text-body-lg font-semibold text-primary">Northern Sector Overview</h3>
<div className="flex items-center gap-2 font-caption text-caption">
<span className="w-3 h-3 rounded-full bg-primary block"></span> Stable
                        <span className="w-3 h-3 rounded-full bg-warning-amber block ml-2"></span> Monitor
                        <span className="w-3 h-3 rounded-full bg-error block ml-2"></span> High Risk
                    </div>
</div>
<div className="flex-1 relative w-full h-full bg-[#E5E9E5]">
{/* Map Placeholder Image */}
<img className="absolute inset-0 w-full h-full object-cover opacity-80" data-alt="A top-down view of a highly detailed, modern digital choropleth map of an agricultural region. The map is rendered in a minimalist, clean corporate style. Districts are shaded in varying tones of primary deep green, warning amber, and terracotta red to indicate risk levels. Subtle glowing borders separate regions. High-end data visualization aesthetic, soft shadows." data-location="India Northern Region" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALlv3URYxR9x6JJuI1pavbA1OmUV8wzrhAVbQYIX9DhM0X32uPiLFpsi8WEjJnJHSKJsQ9eFgKi7-Y4sXQBwfu51Yo5xg5FtSVn8-XAZuQoqs5sM-wcFk2fA9xF4ZJgG3hDbMW6Ij8-xGnCMD7yY_4tdhAiLzWCnFFGCjameEFz0pAh6LGS0kuXOi4C0Qu926t4ov-DhCN2xMSaNIEftzl6UmAWBBeCO-9Xgsmgzn05mwalApAqkI_yRULcvYLv-1FE-0jko35T1o" />
{/* Overlay Elements for realism */}
<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
{/* Floating Map Controls */}
<div className="absolute right-4 bottom-4 flex flex-col gap-2 glass-panel rounded-lg p-1">
<button className="p-2 hover:bg-surface-variant/50 rounded flex items-center justify-center text-primary"><span className="material-symbols-outlined">add</span></button>
<div className="w-full h-px bg-outline-variant/30"></div>
<button className="p-2 hover:bg-surface-variant/50 rounded flex items-center justify-center text-primary"><span className="material-symbols-outlined">remove</span></button>
</div>
{/* Example Interactive Tooltip / Marker (simulated) */}
<div className="absolute top-[40%] left-[30%] cursor-pointer group">
<div className="w-4 h-4 bg-error rounded-full border-2 border-white shadow-md animate-pulse"></div>
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass-panel rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
<h4 className="font-label-md text-label-md font-bold text-on-surface">District 4 (Red Zone)</h4>
<p className="font-caption text-caption text-error font-medium mt-1">Crash Risk: High</p>
<p className="font-caption text-caption text-on-surface-variant mt-1">Wheat prices -12% in 48h</p>
</div>
</div>
<div className="absolute top-[60%] left-[60%] cursor-pointer group">
<div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 glass-panel rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
<h4 className="font-label-md text-label-md font-bold text-on-surface">District 7 (Stable)</h4>
<p className="font-caption text-caption text-primary font-medium mt-1">Normal Trading</p>
</div>
</div>
</div>
</div>
{/* Right Panel: Top Risky Mandis (30%) */}
<div className="w-full xl:w-[30%] flex flex-col gap-stack-md">
<div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-4 sticky top-stack-lg">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-error" style={{"fontVariationSettings":"'FILL' 1"}}>warning</span>
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Top Risky Mandis</h3>
</div>
<p className="font-caption text-caption text-on-surface-variant mb-4">Markets experiencing significant recent price drops.</p>
<div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
{/* Risky Card 1 */}
<div className="glass-panel rounded-lg p-4 cursor-pointer hover:border-error/50 transition-colors border border-error/20 bg-error-container/20">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-label-md text-label-md font-bold text-on-surface">Azadpur Mandi</h4>
<p className="font-caption text-caption text-on-surface-variant">District 4</p>
</div>
<span className="bg-error text-on-error font-caption text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">Critical</span>
</div>
<div className="flex justify-between items-end mt-3">
<div>
<p className="font-caption text-caption text-on-surface-variant mb-1">Commodity: Wheat</p>
<p className="font-headline-lg text-body-lg font-bold text-error flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">arrow_downward</span> ₹2,100/q
                                    </p>
</div>
<div className="text-right">
<p className="font-caption text-caption text-error font-semibold">-12.4% (48h)</p>
</div>
</div>
</div>
{/* Risky Card 2 */}
<div className="glass-panel rounded-lg p-4 cursor-pointer hover:border-warning-amber/50 transition-colors border border-warning-amber/20 bg-warning-amber/5">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-label-md text-label-md font-bold text-on-surface">Karnal Market</h4>
<p className="font-caption text-caption text-on-surface-variant">District 2</p>
</div>
<span className="bg-warning-amber text-white font-caption text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">Monitor</span>
</div>
<div className="flex justify-between items-end mt-3">
<div>
<p className="font-caption text-caption text-on-surface-variant mb-1">Commodity: Rice (Basmati)</p>
<p className="font-headline-lg text-body-lg font-bold text-warning-amber flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">arrow_downward</span> ₹3,450/q
                                    </p>
</div>
<div className="text-right">
<p className="font-caption text-caption text-warning-amber font-semibold">-5.2% (24h)</p>
</div>
</div>
</div>
{/* Risky Card 3 */}
<div className="glass-panel rounded-lg p-4 cursor-pointer hover:border-warning-amber/50 transition-colors border border-warning-amber/20 bg-warning-amber/5">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-label-md text-label-md font-bold text-on-surface">Rohtak Mandi</h4>
<p className="font-caption text-caption text-on-surface-variant">District 6</p>
</div>
<span className="bg-warning-amber text-white font-caption text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">Monitor</span>
</div>
<div className="flex justify-between items-end mt-3">
<div>
<p className="font-caption text-caption text-on-surface-variant mb-1">Commodity: Mustard</p>
<p className="font-headline-lg text-body-lg font-bold text-warning-amber flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">arrow_downward</span> ₹4,800/q
                                    </p>
</div>
<div className="text-right">
<p className="font-caption text-caption text-warning-amber font-semibold">-4.1% (72h)</p>
</div>
</div>
</div>
</div>
<button className="w-full mt-4 py-2 border border-outline rounded-lg text-primary font-label-md text-label-md hover:bg-surface-variant/50 transition-colors">
                        View Full Risk Report
                    </button>
</div>
</div>
</div>
</main>
{/* Mobile Bottom Nav Bar */}
<nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-gutter pb-safe bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30 shadow-lg rounded-t-xl docked full-width bottom-0">
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 ease-in-out cursor-pointer group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">home</span>
<span className="font-label-md text-[10px] mt-1">Home</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>map</span>
<span className="font-label-md text-[10px] mt-1 font-bold">Mandi</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 ease-in-out cursor-pointer group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
<span className="font-label-md text-[10px] mt-1">Alerts</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 ease-in-out cursor-pointer group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
<span className="font-label-md text-[10px] mt-1">Chat</span>
</a>
</nav>



    </>
  );
};

export default MarketHeatmap;
