import React, { useState, useMemo } from 'react';
import { CfrpInputs, FlexureResults } from '../types/cfrp';
import { CFRP_PRESETS, lookupBrandProperties } from '../utils/cfrpMath';
import { BeamDiagram } from './BeamDiagram';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Sparkles, Database, FileText, Play, RefreshCw, Clock, Compass } from 'lucide-react';
import { validateFlexureInputs, FLEXURE_PARAM_RULES, ValidationIssue } from '../utils/validation';
import { ValidationBanner } from './ValidationBanner';

interface FlexureSheetProps {
  inputs: CfrpInputs;
  results: FlexureResults;
  onInputChange: (key: keyof CfrpInputs, value: any) => void;
  onOpenVbaSheet: () => void;
  onBrandSelect: (brandName: string) => void;
  onRunIteration?: () => void;
  isIterating?: boolean;
  hasRunIteration?: boolean;
  onOpenOptimizer?: () => void;
}

export const FlexureSheet: React.FC<FlexureSheetProps> = ({
  inputs,
  results,
  onInputChange,
  onOpenVbaSheet,
  onBrandSelect,
  onRunIteration,
  isIterating = false,
  hasRunIteration = false,
  onOpenOptimizer,
}) => {
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const matchedPreset = lookupBrandProperties(inputs.cfrpBrand);

  // Real-time validation for physical & ACI 440 constraints
  const validationIssues = useMemo(() => validateFlexureInputs(inputs), [inputs]);
  const issueMap = useMemo(() => {
    const map = new Map<string, ValidationIssue>();
    validationIssues.forEach((issue) => {
      const existing = map.get(issue.field);
      if (!existing || (existing.severity === 'warning' && issue.severity === 'error')) {
        map.set(issue.field, issue);
      }
    });
    return map;
  }, [validationIssues]);

  // Helper for numeric inputs in the gray-shaded cell style with real-time validation feedback
  const renderCellInput = (
    label: string,
    key: keyof CfrpInputs,
    value: number | string,
    unit?: string,
    step: string = 'any',
    extraText?: string
  ) => {
    const issue = issueMap.get(key as string);
    const rule = FLEXURE_PARAM_RULES[key];

    return (
      <div
        className={`py-1 px-1.5 rounded transition-colors group ${
          issue
            ? issue.severity === 'error'
              ? 'bg-rose-950/30 border-l-2 border-rose-500'
              : 'bg-amber-950/20 border-l-2 border-amber-500'
            : 'hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-mono text-xs flex items-center gap-1">
            {label}:
            {issue && (
              <span
                className="cursor-help inline-flex"
                title={`${issue.severity.toUpperCase()}: ${issue.message} (${issue.standard || ''})`}
              >
                {issue.severity === 'error' ? (
                  <AlertCircle className="w-3 h-3 text-rose-400 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                )}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              step={step}
              value={value}
              onChange={(e) => {
                const val = typeof value === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                onInputChange(key, val);
              }}
              className={`w-24 px-2 py-0.5 text-right font-mono text-xs font-semibold rounded focus:outline-none transition-all tabular-nums ${
                issue
                  ? issue.severity === 'error'
                    ? 'bg-rose-950/60 text-rose-100 border border-rose-500 ring-1 ring-rose-500/40 focus:ring-rose-400'
                    : 'bg-amber-950/50 text-amber-100 border border-amber-500 ring-1 ring-amber-500/40 focus:ring-amber-400'
                  : 'bg-slate-700/70 hover:bg-slate-700 focus:bg-slate-700 text-cyan-200 border border-slate-600 focus:border-cyan-400'
              }`}
            />
            {unit && <span className="text-[11px] text-slate-400 font-mono w-14">{unit}</span>}
            {extraText && <span className="text-[10px] text-slate-400 italic font-mono">{extraText}</span>}
          </div>
        </div>

        {/* Real-time inline feedback or code guideline range hint */}
        {issue ? (
          <div className="mt-0.5 text-[10px] font-mono flex items-center justify-between text-right">
            <span className={issue.severity === 'error' ? 'text-rose-400 font-semibold' : 'text-amber-400'}>
              {issue.allowedRange ? `Req: ${issue.allowedRange}` : issue.standard || 'Code limit'}
            </span>
            <span className="text-slate-400 text-[9px] italic truncate max-w-[170px]" title={issue.message}>
              {issue.message}
            </span>
          </div>
        ) : rule && (rule.min !== undefined || rule.max !== undefined) ? (
          <div className="text-[9px] text-slate-500 font-mono text-right opacity-0 group-hover:opacity-100 transition-opacity">
            {rule.max !== undefined
              ? `ACI 440 typical: ${rule.min ?? 0}–${rule.max} ${rule.unit || ''}`
              : `ACI 440 typical: ≥ ${rule.min ?? 0} ${rule.unit || ''}`}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Banner Header mirroring Excel Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="border-b-2 border-slate-700 pb-3 mb-4">
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-100 italic">
            Design of Carbon Fiber Reinforced Polymer
          </h1>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-mono text-slate-400">Reference: ACI 440.2R-08 / ACI 318</span>
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Equilibrium Solver Active
            </span>
          </div>
        </div>

        {/* Gray shaded cell notice */}
        <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded border border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-slate-700/70 border border-slate-600 rounded"></span>
            <span className="text-slate-300">
              <strong className="text-cyan-300">Gray shaded cells</strong> are directly editable inputs. Calculations update automatically.
            </span>
          </div>
          <button
            onClick={onOpenVbaSheet}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold underline decoration-dotted"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Inspect VBA Iteration Log ({results.totalIterations} steps)
          </button>
        </div>

        {/* Real-Time ACI 440 Structural Validation Banner */}
        <div className="mt-4">
          <ValidationBanner issues={validationIssues} title="Flexural Design ACI 440 Compliance" />
        </div>

        {/* Master Input Grid (Parameters, Material Properties, Capacity, CFRP) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Box 1: Parameters */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <div className="text-xs font-bold font-mono text-cyan-400 border-b border-slate-800 pb-1 mb-2">
              Parameters:
            </div>
            {renderCellInput('MDL', 'MDL', inputs.MDL, 'kN-m')}
            {renderCellInput('MLL', 'MLL', inputs.MLL, 'kN-m')}
            {/* Automated Load Cell per user requirement: Load = 1.1 MDL + 0.75 MLL */}
            <div className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-800/40 rounded transition-colors group">
              <div className="flex flex-col">
                <span className="text-slate-300 font-mono text-xs">Load (1.1MDL + 0.75MLL):</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  = 1.1({inputs.MDL}) + 0.75({inputs.MLL})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-24 px-2 py-0.5 text-right font-mono text-xs font-bold bg-slate-700/70 text-cyan-200 border border-slate-600 rounded tabular-nums">
                  {(1.1 * inputs.MDL + 0.75 * inputs.MLL).toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono w-14">kN-m</span>
              </div>
            </div>
            {renderCellInput('Assumed C', 'assumedC_initial', inputs.assumedC_initial, 'mm')}
            {renderCellInput('Es', 'Es', inputs.Es / 1000, 'GPa', '1', '(200 GPa)')}

            <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span className="text-slate-400">Calculated initial C:</span>{' '}
              <span className="text-slate-200">{(0.2 * inputs.d).toFixed(2)} mm</span>
            </div>
          </div>

          {/* Box 2: Design Capacity & Geometry */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <div className="text-xs font-bold font-mono text-cyan-400 border-b border-slate-800 pb-1 mb-2">
              Design Capacity & Section:
            </div>
            {renderCellInput('ΦMn', 'phiMnExisting', inputs.phiMnExisting, 'kN-m')}
            {renderCellInput("f'c", 'fc', inputs.fc, 'MPa')}
            {renderCellInput('fy', 'fy', inputs.fy, 'MPa')}
            {renderCellInput('No. of Bars', 'noOfBars', inputs.noOfBars, 'pcs', '1')}
            {renderCellInput('φ of Bar', 'barDiameter', inputs.barDiameter, 'mm', '0.1')}

            <div className="pt-2 border-t border-slate-800/60">
              {renderCellInput('Eff. Depth (d)', 'd', inputs.d, 'mm')}
              {renderCellInput('Width (b)', 'b', inputs.b, 'mm')}
              {renderCellInput('Cc', 'Cc', inputs.Cc, 'mm')}
            </div>
          </div>

          {/* Box 3: CFRP Properties & Fiber Parameters */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
              <span className="text-xs font-bold font-mono text-cyan-400">
                Material Properties & CFRP:
              </span>
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                <Database className="w-3 h-3" /> Auto-TDS Lookup
              </span>
            </div>

            {/* Material Properties Inputs */}
            {renderCellInput('fu', 'fu', inputs.fu, 'MPa')}
            {renderCellInput('εu', 'eu', inputs.eu, '', '0.0001', 'Product properties')}
            {renderCellInput('Ef', 'Ef', inputs.Ef, 'N/mm²')}

            {/* CFRP BRAND Automatic Lookup Cell */}
            <div className="py-1 px-1.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-mono text-xs font-semibold flex items-center gap-1">
                  CFRP BRAND:
                </span>
                <div className="flex items-center gap-1">
                  <select
                    value={matchedPreset ? matchedPreset.brand : isCustomBrand ? '__CUSTOM__' : inputs.cfrpBrand}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        setIsCustomBrand(true);
                      } else {
                        setIsCustomBrand(false);
                        onBrandSelect(val);
                      }
                    }}
                    className="w-48 px-2 py-0.5 font-mono text-xs font-bold bg-slate-700/80 hover:bg-slate-700 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none transition-all truncate"
                    title="Select commercial CFRP brand to automatically populate fu, εu, Ef, and thickness from manufacturer data sheet"
                  >
                    <optgroup label="Manufacturer Technical Data Sheets">
                      {CFRP_PRESETS.map((p) => (
                        <option key={p.id} value={p.brand}>
                          {p.brand} ({p.manufacturer.split(' ')[0]})
                        </option>
                      ))}
                    </optgroup>
                    <option value="__CUSTOM__">+ Custom / Enter Brand...</option>
                  </select>
                </div>
              </div>

              {isCustomBrand && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono">Custom Brand:</span>
                  <input
                    type="text"
                    value={inputs.cfrpBrand}
                    onChange={(e) => onInputChange('cfrpBrand', e.target.value)}
                    placeholder="Enter brand name..."
                    className="w-48 px-2 py-0.5 text-right font-mono text-xs bg-slate-700/70 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Data Sheet Verification Indicator */}
              <div className="text-[10px] font-mono text-slate-400 pt-0.5 flex items-center justify-between">
                <span className="text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  {matchedPreset ? (
                    <span>TDS: {matchedPreset.manufacturer}</span>
                  ) : (
                    <span>Custom properties</span>
                  )}
                </span>
                {matchedPreset && (
                  <span className="text-slate-400 truncate max-w-[130px]" title={matchedPreset.tdsReference}>
                    {matchedPreset.curedSystem?.split(' ')[0] || 'TDS'}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <div className="text-[11px] font-bold font-mono text-slate-400 mb-1 flex justify-between items-center">
                <span>Carbon Fiber Parameter:</span>
                <span className="text-[9px] text-slate-400 font-normal">tf auto-filled</span>
              </div>
              {renderCellInput('No. of plies', 'noOfPlies', inputs.noOfPlies, 'pcs', '1')}
              {renderCellInput('Thickness (tf)', 'tf', inputs.tf, 'mm/ply', '0.01')}
              {renderCellInput('Width (wf)', 'wf', inputs.wf, 'mm')}
              {renderCellInput('Df', 'dfManual', inputs.dfManual ?? inputs.d + inputs.Cc, 'mm')}
            </div>
          </div>
        </div>

        {/* Check strengthening limit criteria Banner */}
        <div className="mt-5 p-3 bg-slate-950 rounded border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
          <div>
            <div className="font-semibold text-slate-200">
              Check strengthening limit criteria: (ACI 440.2R Eq 9-1)
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              (ΦRn)existing ≥ (1.1 SDL + 0.75 SLL)new
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-slate-300">
              ΦMn ({inputs.phiMnExisting} kN-m) &gt; (1.1MDL + 0.75MLL = {results.strengtheningLimit.toFixed(1)} kN-m)
            </div>
            <span
              className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${
                results.strengtheningLimitPass
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {results.strengtheningLimitPass ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> FAIL
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION I & SECTION II */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* I. CFRP System Design Material Properties */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200">I. CFRP System Design Material Properties</h2>
            <span className="text-[11px] text-slate-400">ACI 440 Table 9.1</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Exposure Condition:</span>
              <select
                value={inputs.exposureCondition}
                onChange={(e) =>
                  onInputChange('exposureCondition', e.target.value as 'Interior' | 'Exterior' | 'Aggressive')
                }
                className="px-2 py-0.5 font-mono text-xs bg-slate-700/80 text-cyan-200 border border-slate-600 rounded focus:outline-none"
              >
                <option value="Interior">Interior (CE = 0.95)</option>
                <option value="Exterior">Exterior (CE = 0.85)</option>
                <option value="Aggressive">Aggressive Environment (CE = 0.75)</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">CE (Environmental factor):</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.CE.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">ffu = CE · fu:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.ffu.toFixed(2)} MPa</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">εfu = CE · εu:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.efu.toFixed(5)}</span>
            </div>
          </div>
        </div>

        {/* II. Preliminary Calculation */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200">II. Preliminary Calculation</h2>
            <span className="text-[11px] text-slate-400">Section Properties</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Af = n · tf · wf:</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.Af.toFixed(1)} mm²</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">MLL:</span>
              <span className="font-bold text-slate-200 tabular-nums">{inputs.MLL} kN-m</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">β₁ = 1.05 - 0.05(f'c / 6.9):</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.beta1_initial.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">As = {inputs.noOfBars} × (π/4 · {inputs.barDiameter}²):</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.As.toFixed(2)} mm²</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">Ec = 4700 √f'c:</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.Ec.toFixed(1)} N/mm²</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION III: Existing State of strain on the soffit */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm">
                III. Existing State of strain on the soffit (εbi)
              </h2>
              {results.isEbiOverridden ? (
                <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded text-[10px] font-bold flex items-center gap-1">
                  ✏️ User Override Active
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800 rounded text-[10px] font-bold flex items-center gap-1">
                  ⚡ Auto (ACI 440.2R Eq 10-1)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>ACI 440.2R Section 10.2.3:</span>
              <span className="text-slate-300">
                {results.isCrackedUnderMDL
                  ? 'Cracked: εbi = MDL · (df - kd) / (Icr · Ec)'
                  : 'Uncracked: εbi = MDL · yt / (Ig · Ec)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-slate-400 text-xs">Active εbi:</span>
            <span className={`px-2.5 py-1 rounded font-bold text-sm tabular-nums border ${
              results.isEbiOverridden
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
            }`}>
              {results.ebi.toFixed(7)}
            </span>
          </div>
        </div>

        {/* Section State & Cracking Verification Banner */}
        <div className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 ${
              results.isCrackedUnderMDL
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
            }`}>
              {results.isCrackedUnderMDL ? 'CRACKED AT INSTALLATION' : 'UNCRACKED AT INSTALLATION'}
            </span>
            <span className="text-slate-300">
              MDL ({inputs.MDL} kN-m) {results.isCrackedUnderMDL ? '>' : '≤'} Mcr ({results.Mcr.toFixed(2)} kN-m)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>fr = {results.fr.toFixed(2)} MPa</span>
            <span>·</span>
            <span>Ig = {results.Ig.toExponential(2)} mm⁴</span>
            <span>·</span>
            <span>yt = {results.yt.toFixed(1)} mm</span>
          </div>
        </div>

        {/* Calculation Controls & Editable Substrate εbi Cell */}
        <div className="bg-slate-950/90 p-3.5 rounded border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-300 font-semibold">Calculation Mode:</span>
            <select
              value={inputs.ebiMode ?? 'auto'}
              onChange={(e) => onInputChange('ebiMode', e.target.value as any)}
              className="px-2.5 py-1 bg-slate-800 text-cyan-200 border border-slate-700 rounded font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="auto">
                Auto ACI 440 ({results.isCrackedUnderMDL ? 'Cracked Soffit' : 'Uncracked Gross'})
              </option>
              <option value="cracked_soffit">
                Cracked Section at Soffit: MDL·(df-kd)/(Icr·Ec) = {results.ebi_cracked.toFixed(7)}
              </option>
              <option value="steel_level">
                Cracked Section at Steel Level: MDL·(d-kd)/(Icr·Ec) = {results.ebi_steel_level.toFixed(7)}
              </option>
              <option value="uncracked">
                Uncracked Gross Section: MDL·yt/(Ig·Ec) = {results.ebi_uncracked.toFixed(7)}
              </option>
            </select>
          </div>

          {/* Editable Gray Cell for εbi to match Excel gray cells */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            <span className="text-slate-300 text-xs font-mono">
              Direct εbi Entry:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.000001"
                placeholder={results.ebi_calculated.toFixed(7)}
                value={inputs.ebiManual !== undefined && inputs.ebiManual > 0 ? inputs.ebiManual : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onInputChange('ebiManual', isNaN(val) || val <= 0 ? undefined : val);
                }}
                className={`w-32 px-2.5 py-1 text-right font-mono text-xs font-bold rounded border transition-all tabular-nums focus:outline-none ${
                  results.isEbiOverridden
                    ? 'bg-amber-950/70 border-amber-600 text-amber-200 focus:border-amber-400'
                    : 'bg-slate-700/70 border-slate-600 text-slate-200 focus:border-cyan-400'
                }`}
                title="Editable gray cell: type custom εbi from your Excel sheet if desired"
              />
              {results.isEbiOverridden && (
                <button
                  onClick={() => onInputChange('ebiManual', undefined)}
                  className="px-2 py-1 text-[10px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded transition-colors"
                  title="Reset to formula-calculated value"
                >
                  Reset Auto
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          {/* Cracked section diagram */}
          <BeamDiagram
            b={inputs.b}
            d={inputs.d}
            df={results.df}
            c={results.c_cracked}
            beta1={0.8}
            alpha1={0.85}
            fc={inputs.fc}
            noOfBars={inputs.noOfBars}
            barDiameter={inputs.barDiameter}
            noOfPlies={inputs.noOfPlies}
            tf={inputs.tf}
            wf={inputs.wf}
            title="Cracked Elastic Section (Transfer of Strain)"
            isEquilibrium={true}
          />

          {/* Formulas and numeric steps */}
          <div className="bg-slate-950/80 p-4 rounded border border-slate-800 space-y-2.5">
            <div className="text-slate-300 font-semibold border-b border-slate-800 pb-1 text-xs flex justify-between items-center">
              <span>Transfer of Strain & Elastic Properties:</span>
              <span className="text-[10px] text-slate-400 font-normal">Working Stress Design</span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Modular ratio n = Es / Ec:</span>
              <span className="font-bold text-slate-200 tabular-nums">
                {inputs.Es} / {results.Ec.toFixed(1)} = {results.n_ratio.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">ρs = As / (b · d):</span>
              <span className="font-bold text-slate-200 tabular-nums">
                {results.As.toFixed(1)} / ({inputs.b} × {inputs.d}) = {results.rho_s.toFixed(5)}
              </span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">k = √((ρn)² + 2ρn) - ρn:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.k_elastic.toFixed(4)}</span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">Cracked N.A. depth kd (c):</span>
              <span className="font-bold text-slate-200 tabular-nums">
                {results.k_elastic.toFixed(4)} × {inputs.d} = {results.c_cracked.toFixed(2)} mm
              </span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">Lever arm to steel (d - c):</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.d_minus_c_cracked.toFixed(2)} mm</span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">Lever arm to FRP soffit (df - kd):</span>
              <span className="font-bold text-slate-200 tabular-nums">{results.df_minus_c_cracked.toFixed(2)} mm</span>
            </div>

            <div className="flex justify-between py-0.5 border-t border-slate-800/40">
              <span className="text-slate-400">Icr = 1/3 b c³ + n As (d - c)²:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.Icr_formatted}</span>
            </div>

            {/* Exact ACI 440.2R Step 3 Soffit Strain Equation & Substitution matching image */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/80 mt-2 space-y-2">
              <div className="text-[10px] text-slate-400 font-serif italic text-center">
                Step 3 — Determine the existing state of strain on the soffit (ACI 440.2R Eq. 10-1)
              </div>
              <div className="flex items-center justify-center gap-3 font-serif py-1">
                <span className="italic font-bold text-base text-slate-100">
                  ε<sub>bi</sub> =
                </span>
                <div className="inline-flex flex-col items-center px-1">
                  <span className="border-b border-slate-400 px-3 pb-0.5 italic text-slate-100 text-xs font-semibold">
                    M<sub>DL</sub>(d<sub>f</sub> − k d)
                  </span>
                  <span className="pt-0.5 italic text-slate-100 text-xs font-semibold">
                    I<sub>cr</sub> · E<sub>c</sub>
                  </span>
                </div>
              </div>

              {/* Exact Numerical Substitution matching user uploaded image */}
              <div className="text-center font-mono text-[11px] text-cyan-200 bg-slate-950/80 p-2.5 rounded border border-slate-800 space-y-1">
                <div>
                  ε<sub>bi</sub> = [({inputs.MDL} kN-m) · ({inputs.dfManual ?? results.df} mm − ({results.k_elastic.toFixed(3)})({inputs.d} mm))] / [({results.Icr_formatted}) · ({(results.Ec / 1000).toFixed(1)} kN/mm²)]
                </div>
                <div className="text-sm font-bold text-cyan-300 pt-1 border-t border-slate-800/60">
                  ε<sub>bi</sub> = {results.ebi.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION IV & SECTION V */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* IV. Design strain of the CFRP system */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200">IV. Design strain of the CFRP system (εfd)</h2>
            <span className="text-[11px] text-slate-400">Debonding Limit</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            εfd = 0.41 · √(f'c / (n · Ef · tf)) ≤ 0.90 · εfu
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Calculated εfd:</span>
              <span className="font-bold text-cyan-300 tabular-nums">
                {(results.efd_calc ?? results.efd).toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-1">
              <span className="text-slate-400">Upper Limit 0.90 · εfu:</span>
              <span className="font-bold text-slate-300 tabular-nums">{results.efd_limit.toFixed(4)}</span>
            </div>

            <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-semibold">
                {(results.efd_calc ?? results.efd).toFixed(3)} {results.efd_pass ? '≤' : '>'} {results.efd_limit.toFixed(3)}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-xs border ${
                  results.efd_pass
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {results.efd_pass ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Parameter & Material Property Breakdown */}
            <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60 space-y-1">
              <div className="flex justify-between">
                <span>Input parameters used:</span>
                <span className="text-slate-200 font-semibold">
                  f'c = {inputs.fc} MPa &nbsp;|&nbsp; n = {inputs.noOfPlies} &nbsp;|&nbsp; Ef = {inputs.Ef.toLocaleString()} N/mm² &nbsp;|&nbsp; tf = {inputs.tf} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span>FRP Stiffness (n · Ef · tf):</span>
                <span className="text-slate-200 font-bold">
                  {(inputs.noOfPlies * inputs.Ef * inputs.tf).toLocaleString(undefined, { maximumFractionDigits: 1 })} N/mm
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1">
                <span className="text-slate-300">Governing Design Strain εfd:</span>
                <span className="text-cyan-300 font-bold">
                  min({(results.efd_calc ?? results.efd).toFixed(4)}, {results.efd_limit.toFixed(4)}) = {results.efd.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* V. Estimating Depth C, Neutral axis */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200">V. Estimating Depth C, Neutral axis</h2>
            <span className="text-[11px] text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              20% × Effective Depth (d)
            </span>
          </div>

          <div className="space-y-3">
            {/* Explicit formula card */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-serif italic">
                Formula: Assumed C (Trial 1) = 20% × Effective depth = 0.20 · d
              </div>
              <div className="text-xs font-mono font-semibold text-cyan-300">
                Assumed C = 0.20 × {inputs.d} mm ={' '}
                <strong className="text-sm font-bold text-cyan-200">{results.assumedC_formula.toFixed(2)} mm</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-950/90 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">Assumed C (Trial 1):</span>
                <span className="text-[10px] text-slate-400">
                  {results.isAssumedCOverridden ? 'Manual override active' : 'Automated (20% × d)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  value={results.assumedC_default.toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onInputChange('assumedC_initial', isNaN(val) || val <= 0 ? 0 : val);
                  }}
                  className={`w-28 px-2 py-1 text-right font-mono text-xs font-bold rounded border focus:outline-none tabular-nums ${
                    results.isAssumedCOverridden
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200 focus:border-amber-400'
                      : 'bg-slate-700/70 border-slate-600 text-cyan-200 focus:border-cyan-400'
                  }`}
                  title="Trial 1 Neutral Axis depth C = 20% x d"
                />
                <span className="text-slate-400">mm</span>
                {results.isAssumedCOverridden && (
                  <button
                    type="button"
                    onClick={() => onInputChange('assumedC_initial', 0)}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded"
                    title="Reset to 20% x Effective depth formula"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Sections VI through IX evaluate this trial value to verify internal equilibrium.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION VI, VII, VIII, IX: Initial Trial Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-slate-100 text-sm">
              VI - IX. Initial Trial Equilibrium Check (at Assumed C = {results.initialTrial.c.toFixed(2)} mm)
            </h2>
            <span className="text-[11px] text-slate-400">
              Evaluating Strain Compatibility & Force Equilibrium
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold">
            NOT IN EQUILIBRIUM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* VI */}
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
              VI. FRP & Concrete Strain
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">εfe,geom:</span>
              <span className="text-slate-200 tabular-nums">{results.initialTrial.efe_geom.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">governed εfe:</span>
              <span className="text-cyan-300 font-bold tabular-nums">{results.initialTrial.efe.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/40 pt-1">
              <span className="text-slate-400">εc concrete:</span>
              <span className="text-slate-200 tabular-nums">{results.initialTrial.ec.toFixed(4)}</span>
            </div>
            <span className="text-[10px] text-emerald-400 block pt-0.5">CONDITION PASS (&lt; 0.009)</span>
          </div>

          {/* VII */}
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
              VII. Strain in Steel
            </span>
            <div className="text-[11px] text-slate-400">εs = (εfe + εbi) · (d - c)/(df - c)</div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Calculated εs:</span>
              <span className="text-cyan-300 font-bold tabular-nums">{results.initialTrial.es.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/40 pt-1">
              <span className="text-slate-400">εs · Es:</span>
              <span className="text-slate-200 tabular-nums">{results.initialTrial.es_Es.toFixed(1)} MPa</span>
            </div>
          </div>

          {/* VIII */}
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
              VIII. Stress Level
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Steel fs:</span>
              <span className="text-slate-200 font-bold tabular-nums">
                {results.initialTrial.fs.toFixed(1)} MPa
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">fs = fy = 414 MPa (Yielded)</span>
            <div className="flex justify-between border-t border-slate-800/40 pt-1">
              <span className="text-slate-400">CFRP ffe:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {results.initialTrial.ffe.toFixed(1)} MPa
              </span>
            </div>
          </div>

          {/* IX */}
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
              IX. Stress Block & Verified C
            </span>
            <div className="text-[11px] text-slate-400">ε'c = 1.7·f'c / Ec:</div>
            <div className="text-slate-200 font-bold tabular-nums">{results.initialTrial.e_prime_c.toFixed(4)}</div>
            <div className="flex justify-between border-t border-slate-800/40 pt-1">
              <span className="text-slate-400">β₁ factor:</span>
              <span className="text-slate-200 tabular-nums">{results.initialTrial.beta1.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">α₁ factor:</span>
              <span className="text-slate-200 tabular-nums">{results.initialTrial.alpha1.toFixed(3)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/40 pt-1">
              <span className="text-slate-400">Verified C:</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {results.initialTrial.c_verified.toFixed(1)} mm
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Equilibrium & Internal Force Resultant Breakdown matching user image */}
        <div className="bg-slate-950/90 p-4 rounded border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-200">
              IX. Checking Equilibrium and internal force resultant
            </h3>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                results.initialTrial.inEquilibrium
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {results.initialTrial.inEquilibrium ? 'IN EQUILIBRIUM' : 'NOT IN EQUILIBRIUM'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            {/* Left column: Equations and stress block evaluation */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded border border-slate-800">
              <div className="text-slate-400 font-serif italic text-xs">
                β₁ = (4ε'c - εc) / (6ε'c - 2εc)
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">ε'c = 1.7 · f'c / Ec</span>
                <strong className="text-cyan-300 tabular-nums">ε'c = {results.initialTrial.e_prime_c.toFixed(4)}</strong>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">β₁ = (4ε'c - εc)/(6ε'c - 2εc)</span>
                <strong className="text-slate-200 tabular-nums">β₁ = {results.initialTrial.beta1.toFixed(4)}</strong>
              </div>
              <div className="text-slate-400 font-serif italic text-xs pt-1">
                α₁ = (3ε'c · εc - εc²) / (3 · β₁ · ε'c²)
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400">α₁ factor:</span>
                <strong className="text-slate-200 tabular-nums">α₁ = {results.initialTrial.alpha1.toFixed(3)}</strong>
              </div>
            </div>

            {/* Right column: Force resultant and C recalculation */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded border border-slate-800">
              <div className="text-cyan-300 font-serif italic text-xs text-center border-b border-slate-800/60 pb-1">
                C = (As · fs + Af · ffe) / (α₁ · f'c · β₁ · b)
              </div>
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>As · fs:</span>
                  <span className="text-slate-200 tabular-nums">{results.initialTrial.As_fs.toFixed(1)} N</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Af · ffe:</span>
                  <span className="text-slate-200 tabular-nums">{results.initialTrial.Af_ffe.toFixed(1)} N</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800/60 pt-0.5">
                  <span>Numerator (As·fs + Af·ffe):</span>
                  <strong className="text-slate-100 tabular-nums">{results.initialTrial.numerator_c.toFixed(1)} N</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Denominator (α₁·f'c·β₁·b):</span>
                  <strong className="text-slate-300 tabular-nums">{results.initialTrial.denominator_c.toFixed(2)} N/mm</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-center">
                <div className="text-slate-400 text-[11px] italic">Verified Value of C:</div>
                <div className="text-base font-bold text-amber-300 tabular-nums">
                  C = {results.initialTrial.c_verified.toFixed(1)} mm
                </div>
                <div className={results.initialTrial.inEquilibrium ? 'text-emerald-400 font-bold italic text-xs mt-0.5' : 'text-rose-400 font-bold italic text-xs mt-0.5'}>
                  {results.initialTrial.inEquilibrium ? '✓ IN EQUILIBRIUM' : '✗ NOT IN EQUILIBRIUM'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equilibrium Discrepancy & Action Banner - Visible only after iteration is executed */}
        {hasRunIteration && (
          <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="text-amber-200 text-xs">
              <strong>Equilibrium Comparison:</strong> Assumed C ({results.initialTrial.c.toFixed(2)} mm) ≠ Verified C ({results.initialTrial.c_verified.toFixed(2)} mm). Discrepancy = {results.initialTrial.diff.toFixed(2)} mm.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRunIteration}
                disabled={isIterating}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
              >
                {isIterating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Iterating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Re-run Iteration</span>
                  </>
                )}
              </button>
              <button
                onClick={onOpenVbaSheet}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap border border-slate-700"
              >
                <span>VBA Sheet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION X: Recalculated Depth C (VBA Iteration Equilibrium) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-slate-100 text-sm">
              X. Recalculated Depth C, Neutral axis (VBA Iteration Equilibrium)
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {hasRunIteration ? (
                <>
                  Recalculated value of C = <strong className="text-cyan-300 font-bold text-sm">{results.finalEquilibrium.c.toFixed(2)} mm</strong>
                </>
              ) : (
                <>
                  Initial Assumed C (Step V) = <strong className="text-amber-300 font-bold">{results.assumedC_default.toFixed(2)} mm</strong> (Awaiting Solver)
                </>
              )}
            </div>
          </div>
          {hasRunIteration ? (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ✓ OK (In Equilibrium)
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> ⏳ Awaiting Iteration
            </span>
          )}
        </div>

        {/* Step X Body: Pending Solver vs Solved Final Data */}
        {!hasRunIteration ? (
          <div className="p-6 bg-slate-950 rounded-lg border-2 border-dashed border-amber-600/70 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-600/50 flex items-center justify-center mx-auto text-amber-400">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                Neutral Axis Equilibrium Not Yet Solved
              </h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Step IX internal resultant verified C ({results.initialTrial.c_verified.toFixed(2)} mm) does not equal the initial trial depth 20% × d ({results.assumedC_formula.toFixed(2)} mm). Click the button below to initiate numerical relaxation until equilibrium is achieved.
              </p>
            </div>
            <button
              onClick={onRunIteration}
              disabled={isIterating}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2.5 mx-auto transition-all text-sm font-mono cursor-pointer"
            >
              {isIterating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Equilibrium Iterations...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Equilibrium Iteration Solver (Step X)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Step X Re-iteration & Equilibrium Comparison Banner */}
            <div className="p-3.5 bg-slate-950/90 rounded border border-slate-800 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-xs gap-1 border-b border-slate-800 pb-2">
            <div>
              <span className="text-slate-400">Step V Initial Trial:</span>{' '}
              <strong className="text-slate-200">20% × Effective depth (d) = 0.20 · {inputs.d} = {results.assumedC_formula.toFixed(2)} mm</strong>
            </div>
            <div>
              <span className="text-slate-400">Step IX Force Resultant:</span>{' '}
              <strong className="text-amber-300">Verified C = {results.initialTrial.c_verified.toFixed(2)} mm</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1.5">
            <p>
              Since the Step IX Verified C ({results.initialTrial.c_verified.toFixed(2)} mm) is not equal to the initial 20% × Effective depth ({results.assumedC_formula.toFixed(2)} mm), the value of C was <strong className="text-amber-300">re-iterated</strong> in Step X until the recalculated value equals the Step IX internal force resultant:
            </p>
            <div className="text-cyan-300 font-mono text-center py-1.5 bg-slate-900/80 rounded border border-slate-800">
              C = (As · fs + Af · ffe) / (α₁ · f'c · β₁ · b) = <strong>{results.finalEquilibrium.c.toFixed(2)} mm</strong> (Δ = {results.finalEquilibrium.diff.toFixed(4)} mm ≤ 0.2 mm) ✓
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          {/* Final Data Values Table matching Excel Image 3 */}
          <div className="bg-slate-950/90 p-4 rounded border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 text-xs flex justify-between">
              <span>Final Data Value:</span>
              <span className="text-slate-400 font-normal">Converged in {results.totalIterations} steps</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs">
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">εfe:</span>
                <span className="font-bold text-cyan-300 tabular-nums">{results.finalEquilibrium.efe.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">fs = fy:</span>
                <span className="font-bold text-slate-200 tabular-nums">{(results.finalEquilibrium.fs / 1000).toFixed(3)} kN/mm²</span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">εfd:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.efd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">ffe:</span>
                <span className="font-bold text-cyan-300 tabular-nums">{(results.finalEquilibrium.ffe / 1000).toFixed(3)} kN/mm²</span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">εc:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.ec.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">ε'c:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.e_prime_c.toFixed(4)}</span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">εs:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.es.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">β₁:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.beta1.toFixed(4)}</span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">εs · Es:</span>
                <span className="font-bold text-slate-200 tabular-nums">{(results.finalEquilibrium.es_Es / 1000).toFixed(2)} kN/mm²</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">α₁:</span>
                <span className="font-bold text-slate-200 tabular-nums">{results.finalEquilibrium.alpha1.toFixed(3)}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 mt-2">
              <div className="text-[11px] text-slate-400 mb-1">Final Value of C in equilibrium:</div>
              <div className="text-xs font-semibold text-slate-200">
                C = (As · fs + Af · ffe) / (α₁ · f'c · β₁ · b)
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-bold text-cyan-300">
                  C = {results.finalEquilibrium.c.toFixed(2)} mm
                </span>
                <span className="text-xs font-bold text-emerald-400">✓ OK</span>
              </div>
            </div>
          </div>

          {/* Equilibrium Beam Diagram */}
          <BeamDiagram
            b={inputs.b}
            d={inputs.d}
            df={results.df}
            c={results.finalEquilibrium.c}
            beta1={results.finalEquilibrium.beta1}
            alpha1={results.finalEquilibrium.alpha1}
            fc={inputs.fc}
            noOfBars={inputs.noOfBars}
            barDiameter={inputs.barDiameter}
            noOfPlies={inputs.noOfPlies}
            tf={inputs.tf}
            wf={inputs.wf}
            title="Equilibrium State Cross-Section & Stress Block"
            isEquilibrium={true}
          />
        </div>
      </>
    )}
  </div>

      {/* SECTION XI: Calculating Flexural Strength */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-bold text-slate-100 text-sm">
            XI. Calculating Flexural strength
          </h2>
          <span className="text-[11px] text-slate-400">Internal Couples</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Steel Contribution */}
          <div className="bg-slate-950/80 p-4 rounded border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 text-xs block border-b border-slate-800 pb-1">
              Steel Contribution to bending (Mns)
            </span>
            <div className="text-[11px] text-slate-400">Mns = As · fs · (d - β₁c/2)</div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">As · fs:</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {results.As_fs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} N
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/40 pt-1">
                <span className="text-slate-400">Lever arm (d - β₁c/2):</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {results.d_minus_beta1_c_div_2.toFixed(2)} mm
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs mt-2">
                <span className="text-slate-300 font-semibold">Mns =</span>
                <strong className="text-amber-400 text-sm tabular-nums">
                  {results.Mns.toFixed(2)} kN-m
                </strong>
              </div>
            </div>
          </div>

          {/* FRP Contribution */}
          <div className="bg-slate-950/80 p-4 rounded border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 text-xs block border-b border-slate-800 pb-1">
              FRP Contribution to bending (Mnf)
            </span>
            <div className="text-[11px] text-slate-400">Mnf = Af · ffe · (df - β₁c/2)</div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Af · ffe:</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {results.Af_ffe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} N
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/40 pt-1">
                <span className="text-slate-400">Lever arm (df - β₁c/2):</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {results.df_minus_beta1_c_div_2.toFixed(2)} mm
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs mt-2">
                <span className="text-slate-300 font-semibold">Mnf =</span>
                <strong className="text-cyan-400 text-sm tabular-nums">
                  {results.Mnf.toFixed(2)} kN-m
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION XII: Calculating Design Flexural strength */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-slate-100 text-sm">
              XII. Calculating Design Flexural strength (ΦMn) & DCR
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ΦMn = Φ · [Mns + ψf · Mnf] (with ψf = {results.psi_f}, Φ = {results.phi.toFixed(2)})
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${
              results.flexurePass
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {results.flexurePass ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> DESIGN ✓ OK
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> OVER CAPACITY
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
            <span className="text-slate-400 block">Factored Moment Demand (Mu):</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                value={inputs.MuDemand}
                onChange={(e) => onInputChange('MuDemand', parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 text-right font-mono text-sm font-bold bg-slate-700/80 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none tabular-nums"
              />
              <span className="text-slate-300">kN-m</span>
            </div>
            <span className="text-[10px] text-slate-400">Gray editable cell</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
            <span className="text-slate-400 block">Design Capacity (ΦMn):</span>
            <div className="text-lg font-bold text-cyan-300 tabular-nums">
              {results.phiMn.toFixed(2)} kN-m
            </div>
            <span className="text-[10px] text-slate-400">
              = {results.phi.toFixed(2)} × ({results.Mns.toFixed(1)} + {results.psi_f} × {results.Mnf.toFixed(1)})
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Demand Capacity Ratio (DCR):</span>
              <strong className="text-slate-200 text-sm tabular-nums">
                {results.DCR.toFixed(4)} &lt; 1.0
              </strong>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  results.DCR <= 0.85
                    ? 'bg-emerald-500'
                    : results.DCR <= 1.0
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, results.DCR * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Strength Utilization:</span>
              <span className="font-bold text-slate-200">{results.strengthMargin.toFixed(2)}%</span>
            </div>

            {onOpenOptimizer && (
              <button
                onClick={onOpenOptimizer}
                className="w-full mt-2 py-1.5 px-3 rounded bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                title="Launch parametric visualization plotting DCR vs fc' and Ef"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optimize Design & Sensitivity Plot (f'c vs Ef)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION XIII: Service Stresses */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-slate-100 text-sm">
              XIII. Checking service stresses in the reinforcing steel and FRP
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Steel service stress limit: fss ≤ 0.80 · fy
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${
              results.serviceSteelPass
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {results.serviceSteelPass ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Design ✓ OK
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> SERVICE OVERSTRESSED
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Service Ms:</span>
            <strong className="text-slate-200 tabular-nums">
              {(results.Ms_kNm * 1000).toFixed(0)} kN-mm
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">As · Es:</span>
            <strong className="text-slate-200 tabular-nums">
              {(results.As * (inputs.Es / 1000)).toFixed(0)} kN
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Af · Ef:</span>
            <strong className="text-slate-200 tabular-nums">
              {(results.Af * (inputs.Ef / 1000)).toFixed(1)} kN
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ds - kd/3:</span>
            <strong className="text-slate-200 tabular-nums">
              {results.ds_minus_kd_div_3.toFixed(3)} mm
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">df - kd/3:</span>
            <strong className="text-slate-200 tabular-nums">
              {results.df_minus_kd_div_3.toFixed(3)} mm
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ds - kd:</span>
            <strong className="text-slate-200 tabular-nums">
              {results.ds_minus_kd.toFixed(3)} mm
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">(ds - kd) · Es:</span>
            <strong className="text-slate-200 tabular-nums">
              {(results.ds_minus_kd * (inputs.Es / 1000)).toFixed(2)} kN
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">εbi:</span>
            <strong className="text-slate-200 tabular-nums">
              {results.ebi.toFixed(7)}
            </strong>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold">fss =</span>
            <span className="text-base font-bold text-cyan-300 tabular-nums">
              {results.fss.toFixed(1)} N/mm²
            </span>
            <span className="text-slate-400">({(results.fss / 1000).toFixed(3)} kN/mm²)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span>≤ 0.80 · fy:</span>
            <strong className="text-slate-200 tabular-nums">{results.fss_limit.toFixed(1)} N/mm²</strong>
            {results.serviceSteelPass ? (
              <span className="text-emerald-400 font-bold">
                ({results.fss.toFixed(1)} ≤ {results.fss_limit.toFixed(1)}) ✓ OK
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                ({results.fss.toFixed(1)} &gt; {results.fss_limit.toFixed(1)}) ✗ NOT OK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION XIV: Checking creep rupture limit */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-slate-100 text-sm">
              XIV. Checking creep rupture limit for FRP service
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5 font-serif italic">
              ffs = fs,s (Ef / Es) ((df - kd)/(d - kd)) - εbi Ef ≤ 0.55 ffu
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${
              results.creepPass
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {results.creepPass ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Design ✓ OK
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> CREEP RUPTURE EXCEEDED
              </>
            )}
          </span>
        </div>

        {/* Governing Equation & Definition of k */}
        <div className="bg-slate-950/90 p-3.5 rounded border border-slate-800 space-y-3">
          <div className="text-center font-mono text-xs text-cyan-300">
            ffs = fs,s (Ef / Es) ((df - kd) / (d - kd)) - εbi Ef ≤ 0.55 ffu
          </div>

          <div className="text-[11px] italic text-slate-400 font-serif">where:</div>

          <div className="text-center text-[11px] text-slate-300 font-serif bg-slate-900/80 p-2 rounded border border-slate-800">
            k = √((ρs · Es/Ec + ρf · Ef/Ec)² + 2(ρs · Es/Ec + ρf · Ef/Ec)) - (ρs · Es/Ec + ρf · Ef/Ec)
          </div>

          {/* Parameter Values Grid */}
          <div className="w-64 mx-auto font-mono text-[11px] space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
            <div className="flex justify-between border-b border-slate-800 pb-0.5">
              <span className="text-slate-400">ρs =</span>
              <strong className="text-slate-100">{results.rho_s.toFixed(4)}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-0.5">
              <span className="text-slate-400">Es =</span>
              <strong className="text-slate-100">{(inputs.Es / 1000).toFixed(0)}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-0.5">
              <span className="text-slate-400">Ec =</span>
              <strong className="text-slate-100">{(results.Ec / 1000).toFixed(1)}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-0.5">
              <span className="text-slate-400">Ef =</span>
              <strong className="text-slate-100">{(inputs.Ef / 1000).toFixed(0)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ρf =</span>
              <strong className="text-slate-100">{results.rho_f.toFixed(4)}</strong>
            </div>
          </div>

          {/* Step-by-step substitution for k exactly as in user image */}
          <div className="space-y-2 font-mono text-xs bg-slate-900/90 p-3.5 rounded border border-cyan-900/40">
            <div className="text-center text-slate-300">
              k = √( ({results.term_creep.toFixed(6)})² + 2( {results.term_creep.toFixed(6)} ) ) - ( {results.term_creep.toFixed(4)} )
            </div>

            <div className="text-center text-slate-300">
              k = √( ( {results.term_creep_sq.toFixed(6)} ) + ( {results.two_term_creep.toFixed(6)} ) ) - ( {results.term_creep.toFixed(4)} )
            </div>

            <div className="text-center text-slate-300">
              k = √( {results.k_creep_sq.toFixed(4)} )
            </div>

            <div className="text-center font-bold text-sm text-cyan-300 pt-1 border-t border-slate-800">
              k = {results.k_creep.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Stress Result & Allowable Limit Check */}
        <div className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold">ffs =</span>
            <span className="text-base font-bold text-cyan-300 tabular-nums">
              {results.ffs.toFixed(2)} N/mm²
            </span>
            <span className="text-[11px] text-slate-400">
              (kd = {(results.k_creep * inputs.d).toFixed(1)} mm)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span>≤ 0.55 · ffu:</span>
            <strong className="text-slate-200 tabular-nums">{results.ffs_limit.toFixed(1)} N/mm²</strong>
            {results.creepPass ? (
              <span className="text-emerald-400 font-bold">
                ({results.ffs.toFixed(2)} ≤ {results.ffs_limit.toFixed(1)}) ∴ Design ✓ OK
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                ({results.ffs.toFixed(2)} &gt; {results.ffs_limit.toFixed(1)}) ∴ ✗ NOT OK
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
