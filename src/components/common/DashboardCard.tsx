import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  onClick
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      iconText: 'text-cyan-400',
      accent: 'from-cyan-500/20 to-transparent'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      iconText: 'text-blue-400',
      accent: 'from-blue-500/20 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      iconText: 'text-emerald-400',
      accent: 'from-emerald-500/20 to-transparent'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      iconText: 'text-amber-400',
      accent: 'from-amber-500/20 to-transparent'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      iconText: 'text-purple-400',
      accent: 'from-purple-500/20 to-transparent'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      iconText: 'text-rose-400',
      accent: 'from-rose-500/20 to-transparent'
    }
  };

  const current = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl ${current.accent} rounded-bl-full pointer-events-none opacity-40`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white font-mono">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${current.bg} ${current.border} ${current.iconText} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`inline-flex items-center gap-1 font-medium font-mono ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
