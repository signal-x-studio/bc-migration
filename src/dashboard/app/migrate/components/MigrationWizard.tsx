'use client';

import { useCallback, useState, useEffect } from 'react';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { PhaseSummary } from './PhaseSummary';
import { FoundationPhase } from './phases/FoundationPhase';
import { CoreDataPhase } from './phases/CoreDataPhase';
import { TransactionsPhase } from './phases/TransactionsPhase';
import { ContentPhase } from './phases/ContentPhase';
import { useMigrationWizard } from '../hooks/useMigrationWizard';
import {
  PhaseNumber,
  FoundationPhaseData,
  CoreDataPhaseData,
  TransactionsPhaseData,
  ContentPhaseData,
} from '../types';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MigrationWizardProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
}

export function MigrationWizard({ wcCredentials, bcCredentials }: MigrationWizardProps) {
  const wizard = useMigrationWizard({
    wcStoreUrl: wcCredentials.url,
    bcStoreHash: bcCredentials.storeHash,
  });

  const {
    state,
    currentPhase,
    isCurrentPhaseComplete,
    canProceed,
    canSkip,
    goToPhase,
    nextPhase,
    previousPhase,
    completePhase,
    skipPhase,
    updatePhaseData,
    getCategoryMapping,
    getProductMapping,
    getCustomerMapping,
    resetWizard,
    getPhaseData,
  } = wizard;

  // Animation state for phase transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState(currentPhase);

  // Handle phase transitions with animation
  useEffect(() => {
    if (currentPhase !== displayPhase) {
      setIsTransitioning(true);
      // Wait for fade out, then update displayed phase
      const timeout = setTimeout(() => {
        setDisplayPhase(currentPhase);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [currentPhase, displayPhase]);

  // Phase completion handlers
  const handleFoundationComplete = useCallback((data: FoundationPhaseData) => {
    completePhase(1, data);
  }, [completePhase]);

  const handleCoreDataComplete = useCallback((data: CoreDataPhaseData) => {
    completePhase(2, data);
  }, [completePhase]);

  const handleCoreDataUpdate = useCallback((data: Partial<CoreDataPhaseData>) => {
    updatePhaseData(2, data);
  }, [updatePhaseData]);

  const handleTransactionsComplete = useCallback((data: TransactionsPhaseData) => {
    completePhase(3, data);
  }, [completePhase]);

  const handleTransactionsSkip = useCallback(() => {
    skipPhase(3);
    nextPhase();
  }, [skipPhase, nextPhase]);

  const handleContentComplete = useCallback((data: ContentPhaseData) => {
    completePhase(4, data);
  }, [completePhase]);

  const handleContentSkip = useCallback(() => {
    skipPhase(4);
  }, [skipPhase]);

  // Get completed phases for summaries
  const completedPhases = ([1, 2, 3, 4] as PhaseNumber[]).filter(
    p => p < currentPhase && (state.phases[p].status === 'complete' || state.phases[p].status === 'skipped')
  );

  // Check if all phases complete
  const allComplete = state.phases[1].status === 'complete' &&
    state.phases[2].status === 'complete' &&
    (state.phases[3].status === 'complete' || state.phases[3].status === 'skipped') &&
    (state.phases[4].status === 'complete' || state.phases[4].status === 'skipped');

  // Render current phase (using displayPhase for smooth animation)
  const renderCurrentPhase = () => {
    switch (displayPhase) {
      case 1:
        return (
          <FoundationPhase
            wcCredentials={wcCredentials}
            bcCredentials={bcCredentials}
            phaseData={getPhaseData<FoundationPhaseData>(1)}
            onComplete={handleFoundationComplete}
          />
        );
      case 2:
        return (
          <CoreDataPhase
            wcCredentials={wcCredentials}
            bcCredentials={bcCredentials}
            categoryIdMapping={getCategoryMapping()}
            phaseData={getPhaseData<CoreDataPhaseData>(2)}
            onComplete={handleCoreDataComplete}
            onUpdateData={handleCoreDataUpdate}
          />
        );
      case 3:
        return (
          <TransactionsPhase
            wcCredentials={wcCredentials}
            bcCredentials={bcCredentials}
            productIdMapping={getProductMapping()}
            customerIdMapping={getCustomerMapping()}
            phaseData={getPhaseData<TransactionsPhaseData>(3)}
            onComplete={handleTransactionsComplete}
            onSkip={handleTransactionsSkip}
          />
        );
      case 4:
        return (
          <ContentPhase
            wcCredentials={wcCredentials}
            bcCredentials={bcCredentials}
            productIdMapping={getProductMapping()}
            phaseData={getPhaseData<ContentPhaseData>(4)}
            onComplete={handleContentComplete}
            onSkip={handleContentSkip}
          />
        );
      default:
        return null;
    }
  };

  // Completion screen
  if (allComplete) {
    return (
      <div className="space-y-6">
        <WizardProgress wizardState={state} onPhaseClick={goToPhase} />

        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
              <PartyPopper className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Migration Complete!</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              All phases have been completed successfully. Your WooCommerce data has been migrated to BigCommerce.
            </p>

            {/* Summary of all phases */}
            <div className="space-y-3 mb-8 max-w-md mx-auto text-left">
              {([1, 2, 3, 4] as PhaseNumber[]).map(phase => (
                <PhaseSummary
                  key={phase}
                  phase={phase}
                  status={state.phases[phase].status === 'skipped' ? 'skipped' : 'complete'}
                  data={state.phases[phase].data}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="secondary" onClick={resetWizard}>
                Start New Migration
              </Button>
              <a
                href={`https://store-${bcCredentials.storeHash}.mybigcommerce.com/manage`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  Open BigCommerce Admin
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <WizardProgress wizardState={state} onPhaseClick={goToPhase} />

      {/* Completed phases summaries */}
      {completedPhases.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-2">
          {completedPhases.map(phase => (
            <PhaseSummary
              key={phase}
              phase={phase}
              status={state.phases[phase].status === 'skipped' ? 'skipped' : 'complete'}
              data={state.phases[phase].data}
              onClick={() => goToPhase(phase)}
            />
          ))}
        </div>
      )}

      {/* Current phase content with animation */}
      <div
        className={cn(
          'min-h-[400px] transition-all duration-200 ease-in-out',
          isTransitioning
            ? 'opacity-0 translate-y-2'
            : 'opacity-100 translate-y-0'
        )}
      >
        {renderCurrentPhase()}
      </div>

      {/* Navigation */}
      <div className="max-w-2xl mx-auto">
        <WizardNavigation
          currentPhase={currentPhase}
          canProceed={canProceed}
          canSkip={canSkip}
          isPhaseComplete={isCurrentPhaseComplete}
          onPrevious={previousPhase}
          onNext={nextPhase}
          onSkip={() => {
            if (currentPhase === 3) handleTransactionsSkip();
            else if (currentPhase === 4) handleContentSkip();
          }}
        />
      </div>
    </div>
  );
}
