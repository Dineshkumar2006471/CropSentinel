import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../services/api';
import type { TopMover } from '../services/api';

const LiveRateBoard = () => {
  const [forecasts, setForecasts] = useState<TopMover[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getTopMovers(),
      api.getDashboardMetrics().catch(() => null),
    ])
    .then(([forecastData, metricsData]) => {
      setForecasts(forecastData);
      if (metricsData && 'data_freshness' in metricsData) {
        setLastSynced((metricsData as Record<string, string>).data_freshness);
      }
      setLoading(false);
    })
    .catch(() => {
      setError("Unable to connect to live market data.");
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full bg-board-green h-[120px] flex flex-col justify-center px-16 md:px-32 lg:px-64 relative overflow-hidden border-y border-stone/20">
      <div className="text-[#E9DFC4] font-body text-[14px] mb-8 opacity-80">
        Live Rate Board — Data last synced: {lastSynced}
      </div>
      
      {loading ? (
        <div className="text-white font-data animate-pulse" role="status" aria-label="Loading live prices">Loading live prices...</div>
      ) : error ? (
        <div className="text-[#BF3C2B] font-data font-bold" role="alert">{error}</div>
      ) : forecasts.length === 0 ? (
        <div className="text-[#E9DFC4] font-data">No live price data available.</div>
      ) : (
        <div className="flex gap-48 items-center overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-48 text-white font-data text-[18px]">
            {forecasts.map((f, i) => (
              <div key={i} className="flex items-center gap-16">
                <span className="font-bold text-[#E9DFC4]">{f.commodity}</span>
                <span className="text-stone">—</span>
                <span>{f.mandi}</span>
                <span className="text-stone">—</span>
                <span className="font-bold">₹{f.price.toFixed(2)}/q</span>
                <span className={`font-bold flex items-center ${f.trend > 0 ? 'text-turmeric-gold' : 'text-[#BF3C2B]'}`}>
                  {f.trend > 0 ? <ArrowUp size={16} className="mr-4" aria-hidden="true" /> : <ArrowDown size={16} className="mr-4" aria-hidden="true" />}
                  {Math.abs(f.trend).toFixed(1)}%
                </span>
              </div>
            ))}
            {/* Duplicate for smooth infinite scroll */}
            {forecasts.map((f, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-16" aria-hidden="true">
                <span className="font-bold text-[#E9DFC4]">{f.commodity}</span>
                <span className="text-stone">—</span>
                <span>{f.mandi}</span>
                <span className="text-stone">—</span>
                <span className="font-bold">₹{f.price.toFixed(2)}/q</span>
                <span className={`font-bold flex items-center ${f.trend > 0 ? 'text-turmeric-gold' : 'text-[#BF3C2B]'}`}>
                  {f.trend > 0 ? <ArrowUp size={16} className="mr-4" /> : <ArrowDown size={16} className="mr-4" />}
                  {Math.abs(f.trend).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRateBoard;
