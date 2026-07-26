import { forwardRef } from 'react';

const variantStyles = {
  default: 'bg-white border border-surface-200 shadow-sm',
  glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
  bordered: 'bg-white border-2 border-primary-100',
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
        ${hover ? 'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-surface-100">
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
        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50/50">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
