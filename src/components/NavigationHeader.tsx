import React from 'react';
import { Printer, RefreshCw, Sparkles, BookOpen, Layers, Compass, Cloud } from 'lucide-react';

interface NavigationHeaderProps {
  activeSheet: 'flexure' | 'vba' | 'shear' | 'materials' | 'optimizer';
  setActiveSheet: (sheet: 'flexure' | 'vba' | 'shear' | 'materials' | 'optimizer') => void;
  onPrint: () => void;
  onReset: () => void;
  onRunSolver: () => void;
  onOpenCloudModal?: () => void;
  isSolving?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeSheet,
  setActiveSheet,
  onPrint,
  onReset,
  onRunSolver,
  onOpenCloudModal,
  isSolving,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
          CF
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-100 font-mono">
            CFRP Structural Engine
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            ACI 440.2R Design Calculation
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Workbook Sheets) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveSheet('flexure')}
          className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSheet === 'flexure'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Sheet 1: Flexure Design
        </button>

        <button
          onClick={() => setActiveSheet('vba')}
          className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSheet === 'vba'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Sheet 2: VBA Iteration
        </button>

        <button
          onClick={() => setActiveSheet('shear')}
          className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSheet === 'shear'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Sheet 3: Shear Retrofit
        </button>

        <button
          onClick={() => setActiveSheet('materials')}
          className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSheet === 'materials'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Sheet 4: Materials Library
        </button>

        <button
          onClick={() => setActiveSheet('optimizer')}
          className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSheet === 'optimizer'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          Sheet 5: DCR Optimizer
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {onOpenCloudModal && (
          <button
            onClick={onOpenCloudModal}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm border border-cyan-700/60"
            title="Open Firebase Cloud Projects & Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud Projects</span>
          </button>
        )}

        <button
          onClick={onRunSolver}
          disabled={isSolving}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm border border-emerald-500/40"
          title="Run VBA iteration solver for neutral axis depth c"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
          <span>Iterate VBA</span>
        </button>

        <button
          onClick={onPrint}
          className="px-3.5 py-1.5 text-xs font-mono font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          title="Print layout matching the scanned Excel calculation"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Calculation</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="Reset to Excel default parameters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
