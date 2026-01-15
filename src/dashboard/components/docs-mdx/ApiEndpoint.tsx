import { ReactNode } from 'react';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  children?: ReactNode;
}

const methodColors = {
  GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  POST: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function ApiEndpoint({ method, path, description, children }: ApiEndpointProps) {
  return (
    <div className="my-6 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span
          className={`px-3 py-1 text-xs font-bold uppercase rounded ${methodColors[method]}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-slate-900 dark:text-slate-100">
          {path}
        </code>
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900">
          {description}
        </div>
      )}

      {/* Additional content */}
      {children && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
