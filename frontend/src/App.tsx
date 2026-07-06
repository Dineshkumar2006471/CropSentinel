import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AskCropSentinel from './pages/AskCropSentinel';
import RecommendationResult from './pages/RecommendationResult';
import MandiMap from './pages/MandiMap';
import MyTrackers from './pages/MyTrackers';

// Desktop Screens
import OfficialSignIn from './pages/OfficialSignIn';
import DistressRiskWatch from './pages/DistressRiskWatch';
import MarketHeatmap from './pages/MarketHeatmap';
import Benchmarks from './pages/Benchmarks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile Farmer Flow */}
        <Route path="/" element={<Landing />} />
        <Route path="/ask" element={<AskCropSentinel />} />
        <Route path="/recommendation" element={<RecommendationResult />} />
        <Route path="/map" element={<MandiMap />} />
        <Route path="/trackers" element={<MyTrackers />} />

        {/* Desktop Official Flow */}
        <Route path="/desktop" element={<Landing />} />
        <Route path="/admin/login" element={<OfficialSignIn />} />
        <Route path="/admin/dashboard" element={<DistressRiskWatch />} />
        <Route path="/admin/heatmap" element={<MarketHeatmap />} />
        <Route path="/admin/map" element={<MandiMap />} />
        <Route path="/admin/trackers" element={<MyTrackers />} />
        <Route path="/benchmarks" element={<Benchmarks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
