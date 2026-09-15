import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Settings, History, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sessions', path: '/sessions', icon: History },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121214] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5 text-blue-500">
          <ShieldAlert size={24} />
          <span className="ml-3 font-semibold text-white tracking-wider">DriveGuard AI</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link key={item.name} to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 hover:text-white'}`}>
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
              {user?.name.charAt(0) || 'D'}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user?.name || 'Driver'}</div>
              <div className="text-xs text-gray-500">{user?.role || 'USER'}</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center w-full px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={18} className="mr-3" />
            Sign out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
