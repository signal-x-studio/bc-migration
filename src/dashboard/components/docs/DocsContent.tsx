import { ReactNode } from 'react';

interface DocsContentProps {
  children: ReactNode;
}

export function DocsContent({ children }: DocsContentProps) {
  return (
    <div className="docs-content-wrapper">
      {children}
    </div>
  );
}
