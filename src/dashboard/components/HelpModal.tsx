
import React from 'react';
import { X, BookOpen, Terminal, Activity, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-blue-400" /> Assessment Guide
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 text-slate-300">
          
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="text-green-400" size={20} /> How to Interpret Readiness
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
              <Terminal className="text-purple-400" size={20} /> Essential Commands
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
               <FileText className="text-amber-400" size={20} /> Next Steps
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
