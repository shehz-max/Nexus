import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plug,
  Workflow as WorkflowIcon,
  Activity,
  Settings,
  Menu,
  X,
  Bell,
  LayoutTemplate,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="10" cy="10" r="5" fill="url(#logoGradient)" />
    <circle cx="26" cy="10" r="5" fill="url(#logoGradient)" opacity="0.7" />
    <circle cx="18" cy="26" r="5" fill="url(#logoGradient)" opacity="0.5" />
    <path d="M13 12 L18 22 L23 12" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 15 L18 22" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M26 15 L18 22" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </svg>
);

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/integrations', icon: Plug, label: 'Integrations' },
  { path: '/app/templates', icon: LayoutTemplate, label: 'Templates' },
  { path: '/app/workflows', icon: WorkflowIcon, label: 'Workflows' },
  { path: '/app/activity', icon: Activity, label: 'Activity' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl h-14 sm:h-16">
        <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white touch-manipulation"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2" aria-label="Nexus Home">
              <Logo />
              <span className="text-base sm:text-lg font-bold text-white hidden xs:block">Nexus</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white touch-manipulation" aria-label="Notifications">
              <Bell className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" aria-hidden="true" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Logout ({user?.name || user?.email})
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-14 sm:top-16 left-0 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 z-50 lg:translate-x-0 overflow-y-auto no-scrollbar"
        aria-label="Sidebar navigation"
      >
        <nav className="p-3 sm:p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all touch-manipulation"
          >
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </Link>
        </div>
      </motion.aside>

      <main className="pt-14 sm:pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}