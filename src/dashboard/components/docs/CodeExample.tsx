/**
 * CodeExample Component
 * Displays code examples extracted from source files
 */

'use client';

import { CodeBlock } from '../docs-mdx/CodeBlock';

interface CodeExampleProps {
  src: string;
  startLine?: number;
  endLine?: number;
  startMarker?: string;
  endMarker?: string;
  title?: string;
  language?: string;
  children?: string; // Pre-extracted code content (passed from MDX)
}

/**
 * CodeExample Component
 * Displays code examples. Code should be pre-extracted at build time
 * and passed as children, or provided inline in MDX.
 */
export function CodeExample({
  src,
  startLine,
  endLine,
  startMarker,
  endMarker,
  title,
  language,
  children,
}: CodeExampleProps) {
  // In a full implementation, code would be extracted at build time
  // For now, we expect it to be provided as children (inline in MDX)
  const code = children || '';

  if (!code) {
    return (
      <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Code example not provided: {src}
        </p>
      </div>
    );
  }

  // Determine language from extension if not provided
  const lang = language || (() => {
    const ext = src.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'tsx',
      'js': 'javascript',
      'jsx': 'jsx',
      'json': 'json',
      'md': 'markdown',
      'mdx': 'mdx',
      'php': 'php',
      'css': 'css',
      'html': 'html',
      'bash': 'bash',
      'sh': 'bash',
    };
    return langMap[ext || ''] || 'text';
  })();

  return (
    <div className="my-6">
      {title && (
        <div className="mb-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{src}</p>
        </div>
      )}
      <CodeBlock language={lang}>{code}</CodeBlock>
    </div>
  );
}

