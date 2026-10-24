import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  CheckSquare,
  BarChart3,
  Award,
  Sparkles,
  UserCheck,
  Bell,
  X,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePath, onNavigate }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const adminNav: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Faculty', path: '/admin/faculty', icon: UserCheck },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Exam Schedule', path: '/admin/exams', icon: Calendar },
    { label: 'Rooms & Halls', path: '/admin/rooms', icon: Building2 },
    { label: 'Marks Verification', path: '/admin/marks', icon: CheckSquare },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount }
  ];

  const facultyNav: NavItem[] = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'My Assigned Exams', path: '/faculty/exams', icon: Calendar },
    { label: 'Marks Entry', path: '/faculty/marks', icon: FileSpreadsheet },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount }
  ];

  const studentNav: NavItem[] = [
    { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Exams & Timetable', path: '/student/exams', icon: Calendar },
    { label: 'Published Results', path: '/student/results', icon: Award },
    { label: 'Student Profile', path: '/student/profile', icon: GraduationCap },
    { label: 'AI Exam Assistant', path: '/student/assistant', icon: Sparkles, highlight: true },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount }
  ];

  let currentNav: NavItem[] = adminNav;
  if (user?.role === 'faculty') currentNav = facultyNav;
  if (user?.role === 'student') currentNav = studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/95 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                {user?.role?.toUpperCase()} PORTAL
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {currentNav.map(item => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : item.highlight
                      ? 'text-teal-300 hover:bg-teal-950/40 hover:text-teal-200 border border-teal-800/40 bg-teal-950/20'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Identity & Security Note */}
        <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-semibold">Autonomous Cell</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            College Capstone Examination Suite. Secure prototype RBAC authentication active.
          </p>
        </div>
      </aside>
    </>
  );
};
