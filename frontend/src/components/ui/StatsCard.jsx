import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const colorConfig = {
  primary: {
    gradient: 'from-primary-500 to-primary-600',
    lightBg: 'bg-primary-50',
    ring: 'ring-primary-100',
  },
  success: {
    gradient: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  danger: {
    gradient: 'from-red-500 to-red-600',
    lightBg: 'bg-red-50',
    ring: 'ring-red-100',
  },
  warning: {
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  info: {
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  purple: {
    gradient: 'from-violet-500 to-violet-600',
    lightBg: 'bg-violet-50',
    ring: 'ring-violet-100',
  },
};

const StatsCard = ({
  icon: Icon,
  title,
  value,
  change,
  color = 'primary',
  className = '',
}) => {
  const config = colorConfig[color] || colorConfig.primary;
  const isPositive = change && parseFloat(change) >= 0;
  const TrendIcon = isPositive ? HiArrowTrendingUp : HiArrowTrendingDown;

  return (
    <div
      className={`bg-white rounded-2xl border border-surface-200 p-6 transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] group ${className}`}
      style={{ animation: 'slideUp 0.4s ease-out backwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center
          shadow-lg ring-4 ${config.ring} group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
              ${isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
              }`}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {typeof change === 'number' ? `${Math.abs(change)}%` : change}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-primary-950 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

StatsCard.displayName = 'StatsCard';
export default StatsCard;
