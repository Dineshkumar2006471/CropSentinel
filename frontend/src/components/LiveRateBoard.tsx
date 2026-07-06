import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ForecastData {
  commodity: string;
  mandi: string;
  price: number;
  trend: number;
}

const LiveRateBoard = () => {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/forecast/top-movers").then(res => {
        if (!res.ok) throw new Error("Failed to fetch forecasts");
        return res.json();
      }),
      fetch("/api/dashboard/metrics").then(res => {
        if (!res.ok) return { data_freshness: "daily" }; // fallback
        return res.json();
      })
    ])
    .then(([forecastData, metricsData]) => {
      setForecasts(forecastData);
      if (metricsData && metricsData.data_freshness) {
        setLastSynced(metricsData.data_freshness);
      }
      setLoading(false);
    })
    .catch(() => {
      setError("Unable to connect to live market data.");
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full bg-board-green h-[120px] flex flex-col justify-center px-32 lg:px-64 relative overflow-hidden border-y border-stone/20">
      <div className="text-[#E9DFC4] font-body text-[14px] mb-8 opacity-80">
        Live Rate Board — Data last synced: {lastSynced}
      </div>
      
      {loading ? (
        <div className="text-white font-data animate-pulse">Loading live prices...</div>
      ) : error ? (
        <div className="text-[#BF3C2B] font-data font-bold">{error}</div>
      ) : (
        <div className="flex gap-48 items-center overflow-hidden whitespace-nowrap">
          <div className="flex animate-[marquee_20s_linear_infinite] gap-48 text-white font-data text-[18px]">
            {forecasts.map((f, i) => (
              <div key={i} className="flex items-center gap-16">
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
            {/* Duplicate for smooth infinite scroll */}
            {forecasts.map((f, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-16">
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
