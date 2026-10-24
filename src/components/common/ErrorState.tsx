import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-rose-900/60 bg-rose-950/20 text-rose-200 flex flex-col items-center text-center ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-rose-900/40 border border-rose-700/60 flex items-center justify-center text-rose-400 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold mb-1 text-rose-300">{title}</h4>
      <p className="text-xs text-rose-400/90 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry} className="border-rose-800 text-rose-300 hover:bg-rose-900/40">
          Try Again
        </Button>
      )}
    </div>
  );
};
