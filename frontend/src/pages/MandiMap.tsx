import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { api } from '../services/api';
import type { MapMarket } from '../services/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Center of India
};

const MandiMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [markets, setMarkets] = useState<MapMarket[]>([]);
  const [geocodedMarkets, setGeocodedMarkets] = useState<(MapMarket & { location: google.maps.LatLngLiteral })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMapData();
        setMarkets(data.markets || []);
      } catch (e: any) {
        console.error("Map connection error", e);
        setError("Failed to load map data. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Geocode markets once Maps API is loaded and markets are fetched
  useEffect(() => {
    if (!isLoaded || markets.length === 0) return;
    
    const geocoder = new window.google.maps.Geocoder();
    const geocodePromises = markets.map(async (m) => {
      return new Promise((resolve) => {
        // Fallback static coordinate mapping for reliability in demo if Geocoding fails or hits rate limits
        const staticCoords: Record<string, {lat: number, lng: number}> = {
          'Warangal': { lat: 17.9784, lng: 79.6000 },
          'Chevella': { lat: 17.3107, lng: 78.1360 },
          'Pune': { lat: 18.5204, lng: 73.8567 },
          'Newasa (Ghodegaon)': { lat: 19.5517, lng: 74.9317 },
          'Mumbai': { lat: 19.0760, lng: 72.8777 },
          'Delhi': { lat: 28.7041, lng: 77.1025 },
        };
        
        const fallback = staticCoords[m.market] || staticCoords[m.district];
        if (fallback) {
          resolve({ ...m, location: fallback });
          return;
        }

        geocoder.geocode({ address: `${m.market}, ${m.district}, India` }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve({
              ...m,
              location: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              }
            });
          } else {
            // Geocoding API likely not enabled or rate limited. 
            // Default to center to ensure the map still works.
            resolve({ ...m, location: defaultCenter });
          }
        });
      });
    });

    Promise.all(geocodePromises).then(results => {
      setGeocodedMarkets(results.filter((r: any) => r.location !== null) as (MapMarket & { location: google.maps.LatLngLiteral })[]);
    });

  }, [isLoaded, markets]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#7c93a3" }, { lightness: "-10" }]
      }
    ]
  }), []);

  return (
    <AdminLayout>
      <main className="flex-1 p-16 md:p-32 lg:p-48 max-w-[1400px] h-[calc(100vh-60px)] lg:h-screen flex flex-col">
        
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 shrink-0">
          <div className="flex flex-col gap-4 lg:gap-8">
            <h1 className="font-display font-bold text-[32px] lg:text-[40px] text-soil-ink leading-none tracking-tight">Mandi Coverage Map</h1>
            <p className="text-[14px] lg:text-[16px] text-stone">Real-time geospatial tracking of high-volatility markets.</p>
          </div>
        </div>

        {error && (
          <div className="bg-chili-vermillion/10 border border-chili-vermillion/20 rounded-[12px] p-24 flex items-center gap-16 mb-24" role="alert">
            <span className="material-symbols-outlined text-[32px] text-chili-vermillion" aria-hidden="true">error</span>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-chili-vermillion">Connection Error</span>
              <span className="text-[14px] text-chili-vermillion/80">{error}</span>
            </div>
          </div>
        )}

        <div className="flex-1 bg-white rounded-[12px] border border-stone/10 shadow-sm flex flex-col lg:flex-row overflow-hidden">
          
          {/* Map Area */}
          <div className="flex-1 relative bg-[#E5E3DF] min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center z-10" role="status" aria-label="Loading map">
                <span className="material-symbols-outlined text-[48px] text-board-green animate-spin" aria-hidden="true">progress_activity</span>
              </div>
            ) : isLoaded && !error ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={5}
                options={mapOptions}
              >
                {geocodedMarkets.map((m, i) => (
                  <Marker
                    key={i}
                    position={m.location}
                    onClick={() => setActiveMarker(i)}
                  >
                    {activeMarker === i && (
                      <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                        <div className="p-4">
                          <p className="font-bold text-soil-ink">{m.market}, {m.district}</p>
                          <p className="text-board-green font-bold">₹{m.price.toFixed(2)}/q</p>
                          <p className="text-stone text-[12px]">{m.commodity}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))}
              </GoogleMap>
            ) : !isLoaded && !error ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-stone">Loading Map Engine...</p>
              </div>
            ) : null}
          </div>

          {/* Sidebar Info Area */}
          <div className="w-full lg:w-[350px] bg-white border-l border-stone/10 flex flex-col shrink-0">
            <div className="px-24 py-24 border-b border-stone/10 bg-[#F9F9F9]">
              <h3 className="font-bold text-soil-ink text-[16px]">Active Volatility Zones</h3>
              <p className="text-[13px] text-stone mt-4">Top 3 highest priced markets today</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-24 flex flex-col gap-16">
              {loading ? (
                <p className="text-[13px] text-stone">Loading market data...</p>
              ) : error ? (
                <p className="text-[13px] text-chili-vermillion">Data unavailable</p>
              ) : markets.length === 0 ? (
                <p className="text-[13px] text-stone">No active data.</p>
              ) : (
                markets.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-16 border rounded-[8px] flex flex-col transition-colors cursor-pointer ${activeMarker === i ? 'border-board-green bg-board-green/5' : 'border-stone/20 hover:border-board-green'}`}
                    onClick={() => setActiveMarker(i)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeMarker === i}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveMarker(i); }}
                  >
                    <span className="text-[11px] font-bold text-stone uppercase tracking-widest">{m.commodity}</span>
                    <span className="font-bold text-[18px] text-soil-ink mb-4">{m.market}, {m.district}</span>
                    <div className="flex justify-between items-end mt-8">
                      <span className="text-[12px] text-stone">Current Price</span>
                      <span className="font-bold text-[18px] text-board-green">₹{m.price.toFixed(2)}<span className="text-[14px] font-normal text-stone">/q</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </main>
    </AdminLayout>
  );
};

export default MandiMap;
