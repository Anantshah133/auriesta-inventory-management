import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  className,
}) => {
  const trendUp = trend && trend.value > 0;
  const trendDown = trend && trend.value < 0;

  return (
    <div className={clsx('stat-card', className)}>
      <div
        className="stat-card-icon"
        style={{ backgroundColor: iconBgColor, color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
          {label}
        </span>
        <span className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">
          {value}
        </span>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : trendDown ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span
              className={clsx(
                'text-xs font-medium',
                trendUp ? 'text-emerald-600' : trendDown ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
              {trend.label && <span className="text-gray-400 font-normal ml-1">{trend.label}</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
