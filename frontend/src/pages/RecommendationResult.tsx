

const RecommendationResult = () => {
  return (
    <>
      
{/* TopAppBar */}
<header className="bg-surface/80 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-50"><div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-touch-target-min">
<div className="flex items-center gap-2">
<button className="text-primary hover:bg-surface-variant/50 transition-colors scale-95 active:scale-90 transition-transform w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full">
<span className="material-symbols-outlined" data-icon="close">close</span>
</button>
<h1 className="font-display text-headline-md font-bold text-primary">CropSentinel</h1>
</div>
<div className="flex items-center gap-2">
<button className="px-3 h-8 rounded-full border border-outline-variant text-label-md font-label-md text-primary hover:bg-surface-container-low transition-colors flex items-center justify-center">
EN/HI
</button>
</div>
</div></header>
{/* Main Content Area - Result Card Layout */}
<main className="flex-grow flex flex-col relative z-10">
{/* Verdict Banner (Top 30% area representation) */}
<div className="bg-primary pt-8 pb-16 px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center shadow-lg relative z-0">
<span className="material-symbols-outlined text-on-primary text-6xl mb-4" style={{"fontVariationSettings":"'FILL' 1"}}>sell</span>
<h2 className="font-display text-display text-on-primary">SELL TODAY</h2>
<p className="font-body-lg text-primary-fixed mt-2 opacity-90">Optimal Market Conditions Detected</p>
</div>
{/* Overlapping Content Card */}
<div className="flex-grow px-margin-mobile md:px-margin-desktop -mt-8 relative z-20 pb-safe">
<div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(21,68,43,0.1)] p-stack-lg border border-outline-variant/30 max-w-md mx-auto backdrop-blur-lg bg-surface-container-lowest/90">
{/* Explanation */}
<div className="mb-stack-lg flex items-start gap-3">
<span className="material-symbols-outlined text-warning-amber mt-1" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>trending_down</span>
<p className="font-body-lg text-on-surface leading-relaxed">
                        Prices are expected to drop <span className="font-bold text-error">15%</span> in the next 3 days due to high arrivals in Warangal.
                    </p>
</div>
<hr className="border-t border-outline-variant/30 mb-stack-lg" />
{/* Data Grid */}
<div className="grid grid-cols-2 gap-gutter mb-stack-lg">
<div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 flex flex-col justify-center">
<span className="font-label-md text-label-md text-on-surface-variant mb-1">Predicted Price</span>
<span className="font-headline-md text-headline-md text-primary">₹2,400<span className="text-sm font-normal text-on-surface-variant">/q</span></span>
</div>
<div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 flex flex-col justify-center">
<span className="font-label-md text-label-md text-on-surface-variant mb-1">AI Confidence</span>
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-primary">92%</span>
<span className="material-symbols-outlined text-primary text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>verified</span>
</div>
</div>
</div>
{/* Actions */}
<div className="flex flex-col gap-stack-sm mt-stack-lg">
<button className="w-full bg-primary text-on-primary h-touch-target-min rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:bg-primary-container transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="location_on">location_on</span>
                        View on Map
                    </button>
<button className="w-full bg-transparent border-2 border-outline-variant text-on-surface h-touch-target-min rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="notifications">notifications</span>
                        Track this Crop
                    </button>
</div>
<div className="mt-4 text-center">
<p className="font-caption text-caption text-on-surface-variant">Last updated: Just now</p>
</div>
</div>
</div>
</main>



    </>
  );
};

export default RecommendationResult;
