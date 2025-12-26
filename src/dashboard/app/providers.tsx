'use client';

import { ReactNode } from 'react';
import { ConnectionProvider } from '../lib/contexts/ConnectionContext';
import { AssessmentProvider } from '../lib/contexts/AssessmentContext';
import { BCConnectionProvider } from '../lib/contexts/BCConnectionContext';
import { WPConnectionProvider } from '../lib/contexts/WPConnectionContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ConnectionProvider>
      <BCConnectionProvider>
        <WPConnectionProvider>
          <AssessmentProvider>
            {children}
          </AssessmentProvider>
        </WPConnectionProvider>
      </BCConnectionProvider>
    </ConnectionProvider>
  );
}
