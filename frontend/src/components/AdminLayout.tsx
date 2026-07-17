import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const getMenuClass = (activePaths: string[]) => {
    return activePaths.includes(path)
      ? "flex items-center gap-12 px-16 py-12 rounded-[12px] bg-board-green text-kraft-paper shadow-sm transition-colors w-full"
      : "flex items-center gap-12 px-16 py-12 rounded-[12px] text-stone hover:text-soil-ink hover:bg-white/50 transition-colors w-full";
  };

  const getMobileMenuClass = (activePaths: string[]) => {
    return activePaths.includes(path)
      ? "flex flex-col items-center gap-4 text-board-green transition-colors flex-1"
      : "flex flex-col items-center gap-4 text-stone hover:text-soil-ink transition-colors flex-1";
  };

  return (
    <div className="flex min-h-screen bg-[#F9F6F0] font-body text-soil-ink pb-[60px] lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="w-[260px] bg-kraft-paper border-r border-stone/20 h-screen sticky top-0 flex-col hidden lg:flex shrink-0">
        <div 
          className="h-[80px] px-24 flex items-center gap-12 cursor-pointer border-b border-stone/10 hover:bg-stone/5 transition-colors"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
          aria-label="Go to home"
        >
          <img src="/logo-cs.png" alt="CropSentinel Logo" className="h-[48px] w-auto object-contain" />
        </div>
        
        <nav className="flex-1 px-16 py-24 flex flex-col gap-8" aria-label="Main navigation">
          <button 
            className={getMenuClass(["/admin/dashboard", "/admin"])}
            onClick={() => navigate('/admin/dashboard')}
            aria-current={["/admin/dashboard", "/admin"].includes(path) ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">grid_view</span>
            <span className="text-[14px] font-bold">Overview</span>
          </button>
          
          <button 
            className={getMenuClass(["/ask", "/admin/ask"])}
            onClick={() => navigate('/ask')}
            aria-current={["/ask", "/admin/ask"].includes(path) ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chat</span>
            <span className="text-[14px] font-medium">Ask CropSentinel</span>
          </button>

          <button 
            className={getMenuClass(["/admin/map"])}
            onClick={() => navigate('/admin/map')}
            aria-current={["/admin/map"].includes(path) ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">map</span>
            <span className="text-[14px] font-medium">Mandi Map</span>
          </button>
          
          <button 
            className={getMenuClass(["/admin/trackers"])}
            onClick={() => navigate('/admin/trackers')}
            aria-current={["/admin/trackers"].includes(path) ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">notifications_active</span>
            <span className="text-[14px] font-medium">My Trackers</span>
          </button>

          <button 
            className={getMenuClass(["/benchmarks"])}
            onClick={() => navigate('/benchmarks')}
            aria-current={["/benchmarks"].includes(path) ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">speed</span>
            <span className="text-[14px] font-medium">GPU Benchmarks</span>
          </button>
        </nav>
        
        <div className="p-24 border-t border-stone/20 flex flex-col gap-16">
          <div className="flex items-center gap-12">
            <div className="w-[36px] h-[36px] rounded-full bg-turmeric-gold flex items-center justify-center text-soil-ink font-bold shadow-sm text-[14px]">
              DK
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-soil-ink leading-tight uppercase">Dinesh Kumar Bingi</span>
              <span className="text-[11px] text-stone">Mandi Admin</span>
            </div>
          </div>
          <button className="flex items-center gap-12 text-stone hover:text-chili-vermillion transition-colors w-full py-8">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-[14px] font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Render Area */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone/20 flex lg:hidden items-center justify-around h-[60px] px-8 z-50" aria-label="Mobile navigation">
        <button className={getMobileMenuClass(["/admin/dashboard", "/admin"])} onClick={() => navigate('/admin/dashboard')} aria-current={["/admin/dashboard", "/admin"].includes(path) ? "page" : undefined}>
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">grid_view</span>
          <span className="text-[10px] font-medium">Overview</span>
        </button>
        <button className={getMobileMenuClass(["/ask", "/admin/ask"])} onClick={() => navigate('/ask')} aria-current={["/ask", "/admin/ask"].includes(path) ? "page" : undefined}>
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">chat</span>
          <span className="text-[10px] font-medium">Ask</span>
        </button>
        <button className={getMobileMenuClass(["/admin/map"])} onClick={() => navigate('/admin/map')} aria-current={["/admin/map"].includes(path) ? "page" : undefined}>
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">map</span>
          <span className="text-[10px] font-medium">Map</span>
        </button>
        <button className={getMobileMenuClass(["/admin/trackers"])} onClick={() => navigate('/admin/trackers')} aria-current={["/admin/trackers"].includes(path) ? "page" : undefined}>
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">notifications_active</span>
          <span className="text-[10px] font-medium">Trackers</span>
        </button>
        <button className={getMobileMenuClass(["/benchmarks"])} onClick={() => navigate('/benchmarks')} aria-current={["/benchmarks"].includes(path) ? "page" : undefined}>
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">speed</span>
          <span className="text-[10px] font-medium">Speed</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
