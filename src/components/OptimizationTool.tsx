import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Target,
  Sliders,
  BarChart3,
  Grid3X3,
  Database,
  Download,
  RefreshCw,
  Check,
  Compass,
} from 'lucide-react';
import { CfrpInputs, ShearInputs, CfrpPreset } from '../types/cfrp';
import { calculateFlexure, calculateShear, CFRP_PRESETS } from '../utils/cfrpMath';

interface OptimizationToolProps {
  flexureInputs: CfrpInputs;
  shearInputs: ShearInputs;
  onFlexureInputChange: (key: keyof CfrpInputs, value: any) => void;
  onShearInputChange: (key: keyof ShearInputs, value: any) => void;
  onNavigateToSheet: (sheet: 'flexure' | 'vba' | 'shear' | 'materials') => void;
  customPresets?: CfrpPreset[];
}

export const OptimizationTool: React.FC<OptimizationToolProps> = ({
  flexureInputs,
  shearInputs,
  onFlexureInputChange,
  onShearInputChange,
  onNavigateToSheet,
  customPresets = [],
}) => {
  // Mode selection: Flexure vs Shear vs Combined Envelope
  const [analysisMode, setAnalysisMode] = useState<'flexure' | 'shear' | 'combined'>('flexure');

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'fc_sweep' | 'ef_sweep' | '2d_matrix' | 'brand_benchmark'>('fc_sweep');

  // Interactive Sweep Controls State
  const [fcMin, setFcMin] = useState<number>(15);
  const [fcMax, setFcMax] = useState<number>(60);
  const [efMin, setEfMin] = useState<number>(100000);
  const [efMax, setEfMax] = useState<number>(650000);

  // Hover state for chart crosshairs & tooltips
  const [hoveredPoint, setHoveredPoint] = useState<{
    xVal: number;
    dcr: number;
    capacity: number;
    demand: number;
    efd?: number;
    curveLabel: string;
    isCurrent?: boolean;
    xCoord: number;
    yCoord: number;
  } | null>(null);

  // Status message for parameter application
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setAppliedNotice(msg);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  // Current active calculations
  const currentFlexure = useMemo(() => calculateFlexure(flexureInputs), [flexureInputs]);
  const currentShear = useMemo(() => calculateShear(shearInputs), [shearInputs]);

  const currentDcr = useMemo(() => {
    if (analysisMode === 'flexure') return currentFlexure.DCR;
    if (analysisMode === 'shear') return currentShear.DCR;
    return Math.max(currentFlexure.DCR, currentShear.DCR);
  }, [analysisMode, currentFlexure, currentShear]);

  const currentCapacity = useMemo(() => {
    if (analysisMode === 'flexure') return currentFlexure.phiMn;
    if (analysisMode === 'shear') return currentShear.phiVn;
    return currentFlexure.phiMn;
  }, [analysisMode, currentFlexure, currentShear]);

  const currentDemand = useMemo(() => {
    if (analysisMode === 'flexure') return flexureInputs.MuDemand;
    if (analysisMode === 'shear') return shearInputs.VuDemand;
    return flexureInputs.MuDemand;
  }, [analysisMode, flexureInputs, shearInputs]);

  // All presets (standard + custom)
  const allPresets = useMemo(() => [...customPresets, ...CFRP_PRESETS], [customPresets]);

  // Helper evaluator for any (fc, Ef) combination
  const evaluateDesign = (testFc: number, testEf: number) => {
    if (analysisMode === 'flexure') {
      const cloned: CfrpInputs = { ...flexureInputs, fc: testFc, Ef: testEf };
      const res = calculateFlexure(cloned);
      return {
        dcr: res.DCR,
        capacity: res.phiMn,
        demand: cloned.MuDemand,
        pass: res.flexurePass,
        efd: res.efd,
        unit: 'kN-m',
        capacityLabel: 'ΦMn',
      };
    } else if (analysisMode === 'shear') {
      const cloned: ShearInputs = { ...shearInputs, fc: testFc, Ef: testEf };
      const res = calculateShear(cloned);
      return {
        dcr: res.DCR,
        capacity: res.phiVn,
        demand: cloned.VuDemand,
        pass: res.shearPass,
        unit: 'kN',
        capacityLabel: 'ΦVn',
      };
    } else {
      const clonedFlex: CfrpInputs = { ...flexureInputs, fc: testFc, Ef: testEf };
      const clonedShear: ShearInputs = { ...shearInputs, fc: testFc, Ef: testEf };
      const resFlex = calculateFlexure(clonedFlex);
      const resShear = calculateShear(clonedShear);
      const governingDcr = Math.max(resFlex.DCR, resShear.DCR);
      return {
        dcr: governingDcr,
        capacity: resFlex.DCR >= resShear.DCR ? resFlex.phiMn : resShear.phiVn,
        demand: resFlex.DCR >= resShear.DCR ? clonedFlex.MuDemand : clonedShear.VuDemand,
        pass: resFlex.flexurePass && resShear.shearPass,
        unit: resFlex.DCR >= resShear.DCR ? 'kN-m (Flexure)' : 'kN (Shear)',
        capacityLabel: resFlex.DCR >= resShear.DCR ? 'Gov. ΦMn' : 'Gov. ΦVn',
      };
    }
  };

  // ---------------------------------------------------------------------------
  // 1. DATA GENERATION: fc' Sweep Curves (with different Ef levels)
  // ---------------------------------------------------------------------------
  const fcSweepData = useMemo(() => {
    const steps = 40;
    const delta = (fcMax - fcMin) / steps;
    const fcSamples: number[] = [];
    for (let i = 0; i <= steps; i++) {
      fcSamples.push(Number((fcMin + i * delta).toFixed(1)));
    }

    const activeEf = analysisMode === 'shear' ? shearInputs.Ef : flexureInputs.Ef;

    // Define curve series of Ef
    const efLevels = [
      { label: 'Low Modulus (150 GPa)', value: 150000, color: '#f59e0b', dash: '3,3' },
      { label: `Active System (${(activeEf / 1000).toFixed(0)} GPa)`, value: activeEf, color: '#06b6d4', isCurrent: true },
      { label: 'Standard CFRP (230 GPa)', value: 230000, color: '#3b82f6', dash: '4,4' },
      { label: 'High Modulus (370 GPa)', value: 370000, color: '#a855f7', dash: '2,2' },
      { label: 'Ultra-High Modulus (640 GPa)', value: 640000, color: '#ec4899', dash: '5,3' },
    ];

    // Filter duplicates if activeEf equals one of standard values
    const uniqueEfLevels = efLevels.filter(
      (item, idx, self) =>
        item.isCurrent || idx === self.findIndex((t) => Math.abs(t.value - item.value) < 1000)
    );

    const curves = uniqueEfLevels.map((lvl) => {
      const points = fcSamples.map((fcVal) => {
        const evalRes = evaluateDesign(fcVal, lvl.value);
        return {
          x: fcVal,
          y: evalRes.dcr,
          capacity: evalRes.capacity,
          demand: evalRes.demand,
          efd: evalRes.efd,
        };
      });
      return {
        ...lvl,
        points,
      };
    });

    return { fcSamples, curves };
  }, [fcMin, fcMax, flexureInputs, shearInputs, analysisMode]);

  // ---------------------------------------------------------------------------
  // 2. DATA GENERATION: Ef Sweep Curves (with different fc' levels)
  // ---------------------------------------------------------------------------
  const efSweepData = useMemo(() => {
    const steps = 40;
    const delta = (efMax - efMin) / steps;
    const efSamples: number[] = [];
    for (let i = 0; i <= steps; i++) {
      efSamples.push(Math.round(efMin + i * delta));
    }

    const activeFc = analysisMode === 'shear' ? shearInputs.fc : flexureInputs.fc;

    // Define curve series of fc'
    const fcLevels = [
      { label: "fc' = 20 MPa (Substandard)", value: 20, color: '#f43f5e', dash: '3,3' },
      { label: `Active System (fc' = ${activeFc} MPa)`, value: activeFc, color: '#06b6d4', isCurrent: true },
      { label: "fc' = 28 MPa (4000 psi Standard)", value: 28, color: '#3b82f6', dash: '4,4' },
      { label: "fc' = 35 MPa (5000 psi Medium)", value: 35, color: '#10b981', dash: '2,2' },
      { label: "fc' = 45 MPa (High Performance)", value: 45, color: '#a855f7', dash: '5,3' },
    ];

    const uniqueFcLevels = fcLevels.filter(
      (item, idx, self) =>
        item.isCurrent || idx === self.findIndex((t) => Math.abs(t.value - item.value) < 0.5)
    );

    const curves = uniqueFcLevels.map((lvl) => {
      const points = efSamples.map((efVal) => {
        const evalRes = evaluateDesign(lvl.value, efVal);
        return {
          x: efVal,
          y: evalRes.dcr,
          capacity: evalRes.capacity,
          demand: evalRes.demand,
          efd: evalRes.efd,
        };
      });
      return {
        ...lvl,
        points,
      };
    });

    return { efSamples, curves };
  }, [efMin, efMax, flexureInputs, shearInputs, analysisMode]);

  // ---------------------------------------------------------------------------
  // 3. DATA GENERATION: 2D Parametric Grid / Iso-DCR Surface
  // ---------------------------------------------------------------------------
  const matrixData = useMemo(() => {
    const fcTicks = [18, 21, 24, 28, 32, 36, 40, 45, 50, 55];
    const efTicks = [140000, 180000, 230000, 300000, 370000, 450000, 550000, 640000];

    const grid = efTicks.map((efVal) => {
      const row = fcTicks.map((fcVal) => {
        const evalRes = evaluateDesign(fcVal, efVal);
        return {
          fc: fcVal,
          ef: efVal,
          dcr: evalRes.dcr,
          capacity: evalRes.capacity,
          demand: evalRes.demand,
          pass: evalRes.pass,
        };
      });
      return { ef: efVal, cells: row };
    });

    return { fcTicks, efTicks, grid };
  }, [flexureInputs, shearInputs, analysisMode]);

  // ---------------------------------------------------------------------------
  // 4. DATA GENERATION: Commercial TDS Brand Benchmark
  // ---------------------------------------------------------------------------
  const brandBenchmarkData = useMemo(() => {
    const activeFc = analysisMode === 'shear' ? shearInputs.fc : flexureInputs.fc;

    const list = allPresets.map((preset) => {
      const evalRes = evaluateDesign(activeFc, preset.Ef);
      return {
        brand: preset.brand,
        name: preset.name,
        Ef: preset.Ef,
        tf: preset.tf,
        fu: preset.fu,
        dcr: evalRes.dcr,
        capacity: evalRes.capacity,
        pass: evalRes.pass,
      };
    });

    // Sort by most efficient DCR
    return list.sort((a, b) => a.dcr - b.dcr);
  }, [allPresets, flexureInputs, shearInputs, analysisMode]);

  // ---------------------------------------------------------------------------
  // 5. OPTIMIZATION SOLVER & SENSITIVITY GRADIENTS
  // ---------------------------------------------------------------------------
  const optimizationInsights = useMemo(() => {
    const activeFc = analysisMode === 'shear' ? shearInputs.fc : flexureInputs.fc;
    const activeEf = analysisMode === 'shear' ? shearInputs.Ef : flexureInputs.Ef;

    // Minimum fc' required to reach DCR <= 1.0 (Bisection Search)
    let minFcToPass: number | null = null;
    for (let testFc = 15; testFc <= 90; testFc += 0.5) {
      const ev = evaluateDesign(testFc, activeEf);
      if (ev.dcr <= 1.0) {
        minFcToPass = testFc;
        break;
      }
    }

    // Minimum fc' required to reach optimal target DCR <= 0.85
    let minFcOptimal: number | null = null;
    for (let testFc = 15; testFc <= 90; testFc += 0.5) {
      const ev = evaluateDesign(testFc, activeEf);
      if (ev.dcr <= 0.85) {
        minFcOptimal = testFc;
        break;
      }
    }

    // Minimum Ef required to reach DCR <= 1.0 (with current concrete)
    let minEfToPass: number | null = null;
    for (let testEf = 80000; testEf <= 800000; testEf += 5000) {
      const ev = evaluateDesign(activeFc, testEf);
      if (ev.dcr <= 1.0) {
        minEfToPass = testEf;
        break;
      }
    }

    // Sensitivity Gradients:
    // d(DCR) / d(fc) evaluated at active point (+/- 3 MPa)
    const dcrFcPlus = evaluateDesign(activeFc + 3, activeEf).dcr;
    const dcrFcMinus = evaluateDesign(Math.max(15, activeFc - 3), activeEf).dcr;
    const gradFc = (dcrFcPlus - dcrFcMinus) / 6; // DCR change per MPa

    // d(DCR) / d(Ef) evaluated at active point (+/- 30 GPa)
    const dcrEfPlus = evaluateDesign(activeFc, activeEf + 30000).dcr;
    const dcrEfMinus = evaluateDesign(activeFc, Math.max(100000, activeEf - 30000)).dcr;
    const gradEf = ((dcrEfPlus - dcrEfMinus) / 60000) * 1000; // DCR change per GPa

    // Impact of +5 MPa concrete upgrade
    const deltaDcr5MPa = gradFc * 5;
    // Impact of +50 GPa fiber modulus upgrade
    const deltaDcr50GPa = gradEf * 50;

    return {
      activeFc,
      activeEf,
      minFcToPass,
      minFcOptimal,
      minEfToPass,
      gradFc,
      gradEf,
      deltaDcr5MPa,
      deltaDcr50GPa,
      isPassing: currentDcr <= 1.0,
      dominantFactor: Math.abs(deltaDcr5MPa) > Math.abs(deltaDcr50GPa) ? 'fc' : 'Ef',
    };
  }, [flexureInputs, shearInputs, analysisMode, currentDcr]);

  // ---------------------------------------------------------------------------
  // CHART RENDERING MATH & COORDINATE MAPPINGS
  // ---------------------------------------------------------------------------
  const chartWidth = 720;
  const chartHeight = 360;
  const margin = { top: 35, right: 40, bottom: 50, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Determine Y range (DCR)
  const yMin = 0.4;
  const yMax = 1.6;

  const getYCoord = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return margin.top + innerHeight - ((clamped - yMin) / (yMax - yMin)) * innerHeight;
  };

  const getFcXCoord = (val: number) => {
    const clamped = Math.max(fcMin, Math.min(fcMax, val));
    return margin.left + ((clamped - fcMin) / (fcMax - fcMin)) * innerWidth;
  };

  const getEfXCoord = (val: number) => {
    const clamped = Math.max(efMin, Math.min(efMax, val));
    return margin.left + ((clamped - efMin) / (efMax - efMin)) * innerWidth;
  };

  // Y-axis tick intervals
  const yTicks = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6];

  // Apply Parameter Handlers
  const handleApplyFc = (newFc: number) => {
    if (analysisMode === 'flexure' || analysisMode === 'combined') {
      onFlexureInputChange('fc', newFc);
    }
    if (analysisMode === 'shear' || analysisMode === 'combined') {
      onShearInputChange('fc', newFc);
    }
    showNotice(`Applied concrete compressive strength f'c = ${newFc} MPa to active design!`);
  };

  const handleApplyEf = (newEf: number) => {
    if (analysisMode === 'flexure' || analysisMode === 'combined') {
      onFlexureInputChange('Ef', newEf);
    }
    if (analysisMode === 'shear' || analysisMode === 'combined') {
      onShearInputChange('Ef', newEf);
    }
    showNotice(`Applied fiber elastic modulus Ef = ${newEf.toLocaleString()} N/mm² to active design!`);
  };

  const handleApplyCombination = (newFc: number, newEf: number) => {
    if (analysisMode === 'flexure' || analysisMode === 'combined') {
      onFlexureInputChange('fc', newFc);
      onFlexureInputChange('Ef', newEf);
    }
    if (analysisMode === 'shear' || analysisMode === 'combined') {
      onShearInputChange('fc', newFc);
      onShearInputChange('Ef', newEf);
    }
    showNotice(`Applied combined design point: f'c = ${newFc} MPa & Ef = ${newEf.toLocaleString()} MPa!`);
  };

  // Export CSV Data
  const handleExportCsv = () => {
    let csv = '';
    if (activeTab === 'fc_sweep') {
      csv = `Concrete Compressive Strength fc' Sensitivity Data\n`;
      csv += `fc' (MPa),` + fcSweepData.curves.map((c) => `${c.label} DCR`).join(',') + '\n';
      fcSweepData.fcSamples.forEach((fcVal, idx) => {
        const row = [fcVal, ...fcSweepData.curves.map((c) => c.points[idx]?.y.toFixed(4))];
        csv += row.join(',') + '\n';
      });
    } else if (activeTab === 'ef_sweep') {
      csv = `Fiber Elastic Modulus Ef Sensitivity Data\n`;
      csv += `Ef (MPa),` + efSweepData.curves.map((c) => `${c.label} DCR`).join(',') + '\n';
      efSweepData.efSamples.forEach((efVal, idx) => {
        const row = [efVal, ...efSweepData.curves.map((c) => c.points[idx]?.y.toFixed(4))];
        csv += row.join(',') + '\n';
      });
    } else {
      csv = `2D Parametric Matrix: Ef (rows) vs fc' (columns) DCR\n`;
      csv += `Ef / fc',` + matrixData.fcTicks.map((fc) => `${fc} MPa`).join(',') + '\n';
      matrixData.grid.forEach((row) => {
        csv += `${row.ef},` + row.cells.map((cell) => cell.dcr.toFixed(4)).join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CFRP_DCR_Sensitivity_${activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-mono text-xs">
      {/* ------------------------------------------------------------------- */}
      {/* SECTION 1: HEADER & MODULE SELECTION                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                Sheet 5: Sensitivity & Optimization
              </span>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                DCR Parametric Sensitivity & Design Optimizer
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Plot how changes in concrete compressive strength (<span className="text-cyan-300 font-bold">f'c</span>) or fiber elastic modulus (<span className="text-amber-300 font-bold">Ef</span>) impact structural capacity and Demand-to-Capacity Ratio (DCR) per ACI 440.2R.
            </p>
          </div>

          {/* Module Selector Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setAnalysisMode('flexure')}
              className={`px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 ${
                analysisMode === 'flexure'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Flexure (Mu / ΦMn)
            </button>
            <button
              onClick={() => setAnalysisMode('shear')}
              className={`px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 ${
                analysisMode === 'shear'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Shear (Vu / ΦVn)
            </button>
            <button
              onClick={() => setAnalysisMode('combined')}
              className={`px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 ${
                analysisMode === 'combined'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Governing Envelope
            </button>
          </div>
        </div>

        {/* Live Active Design Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-1">
          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Current Concrete f'c:</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">
              {optimizationInsights.activeFc} MPa
            </span>
            <span className="text-[9px] text-slate-500 block">Substrate Strength</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Current Fiber Modulus Ef:</span>
            <span className="text-sm font-bold text-amber-300 font-mono">
              {optimizationInsights.activeEf.toLocaleString()} N/mm²
            </span>
            <span className="text-[9px] text-slate-500 block">
              {(optimizationInsights.activeEf / 1000).toFixed(0)} GPa
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Factored Demand:</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {currentDemand.toFixed(1)} {analysisMode === 'shear' ? 'kN' : 'kN-m'}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {analysisMode === 'shear' ? 'Vu Demand' : 'Mu Demand'}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Design Capacity:</span>
            <span className="text-sm font-bold text-emerald-300 font-mono">
              {currentCapacity.toFixed(1)} {analysisMode === 'shear' ? 'kN' : 'kN-m'}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {analysisMode === 'shear' ? 'ΦVn Total' : 'ΦMn Moment'}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <span className="text-[10px] text-slate-400 block">Active DCR:</span>
              <span
                className={`text-base font-bold font-mono ${
                  currentDcr <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentDcr.toFixed(3)}
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded font-bold text-[11px] border ${
                currentDcr <= 1.0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}
            >
              {currentDcr <= 1.0 ? 'PASS ✓' : 'FAIL ✗'}
            </span>
          </div>
        </div>

        {appliedNotice && (
          <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded text-xs flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {appliedNotice}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Calculation Updated</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 2: VIEW MODE SELECTOR & SWEEP CONTROLS                     */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
        <div className="flex items-center gap-1 overflow-x-auto p-0.5">
          <button
            onClick={() => setActiveTab('fc_sweep')}
            className={`px-3.5 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fc_sweep'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            1. Concrete f'c Sensitivity
          </button>

          <button
            onClick={() => setActiveTab('ef_sweep')}
            className={`px-3.5 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ef_sweep'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            2. Fiber Modulus Ef Sensitivity
          </button>

          <button
            onClick={() => setActiveTab('2d_matrix')}
            className={`px-3.5 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === '2d_matrix'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-emerald-400" />
            3. 2D Iso-DCR Surface
          </button>

          <button
            onClick={() => setActiveTab('brand_benchmark')}
            className={`px-3.5 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'brand_benchmark'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            4. TDS Material Benchmark
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-xs transition-colors"
            title="Export calculated sensitivity data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>

          <button
            onClick={() => {
              setFcMin(15);
              setFcMax(60);
              setEfMin(100000);
              setEfMax(650000);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Reset sweep limits to default ranges"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 3: PRIMARY VISUALIZATION CANVAS                             */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        {/* TAB 1: f'c SENSITIVITY SWEEP */}
        {activeTab === 'fc_sweep' && (
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="text-cyan-400">Curve Plot:</span>
                  Concrete Strength f'c vs Design Capacity DCR
                </h2>
                <p className="text-slate-400 text-xs">
                  Demonstrates how substrate strength increases usable CFRP strain before debonding (εfd ∝ √f'c) and expands compression block capacity.
                </p>
              </div>

              {/* Slider for f'c Range Bounds */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-400">Sweep Range:</span>
                <span className="text-cyan-300 font-bold">{fcMin} MPa</span>
                <input
                  type="range"
                  min="12"
                  max="30"
                  step="1"
                  value={fcMin}
                  onChange={(e) => setFcMin(Number(e.target.value))}
                  className="w-16 accent-cyan-500 cursor-pointer"
                />
                <span className="text-slate-600">to</span>
                <input
                  type="range"
                  min="35"
                  max="80"
                  step="1"
                  value={fcMax}
                  onChange={(e) => setFcMax(Number(e.target.value))}
                  className="w-16 accent-cyan-500 cursor-pointer"
                />
                <span className="text-cyan-300 font-bold">{fcMax} MPa</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative mt-4 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-80 sm:h-96 min-w-[620px] select-none"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  {/* Subtle Safe / Overload Background Gradients */}
                  <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="overloadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Overload Zone (DCR > 1.0) */}
                <rect
                  x={margin.left}
                  y={getYCoord(yMax)}
                  width={innerWidth}
                  height={getYCoord(1.0) - getYCoord(yMax)}
                  fill="url(#overloadGrad)"
                />
                {/* Safe Zone (DCR <= 1.0) */}
                <rect
                  x={margin.left}
                  y={getYCoord(1.0)}
                  width={innerWidth}
                  height={getYCoord(yMin) - getYCoord(1.0)}
                  fill="url(#safeGrad)"
                />

                {/* Optimal Target Corridor (0.80 <= DCR <= 0.95) */}
                <rect
                  x={margin.left}
                  y={getYCoord(0.95)}
                  width={innerWidth}
                  height={getYCoord(0.80) - getYCoord(0.95)}
                  fill="#06b6d4"
                  fillOpacity="0.06"
                />

                {/* Grid Lines - Horizontal */}
                {yTicks.map((tickVal) => {
                  const yPos = getYCoord(tickVal);
                  return (
                    <g key={tickVal}>
                      <line
                        x1={margin.left}
                        y1={yPos}
                        x2={margin.left + innerWidth}
                        y2={yPos}
                        stroke={tickVal === 1.0 ? '#ef4444' : '#334155'}
                        strokeWidth={tickVal === 1.0 ? 1.5 : 0.6}
                        strokeDasharray={tickVal === 1.0 ? 'none' : '3,3'}
                      />
                      <text
                        x={margin.left - 8}
                        y={yPos + 3.5}
                        fontSize="9.5"
                        textAnchor="end"
                        fill={tickVal === 1.0 ? '#f87171' : '#64748b'}
                        fontWeight={tickVal === 1.0 ? 'bold' : 'normal'}
                      >
                        {tickVal.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Threshold Lines & Labels */}
                <text
                  x={margin.left + innerWidth - 6}
                  y={getYCoord(1.0) - 5}
                  fontSize="9"
                  textAnchor="end"
                  fill="#f87171"
                  fontWeight="bold"
                >
                  DCR = 1.0 (ACI 440 Code Limit)
                </text>
                <text
                  x={margin.left + innerWidth - 6}
                  y={getYCoord(0.85) - 4}
                  fontSize="8.5"
                  textAnchor="end"
                  fill="#22d3ee"
                  fontStyle="italic"
                >
                  Optimal Efficiency Zone (0.80–0.95)
                </text>

                {/* Grid Lines - Vertical (fc' Ticks) */}
                {[20, 25, 30, 35, 40, 45, 50, 55, 60]
                  .filter((v) => v >= fcMin && v <= fcMax)
                  .map((fcVal) => {
                    const xPos = getFcXCoord(fcVal);
                    return (
                      <g key={fcVal}>
                        <line
                          x1={xPos}
                          y1={margin.top}
                          x2={xPos}
                          y2={margin.top + innerHeight}
                          stroke="#334155"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                        />
                        <text
                          x={xPos}
                          y={margin.top + innerHeight + 16}
                          fontSize="9.5"
                          textAnchor="middle"
                          fill="#94a3b8"
                        >
                          {fcVal}
                        </text>
                      </g>
                    );
                  })}

                {/* Axis Labels */}
                <text
                  x={margin.left + innerWidth / 2}
                  y={margin.top + innerHeight + 36}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#cbd5e1"
                >
                  Concrete Compressive Strength f'c (MPa)
                </text>
                <text
                  x={-(margin.top + innerHeight / 2)}
                  y="18"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  transform="rotate(-90)"
                >
                  Demand-to-Capacity Ratio (DCR)
                </text>

                {/* Render Curves */}
                {fcSweepData.curves.map((curve, cIdx) => {
                  const pathD = curve.points
                    .map((pt, pIdx) => {
                      const px = getFcXCoord(pt.x);
                      const py = getYCoord(pt.y);
                      return `${pIdx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                    })
                    .join(' ');

                  return (
                    <g key={cIdx}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={curve.color}
                        strokeWidth={curve.isCurrent ? 2.8 : 1.6}
                        strokeDasharray={curve.dash || 'none'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all hover:stroke-white cursor-pointer"
                      />

                      {/* Interactive sampled points along active curve */}
                      {curve.points.map((pt, pIdx) => {
                        const px = getFcXCoord(pt.x);
                        const py = getYCoord(pt.y);
                        return (
                          <circle
                            key={pIdx}
                            cx={px}
                            cy={py}
                            r={curve.isCurrent ? 3.5 : 2}
                            fill={curve.color}
                            className="hover:r-5 cursor-pointer opacity-70 hover:opacity-100"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                xVal: pt.x,
                                dcr: pt.y,
                                capacity: pt.capacity,
                                demand: pt.demand,
                                efd: pt.efd,
                                curveLabel: curve.label,
                                isCurrent: curve.isCurrent,
                                xCoord: px,
                                yCoord: py,
                              })
                            }
                            onClick={() => handleApplyFc(pt.x)}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Marker for Active Design Point */}
                {(() => {
                  const activeFc = optimizationInsights.activeFc;
                  if (activeFc >= fcMin && activeFc <= fcMax) {
                    const px = getFcXCoord(activeFc);
                    const py = getYCoord(currentDcr);
                    return (
                      <g>
                        {/* Vertical Indicator Guide */}
                        <line
                          x1={px}
                          y1={margin.top}
                          x2={px}
                          y2={margin.top + innerHeight}
                          stroke="#06b6d4"
                          strokeWidth="1.2"
                          strokeDasharray="4,3"
                        />
                        {/* Target Marker Ring */}
                        <circle
                          cx={px}
                          cy={py}
                          r="7"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          className="animate-ping"
                          opacity="0.6"
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r="5.5"
                          fill="#0891b2"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                        />
                        <text
                          x={px}
                          y={py - 10}
                          fontSize="9.5"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#38bdf8"
                          className="drop-shadow"
                        >
                          Current Design ({activeFc} MPa, DCR {currentDcr.toFixed(3)})
                        </text>
                      </g>
                    );
                  }
                  return null;
                })()}

                {/* Active Hover Crosshair & Tooltip Overlay */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.xCoord}
                      y1={margin.top}
                      x2={hoveredPoint.xCoord}
                      y2={margin.top + innerHeight}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="3,3"
                    />
                    <line
                      x1={margin.left}
                      y1={hoveredPoint.yCoord}
                      x2={margin.left + innerWidth}
                      y2={hoveredPoint.yCoord}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={hoveredPoint.xCoord}
                      cy={hoveredPoint.yCoord}
                      r="5"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* Floating Tooltip Card */}
              {hoveredPoint && (
                <div
                  className="absolute z-10 bg-slate-900/95 border border-cyan-500/80 rounded-lg p-2.5 shadow-2xl text-xs space-y-1 backdrop-blur pointer-events-none"
                  style={{
                    left: Math.min(chartWidth - 210, Math.max(margin.left, hoveredPoint.xCoord + 15)),
                    top: Math.max(20, Math.min(chartHeight - 110, hoveredPoint.yCoord - 40)),
                  }}
                >
                  <div className="font-bold text-slate-100 flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
                    <span className="text-cyan-300">f'c = {hoveredPoint.xVal} MPa</span>
                    <span className="text-[10px] text-slate-400">{hoveredPoint.curveLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Demand/Capacity (DCR):</span>
                    <span
                      className={`font-bold ${
                        hoveredPoint.dcr <= 1.0 ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {hoveredPoint.dcr.toFixed(3)} ({hoveredPoint.dcr <= 1.0 ? 'PASS' : 'FAIL'})
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Design Capacity:</span>
                    <span className="font-bold text-slate-200">
                      {hoveredPoint.capacity.toFixed(1)} {analysisMode === 'shear' ? 'kN' : 'kN-m'}
                    </span>
                  </div>
                  {hoveredPoint.efd && (
                    <div className="flex justify-between gap-4 text-[10px] text-slate-400 border-t border-slate-800 pt-0.5">
                      <span>Debonding εfd:</span>
                      <span className="text-cyan-300 font-mono">{hoveredPoint.efd.toFixed(5)}</span>
                    </div>
                  )}
                  <div className="text-[9px] text-amber-300 italic pt-0.5">
                    Click point to apply f'c = {hoveredPoint.xVal} MPa to design
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Legend & Curve Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-400 text-[11px] font-semibold">Fiber Modulus Curves:</span>
                {fcSweepData.curves.map((curve, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-1 rounded inline-block"
                      style={{ backgroundColor: curve.color }}
                    ></span>
                    <span className={curve.isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                      {curve.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {optimizationInsights.minFcToPass && (
                  <button
                    onClick={() => handleApplyFc(optimizationInsights.minFcToPass!)}
                    className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors text-[11px] font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Set Min Required f'c ({optimizationInsights.minFcToPass} MPa)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Ef SENSITIVITY SWEEP */}
        {activeTab === 'ef_sweep' && (
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="text-amber-400">Curve Plot:</span>
                  Fiber Elastic Modulus Ef vs Design Capacity DCR
                </h2>
                <p className="text-slate-400 text-xs">
                  Illustrates the nonlinear impact of fiber stiffness. Note diminishing returns due to debonding strain reduction (εfd ∝ 1/√Ef).
                </p>
              </div>

              {/* Slider for Ef Range Bounds */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-400">Modulus Range:</span>
                <span className="text-amber-300 font-bold">{(efMin / 1000).toFixed(0)} GPa</span>
                <input
                  type="range"
                  min="80000"
                  max="180000"
                  step="10000"
                  value={efMin}
                  onChange={(e) => setEfMin(Number(e.target.value))}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
                <span className="text-slate-600">to</span>
                <input
                  type="range"
                  min="300000"
                  max="800000"
                  step="20000"
                  value={efMax}
                  onChange={(e) => setEfMax(Number(e.target.value))}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
                <span className="text-amber-300 font-bold">{(efMax / 1000).toFixed(0)} GPa</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative mt-4 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-80 sm:h-96 min-w-[620px] select-none"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Overload & Safe Backgrounds */}
                <rect
                  x={margin.left}
                  y={getYCoord(yMax)}
                  width={innerWidth}
                  height={getYCoord(1.0) - getYCoord(yMax)}
                  fill="url(#overloadGrad)"
                />
                <rect
                  x={margin.left}
                  y={getYCoord(1.0)}
                  width={innerWidth}
                  height={getYCoord(yMin) - getYCoord(1.0)}
                  fill="url(#safeGrad)"
                />

                {/* Optimal Target Corridor */}
                <rect
                  x={margin.left}
                  y={getYCoord(0.95)}
                  width={innerWidth}
                  height={getYCoord(0.80) - getYCoord(0.95)}
                  fill="#f59e0b"
                  fillOpacity="0.06"
                />

                {/* Grid Lines - Horizontal */}
                {yTicks.map((tickVal) => {
                  const yPos = getYCoord(tickVal);
                  return (
                    <g key={tickVal}>
                      <line
                        x1={margin.left}
                        y1={yPos}
                        x2={margin.left + innerWidth}
                        y2={yPos}
                        stroke={tickVal === 1.0 ? '#ef4444' : '#334155'}
                        strokeWidth={tickVal === 1.0 ? 1.5 : 0.6}
                        strokeDasharray={tickVal === 1.0 ? 'none' : '3,3'}
                      />
                      <text
                        x={margin.left - 8}
                        y={yPos + 3.5}
                        fontSize="9.5"
                        textAnchor="end"
                        fill={tickVal === 1.0 ? '#f87171' : '#64748b'}
                        fontWeight={tickVal === 1.0 ? 'bold' : 'normal'}
                      >
                        {tickVal.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                <text
                  x={margin.left + innerWidth - 6}
                  y={getYCoord(1.0) - 5}
                  fontSize="9"
                  textAnchor="end"
                  fill="#f87171"
                  fontWeight="bold"
                >
                  DCR = 1.0 Code Limit
                </text>

                {/* Grid Lines - Vertical (Ef Ticks) */}
                {[150000, 230000, 300000, 370000, 450000, 550000, 640000]
                  .filter((v) => v >= efMin && v <= efMax)
                  .map((efVal) => {
                    const xPos = getEfXCoord(efVal);
                    return (
                      <g key={efVal}>
                        <line
                          x1={xPos}
                          y1={margin.top}
                          x2={xPos}
                          y2={margin.top + innerHeight}
                          stroke="#334155"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                        />
                        <text
                          x={xPos}
                          y={margin.top + innerHeight + 16}
                          fontSize="9.5"
                          textAnchor="middle"
                          fill="#94a3b8"
                        >
                          {(efVal / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  })}

                {/* Axis Labels */}
                <text
                  x={margin.left + innerWidth / 2}
                  y={margin.top + innerHeight + 36}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#cbd5e1"
                >
                  Fiber Elastic Modulus Ef (N/mm² / MPa)
                </text>
                <text
                  x={-(margin.top + innerHeight / 2)}
                  y="18"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  transform="rotate(-90)"
                >
                  Demand-to-Capacity Ratio (DCR)
                </text>

                {/* Render Curves */}
                {efSweepData.curves.map((curve, cIdx) => {
                  const pathD = curve.points
                    .map((pt, pIdx) => {
                      const px = getEfXCoord(pt.x);
                      const py = getYCoord(pt.y);
                      return `${pIdx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                    })
                    .join(' ');

                  return (
                    <g key={cIdx}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={curve.color}
                        strokeWidth={curve.isCurrent ? 2.8 : 1.6}
                        strokeDasharray={curve.dash || 'none'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all hover:stroke-white cursor-pointer"
                      />

                      {curve.points.map((pt, pIdx) => {
                        const px = getEfXCoord(pt.x);
                        const py = getYCoord(pt.y);
                        return (
                          <circle
                            key={pIdx}
                            cx={px}
                            cy={py}
                            r={curve.isCurrent ? 3.5 : 2}
                            fill={curve.color}
                            className="hover:r-5 cursor-pointer opacity-70 hover:opacity-100"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                xVal: pt.x,
                                dcr: pt.y,
                                capacity: pt.capacity,
                                demand: pt.demand,
                                efd: pt.efd,
                                curveLabel: curve.label,
                                isCurrent: curve.isCurrent,
                                xCoord: px,
                                yCoord: py,
                              })
                            }
                            onClick={() => handleApplyEf(pt.x)}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Marker for Active Design Point */}
                {(() => {
                  const activeEf = optimizationInsights.activeEf;
                  if (activeEf >= efMin && activeEf <= efMax) {
                    const px = getEfXCoord(activeEf);
                    const py = getYCoord(currentDcr);
                    return (
                      <g>
                        <line
                          x1={px}
                          y1={margin.top}
                          x2={px}
                          y2={margin.top + innerHeight}
                          stroke="#f59e0b"
                          strokeWidth="1.2"
                          strokeDasharray="4,3"
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r="7"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          className="animate-ping"
                          opacity="0.6"
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r="5.5"
                          fill="#d97706"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                        />
                        <text
                          x={px}
                          y={py - 10}
                          fontSize="9.5"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#fbbf24"
                          className="drop-shadow"
                        >
                          Current ({(activeEf / 1000).toFixed(0)} GPa, DCR {currentDcr.toFixed(3)})
                        </text>
                      </g>
                    );
                  }
                  return null;
                })()}

                {/* Active Hover Crosshair Overlay */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.xCoord}
                      y1={margin.top}
                      x2={hoveredPoint.xCoord}
                      y2={margin.top + innerHeight}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="3,3"
                    />
                    <line
                      x1={margin.left}
                      y1={hoveredPoint.yCoord}
                      x2={margin.left + innerWidth}
                      y2={hoveredPoint.yCoord}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={hoveredPoint.xCoord}
                      cy={hoveredPoint.yCoord}
                      r="5"
                      fill="#ffffff"
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* Floating Tooltip Card */}
              {hoveredPoint && (
                <div
                  className="absolute z-10 bg-slate-900/95 border border-amber-500/80 rounded-lg p-2.5 shadow-2xl text-xs space-y-1 backdrop-blur pointer-events-none"
                  style={{
                    left: Math.min(chartWidth - 210, Math.max(margin.left, hoveredPoint.xCoord + 15)),
                    top: Math.max(20, Math.min(chartHeight - 110, hoveredPoint.yCoord - 40)),
                  }}
                >
                  <div className="font-bold text-slate-100 flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
                    <span className="text-amber-300">
                      Ef = {hoveredPoint.xVal.toLocaleString()} N/mm² ({(hoveredPoint.xVal / 1000).toFixed(0)} GPa)
                    </span>
                    <span className="text-[10px] text-slate-400">{hoveredPoint.curveLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Demand/Capacity (DCR):</span>
                    <span
                      className={`font-bold ${
                        hoveredPoint.dcr <= 1.0 ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {hoveredPoint.dcr.toFixed(3)} ({hoveredPoint.dcr <= 1.0 ? 'PASS' : 'FAIL'})
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Design Capacity:</span>
                    <span className="font-bold text-slate-200">
                      {hoveredPoint.capacity.toFixed(1)} {analysisMode === 'shear' ? 'kN' : 'kN-m'}
                    </span>
                  </div>
                  {hoveredPoint.efd && (
                    <div className="flex justify-between gap-4 text-[10px] text-slate-400 border-t border-slate-800 pt-0.5">
                      <span>Debonding εfd:</span>
                      <span className="text-amber-300 font-mono">{hoveredPoint.efd.toFixed(5)}</span>
                    </div>
                  )}
                  <div className="text-[9px] text-cyan-300 italic pt-0.5">
                    Click point to apply Ef = {hoveredPoint.xVal.toLocaleString()} MPa to design
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-400 text-[11px] font-semibold">Substrate Strength Curves:</span>
                {efSweepData.curves.map((curve, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-1 rounded inline-block"
                      style={{ backgroundColor: curve.color }}
                    ></span>
                    <span className={curve.isCurrent ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                      {curve.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Action */}
              <div className="flex items-center gap-2">
                {optimizationInsights.minEfToPass && (
                  <button
                    onClick={() => handleApplyEf(optimizationInsights.minEfToPass!)}
                    className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors text-[11px] font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Set Min Required Ef ({(optimizationInsights.minEfToPass / 1000).toFixed(0)} GPa)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 2D PARAMETRIC MATRIX / ISO-DCR SURFACE */}
        {activeTab === '2d_matrix' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-emerald-400" />
                  2D Parametric Iso-DCR Surface Matrix (f'c vs Ef)
                </h2>
                <p className="text-slate-400 text-xs">
                  Comprehensive design space evaluation. Click any cell to immediately apply that exact (f'c, Ef) combination to your calculation.
                </p>
              </div>

              {/* Color legend */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-900/80 border border-emerald-600"></span> &lt; 0.85
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-teal-900/80 border border-teal-500"></span> 0.85–0.95
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-900/80 border border-amber-500"></span> 0.95–1.00
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-900/80 border border-rose-600"></span> &gt; 1.00 Fail
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-800 bg-slate-950 text-left text-slate-400 font-normal">
                      Ef (N/mm²) \ f'c (MPa)
                    </th>
                    {matrixData.fcTicks.map((fcVal) => (
                      <th
                        key={fcVal}
                        className={`p-2 border border-slate-800 font-bold ${
                          fcVal === optimizationInsights.activeFc
                            ? 'bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-500'
                            : 'bg-slate-950 text-slate-200'
                        }`}
                      >
                        {fcVal} MPa
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.grid.map((row, rIdx) => {
                    const isRowActive = Math.abs(row.ef - optimizationInsights.activeEf) < 25000;
                    return (
                      <tr key={rIdx}>
                        <td
                          className={`p-2 border border-slate-800 text-left font-mono ${
                            isRowActive
                              ? 'bg-amber-950/80 text-amber-300 font-bold ring-1 ring-amber-500'
                              : 'bg-slate-950/60 text-slate-400'
                          }`}
                        >
                          {row.ef.toLocaleString()} ({(row.ef / 1000).toFixed(0)} GPa)
                        </td>
                        {row.cells.map((cell, cIdx) => {
                          const isExactActive =
                            cell.fc === optimizationInsights.activeFc && isRowActive;

                          // Color classes based on DCR
                          let cellBg = 'bg-rose-950/50 text-rose-300 border-rose-800/60 hover:bg-rose-900/80';
                          if (cell.dcr <= 0.85) {
                            cellBg = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/80';
                          } else if (cell.dcr <= 0.95) {
                            cellBg = 'bg-teal-950/60 text-teal-300 border-teal-800/60 hover:bg-teal-900/80';
                          } else if (cell.dcr <= 1.00) {
                            cellBg = 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/80';
                          }

                          return (
                            <td
                              key={cIdx}
                              onClick={() => handleApplyCombination(cell.fc, cell.ef)}
                              className={`p-2 border cursor-pointer transition-all font-mono text-xs ${cellBg} ${
                                isExactActive
                                  ? 'ring-2 ring-white font-black scale-105 shadow-lg'
                                  : ''
                              }`}
                              title={`f'c: ${cell.fc} MPa, Ef: ${cell.ef.toLocaleString()} MPa\nDCR: ${cell.dcr.toFixed(3)}\nCapacity: ${cell.capacity.toFixed(1)}\nClick to apply to design!`}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-bold">{cell.dcr.toFixed(3)}</span>
                                <span className="text-[9px] opacity-75">
                                  {cell.capacity.toFixed(0)}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-slate-500 italic text-right">
              Values displayed: DCR (top) & Calculated Design Capacity (bottom). Click any cell to update calculation.
            </div>
          </div>
        )}

        {/* TAB 4: COMMERCIAL TDS BRAND BENCHMARK */}
        {activeTab === 'brand_benchmark' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  Commercial CFRP Material System Ranking (at f'c = {optimizationInsights.activeFc} MPa)
                </h2>
                <p className="text-slate-400 text-xs">
                  Automated performance comparison across verified TDS manufacturer systems evaluated against current structural geometry.
                </p>
              </div>

              <button
                onClick={() => onNavigateToSheet('materials')}
                className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-colors text-xs flex items-center gap-1 font-semibold"
              >
                Open Materials Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {brandBenchmarkData.map((brandItem, idx) => {
                const isSelected =
                  (analysisMode === 'shear' ? shearInputs.cfrpBrand : flexureInputs.cfrpBrand)?.toLowerCase() ===
                  brandItem.brand.toLowerCase();

                // Bar width percentage relative to DCR = 1.0 (clamped 0 to 100)
                const barPercent = Math.min(100, Math.max(10, (brandItem.dcr / 1.5) * 100));

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500/40 shadow'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 font-mono text-[11px] w-5">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-xs">{brandItem.brand}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 text-[9px] font-bold border border-purple-700">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px]">{brandItem.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Ef / tf:</span>
                          <span className="font-mono text-slate-200 font-semibold">
                            {(brandItem.Ef / 1000).toFixed(0)} GPa &nbsp;|&nbsp; {brandItem.tf} mm
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Capacity:</span>
                          <span className="font-mono text-cyan-300 font-bold">
                            {brandItem.capacity.toFixed(1)} {analysisMode === 'shear' ? 'kN' : 'kN-m'}
                          </span>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-slate-400 text-[10px] block">DCR:</span>
                          <span
                            className={`font-mono font-bold text-sm ${
                              brandItem.pass ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {brandItem.dcr.toFixed(3)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (analysisMode === 'flexure' || analysisMode === 'combined') {
                              onFlexureInputChange('cfrpBrand', brandItem.brand);
                              onFlexureInputChange('Ef', brandItem.Ef);
                              onFlexureInputChange('tf', brandItem.tf);
                              onFlexureInputChange('fu', brandItem.fu);
                            }
                            if (analysisMode === 'shear' || analysisMode === 'combined') {
                              onShearInputChange('cfrpBrand', brandItem.brand);
                              onShearInputChange('Ef', brandItem.Ef);
                              onShearInputChange('tf', brandItem.tf);
                              onShearInputChange('fu', brandItem.fu);
                            }
                            showNotice(`Loaded material system: ${brandItem.brand}!`);
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                            isSelected
                              ? 'bg-purple-900 text-purple-200 border border-purple-700'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {/* DCR Bar Indicator */}
                    <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          brandItem.pass
                            ? brandItem.dcr <= 0.85
                              ? 'bg-emerald-500'
                              : 'bg-teal-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${barPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 4: DESIGN OPTIMIZATION ASSISTANT & INSIGHTS CARDS          */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Sensitivity Gradient & Dominant Driver */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-200 text-xs">
              Sensitivity Gradients (Local Derivatives)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Concrete Strength Impact:</span>
              <span className="font-mono font-bold text-cyan-300">
                {optimizationInsights.deltaDcr5MPa < 0 ? '' : '+'}
                {optimizationInsights.deltaDcr5MPa.toFixed(3)} DCR / +5 MPa
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Fiber Modulus Impact:</span>
              <span className="font-mono font-bold text-amber-300">
                {optimizationInsights.deltaDcr50GPa < 0 ? '' : '+'}
                {optimizationInsights.deltaDcr50GPa.toFixed(3)} DCR / +50 GPa
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              <span className="text-amber-400 font-bold block mb-0.5">
                Primary Sensitivity Driver:
              </span>
              {optimizationInsights.dominantFactor === 'fc' ? (
                <span>
                  Increasing concrete compressive strength <strong>f'c</strong> provides higher capacity gains in this region due to debonding strain scaling (√f'c) and larger compressive block depth.
                </span>
              ) : (
                <span>
                  Increasing fiber modulus <strong>Ef</strong> produces strong initial gains; monitor debonding strain limits to avoid premature fiber delamination.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Code Compliance Boundaries & Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-xs">
              Critical Thresholds for DCR ≤ 1.0
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">Min f'c (at current Ef):</span>
                <span className="font-mono font-bold text-slate-100">
                  {optimizationInsights.minFcToPass ? `${optimizationInsights.minFcToPass} MPa` : 'Exceeds 90 MPa'}
                </span>
              </div>
              {optimizationInsights.minFcToPass && (
                <button
                  onClick={() => handleApplyFc(optimizationInsights.minFcToPass!)}
                  className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-[10px] font-bold"
                >
                  Apply
                </button>
              )}
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">Min Ef (at current f'c):</span>
                <span className="font-mono font-bold text-slate-100">
                  {optimizationInsights.minEfToPass ? `${(optimizationInsights.minEfToPass / 1000).toFixed(0)} GPa` : 'Exceeds 800 GPa'}
                </span>
              </div>
              {optimizationInsights.minEfToPass && (
                <button
                  onClick={() => handleApplyEf(optimizationInsights.minEfToPass!)}
                  className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 text-[10px] font-bold"
                >
                  Apply
                </button>
              )}
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">Target f'c for Optimal DCR ≤ 0.85:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {optimizationInsights.minFcOptimal ? `${optimizationInsights.minFcOptimal} MPa` : 'N/A'}
                </span>
              </div>
              {optimizationInsights.minFcOptimal && (
                <button
                  onClick={() => handleApplyFc(optimizationInsights.minFcOptimal!)}
                  className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[10px] font-bold"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Optimization Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-200 text-xs">
              Engineering Optimization Recommendations
            </h3>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {currentDcr <= 0.85 ? (
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/80 text-emerald-200">
                <span className="font-bold block text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Safety Margin (DCR = {currentDcr.toFixed(3)})
                </span>
                The design is conservative with &gt;15% reserve capacity. You may consider reducing plies or choosing a lower-modulus fabric for cost savings.
              </div>
            ) : currentDcr <= 1.0 ? (
              <div className="p-2.5 rounded bg-teal-950/40 border border-teal-800/80 text-teal-200">
                <span className="font-bold block text-teal-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Target Range (DCR = {currentDcr.toFixed(3)})
                </span>
                Structure satisfies ACI 440 code limits with balanced material utilization and safe reserve capacity.
              </div>
            ) : (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/80 text-rose-200">
                <span className="font-bold block text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over Capacity (DCR = {currentDcr.toFixed(3)})
                </span>
                To achieve code compliance:
                <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px]">
                  {optimizationInsights.minFcToPass && (
                    <li>Increase concrete strength to at least {optimizationInsights.minFcToPass} MPa</li>
                  )}
                  {optimizationInsights.minEfToPass && (
                    <li>Upgrade fiber modulus to {(optimizationInsights.minEfToPass / 1000).toFixed(0)} GPa</li>
                  )}
                  <li>Add plies or increase laminate width in Sheet 1/3</li>
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Return to design calculation:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateToSheet('flexure')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Sheet 1
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => onNavigateToSheet('shear')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Sheet 3
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
