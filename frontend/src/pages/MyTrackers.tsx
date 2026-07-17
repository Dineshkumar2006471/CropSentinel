import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';
import type { TrackerItem } from '../services/api';

const MyTrackers = () => {
  const [trackers, setTrackers] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTrackers();
      setTrackers(data.trackers || []);
    } catch (e: any) {
      console.error("Trackers connection error", e);
      setError("Failed to load trackers. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleAddTracker = async () => {
    const crop = window.prompt("Enter the name of the crop to track (e.g., Tomato, Potato, Apple):");
    if (!crop || crop.trim() === '') return;

    try {
      setLoading(true);
      await api.addTracker(crop.trim());
      await fetchTrackers();
    } catch (e: any) {
      console.error("Failed to add tracker", e);
      alert(`Failed to add tracker: ${e.message}`);
      setLoading(false);
    }
  };

  const handleRemoveTracker = async (commodity: string) => {
    try {
      setLoading(true);
      await api.deleteTracker(commodity);
      await fetchTrackers();
    } catch (e: any) {
      console.error("Failed to remove tracker", e);
      alert(`Failed to remove tracker: ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="flex-1 p-16 md:p-32 lg:p-48 max-w-[1400px] min-h-[calc(100vh-60px)] lg:min-h-screen flex flex-col">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 lg:mb-48 shrink-0 gap-16 lg:gap-0">
          <div className="flex flex-col gap-4 lg:gap-8">
            <h1 className="font-display font-bold text-[32px] lg:text-[40px] text-soil-ink leading-none tracking-tight">My Trackers</h1>
            <p className="text-[14px] lg:text-[16px] text-stone">Real-time alerts and tracking for your active commodities.</p>
          </div>
          <div className="flex gap-8 lg:gap-16 items-center w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
            <button className="flex items-center gap-8 bg-white border border-stone/20 text-soil-ink px-24 py-12 rounded-full font-bold text-[14px] hover:bg-stone/5 transition-colors shadow-sm" aria-label="SMS Settings">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
              SMS Settings
            </button>
            <button 
              onClick={handleAddTracker}
              className="flex items-center gap-8 bg-board-green text-kraft-paper px-24 py-12 rounded-full font-bold text-[14px] hover:bg-opacity-90 transition-colors shadow-sm"
              aria-label="Add Tracker"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
              Add Tracker
            </button>
          </div>
        </div>

        <div className="mb-24 lg:mb-48 bg-white border border-stone/10 rounded-[12px] shadow-sm p-16 lg:p-32">
          <h2 className="font-display text-[20px] font-bold text-soil-ink mb-16">Alert history — coming soon</h2>
          <div className="flex flex-col gap-12">
            <div className="flex items-center justify-center p-32 bg-[#F9F9F9] rounded-[8px] border border-stone/10 border-dashed">
              <span className="text-[14px] text-stone">Historical SMS alerts will appear here.</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-chili-vermillion/10 border border-chili-vermillion/20 rounded-[12px] p-24 flex items-center gap-16 mb-24 lg:mb-48" role="alert">
            <span className="material-symbols-outlined text-[32px] text-chili-vermillion" aria-hidden="true">error</span>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-chili-vermillion">Connection Error</span>
              <span className="text-[14px] text-chili-vermillion/80">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center" role="status" aria-label="Loading trackers">
            <span className="material-symbols-outlined text-[48px] text-board-green animate-spin mb-16" aria-hidden="true">progress_activity</span>
            <p className="text-[14px] text-stone">Syncing with live mandi database...</p>
          </div>
        ) : !error && trackers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border border-stone/10 rounded-[12px] p-48 text-center shadow-sm">
            <span className="material-symbols-outlined text-[64px] text-stone/30 mb-24" aria-hidden="true">notifications_off</span>
            <h2 className="font-display text-[24px] font-bold text-soil-ink mb-8">No Active Trackers</h2>
            <p className="text-[15px] text-stone max-w-[400px]">You aren't tracking any commodities right now. Add a tracker to get instant AI alerts on price drops.</p>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-24">
            {trackers.map((t, i) => (
              <div key={i} className="bg-white rounded-[12px] border border-stone/10 p-24 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-24">
                  <div className="w-[48px] h-[48px] bg-board-green/10 text-board-green rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">grass</span>
                  </div>
                  <span className="bg-board-green/10 text-board-green text-[11px] font-bold px-8 py-4 rounded-md uppercase tracking-wide">
                    {t.status}
                  </span>
                </div>
                
                <h3 className="font-display font-bold text-[24px] text-soil-ink mb-4">{t.commodity}</h3>
                <p className="text-[13px] text-stone mb-24">Tracking across all mandis</p>
                
                <div className="pt-24 border-t border-stone/10 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[12px] text-stone mb-4">Live Avg. Price</span>
                    <span className="font-bold text-[20px] text-soil-ink">{t.avg_price}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveTracker(t.commodity)}
                    className="text-[13px] font-bold text-chili-vermillion hover:underline"
                    aria-label={`Remove tracker for ${t.commodity}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default MyTrackers;
