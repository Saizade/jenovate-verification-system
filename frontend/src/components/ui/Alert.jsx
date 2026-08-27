import { useState } from 'react';
import {
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
} from 'react-icons/hi2';

const variantConfig = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200/70',
    icon: HiCheckCircle,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800',
    messageColor: 'text-emerald-700',
    dismissColor: 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100',
  },
  error: {
    bg: 'bg-red-50 border-red-200/70',
    icon: HiXCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    dismissColor: 'text-red-400 hover:text-red-600 hover:bg-red-100',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200/70',
    icon: HiExclamationTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    messageColor: 'text-amber-700',
    dismissColor: 'text-amber-400 hover:text-amber-600 hover:bg-amber-100',
  },
  info: {
    bg: 'bg-ocean-50 border-ocean-200/70',
    icon: HiInformationCircle,
    iconColor: 'text-ocean-500',
    titleColor: 'text-ocean-800',
    messageColor: 'text-ocean-700',
    dismissColor: 'text-ocean-400 hover:text-ocean-600 hover:bg-ocean-100',
  },
};

const Alert = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);
  const config = variantConfig[variant];
  const IconComp = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border ${config.bg} ${className}`}
      style={{ animation: 'slideUp 0.3s ease-out' }}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComp className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {title}
          </h4>
        )}
        {message && (
          <p className={`text-sm ${config.messageColor} ${title ? 'mt-1' : ''}`}>
            {message}
          </p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors duration-150 ${config.dismissColor}`}
          aria-label="Dismiss alert"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
export default Alert;
