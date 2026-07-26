const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  neutral: 'bg-gray-50 text-gray-600 border border-gray-200',
};

const dotColors = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

const Badge = ({ children, variant = 'neutral', dot = false, size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold leading-none whitespace-nowrap
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
export default Badge;
