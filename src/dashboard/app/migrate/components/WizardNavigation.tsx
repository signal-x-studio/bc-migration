'use client';

import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PhaseNumber, PHASES } from '../types';

interface WizardNavigationProps {
  currentPhase: PhaseNumber;
  canProceed: boolean;
  canSkip: boolean;
  isPhaseComplete: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function WizardNavigation({
  currentPhase,
  canProceed,
  canSkip,
  isPhaseComplete,
  onPrevious,
  onNext,
  onSkip,
}: WizardNavigationProps) {
  const phaseInfo = PHASES[currentPhase];
  const isFirstPhase = currentPhase === 1;
  const isLastPhase = currentPhase === 4;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-700">
      {/* Previous button */}
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={isFirstPhase}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {/* Right side buttons */}
      <div className="flex items-center gap-3">
        {/* Skip button (only for optional phases) */}
        {canSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="gap-2 text-gray-400 hover:text-white"
          >
            Skip {phaseInfo.shortName}
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        {/* Next/Complete button */}
        {isLastPhase ? (
          <Button
            onClick={onNext}
            disabled={!isPhaseComplete}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            Complete Migration
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="gap-2"
          >
            Next Phase
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
