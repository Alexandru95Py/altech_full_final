import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface CutePopupProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const CutePopup: React.FC<CutePopupProps> = ({ 
  isVisible, 
  message, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-orange-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-300 rounded-full"
            style={{
              width: '100%',
              animation: `shrinkWidth ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style>
        {`
          @keyframes shrinkWidth {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};
