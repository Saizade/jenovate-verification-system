import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', type = 'text', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`form-input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="form-error"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
