import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex font-sans text-slate-200">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 relative h-full flex flex-col">
        {/* Header HUD (Overlay on Content) */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center justify-center rounded-2xl border border-white/20 shadow-lg"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
