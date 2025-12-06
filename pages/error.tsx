import * as React from 'react';
import { AlertTriangle, FileQuestion, Home, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui';

interface ErrorPageProps {
  onNavigate?: (view: 'dashboard') => void;
}

export const NotFoundPage = ({ onNavigate }: ErrorPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-full mb-6">
        <FileQuestion className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to the dashboard.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => onNavigate?.('dashboard')} className="gap-2">
          <Home className="h-4 w-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
};

export const Error500Page = ({ error, reset, onNavigate }: {
  error: Error;
  reset?: () => void;
  onNavigate?: (view: 'dashboard') => void;
}) => {
  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">500</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Internal Server Error</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Something went wrong on our end. We're working to fix it.
        {error && <span className="block mt-2 text-xs font-mono bg-slate-100 dark:bg-white/5 p-2 rounded text-red-500 break-all">{error.message}</span>}
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
        <Button onClick={() => onNavigate?.('dashboard')} className="gap-2">
          <Home className="h-4 w-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
};