import { forwardRef } from 'react';

const variantStyles = {
  default: 'bg-white border border-slate-200 shadow-card',
  glass: 'bg-white/95 backdrop-blur-xl border border-sky-100 shadow-card',
  bordered: 'bg-white border border-primary-200',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = forwardRef(({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  header,
  footer,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-2xl overflow-hidden transition-all duration-300 ease-out
        ${variantStyles[variant]}
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-100">
          {typeof header === 'string' ? (
            <h3 className="text-base font-semibold text-primary-950">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
