'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Box,
  ShoppingCart,
  Users
} from 'lucide-react';
import { HelpModal } from './HelpModal';

// Helper function to get color based on readiness level
const getReadinessColor = (level: string) => {
    switch (level) {
        case 'GREEN': return 'bg-green-500/20 text-green-400 border border-green-500/50';
        case 'YELLOW': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
        case 'RED': return 'bg-red-500/20 text-red-400 border border-red-500/50';
        default: return 'bg-slate-800 text-slate-400';
    }
};

const getDensityColor = (level: string) => {
    switch(level) {
        case 'LOW': return 'text-green-400';
        case 'MEDIUM': return 'text-yellow-400';
        case 'HIGH': return 'text-red-400';
        default: return 'text-slate-400';
    }
};

interface ReportData {
  storeUrl: string;
  wcVersion: string;
  readiness?: string;
  metrics: {
    scale: {
      productCount: number;
      orderCount: number;
      customerCount: number;
      categoryCount: number;
      variantCount: number;
    };
    complexity: {
        score: number;
        level: 'LOW' | 'MEDIUM' | 'HIGH';
        factors: string[];
    };
    logic: {
        detectedHooks: string[];
        hasShortcodes: boolean;
        requiresManualReview: boolean;
        logicDensity: string;
    };
    seo: {
        permalinkStructure: string;
        isStandard: boolean;
        redirectEstimate: number;
    };
  };
  timestamp: string;
}

export function ReportVisualizer() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/report.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Assessment...</div>;
  if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
            <div className="text-red-400 mb-2">Error loading report</div>
            <div className="text-sm text-slate-500">Make sure you have run 'bc-migrate assess' first.</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
            
            <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Migration Assessment
                    </h1>
                    <p className="text-slate-400 mt-2">Target: <span className="font-mono text-slate-300">{data.storeUrl}</span></p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors"
                    >
                        <HelpCircle size={18} /> Help & Guide
                    </button>
                    <div className={`px-4 py-2 rounded-lg font-bold ${getReadinessColor(data.readiness ?? (data.metrics.complexity.level === 'HIGH' ? 'YELLOW' : 'GREEN'))}`}>
                        {data.readiness ?? (data.metrics.complexity.level === 'HIGH' ? 'YELLOW' : 'GREEN')}
                    </div>
                </div>
            </header>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <MetricCard 
             icon={<Box className="text-blue-400" />} 
             label="Products" 
             value={data.metrics.scale.productCount} 
             subVal={`${data.metrics.scale.variantCount} variants`}
           />
           <MetricCard
             icon={<ShoppingCart className="text-purple-400" />}
             label="Orders"
             value={data.metrics.scale.orderCount}
           />
           <MetricCard 
             icon={<Users className="text-green-400" />} 
             label="Customers" 
             value={data.metrics.scale.customerCount} 
           />
        </div>

        {/* Complexity Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-amber-400" /> Complexity Factors
                </h2>
                <ul className="space-y-3">
                    {data.metrics.complexity.factors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-300 text-sm">{factor}</span>
                        </li>
                    ))}
                    {data.metrics.complexity.factors.length === 0 && (
                        <li className="text-slate-500 italic">No major complexity factors detected.</li>
                    )}
                </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                   <ShieldAlert className="text-red-400" /> Custom Logic Risks
                </h2>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg">
                        <span className="text-slate-400">Logic Density</span>
                        <span className={`font-mono font-medium ${getDensityColor(data.metrics.logic.logicDensity)}`}>
                            {data.metrics.logic.logicDensity}
                        </span>
                    </div>
                     <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg">
                        <span className="text-slate-400">Manual Review Required?</span>
                        <span className={data.metrics.logic.requiresManualReview ? "text-red-400 font-bold" : "text-green-400"}>
                            {data.metrics.logic.requiresManualReview ? "YES" : "NO"}
                        </span>
                    </div>
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-8 border-t border-slate-800">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Proceed to Migration Plan <ArrowRight size={18} />
            </button>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subVal }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-slate-950 rounded-lg">{icon}</div>
                {subVal && <span className="text-xs text-slate-500 font-mono">{subVal}</span>}
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-1">{value.toLocaleString()}</div>
            <div className="text-sm text-slate-400 font-medium">{label}</div>
        </div>
    )
}
