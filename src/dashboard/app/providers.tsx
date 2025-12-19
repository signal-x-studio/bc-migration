'use client';

import { ReactNode } from 'react';
import { ConnectionProvider } from '../lib/contexts/ConnectionContext';
import { AssessmentProvider } from '../lib/contexts/AssessmentContext';
import { BCConnectionProvider } from '../lib/contexts/BCConnectionContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ConnectionProvider>
      <BCConnectionProvider>
        <AssessmentProvider>
          {children}
        </AssessmentProvider>
      </BCConnectionProvider>
    </ConnectionProvider>
  );
}
