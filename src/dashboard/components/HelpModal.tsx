'use client';

import { useEffect, useRef } from 'react';
import { X, BookOpen, Terminal, Activity, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10">
          <h2 id="help-modal-title" className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-blue-400" aria-hidden="true" /> Assessment Guide
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            aria-label="Close dialog"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-8 text-slate-300">
          
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="text-green-400" size={20} aria-hidden="true" /> How to Interpret Readiness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-slate-950 p-3 rounded-lg border border-green-500/20">
                 <div className="font-bold text-green-400 mb-1">GREEN</div>
                 <div className="text-sm">Ideal fit. Ready for automated migration.</div>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-yellow-500/20">
                 <div className="font-bold text-yellow-400 mb-1">YELLOW</div>
                 <div className="text-sm">Feasible, but requires manual plugin config.</div>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-red-500/20">
                 <div className="font-bold text-red-400 mb-1">RED</div>
                 <div className="text-sm">High complexity. Needs architectural review.</div>
               </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Terminal className="text-purple-400" size={20} aria-hidden="true" /> Essential Commands
            </h3>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800 space-y-4">
              <div>
                <div className="text-slate-500 mb-1"># Run Assessment</div>
                <div className="text-blue-300">npx bc-migrate assess --url [url] --key [key] --secret [secret]</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1"># Migrate All Data</div>
                <div className="text-blue-300">npx bc-migrate migrate --type all</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1"># Delta Sync (Updates Only)</div>
                <div className="text-blue-300">npx bc-migrate migrate --type all --delta</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
               <FileText className="text-amber-400" size={20} aria-hidden="true" /> Next Steps
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Review the <span className="text-white font-medium">Complexity Score</span> above.</li>
                <li>Check the <span className="text-white font-medium">Custom Logic Risks</span> for plugin conflicts.</li>
                <li>If green/yellow, run the <code className="bg-slate-800 px-1 py-0.5 rounded text-xs">migrate</code> command.</li>
                <li>After migration, install the <strong>BC Bridge Plugin</strong> on WordPress (Coming Soon).</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
