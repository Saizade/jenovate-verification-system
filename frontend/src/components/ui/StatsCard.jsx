import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const colorConfig = {
  primary: {
    gradient: 'from-primary-700 to-primary-800',
    lightBg: 'bg-primary-50',
    ring: 'ring-primary-100',
  },
  success: {
    gradient: 'from-emerald-700 to-emerald-800',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  danger: {
    gradient: 'from-red-700 to-red-800',
    lightBg: 'bg-red-50',
    ring: 'ring-red-100',
  },
  warning: {
    gradient: 'from-amber-700 to-amber-800',
    lightBg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  info: {
    gradient: 'from-primary-600 to-primary-700',
    lightBg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  purple: {
    gradient: 'from-primary-600 to-primary-800',
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
      className={`bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-card-hover group ${className}`}
      style={{ animation: 'slideUp 0.4s ease-out backwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center
          shadow-md ring-4 ${config.ring} group-hover:scale-105 transition-transform duration-300`}>
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
