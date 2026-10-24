import React from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'result':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Official Examination Cell Notices
          </h2>
          <p className="text-xs text-slate-400">
            Timetable releases, invigilation duty assignments, and result publishing alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner label="Fetching Notifications..." />
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          No notifications or examination announcements at this time.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'border-slate-800/60 bg-slate-900/40 text-slate-400'
                  : 'border-cyan-500/30 bg-slate-900/90 text-slate-200 shadow-md shadow-cyan-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                    n.is_read
                      ? 'bg-slate-950 border-slate-800 text-slate-500'
                      : 'bg-cyan-950/40 border-cyan-800/80 text-cyan-400'
                  }`}
                >
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-100">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{n.message}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition shrink-0"
                  title="Mark as Read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
