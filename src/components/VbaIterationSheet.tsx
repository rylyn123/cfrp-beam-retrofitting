import React, { useState } from 'react';
import { IterationStep } from '../types/cfrp';
import { EXCEL_VBA_CODE } from '../utils/vbaCode';
import { Play, Copy, Check, Sparkles, Terminal, ArrowRight, Gauge } from 'lucide-react';

interface VbaIterationSheetProps {
  steps: IterationStep[];
  finalC: number;
  initialC: number;
  onRunSolver: () => void;
  isSolving: boolean;
}

export const VbaIterationSheet: React.FC<VbaIterationSheetProps> = ({
  steps,
  finalC,
  initialC,
  onRunSolver,
  isSolving,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'vba' | 'graph'>('table');

  const handleCopy = () => {
    navigator.clipboard.writeText(EXCEL_VBA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Min and max for SVG graph
  const cValues = steps.map((s) => s.c_assumed);
  const minC = Math.min(...cValues, initialC, finalC) - 2;
  const maxC = Math.max(...cValues, initialC, finalC) + 2;
  const graphWidth = 640;
  const graphHeight = 200;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold">
                Sheet 2: VBA Iteration Engine
              </span>
              <h1 className="text-xl font-bold text-slate-100">
                Neutral Axis Equilibrium Iteration Log
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Automated numerical convergence of neutral axis depth C based on internal force balance:
              T = As · fs + Af · ffe = C_c = α₁ · f'c · β₁ · b · c
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunSolver}
              disabled={isSolving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded flex items-center gap-2 transition-all shadow-md"
            >
              <Play className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'Solving...' : 'Run VBA Solver'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Initial Assumed C:</span>
            <strong className="text-amber-400 text-sm">{initialC.toFixed(2)} mm</strong>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Equilibrium Converged C:</span>
            <strong className="text-cyan-300 text-sm">{finalC.toFixed(2)} mm</strong>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Iteration Steps:</span>
            <strong className="text-emerald-400 text-sm">{steps.length} cycles</strong>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Final Residual Tolerance:</span>
            <strong className="text-slate-200 text-sm">
              &lt; 0.005 mm (
              {steps.length > 0 ? Math.abs(steps[steps.length - 1].diff).toFixed(5) : '0.000'} mm)
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
            activeTab === 'table'
              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Convergence Table ({steps.length} Steps)</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
            activeTab === 'graph'
              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Convergence Trajectory Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('vba')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
            activeTab === 'vba'
              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>View Excel VBA Macro Code</span>
        </button>
      </div>

      {/* Tab 1: Table */}
      {activeTab === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
            <span className="font-semibold text-slate-200">
              VBA Iteration Step-by-Step Simulation Table
            </span>
            <span className="text-[11px] text-slate-400">
              Updates in real-time as parameters change
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Cycle #</th>
                  <th className="py-2.5 px-3">Assumed C (mm)</th>
                  <th className="py-2.5 px-3">FRP Strain εfe</th>
                  <th className="py-2.5 px-3">Concrete εc</th>
                  <th className="py-2.5 px-3">Steel εs</th>
                  <th className="py-2.5 px-3">Factor β₁</th>
                  <th className="py-2.5 px-3">Factor α₁</th>
                  <th className="py-2.5 px-3">Calculated C (mm)</th>
                  <th className="py-2.5 px-3">Delta ΔC (mm)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {steps.map((st) => (
                  <tr
                    key={st.step}
                    className={`transition-colors ${
                      st.converged
                        ? 'bg-emerald-950/40 text-emerald-200 font-semibold'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 tabular-nums font-bold">
                      {st.step === 1 ? 'Initial (Trial 1)' : `Iter ${st.step}`}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-cyan-300 font-semibold">
                      {st.c_assumed.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 tabular-nums">{st.efe.toFixed(5)}</td>
                    <td className="py-2 px-3 tabular-nums">{st.ec.toFixed(5)}</td>
                    <td className="py-2 px-3 tabular-nums">{st.es.toFixed(5)}</td>
                    <td className="py-2 px-3 tabular-nums">{st.beta1.toFixed(4)}</td>
                    <td className="py-2 px-3 tabular-nums">{st.alpha1.toFixed(3)}</td>
                    <td className="py-2 px-3 tabular-nums font-semibold text-slate-200">
                      {st.c_calc.toFixed(4)}
                    </td>
                    <td
                      className={`py-2 px-3 tabular-nums ${
                        Math.abs(st.diff) < 0.005 ? 'text-emerald-400 font-bold' : 'text-amber-400'
                      }`}
                    >
                      {st.diff > 0 ? `+${st.diff.toFixed(4)}` : st.diff.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {st.converged ? (
                        <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded text-[10px]">
                          ✓ CONVERGED
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Iterating...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Graph */}
      {activeTab === 'graph' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-slate-200 text-sm">
              Neutral Axis Convergence Path: C_assumed → C_equilibrium
            </span>
            <span className="text-slate-400 text-xs">
              Initial: {initialC.toFixed(1)} mm → Equilibrium: {finalC.toFixed(1)} mm
            </span>
          </div>

          <div className="w-full flex justify-center py-4 bg-slate-950 rounded border border-slate-800">
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full max-w-2xl h-auto">
              {/* Axes */}
              <line x1="60" y1="20" x2="60" y2="160" stroke="#475569" strokeWidth="1" />
              <line x1="60" y1="160" x2="600" y2="160" stroke="#475569" strokeWidth="1" />

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 20 + 140 * (1 - ratio);
                const val = minC + (maxC - minC) * ratio;
                return (
                  <g key={idx}>
                    <line x1="55" y1={y} x2="600" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
                    <text x="50" y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end">
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Points & Polyline */}
              {(() => {
                if (steps.length === 0) return null;
                const stepCount = steps.length;
                const points = steps.map((s, idx) => {
                  const x = 60 + ((idx) / Math.max(1, stepCount - 1)) * 520;
                  const norm = (s.c_assumed - minC) / (maxC - minC || 1);
                  const y = 160 - norm * 140;
                  return `${x},${y}`;
                });

                return (
                  <g>
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      points={points.join(' ')}
                    />
                    {steps.map((s, idx) => {
                      const x = 60 + ((idx) / Math.max(1, stepCount - 1)) * 520;
                      const norm = (s.c_assumed - minC) / (maxC - minC || 1);
                      const y = 160 - norm * 140;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r={s.converged ? 5 : 3.5} fill={s.converged ? '#10b981' : '#38bdf8'} />
                          <text x={x} y={175} fill="#64748b" fontSize="8" textAnchor="middle">
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}

              <text x="330" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle">
                Iteration Step Index
              </text>
              <text
                x="20"
                y="90"
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                transform="rotate(-90 20 90)"
              >
                Depth C (mm)
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* Tab 3: VBA Code */}
      {activeTab === 'vba' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-200 text-sm">
              Original Microsoft Excel VBA Iteration Macro
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy VBA Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[11px] font-mono text-cyan-200 leading-relaxed max-h-[460px]">
            <code>{EXCEL_VBA_CODE}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
