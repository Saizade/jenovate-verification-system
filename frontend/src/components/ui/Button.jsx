import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-700 text-white border border-primary-600 hover:bg-primary-600 shadow-sm hover:shadow-md',
  secondary: 'bg-sky-50 text-primary-800 border border-sky-200 hover:bg-sky-100',
  danger: 'bg-red-600 text-white border border-red-500 hover:bg-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-sky-50 hover:text-primary-800',
  outline: 'border border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const Button = forwardRef(({ children, variant = 'primary', size = 'md', loading = false, disabled = false, icon: Icon, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out
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
