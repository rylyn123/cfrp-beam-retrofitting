import React, { useState, useMemo } from 'react';
import { ShearInputs, ShearResults, CfrpPreset } from '../types/cfrp';
import { CFRP_PRESETS, lookupBrandProperties } from '../utils/cfrpMath';
import { AddMaterialModal } from './AddMaterialModal';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Printer,
  Database,
  Sparkles,
  Layers,
  Bookmark,
  Check,
  ShieldCheck,
  Sun,
  Umbrella,
  CloudSun,
  Calculator,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Trash2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { validateShearInputs, SHEAR_PARAM_RULES, ValidationIssue } from '../utils/validation';
import { ValidationBanner } from './ValidationBanner';

interface ShearSheetProps {
  inputs: ShearInputs;
  results: ShearResults;
  onInputChange: (key: keyof ShearInputs, value: any) => void;
  onBrandSelect: (brandName: string) => void;
  onPrint?: () => void;
  onOpenMaterialsSheet?: () => void;
  customPresets?: CfrpPreset[];
  onAddCustomPreset?: (preset: CfrpPreset) => void;
  onDeleteCustomPreset?: (id: string) => void;
  onOpenOptimizer?: () => void;
}

export const ShearSheet: React.FC<ShearSheetProps> = ({
  inputs,
  results,
  onInputChange,
  onBrandSelect,
  onPrint,
  onOpenMaterialsSheet,
  customPresets = [],
  onAddCustomPreset,
  onDeleteCustomPreset,
  onOpenOptimizer,
}) => {
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);

  const allAvailablePresets = [...CFRP_PRESETS, ...customPresets];

  // Active matched preset
  const matchedPreset =
    lookupBrandProperties(inputs.cfrpBrand || '', customPresets) ||
    allAvailablePresets.find(
      (p) =>
        p.brand.toLowerCase() === (inputs.cfrpBrand || '').toLowerCase() ||
        (Math.abs(p.fu - inputs.fu) < 1 &&
          Math.abs(p.Ef - inputs.Ef) < 100 &&
          Math.abs(p.eu - inputs.eu) < 0.0005 &&
          Math.abs(p.tf - inputs.tf) < 0.01)
    );

  // Real-time validation for physical & ACI 440 constraints
  const validationIssues = useMemo(() => validateShearInputs(inputs), [inputs]);
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

  const renderCellInput = (
    label: string,
    key: keyof ShearInputs,
    value: number | string,
    unit?: string,
    step: string = 'any',
    helperText?: string
  ) => {
    const issue = issueMap.get(key as string);
    const rule = SHEAR_PARAM_RULES[key];

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
          <div className="flex flex-col">
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
            {helperText && <span className="text-[10px] text-slate-500 font-mono">{helperText}</span>}
          </div>
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                Sheet 3: Shear Strengthening
              </span>
              <h1 className="text-xl font-bold text-slate-100">
                ACI 440.2R Shear Strengthening of RC Beams
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Transverse shear reinforcement calculation using externally bonded CFRP U-wraps or closed jackets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 ${
                results.shearPass
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {results.shearPass ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> SHEAR DESIGN ✓ OK
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" /> SHEAR OVERLOAD
                </>
              )}
            </span>

            {onPrint && (
              <button
                onClick={onPrint}
                className="px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all border border-cyan-400/30"
                title="Print layout matching the scanned Excel calculation for Sheet 3"
              >
                <Printer className="w-4 h-4" />
                <span>Print Calculation</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature 1: Material Systems Quick-Select Bar */}
        <div className="mt-4 p-3 bg-slate-950/90 rounded-lg border border-cyan-900/40 space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200 text-xs">
                CFRP Material System Selector (Active TDS Library):
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Actively updates Ef, tf, εu, fu & Le
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(true)}
                className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Add new CFRP material system into library"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                + Add Material System
              </button>

              <button
                onClick={() => setShowFullCatalog(!showFullCatalog)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold underline decoration-dotted"
              >
                {showFullCatalog ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Collapse Catalog ({allAvailablePresets.length})
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> View All {allAvailablePresets.length} Systems
                  </>
                )}
              </button>

              {onOpenMaterialsSheet && (
                <button
                  onClick={onOpenMaterialsSheet}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Bookmark className="w-3 h-3" /> Sheet 4: Materials Tab
                </button>
              )}
            </div>
          </div>

          {/* Quick-select chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Quick Add Button Chip */}
            <button
              type="button"
              onClick={() => setShowAddMaterialModal(true)}
              className="px-2 py-1 rounded text-[11px] font-mono border border-dashed border-cyan-500/70 hover:border-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-semibold flex items-center gap-1 transition-all"
              title="Add a custom CFRP Material System"
            >
              <PlusCircle className="w-3 h-3" />
              <span>+ Add System</span>
            </button>

            {/* Custom Presets first */}
            {customPresets.map((preset) => {
              const isSelected =
                (inputs.cfrpBrand && inputs.cfrpBrand.toLowerCase() === preset.brand.toLowerCase()) ||
                (inputs.fu === preset.fu && inputs.Ef === preset.Ef && Math.abs(inputs.tf - preset.tf) < 0.01);
              return (
                <div key={preset.id} className="relative group inline-flex items-center">
                  <button
                    onClick={() => {
                      setIsCustomBrand(false);
                      onBrandSelect(preset.brand);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-purple-900/80 text-purple-200 border-purple-500 font-bold shadow-sm ring-1 ring-purple-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-purple-800/60'
                    }`}
                    title={`Custom: ${preset.name} - fu:${preset.fu}MPa, Ef:${preset.Ef}MPa, tf:${preset.tf}mm`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-purple-300" />}
                    <span className="font-bold">{preset.brand}</span>
                    <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 border border-purple-700">Custom</span>
                    <span className="text-[9px] text-slate-400">({preset.tf}mm)</span>
                  </button>
                  {onDeleteCustomPreset && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove custom material system "${preset.brand}"?`)) {
                          onDeleteCustomPreset(preset.id);
                        }
                      }}
                      className="ml-0.5 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete this custom preset"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Standard Built-in Presets */}
            {CFRP_PRESETS.slice(0, 6).map((preset) => {
              const isSelected =
                (inputs.cfrpBrand && inputs.cfrpBrand.toLowerCase() === preset.brand.toLowerCase()) ||
                (inputs.fu === preset.fu && inputs.Ef === preset.Ef && Math.abs(inputs.tf - preset.tf) < 0.01);
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setIsCustomBrand(false);
                    onBrandSelect(preset.brand);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-cyan-900/80 text-cyan-200 border-cyan-500 font-bold shadow-sm ring-1 ring-cyan-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={`${preset.name} - fu:${preset.fu}MPa, Ef:${preset.Ef}MPa, tf:${preset.tf}mm`}
                >
                  {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                  <span>{preset.brand}</span>
                  <span className="text-[9px] text-slate-400">({preset.tf}mm)</span>
                </button>
              );
            })}
          </div>

          {/* Full catalog expander */}
          {showFullCatalog && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
              {allAvailablePresets.map((preset) => {
                const isSelected =
                  (inputs.cfrpBrand && inputs.cfrpBrand.toLowerCase() === preset.brand.toLowerCase()) ||
                  (inputs.fu === preset.fu && inputs.Ef === preset.Ef && Math.abs(inputs.tf - preset.tf) < 0.01);
                const isCustom = preset.id.startsWith('custom-');
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setIsCustomBrand(false);
                      onBrandSelect(preset.brand);
                    }}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? isCustom
                          ? 'bg-purple-950/60 border-purple-500 shadow ring-1 ring-purple-500/30'
                          : 'bg-cyan-950/60 border-cyan-500 shadow ring-1 ring-cyan-500/30'
                        : isCustom
                        ? 'bg-slate-900/90 border-purple-900/60 hover:border-purple-600'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs ${isCustom ? 'text-purple-300' : 'text-cyan-300'}`}>
                          {preset.brand}
                        </span>
                        {isCustom && (
                          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            Custom
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isCustom ? 'text-purple-300' : 'text-cyan-400'}`}>
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Click to load</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{preset.name}</div>
                    <div className="mt-1 pt-1 border-t border-slate-800 grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                      <div>
                        fu: <strong className="text-slate-100">{preset.fu} MPa</strong>
                      </div>
                      <div>
                        εu: <strong className="text-slate-100">{preset.eu}</strong>
                      </div>
                      <div>
                        Ef: <strong className="text-slate-100">{preset.Ef.toLocaleString()} MPa</strong>
                      </div>
                      <div>
                        tf: <strong className={isCustom ? 'text-purple-300 font-bold' : 'text-cyan-300 font-bold'}>{preset.tf} mm</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Material Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Active System:</span>
              <span className="text-cyan-300 font-bold">{inputs.cfrpBrand || 'Custom CFRP'}</span>
              <span className="text-slate-600">|</span>
              <span>
                Ef = <strong className="text-slate-200">{inputs.Ef.toLocaleString()} N/mm²</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                tf = <strong className="text-cyan-300">{inputs.tf} mm/ply</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                εu = <strong className="text-slate-200">{inputs.eu}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                fu = <strong className="text-slate-200">{inputs.fu} MPa</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded font-mono">
                Active Bond Length Le = <strong>{results.Le.toFixed(3)} mm</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Feature 2: Prominent Interactive Environmental Exposure Condition & CE Selector */}
        <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200 text-xs">
                Environmental Exposure Condition & CE Factor (ACI 440.2R Table 9.1):
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Automatic CE reduction factor actively recalculates ffu, εfu, κv, εfe, and Vf
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Interior Option */}
            <button
              onClick={() => onInputChange('exposureCondition', 'Interior')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                inputs.exposureCondition === 'Interior'
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/40 text-cyan-100'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs flex items-center gap-1 text-slate-200">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Interior Exposure
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    inputs.exposureCondition === 'Interior'
                      ? 'bg-cyan-900 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CE = 0.95
                </span>
              </div>
              <div className="text-[10px] mt-1 text-slate-400 leading-tight">
                Indoor protected environment, building enclosures.
              </div>
            </button>

            {/* Exterior Option */}
            <button
              onClick={() => onInputChange('exposureCondition', 'Exterior')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                inputs.exposureCondition === 'Exterior'
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/40 text-cyan-100'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs flex items-center gap-1 text-slate-200">
                  <CloudSun className="w-3.5 h-3.5 text-sky-400" /> Exterior Exposure
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    inputs.exposureCondition === 'Exterior'
                      ? 'bg-cyan-900 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CE = 0.85
                </span>
              </div>
              <div className="text-[10px] mt-1 text-slate-400 leading-tight">
                Bridges, piers, unenclosed parking garages, outdoor beams.
              </div>
            </button>

            {/* Aggressive Option */}
            <button
              onClick={() => onInputChange('exposureCondition', 'Aggressive')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                inputs.exposureCondition === 'Aggressive'
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/40 text-cyan-100'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs flex items-center gap-1 text-slate-200">
                  <Umbrella className="w-3.5 h-3.5 text-rose-400" /> Aggressive Env.
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    inputs.exposureCondition === 'Aggressive'
                      ? 'bg-cyan-900 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CE = 0.75
                </span>
              </div>
              <div className="text-[10px] mt-1 text-slate-400 leading-tight">
                Chemical plants, wastewater treatment, marine tidal zones.
              </div>
            </button>
          </div>

          {/* Real-time Environmental Property Calculations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CE Factor:</span>
              <span className="font-bold text-cyan-300 text-sm font-mono">{results.CE.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">Table 9.1</span>
            </div>

            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Design Tensile ffu:</span>
              <span className="font-bold text-slate-100 text-sm font-mono">
                {results.ffu.toFixed(1)} MPa
              </span>
              <span className="text-[9px] text-slate-500 block">
                = {results.CE.toFixed(2)} × {inputs.fu} MPa
              </span>
            </div>

            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Design Rupture Strain εfu:</span>
              <span className="font-bold text-slate-100 text-sm font-mono">
                {results.efu.toFixed(5)}
              </span>
              <span className="text-[9px] text-slate-500 block">
                = {results.CE.toFixed(2)} × {inputs.eu}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Effective CFRP Strain εfe:</span>
              <span className="font-bold text-cyan-300 text-sm font-mono">
                {results.efe.toFixed(5)}
              </span>
              <span className="text-[9px] text-slate-500 block">
                ≤ min(0.004, κv·εfu)
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time ACI 440 Structural Validation Banner */}
        <div className="mt-4">
          <ValidationBanner issues={validationIssues} title="Shear Retrofit ACI 440 Compliance" />
        </div>

        {/* Input Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Column 1: Demands & Existing Concrete */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block border-b border-slate-800 pb-1 mb-2">
              Demands & Existing Shear:
            </span>
            {renderCellInput('Vu Demand', 'VuDemand', inputs.VuDemand, 'kN')}
            {renderCellInput('Vc Concrete', 'VcExisting', inputs.VcExisting, 'kN')}
            {renderCellInput('Vs Stirrups', 'VsExisting', inputs.VsExisting, 'kN')}
            {renderCellInput('Eff. Depth (d)', 'd', inputs.d, 'mm')}
            {renderCellInput('Web Width (b)', 'b', inputs.b, 'mm')}
            {renderCellInput('Total Height (h)', 'h', inputs.h, 'mm')}
          </div>

          {/* Column 2: CFRP Strips & Configuration */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block border-b border-slate-800 pb-1 mb-2">
              CFRP Strip Geometry:
            </span>
            <div className="flex items-center justify-between py-1 px-1.5">
              <span className="text-slate-300">Wrapping Scheme:</span>
              <select
                value={inputs.scheme}
                onChange={(e) => onInputChange('scheme', e.target.value)}
                className="px-2 py-0.5 font-mono text-xs bg-slate-700/80 text-cyan-200 border border-slate-600 rounded focus:outline-none"
              >
                <option value="u_wrap">3-Sided U-Wrap</option>
                <option value="completely_wrapped">Completely Wrapped</option>
                <option value="two_sided">Two-Sided Bonded</option>
              </select>
            </div>
            {renderCellInput('Strip Width (wf)', 'wf', inputs.wf, 'mm')}
            {(() => {
              const hasOverlap = inputs.wf > 0 && inputs.sf < inputs.wf;
              const overlapPct = hasOverlap ? ((inputs.wf - inputs.sf) / inputs.wf) * 100 : 0;
              const helperText = hasOverlap
                ? overlapPct <= 50.01
                  ? `${overlapPct.toFixed(0)}% overlap (≤50% allowed)`
                  : `${overlapPct.toFixed(0)}% overlap (>50% limit)`
                : inputs.sf > inputs.wf
                ? `Clear gap: ${(inputs.sf - inputs.wf).toFixed(0)} mm`
                : 'Edge-to-edge';
              return renderCellInput('Spacing (sf)', 'sf', inputs.sf, 'mm', undefined, helperText);
            })()}
            {renderCellInput('No. of Plies (n)', 'noOfPlies', inputs.noOfPlies, 'pcs', '1')}
            {renderCellInput('Ply Thickness (tf)', 'tf', inputs.tf, 'mm/ply', '0.001', 'Single ply thickness')}
            {renderCellInput('Fiber Angle α', 'angleAlpha', inputs.angleAlpha, 'deg', '1', '0° to 90°')}
          </div>

          {/* Column 3: Material & Concrete */}
          <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
              <span className="font-bold text-cyan-400 block text-xs">
                Material Properties & CFRP:
              </span>
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                <Database className="w-3 h-3" /> Auto-TDS Lookup
              </span>
            </div>

            {renderCellInput("f'c concrete", 'fc', inputs.fc, 'MPa')}

            {/* CFRP BRAND Automatic Lookup Selector */}
            <div className="py-1 px-1.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-1 my-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-mono text-xs font-semibold flex items-center gap-1">
                  CFRP BRAND:
                </span>
                <div className="flex items-center gap-1">
                  <select
                    value={matchedPreset ? matchedPreset.brand : isCustomBrand ? '__CUSTOM__' : inputs.cfrpBrand || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        setIsCustomBrand(true);
                      } else {
                        setIsCustomBrand(false);
                        onBrandSelect(val);
                      }
                    }}
                    className="w-44 px-2 py-0.5 font-mono text-xs font-bold bg-slate-700/80 hover:bg-slate-700 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none transition-all truncate"
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
                    value={inputs.cfrpBrand || ''}
                    onChange={(e) => onInputChange('cfrpBrand', e.target.value)}
                    placeholder="Enter brand name..."
                    className="w-44 px-2 py-0.5 text-right font-mono text-xs bg-slate-700/70 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none"
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
                  <span className="text-[9px] text-slate-400">
                    tf={matchedPreset.tf}mm · Ef={matchedPreset.Ef.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {renderCellInput('fu tensile', 'fu', inputs.fu, 'MPa', 'any', 'CFRP ultimate tensile strength')}
            {renderCellInput('εu rupture strain', 'eu', inputs.eu, '', '0.0001', 'CFRP ultimate strain')}
            {renderCellInput('Ef modulus', 'Ef', inputs.Ef, 'N/mm²', 'any', 'CFRP tensile modulus of elasticity')}

            <div className="flex items-center justify-between py-1 px-1.5 border-t border-slate-800/40">
              <span className="text-slate-400">Exposure Condition:</span>
              <span className="font-bold text-cyan-300 tabular-nums">
                {inputs.exposureCondition} (CE={results.CE.toFixed(2)})
              </span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 border-t border-slate-800/40">
              <span className="text-slate-400">Design ffu = CE · fu:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.ffu.toFixed(1)} MPa</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 border-t border-slate-800/40">
              <span className="text-slate-400">Design εfu = CE · εu:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{results.efu.toFixed(5)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shear Intermediate Calculations & Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Box A: Bond Reduction & Design Strain */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <span className="font-bold text-slate-200 text-sm block border-b border-slate-800 pb-2">
            Bond Reduction Factors (ACI 440.2R Section 10.2)
          </span>

          <div className="space-y-2">
            {/* Active Bond Length Card */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Active Bond Length (Le):
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                    results.isLeOverridden
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {results.Le.toFixed(3)} mm
                </span>
              </div>

              <div className="text-[11px] text-cyan-400 font-mono font-semibold">
                ACI 440.2R Eq. (11-8): Le = 23300 / (n · tf · Ef)^0.58
              </div>

              <div className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded border border-slate-800/80">
                <div>
                  n·tf·Ef = {inputs.noOfPlies} × {inputs.tf} × {inputs.Ef.toLocaleString()} ={' '}
                  <strong className="text-slate-100">{results.n_tf_Ef.toFixed(0)} N/mm</strong>
                </div>
                <div className="mt-0.5">
                  Le = 23300 / ({results.n_tf_Ef.toFixed(0)})^0.58 ={' '}
                  <strong className="text-cyan-300 font-bold text-xs">{results.Le_calculated.toFixed(3)} mm</strong>
                </div>
              </div>

              {/* Direct Le Entry Cell */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400">Direct Le Manual Override:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.001"
                    placeholder={results.Le_calculated.toFixed(3)}
                    value={inputs.LeManual !== undefined && inputs.LeManual > 0 ? inputs.LeManual : ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onInputChange('LeManual', isNaN(val) || val <= 0 ? undefined : val);
                    }}
                    className={`w-24 px-2 py-0.5 text-right font-mono text-xs font-bold rounded border transition-all tabular-nums focus:outline-none ${
                      results.isLeOverridden
                        ? 'bg-amber-950/70 border-amber-600 text-amber-200 focus:border-amber-400'
                        : 'bg-slate-700/70 border-slate-600 text-slate-200 focus:border-cyan-400'
                    }`}
                    title="Direct entry for Le: 51.855 mm or custom bond length"
                  />
                  <span className="text-[11px] text-slate-400">mm</span>
                  {results.isLeOverridden && (
                    <button
                      onClick={() => onInputChange('LeManual', undefined)}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded"
                      title="Reset to formula-calculated value"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">Concrete Strength Factor k1 = (f'c / 27)^(2/3):</span>
              <strong className="text-slate-200 tabular-nums">
                ({inputs.fc} / 27)^(2/3) = {results.k1.toFixed(3)}
              </strong>
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">
                Wrapping Factor k2 = {inputs.scheme === 'u_wrap' ? '(dfv - Le) / dfv' : inputs.scheme === 'two_sided' ? '(dfv - 2·Le) / dfv' : '1.0'}:
              </span>
              <strong className="text-slate-200 tabular-nums">
                ({results.dfv.toFixed(1)} - {results.Le.toFixed(3)}) / {results.dfv.toFixed(1)} = {results.k2.toFixed(3)}
              </strong>
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">Bond reduction factor κv (Eq. 11-7):</span>
              <strong className="text-cyan-300 tabular-nums">
                (k1·k2·Le) / (11900·εfu) = {results.kv.toFixed(4)}
              </strong>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Effective CFRP Strain εfe (4 digits truncated):</span>
                <strong className="text-cyan-300 font-mono text-sm tabular-nums">
                  {results.efe.toFixed(4)}
                </strong>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                εfe = min(0.0040, κv · εfu) = min(0.0040, {(results.kv * results.efu).toFixed(6)}) → <strong className="text-cyan-300">{results.efe.toFixed(4)}</strong> (no rounding up/down)
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Effective CFRP Stress ffe = εfe · Ef:</span>
                <strong className="text-slate-200 tabular-nums">
                  {results.efe.toFixed(4)} × {inputs.Ef} = {results.ffe.toFixed(2)} MPa
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Box B: Capacity Check & FRP Shear Contribution Vf */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Shear Strength Contributions & Capacity
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              ACI 440.2R Eq. (11-3)
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Existing Concrete Vc:</span>
              <strong className="text-slate-200 tabular-nums">{inputs.VcExisting.toFixed(1)} kN</strong>
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">Existing Steel Stirrups Vs:</span>
              <strong className="text-slate-200 tabular-nums">{inputs.VsExisting.toFixed(1)} kN</strong>
            </div>

            {/* Feature 3: Explicit FRP Shear Contribution Vf Card */}
            <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-cyan-300 font-bold text-xs">
                  FRP Shear Contribution (Vf):
                </span>
                <strong className="text-base text-cyan-300 tabular-nums font-mono">
                  {results.Vf.toFixed(2)} kN
                </strong>
              </div>

              {/* Governing formula */}
              {(() => {
                const angle = Number(inputs.angleAlpha);
                const trigFactorVal = results.trigFactor ?? (
                  !angle || angle === 0
                    ? 1.0
                    : Math.sin((angle * Math.PI) / 180) + Math.cos((angle * Math.PI) / 180)
                );
                const trigFactorStr = (!angle || angle === 0)
                  ? '1.0'
                  : (Math.abs(trigFactorVal - 1) < 1e-4 ? '1.0' : trigFactorVal.toFixed(3));

                return (
                  <>
                    <div className="text-[11px] text-amber-300 font-mono font-semibold bg-slate-900/90 p-2 rounded border border-slate-800">
                      <div className="text-center">
                        Vf = [ Afv · ffe · (sin α + cos α) · dfv ] / sf
                      </div>
                      <div className="text-[10px] text-slate-400 text-center mt-1">
                        Where Afv = 2 · n · tf · wf = 2 × {inputs.noOfPlies} × {inputs.tf} × {inputs.wf} ={' '}
                        <strong className="text-slate-200">{results.Afv.toFixed(1)} mm²</strong>
                        <span className="mx-1.5 text-slate-600">|</span>
                        <span>(sin α + cos α) = </span>
                        <strong className="text-slate-200">
                          {(!angle || angle === 0) ? '1.0 (α = 0°)' : `${trigFactorStr} (α = ${angle}°)`}
                        </strong>
                      </div>
                    </div>

                    {/* Explicit numerical substitution */}
                    <div className="text-[10px] text-slate-300 font-mono space-y-0.5 bg-slate-900/60 p-2 rounded">
                      <div>
                        ffe = {results.ffe.toFixed(2)} MPa &nbsp;|&nbsp; dfv = {results.dfv.toFixed(1)} mm &nbsp;|&nbsp; sf = {inputs.sf} mm &nbsp;|&nbsp; (sin α + cos α) = {trigFactorStr}
                      </div>
                      <div className="text-slate-400">
                        Vf = [ {results.Afv.toFixed(1)} × {results.ffe.toFixed(2)} × {trigFactorStr} × {results.dfv.toFixed(1)} ] / [ {inputs.sf} × 1000 ]
                      </div>
                      <div className="text-cyan-300 font-bold pt-1 border-t border-slate-800/80">
                        = {results.Vf.toFixed(2)} kN
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">
                FRP Strength Reduction Factor ψf:
              </span>
              <strong className="text-slate-200 tabular-nums">
                {results.psi_f.toFixed(2)} ({inputs.scheme === 'completely_wrapped' ? 'Complete Jacket = 0.95' : 'U-Wrap = 0.85'})
              </strong>
            </div>

            <div className="flex justify-between py-1 border-t border-slate-800/60">
              <span className="text-slate-400">Nominal Shear Strength Vn = Vc + Vs + ψf·Vf:</span>
              <strong className="text-slate-100 tabular-nums">{results.Vn.toFixed(2)} kN</strong>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-semibold">
                  Factored Shear Capacity ΦVn (Φ = {results.phi.toFixed(2)}):
                </span>
                <strong className="text-base text-cyan-300 tabular-nums">
                  {results.phiVn.toFixed(1)} kN
                </strong>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-1">
                <span>Demand Vu / Capacity ΦVn (DCR):</span>
                <strong
                  className={`tabular-nums font-bold ${
                    results.DCR <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {inputs.VuDemand} / {results.phiVn.toFixed(1)} = {results.DCR.toFixed(3)}
                </strong>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-1">
                <div>
                  <span className="block">Maximum Shear Limit (Anti-Crushing):</span>
                  <span className="text-[10px] text-slate-500">
                    Vs + Vf ≤ 0.66 · √(f'c) · b · d = {results.maxAllowableVsVf.toFixed(1)} kN
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-200 font-mono">
                    Actual: {results.actualVsVf.toFixed(1)} kN
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      results.isMaxLimitOk ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {results.isMaxLimitOk ? '✓ PASS (No crushing)' : '⚠ EXCEEDED'}
                  </span>
                </div>
              </div>

              {onOpenOptimizer && (
                <button
                  onClick={onOpenOptimizer}
                  className="w-full mt-2.5 py-1.5 px-3 rounded bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                  title="Launch parametric visualization plotting DCR vs fc' and Ef"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Optimize Shear Design & Sensitivity Plot (f'c vs Ef)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom CFRP Material System Modal */}
      <AddMaterialModal
        isOpen={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        onAddPreset={(newPreset) => {
          if (onAddCustomPreset) {
            onAddCustomPreset(newPreset);
          }
          setIsCustomBrand(false);
          onBrandSelect(newPreset.brand);
        }}
      />
    </div>
  );
};
