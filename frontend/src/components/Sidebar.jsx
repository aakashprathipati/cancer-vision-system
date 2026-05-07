import { NavLink } from 'react-router-dom';
import { Home, Database, Settings, ShieldAlert } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Scanner', path: '/', icon: Home },
    { name: 'Database', path: '/database', icon: Database },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-[#050505] border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1 text-glow">VisioData<span className="font-light">AI</span></h1>
            <p className="text-[10px] font-medium text-brand tracking-[0.2em] uppercase">Control Panel</p>
          </div>
          <button onClick={toggleSidebar} className="text-zinc-400 hover:text-white lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-brand/10 text-brand border border-brand/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 bg-critical/10 border border-critical/20 rounded-xl p-3 text-critical">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">System Status</p>
              <p className="opacity-80">All services operational</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
