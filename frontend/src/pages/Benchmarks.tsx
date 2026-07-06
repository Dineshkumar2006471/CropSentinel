import { Activity, Zap, Cpu, Clock, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import AdminLayout from '../components/AdminLayout';

const featureEngData = [
  { operation: 'Rolling Windows (61.9k rows)', cpu: 0.08, gpu: 0.31 },
];

const trainingData = [
  { model: 'XGBoost - 500 Trees', cpu: 4.74, gpu: 1.71 },
];

const Benchmarks = () => {
  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-32 max-w-7xl mx-auto w-full">
        <header className="mb-32">
          <h1 className="font-display text-[32px] font-bold text-soil-ink mb-8">System Benchmarks</h1>
          <p className="text-stone text-[16px] max-w-2xl">
            Real performance metrics comparing CPU vs. NVIDIA GPU acceleration (T4) for our XGBoost price prediction models on a 61,931 row dataset.
          </p>
        </header>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-32">
          <div className="bg-white border border-stone/20 rounded-[12px] p-24 shadow-sm">
            <div className="flex items-center gap-12 mb-16">
              <div className="w-40 h-40 rounded-[8px] bg-turmeric-gold/20 flex items-center justify-center">
                <Zap className="text-turmeric-gold" size={20} />
              </div>
              <h3 className="font-display text-soil-ink text-[18px]">Training Speedup</h3>
            </div>
            <div className="text-[42px] font-data font-bold text-turmeric-gold leading-none mb-8">
              2.8x
            </div>
            <p className="text-stone text-[14px]">Faster model training with GPU</p>
          </div>

          <div className="bg-white border border-stone/20 rounded-[12px] p-24 shadow-sm">
            <div className="flex items-center gap-12 mb-16">
              <div className="w-40 h-40 rounded-[8px] bg-board-green/20 flex items-center justify-center">
                <Clock className="text-board-green" size={20} />
              </div>
              <h3 className="font-display text-soil-ink text-[18px]">GPU Training</h3>
            </div>
            <div className="text-[42px] font-data font-bold text-board-green leading-none mb-8">
              1.71 s
            </div>
            <p className="text-stone text-[14px]">vs 4.74 s on CPU</p>
          </div>

          <div className="bg-white border border-stone/20 rounded-[12px] p-24 shadow-sm">
            <div className="flex items-center gap-12 mb-16">
              <div className="w-40 h-40 rounded-[8px] bg-[#3C82F6]/20 flex items-center justify-center">
                <Server className="text-[#3C82F6]" size={20} />
              </div>
              <h3 className="font-display text-soil-ink text-[18px]">Dataset</h3>
            </div>
            <div className="text-[24px] font-display font-bold text-[#3C82F6] leading-tight mb-8">
              61,931
            </div>
            <p className="text-stone text-[14px]">Total historical rows processed</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          {/* Feature Engineering Chart */}
          <div className="bg-white border border-stone/20 rounded-[12px] p-24 shadow-sm">
            <div className="flex items-center justify-between mb-24">
              <div>
                <h3 className="font-display text-soil-ink text-[20px] font-bold">Feature Engineering Time</h3>
                <p className="text-stone text-[14px]">Time to compute rolling features (seconds)</p>
                <p className="text-[12px] text-stone/80 mt-4 italic">*Note: cuDF overhead is slower on small datasets vs Pandas</p>
              </div>
              <Activity className="text-stone" size={20} />
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureEngData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0ddc6" vertical={false} />
                  <XAxis dataKey="operation" stroke="#8c897f" tick={{fill: '#8c897f', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8c897f" tick={{fill: '#8c897f', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e0ddc6', borderRadius: '8px' }}
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="cpu" name="Pandas (CPU)" fill="#BF3C2B" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="gpu" name="cuDF (GPU)" fill="#8DC63F" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Training Chart */}
          <div className="bg-white border border-stone/20 rounded-[12px] p-24 shadow-sm">
            <div className="flex items-center justify-between mb-24">
              <div>
                <h3 className="font-display text-soil-ink text-[20px] font-bold">Model Training Time</h3>
                <p className="text-stone text-[14px]">Time to train XGBoost models (seconds)</p>
              </div>
              <Cpu className="text-stone" size={20} />
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0ddc6" vertical={false} />
                  <XAxis dataKey="model" stroke="#8c897f" tick={{fill: '#8c897f', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8c897f" tick={{fill: '#8c897f', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e0ddc6', borderRadius: '8px' }}
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="cpu" name="CPU (s)" fill="#BF3C2B" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="gpu" name="GPU (s)" fill="#8DC63F" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Benchmarks;
