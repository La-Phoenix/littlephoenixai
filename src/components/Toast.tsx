import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
  duration?: number;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ id, type, message, duration = 4000, onClose }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess
    ? theme === 'light'
      ? 'bg-green-100'
      : 'bg-green-600'
    : theme === 'light'
      ? 'bg-red-100'
      : 'bg-red-600';

  const borderColor = isSuccess
    ? theme === 'light'
      ? 'border-green-300'
      : 'border-green-500'
    : theme === 'light'
      ? 'border-red-300'
      : 'border-red-500';

  const textColor = isSuccess
    ? theme === 'light'
      ? 'text-green-800'
      : 'text-white'
    : theme === 'light'
      ? 'text-red-800'
      : 'text-white';

  const iconColor = isSuccess
    ? theme === 'light'
      ? 'text-green-700'
      : 'text-white'
    : theme === 'light'
      ? 'text-red-700'
      : 'text-white';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${bgColor} ${borderColor} pointer-events-auto animate-slide-up shadow-lg backdrop-blur-sm`}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      ) : (
        <AlertCircle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      )}
      <p className={`text-sm ${textColor} flex-1 font-medium`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`${
          theme === 'light'
            ? 'hover:bg-white/40 text-green-700 hover:text-green-800'
            : 'hover:bg-white/20 text-white hover:text-white/90'
        } p-1 rounded transition-all flex-shrink-0`}
      >
        <X className={`w-4 h-4 ${iconColor}`} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};
