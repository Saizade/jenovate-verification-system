import { forwardRef } from 'react';

const variants = {
  primary: 'bg-ocean-600 text-white hover:bg-ocean-700 shadow-sm hover:shadow-md',
  secondary: 'bg-surface-100 text-ocean-950 hover:bg-surface-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  ghost: 'bg-transparent text-gray-600 hover:bg-surface-100 hover:text-ocean-950',
  outline: 'border border-surface-200 text-gray-700 hover:bg-surface-50 hover:border-ocean-300 hover:text-ocean-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-sm rounded-lg gap-2.5',
};

const Button = forwardRef(({ children, variant = 'primary', size = 'md', loading = false, disabled = false, icon: Icon, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out
        ${variants[variant]} ${sizes[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
