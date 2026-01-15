/**
 * ApiReference Component
 * Displays API reference documentation for classes, functions, interfaces
 */

'use client';

import { CodeBlock } from '../docs-mdx/CodeBlock';
import { TypeSignature } from './TypeSignature';

interface Parameter {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

interface Method {
  name: string;
  description?: string;
  parameters?: Parameter[];
  returns?: string;
  signature?: string;
}

interface ApiReferenceProps {
  title: string;
  description?: string;
  methods?: Method[];
  properties?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  type?: 'class' | 'function' | 'interface';
}

export function ApiReference({
  title,
  description,
  methods = [],
  properties = [],
  type = 'class',
}: ApiReferenceProps) {
  return (
    <div className="my-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-slate-700 dark:text-slate-300">{description}</p>
        )}
      </div>

      {properties.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Properties
          </h3>
          <div className="space-y-4">
            {properties.map((prop) => (
              <div key={prop.name} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {prop.name}
                  </code>
                  <span className="text-sm text-slate-500 dark:text-slate-400">:</span>
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    {prop.type}
                  </code>
                </div>
                {prop.description && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {prop.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {methods.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Methods
          </h3>
          <div className="space-y-6">
            {methods.map((method) => (
              <div key={method.name} className="border-l-4 border-green-500 pl-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  <code className="font-mono">{method.name}()</code>
                </h4>
                {method.description && (
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    {method.description}
                  </p>
                )}
                {method.signature && (
                  <TypeSignature type={method.signature} showLabel={false} />
                )}
                {method.parameters && method.parameters.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Parameters
                    </p>
                    <ul className="space-y-2">
                      {method.parameters.map((param) => (
                        <li key={param.name} className="text-sm">
                          <code className="font-mono text-slate-900 dark:text-slate-100">
                            {param.name}
                            {param.optional && '?'}
                          </code>
                          <span className="text-slate-500 dark:text-slate-400 mx-2">:</span>
                          <code className="font-mono text-blue-600 dark:text-blue-400">
                            {param.type}
                          </code>
                          {param.description && (
                            <span className="text-slate-600 dark:text-slate-400 ml-2">
                              — {param.description}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {method.returns && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Returns
                    </p>
                    <code className="text-sm font-mono text-green-600 dark:text-green-400">
                      {method.returns}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

