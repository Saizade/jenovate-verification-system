import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const colorConfig = {
  primary: {
    bg: 'bg-ocean-600',
    lightBg: 'bg-ocean-50',
    ring: 'ring-ocean-100',
  },
  indigo: {
    bg: 'bg-ocean-600',
    lightBg: 'bg-ocean-50',
    ring: 'ring-ocean-100',
  },
  success: {
    bg: 'bg-emerald-600',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  emerald: {
    bg: 'bg-emerald-600',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  danger: {
    bg: 'bg-red-500',
    lightBg: 'bg-red-50',
    ring: 'ring-red-100',
  },
  rose: {
    bg: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    ring: 'ring-rose-100',
  },
  warning: {
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  amber: {
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  info: {
    bg: 'bg-sky-500',
    lightBg: 'bg-sky-50',
    ring: 'ring-sky-100',
  },
  teal: {
    bg: 'bg-teal-600',
    lightBg: 'bg-teal-50',
    ring: 'ring-teal-100',
  },
  purple: {
    bg: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    ring: 'ring-violet-100',
  },
};

const StatsCard = ({
  icon: Icon,
  title,
  value,
  change,
  description,
  color = 'primary',
  className = '',
}) => {
  const config = colorConfig[color] || colorConfig.primary;
  const isPositive = change && parseFloat(change) >= 0;
  const TrendIcon = isPositive ? HiArrowTrendingUp : HiArrowTrendingDown;

  return (
    <div
      className={`bg-white rounded-2xl border border-surface-200 p-5 transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-card-hover group ${className}`}
      style={{ animation: 'slideUp 0.4s ease-out backwards' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center
          ring-[3px] ${config.ring} group-hover:scale-105 transition-transform duration-200`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
              ${isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
              }`}
          >
            <TrendIcon className="w-3 h-3" />
            {typeof change === 'number' ? `${Math.abs(change)}%` : change}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
        <p className="text-xl font-heading font-bold text-ocean-950 tracking-tight">{value}</p>
        {description && (
          <p className="text-[11px] text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

StatsCard.displayName = 'StatsCard';
export default StatsCard;
