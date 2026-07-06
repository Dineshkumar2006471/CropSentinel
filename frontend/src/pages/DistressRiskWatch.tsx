import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const DistressRiskWatch = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [topMovers, setTopMovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, briefData, moversRes] = await Promise.all([
          api.getDashboardMetrics(),
          api.getDashboardAIBrief(),
          fetch('/api/forecast/top-movers')
        ]);
        const moversData = await moversRes.json();
        
        setMetrics(metricsData);
        setAiBrief(briefData);
        setTopMovers(moversData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load real-time data from the backend. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
       {/* Main Content */}
       <main className="flex-1 p-16 md:p-32 lg:p-48 max-w-[1400px]">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-24 lg:mb-48 gap-16 lg:gap-0">
            <div className="flex flex-col gap-4 lg:gap-8">
              <h1 className="font-display font-bold text-[32px] lg:text-[40px] text-soil-ink leading-none tracking-tight">Mandi Overview</h1>
              <p className="text-[14px] lg:text-[16px] text-stone">Analytics Dashboard powered by BigQuery & cuDF</p>
            </div>
            
            <div className="flex items-center gap-8 bg-white border border-stone/20 rounded-full px-16 py-12 shadow-sm">
              <span className="material-symbols-outlined text-[20px] text-stone">calendar_month</span>
              <span className="text-[13px] font-bold text-soil-ink">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-64">
              <span className="material-symbols-outlined text-[48px] text-board-green animate-spin mb-16">progress_activity</span>
              <p className="text-[14px] text-stone font-medium">Connecting to real-time database...</p>
            </div>
          ) : error ? (
            <div className="bg-chili-vermillion/10 border border-chili-vermillion/20 rounded-[12px] p-24 flex items-center gap-16">
              <span className="material-symbols-outlined text-[32px] text-chili-vermillion">error</span>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-chili-vermillion">Connection Error</span>
                <span className="text-[14px] text-chili-vermillion/80">{error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* 6 Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-16 mb-24 lg:mb-48">
                
                {/* 1. TOTAL FARMERS */}
                <div className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col">
                  <span className="text-[11px] font-bold text-stone uppercase tracking-widest mb-16">TOTAL FARMERS</span>
                  <span className="font-body font-bold text-[28px] lg:text-[36px] text-soil-ink leading-none mb-16">{metrics.total_farmers.value}</span>
                  <div className="flex items-center gap-4 text-[13px] font-bold text-board-green">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span> {metrics.total_farmers.subtitle}
                  </div>
                </div>

                {/* 2. CROPS TRACKED */}
                <div className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col">
                  <span className="text-[11px] font-bold text-stone uppercase tracking-widest mb-16">CROPS TRACKED</span>
                  <span className="font-body font-bold text-[28px] lg:text-[36px] text-soil-ink leading-none mb-16">{metrics.crops_tracked.value}</span>
                  <div className="flex items-center gap-4 text-[13px] font-medium text-stone">
                    {metrics.crops_tracked.subtitle}
                  </div>
                </div>

                {/* 3. ALERTS GENERATED */}
                <div className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col">
                  <span className="text-[11px] font-bold text-stone uppercase tracking-widest mb-16">ALERTS GENERATED</span>
                  <span className="font-body font-bold text-[28px] lg:text-[36px] text-soil-ink leading-none mb-16">{metrics.alerts_generated.value}</span>
                  <div className="flex items-center gap-4 text-[13px] font-bold text-board-green">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span> {metrics.alerts_generated.subtitle}
                  </div>
                </div>

                {/* 4. DISTRESS MARKETS */}
                <div className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col">
                  <span className="text-[11px] font-bold text-stone uppercase tracking-widest mb-16">DISTRESS MARKETS</span>
                  <span className="font-body font-bold text-[28px] lg:text-[36px] text-chili-vermillion leading-none mb-16">{metrics.distress_markets.value}</span>
                  <div className="flex items-center gap-4 text-[12px] font-bold text-chili-vermillion bg-chili-vermillion/10 px-8 py-4 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">warning</span> {metrics.distress_markets.subtitle}
                  </div>
                </div>

                {/* 5. PREDICTION ACCURACY */}
                <div className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col">
                  <span className="text-[11px] font-bold text-stone uppercase tracking-widest mb-16">PREDICTION ACCURACY</span>
                  <span className="font-body font-bold text-[28px] lg:text-[36px] text-soil-ink leading-none mb-16">{metrics.prediction_accuracy.value}</span>
                  <div className="flex items-center gap-4 text-[13px] font-bold text-board-green">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> {metrics.prediction_accuracy.subtitle}
                  </div>
                </div>
              </div>

              {/* Lower Section (Top Movers & AI Brief) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-32">
                
                {/* Data Table */}
                <div className="lg:col-span-2 bg-white rounded-[12px] border border-stone/10 overflow-hidden shadow-sm flex flex-col">
                  <div className="px-32 py-24 flex justify-between items-center border-b border-stone/10 bg-[#F9F9F9]">
                    <h3 className="font-display font-bold text-[20px] text-soil-ink flex items-center gap-8">
                      Top Market Movements <span className="material-symbols-outlined text-board-green text-[18px]">trending_up</span>
                    </h3>
                  </div>
                  
                  <div className="flex-1 w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone/10">
                          <th className="px-32 py-16 text-[12px] font-bold text-stone uppercase tracking-widest bg-white">Commodity</th>
                          <th className="px-32 py-16 text-[12px] font-bold text-stone uppercase tracking-widest bg-white">Market</th>
                          <th className="px-32 py-16 text-[12px] font-bold text-stone uppercase tracking-widest bg-white text-right">Live Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone/5">
                        {topMovers.length > 0 ? topMovers.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone/5 transition-colors">
                            <td className="px-32 py-16">
                              <span className="font-bold text-soil-ink">{item.commodity}</span>
                            </td>
                            <td className="px-32 py-16 text-[14px] text-stone">
                              {item.mandi}
                            </td>
                            <td className="px-32 py-16 text-right">
                              <span className="font-mono font-bold text-board-green text-[15px]">₹{item.price}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-32 py-32 text-center text-stone text-[14px]">Loading live market movements...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Brief */}
                <div className="bg-white rounded-[12px] border border-stone/10 shadow-sm flex flex-col h-full border-t-[4px] border-t-turmeric-gold">
                  <div className="px-32 py-32 flex-1">
                    <h3 className="font-display font-bold text-[18px] text-soil-ink flex items-center gap-12 mb-32">
                      <span className="material-symbols-outlined text-turmeric-gold text-[24px]">auto_awesome</span>
                      AI Brief — {aiBrief.date_week}
                    </h3>

                    <div className="flex flex-col gap-24">
                      <p className="text-[14px] text-stone leading-relaxed">
                        <strong className="text-soil-ink font-bold font-display">Anomaly Detected:</strong> {aiBrief.anomaly_detected}
                      </p>
                      
                      <p className="text-[14px] text-stone leading-relaxed">
                        <strong className="text-soil-ink font-bold font-display">Recommendation:</strong> {aiBrief.recommendation}
                      </p>
                      
                      <p className="text-[14px] text-stone leading-relaxed">
                        <strong className="text-soil-ink font-bold font-display">Alert:</strong> {aiBrief.alert}
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-32 py-24 border-t border-stone/10 flex items-center justify-between bg-[#F9F9F9]">
                    <span className="text-[12px] text-stone font-display">Generated by CropSentinel Analytics Agent</span>
                    <button className="text-[13px] font-bold text-board-green hover:underline font-display">View Full Report</button>
                  </div>
                </div>

              </div>
            </>
          )}

       </main>
    </AdminLayout>
  );
};

export default DistressRiskWatch;
