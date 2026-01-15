/**
 * TypeSignature Component
 * Displays TypeScript type signatures with syntax highlighting
 */

'use client';

import { CodeBlock } from '../docs-mdx/CodeBlock';

interface TypeSignatureProps {
  type: string;
  name?: string;
  showLabel?: boolean;
}

export function TypeSignature({ type, name, showLabel = true }: TypeSignatureProps) {
  const signature = name ? `${name}: ${type}` : type;

  return (
    <div className="my-4">
      {showLabel && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Type Signature
        </p>
      )}
      <CodeBlock language="typescript">{signature}</CodeBlock>
    </div>
  );
}

