import React from 'react';
import { Bell, LogOut, Menu, UserCircle2, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ConnectionBadge } from './ConnectionBadge';

interface NavbarProps {
  onToggleSidebar: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activePath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              EXAM CELL <span className="text-cyan-400 text-xs font-mono font-normal">v2.6</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Apex University Examination Division</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <ConnectionBadge />

        {/* Notifications Button */}
        <button
          onClick={() => onNavigate('/notifications')}
          className={`relative p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition ${
            activePath === '/notifications' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20' : ''
          }`}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-slate-950 font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Identity Pill */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400">
            <UserCircle2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200 line-clamp-1">{user?.full_name}</p>
            <p className="text-[10px] uppercase font-mono tracking-wider text-cyan-400/90">{user?.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
