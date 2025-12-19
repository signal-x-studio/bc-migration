'use client';

import { CheckCircle, Lock, Circle } from 'lucide-react';
import { PhaseNumber, PHASES, WizardState } from '../types';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  wizardState: WizardState;
  onPhaseClick?: (phase: PhaseNumber) => void;
}

export function WizardProgress({ wizardState, onPhaseClick }: WizardProgressProps) {
  const phases = ([1, 2, 3, 4] as PhaseNumber[]).map(num => ({
    ...PHASES[num],
    state: wizardState.phases[num],
    isCurrent: wizardState.currentPhase === num,
  }));

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {phases.map((phase, index) => (
          <div key={phase.number} className="flex items-center flex-1">
            {/* Phase indicator */}
            <button
              onClick={() => {
                if (phase.state.status !== 'locked' && onPhaseClick) {
                  onPhaseClick(phase.number);
                }
              }}
              disabled={phase.state.status === 'locked'}
              className={cn(
                'flex flex-col items-center gap-2 group transition-all duration-200',
                phase.state.status === 'locked'
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:opacity-80'
              )}
            >
              {/* Circle indicator */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  phase.state.status === 'complete' && 'bg-green-500/20 text-green-400 animate-pop',
                  phase.state.status === 'skipped' && 'bg-gray-500/20 text-gray-400',
                  phase.state.status === 'in_progress' && 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-400/50 animate-pulse-subtle',
                  phase.state.status === 'pending' && 'bg-gray-700 text-gray-300',
                  phase.state.status === 'locked' && 'bg-gray-800 text-gray-600',
                  phase.isCurrent && phase.state.status !== 'complete' && 'ring-2 ring-blue-400'
                )}
              >
                {phase.state.status === 'complete' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : phase.state.status === 'skipped' ? (
                  <span className="text-sm font-medium">Skip</span>
                ) : phase.state.status === 'locked' ? (
                  <Lock className="w-5 h-5" />
                ) : phase.state.status === 'in_progress' ? (
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Phase label */}
              <div className="text-center">
                <div
                  className={cn(
                    'text-sm font-medium',
                    phase.isCurrent ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {phase.shortName}
                </div>
                {!phase.isRequired && (
                  <div className="text-xs text-gray-500">Optional</div>
                )}
              </div>
            </button>

            {/* Connector line */}
            {index < phases.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative top-[-18px]">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    phase.state.status === 'complete' || phase.state.status === 'skipped'
                      ? 'bg-green-500/50'
                      : 'bg-gray-700'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
