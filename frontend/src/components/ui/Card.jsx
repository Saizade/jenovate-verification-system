import { forwardRef } from 'react';

const variantStyles = {
  default: 'bg-white border border-surface-200 shadow-card',
  glass: 'bg-white/85 backdrop-blur-lg border border-surface-200/60 shadow-glass',
  bordered: 'bg-white border-2 border-ocean-100',
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
  title,
  subtitle,
  headerAction,
  footer,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-2xl overflow-hidden transition-all duration-200 ease-out
        ${variantStyles[variant]}
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {(header || title) && (
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div>
            {typeof header === 'string' ? (
              <h3 className="text-sm font-heading font-bold text-ocean-950">{header}</h3>
            ) : header ? (
              header
            ) : (
              <>
                {title && <h3 className="text-sm font-heading font-bold text-ocean-950">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
              </>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
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
