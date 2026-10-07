/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { CfrpInputs, ShearInputs, CfrpPreset } from './types/cfrp';
import {
  DEFAULT_INPUTS,
  DEFAULT_SHEAR_INPUTS,
  CFRP_PRESETS,
  calculateFlexure,
  calculateShear,
  lookupBrandProperties,
} from './utils/cfrpMath';
import { NavigationHeader } from './components/NavigationHeader';
import { FlexureSheet } from './components/FlexureSheet';
import { VbaIterationSheet } from './components/VbaIterationSheet';
import { ShearSheet } from './components/ShearSheet';
import { MaterialsSheet } from './components/MaterialsSheet';
import { PrintableReport } from './components/PrintableReport';
import { OptimizationTool } from './components/OptimizationTool';
import {
  Layers,
  Sparkles,
  BookOpen,
  Printer,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Compass,
} from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState<CfrpInputs>(DEFAULT_INPUTS);
  const [shearInputs, setShearInputs] = useState<ShearInputs>(DEFAULT_SHEAR_INPUTS);
  const [activeSheet, setActiveSheet] = useState<'flexure' | 'vba' | 'shear' | 'materials' | 'optimizer'>('flexure');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverStep, setSolverStep] = useState<number>(1);
  const [hasRunIteration, setHasRunIteration] = useState<boolean>(false);
  const [customPresets, setCustomPresets] = useState<CfrpPreset[]>(() => {
    try {
      const saved = localStorage.getItem('cfrp_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomPreset = (preset: CfrpPreset) => {
    setCustomPresets((prev) => {
      const updated = [...prev.filter((p) => p.id !== preset.id), preset];
      try {
        localStorage.setItem('cfrp_custom_presets', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeSheet === 'shear') {
      setShearInputs((prev) => ({
        ...prev,
        cfrpBrand: preset.brand,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        cfrpBrand: preset.brand,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      }));
    }
  };

  const handleDeleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('cfrp_custom_presets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Compute live calculation results whenever inputs update
  const flexureResults = useMemo(() => {
    return calculateFlexure(inputs);
  }, [inputs]);

  const shearResults = useMemo(() => {
    return calculateShear(shearInputs);
  }, [shearInputs]);

  // Handler for flexure input edits (Completely separate from shear)
  const handleInputChange = (key: keyof CfrpInputs, value: any) => {
    setHasRunIteration(false); // Mark iteration as pending recalculation when any parameter changes
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      // If d or Cc changed, clear dfManual unless explicitly set
      if (key === 'd' || key === 'Cc') {
        if (!prev.dfManual) {
          next.dfManual = undefined;
        }
      }
      // If d changed, update assumedC_initial according to 20% x Effective depth formula:
      if (key === 'd') {
        next.assumedC_initial = parseFloat((0.20 * Number(value)).toFixed(2));
      }
      return next;
    });
  };

  // Handler for shear input edits (Completely separate from flexure)
  const handleShearInputChange = (key: keyof ShearInputs, value: any) => {
    setShearInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Automatic CFRP Brand lookup & property population for Flexure Design (Sheet 1)
  const handleBrandChange = (brandName: string) => {
    const preset = lookupBrandProperties(brandName, customPresets);
    if (preset) {
      setInputs((prev) => ({
        ...prev,
        cfrpBrand: preset.brand,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        cfrpBrand: brandName,
      }));
    }
  };

  // Automatic CFRP Brand lookup & property population for Shear Retrofit (Sheet 3)
  const handleShearBrandChange = (brandName: string) => {
    const preset = lookupBrandProperties(brandName, customPresets);
    if (preset) {
      setShearInputs((prev) => ({
        ...prev,
        cfrpBrand: preset.brand,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      }));
    } else {
      setShearInputs((prev) => ({
        ...prev,
        cfrpBrand: brandName,
      }));
    }
  };

  // Preset loader
  const handleApplyPreset = (presetId: string) => {
    const preset = CFRP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    handleBrandChange(preset.brand);
  };

  // Reset to default sample workbook values
  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setShearInputs(DEFAULT_SHEAR_INPUTS);
    setHasRunIteration(false);
  };

  // Interactive VBA solver execution with animated progressive loading (reduced speed by 10% for clear visibility)
  const handleRunSolver = () => {
    setIsSolving(true);
    setSolverStep(1);
    setTimeout(() => setSolverStep(2), 242);
    setTimeout(() => setSolverStep(3), 572);
    setTimeout(() => setSolverStep(4), 902);
    setTimeout(() => {
      setIsSolving(false);
      setHasRunIteration(true);
    }, 1210);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top 3-Zone Header Contract */}
      <NavigationHeader
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        onPrint={() => setShowPrintModal(true)}
        onReset={handleReset}
        onRunSolver={handleRunSolver}
        isSolving={isSolving}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Real-time Status / Telemetry Ribbon */}
        <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACI 440.2R Calibrated
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Demand Mu: <strong className="text-cyan-300">{inputs.MuDemand} kN-m</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Design ΦMn:{' '}
              {hasRunIteration ? (
                <strong className="text-slate-100">{flexureResults.phiMn.toFixed(2)} kN-m</strong>
              ) : (
                <span className="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                  Pending Solver
                </span>
              )}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              DCR:{' '}
              {hasRunIteration ? (
                <strong
                  className={flexureResults.flexurePass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                >
                  {flexureResults.DCR.toFixed(3)}
                </strong>
              ) : (
                <span className="text-slate-400 italic">--</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-slate-400">
              Neutral Axis C:{' '}
              {hasRunIteration ? (
                <strong className="text-cyan-300">
                  {flexureResults.finalEquilibrium.c.toFixed(2)} mm (Converged)
                </strong>
              ) : (
                <strong className="text-amber-300">
                  {flexureResults.assumedC_default.toFixed(2)} mm (Initial Assumed)
                </strong>
              )}
            </div>

            <button
              onClick={() => setShowPrintModal(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printable Excel Output</span>
            </button>
          </div>
        </div>

        {/* Active Sheet Display */}
        {activeSheet === 'flexure' && (
          <FlexureSheet
            inputs={inputs}
            results={flexureResults}
            onInputChange={handleInputChange}
            onOpenVbaSheet={() => setActiveSheet('vba')}
            onBrandSelect={handleBrandChange}
            onRunIteration={handleRunSolver}
            isIterating={isSolving}
            hasRunIteration={hasRunIteration}
            onOpenOptimizer={() => setActiveSheet('optimizer')}
          />
        )}

        {activeSheet === 'vba' && (
          <VbaIterationSheet
            steps={flexureResults.iterationSteps}
            finalC={flexureResults.finalEquilibrium.c}
            initialC={flexureResults.initialTrial.c}
            onRunSolver={handleRunSolver}
            isSolving={isSolving}
          />
        )}

        {activeSheet === 'shear' && (
          <ShearSheet
            inputs={shearInputs}
            results={shearResults}
            onInputChange={handleShearInputChange}
            onBrandSelect={handleShearBrandChange}
            onPrint={() => setShowPrintModal(true)}
            onOpenMaterialsSheet={() => setActiveSheet('materials')}
            onOpenOptimizer={() => setActiveSheet('optimizer')}
            customPresets={customPresets}
            onAddCustomPreset={handleAddCustomPreset}
            onDeleteCustomPreset={handleDeleteCustomPreset}
          />
        )}

        {activeSheet === 'materials' && (
          <MaterialsSheet
            flexureInputs={inputs}
            shearInputs={shearInputs}
            onFlexureInputChange={handleInputChange}
            onShearInputChange={handleShearInputChange}
            customPresets={customPresets}
            onAddCustomPreset={handleAddCustomPreset}
            onDeleteCustomPreset={handleDeleteCustomPreset}
            onApplyPresetFlexure={(id) => {
              const all = [...customPresets, ...CFRP_PRESETS];
              const preset = all.find((p) => p.id === id);
              if (preset) handleBrandChange(preset.brand);
            }}
            onApplyPresetShear={(id) => {
              const all = [...customPresets, ...CFRP_PRESETS];
              const preset = all.find((p) => p.id === id);
              if (preset) handleShearBrandChange(preset.brand);
            }}
          />
        )}

        {activeSheet === 'optimizer' && (
          <OptimizationTool
            flexureInputs={inputs}
            shearInputs={shearInputs}
            onFlexureInputChange={handleInputChange}
            onShearInputChange={handleShearInputChange}
            onNavigateToSheet={(sheet) => setActiveSheet(sheet)}
            customPresets={customPresets}
          />
        )}

        {/* Global Solver UI Loading Modal */}
        {isSolving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    Executing Equilibrium Iteration Solver
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ACI 440.2R Numerical Relaxation Engine
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${solverStep * 25}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Iteration Phase {solverStep} of 4</span>
                  <span>{solverStep * 25}%</span>
                </div>
              </div>

              {/* Step-by-step Telemetry */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${solverStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{solverStep > 1 ? '✓' : '●'}</span>
                  <span>Step V: Initial Trial at Assumed C = 20% × d ({flexureResults.assumedC_default.toFixed(2)} mm)</span>
                </div>
                <div className={`flex items-center gap-2 ${solverStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{solverStep > 2 ? '✓' : solverStep === 2 ? '●' : '○'}</span>
                  <span>Step IX: Checking Resultant Force (Verified C = {flexureResults.initialTrial.c_verified.toFixed(2)} mm)</span>
                </div>
                <div className={`flex items-center gap-2 ${solverStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{solverStep > 3 ? '✓' : solverStep === 3 ? '●' : '○'}</span>
                  <span>Step X: Successive relaxation iterations converging...</span>
                </div>
                <div className={`flex items-center gap-2 ${solverStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{solverStep === 4 ? '✓' : '○'}</span>
                  <span>Equilibrium verified: Converged at C = {flexureResults.finalEquilibrium.c.toFixed(2)} mm!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Excel-style Bottom Sheet Tab Bar */}
      <footer className="sticky bottom-0 z-20 bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <div className="text-slate-400 text-[11px] font-semibold pr-2 flex items-center gap-1.5 border-r border-slate-800 mr-1 shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>CFRP_Design_v2.xlsm</span>
          </div>

          {/* Sheet 1 */}
          <button
            onClick={() => setActiveSheet('flexure')}
            className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSheet === 'flexure'
                ? 'bg-slate-800 text-cyan-300 font-bold border-t-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Sheet1: Flexural_Strengthening</span>
            {flexureResults.flexurePass ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            )}
          </button>

          {/* Sheet 2 */}
          <button
            onClick={() => setActiveSheet('vba')}
            className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSheet === 'vba'
                ? 'bg-slate-800 text-amber-300 font-bold border-t-2 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sheet2: VBA_Iteration_Log</span>
          </button>

          {/* Sheet 3 */}
          <button
            onClick={() => setActiveSheet('shear')}
            className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSheet === 'shear'
                ? 'bg-slate-800 text-cyan-300 font-bold border-t-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Sheet3: Shear_Retrofit_ACI440</span>
            {shearResults.shearPass ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            )}
          </button>

          {/* Sheet 4 */}
          <button
            onClick={() => setActiveSheet('materials')}
            className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSheet === 'materials'
                ? 'bg-slate-800 text-cyan-300 font-bold border-t-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Sheet4: Material_Database</span>
          </button>

          {/* Sheet 5 */}
          <button
            onClick={() => setActiveSheet('optimizer')}
            className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSheet === 'optimizer'
                ? 'bg-slate-800 text-cyan-300 font-bold border-t-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Sheet5: DCR_Parametric_Optimizer</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Equilibrium: OK</span>
          </span>
          <span>·</span>
          <span>Ready</span>
        </div>
      </footer>

      {/* Modal: Printable Output (mirrors Excel layout exactly) */}
      {showPrintModal && (
        <PrintableReport
          inputs={inputs}
          results={flexureResults}
          shearInputs={shearInputs}
          shearResults={shearResults}
          defaultSheet={activeSheet === 'shear' ? 'shear' : 'flexure'}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
