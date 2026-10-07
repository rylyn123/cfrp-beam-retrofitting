import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  Sliders,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  ArrowRight,
  Check,
  Info,
  TrendingDown,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { CfrpInputs, ShearInputs, CfrpPreset } from '../types/cfrp';
import { calculateFlexure, calculateShear, CFRP_PRESETS } from '../utils/cfrpMath';

interface SensitivityOptimizationSheetProps {
  flexureInputs: CfrpInputs;
  shearInputs: ShearInputs;
  onFlexureInputChange: (key: keyof CfrpInputs, value: any) => void;
  onShearInputChange: (key: keyof ShearInputs, value: any) => void;
  customPresets: CfrpPreset[];
  onNavigateToFlexure: () => void;
  onNavigateToShear: () => void;
}

type OptimizationMode = 'flexure' | 'shear' | 'envelope';

export const SensitivityOptimizationSheet: React.FC<SensitivityOptimizationSheetProps> = ({
  flexureInputs,
  shearInputs,
  onFlexureInputChange,
  onShearInputChange,
  customPresets,
  onNavigateToFlexure,
  onNavigateToShear,
}) => {
  const [mode, setMode] = useState<OptimizationMode>('flexure');
  const [targetDcr, setTargetDcr] = useState<number>(0.85); // 15% safety margin default
  const [hoveredFc, setHoveredFc] = useState<number | null>(null);
  const [hoveredEf, setHoveredEf] = useState<number | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const allPresets = useMemo(() => {
    return [...customPresets, ...CFRP_PRESETS];
  }, [customPresets]);

  // Current baseline results
  const currentFlexure = useMemo(() => calculateFlexure(flexureInputs), [flexureInputs]);
  const currentShear = useMemo(() => calculateShear(shearInputs), [shearInputs]);

  const currentDcr = useMemo(() => {
    if (mode === 'flexure') return currentFlexure.DCR;
    if (mode === 'shear') return currentShear.DCR;
    return Math.max(currentFlexure.DCR, currentShear.DCR);
  }, [mode, currentFlexure, currentShear]);

  // =========================================================================
  // 1. Concrete Compressive Strength (f'c) Parametric Sweep (15 to 60 MPa)
  // =========================================================================
  const fcSweepData = useMemo(() => {
    const points: {
      fc: number;
      dcrFlex: number;
      phiMn: number;
      dcrShear: number;
      phiVn: number;
      dcr: number;
      pass: boolean;
    }[] = [];

    for (let fc = 15; fc <= 60; fc += 1) {
      const fRes = calculateFlexure({ ...flexureInputs, fc });
      const sRes = calculateShear({ ...shearInputs, fc });

      let dcr = fRes.DCR;
      if (mode === 'shear') dcr = sRes.DCR;
      else if (mode === 'envelope') dcr = Math.max(fRes.DCR, sRes.DCR);

      points.push({
        fc,
        dcrFlex: fRes.DCR,
        phiMn: fRes.phiMn,
        dcrShear: sRes.DCR,
        phiVn: sRes.phiVn,
        dcr,
        pass: dcr <= 1.0,
      });
    }

    return points;
  }, [flexureInputs, shearInputs, mode]);

  // =========================================================================
  // 2. Fiber Elastic Modulus (Ef) Parametric Sweep (50k to 400k MPa)
  // =========================================================================
  const efSweepData = useMemo(() => {
    const points: {
      Ef: number;
      EfGpa: number;
      dcrFlex: number;
      phiMn: number;
      dcrShear: number;
      phiVn: number;
      dcr: number;
      dcrPly1: number;
      dcrPly2: number;
      dcrPly3: number;
      pass: boolean;
    }[] = [];

    for (let Ef = 50000; Ef <= 400000; Ef += 10000) {
      const fRes = calculateFlexure({ ...flexureInputs, Ef });
      const sRes = calculateShear({ ...shearInputs, Ef });

      // Multply comparison curves
      const fResP1 = calculateFlexure({ ...flexureInputs, Ef, noOfPlies: 1 });
      const fResP2 = calculateFlexure({ ...flexureInputs, Ef, noOfPlies: 2 });
      const fResP3 = calculateFlexure({ ...flexureInputs, Ef, noOfPlies: 3 });

      let dcr = fRes.DCR;
      let dcrP1 = fResP1.DCR;
      let dcrP2 = fResP2.DCR;
      let dcrP3 = fResP3.DCR;

      if (mode === 'shear') {
        dcr = sRes.DCR;
        const sResP1 = calculateShear({ ...shearInputs, Ef, noOfPlies: 1 });
        const sResP2 = calculateShear({ ...shearInputs, Ef, noOfPlies: 2 });
        const sResP3 = calculateShear({ ...shearInputs, Ef, noOfPlies: 3 });
        dcrP1 = sResP1.DCR;
        dcrP2 = sResP2.DCR;
        dcrP3 = sResP3.DCR;
      } else if (mode === 'envelope') {
        dcr = Math.max(fRes.DCR, sRes.DCR);
        dcrP1 = Math.max(fResP1.DCR, calculateShear({ ...shearInputs, Ef, noOfPlies: 1 }).DCR);
        dcrP2 = Math.max(fResP2.DCR, calculateShear({ ...shearInputs, Ef, noOfPlies: 2 }).DCR);
        dcrP3 = Math.max(fResP3.DCR, calculateShear({ ...shearInputs, Ef, noOfPlies: 3 }).DCR);
      }

      points.push({
        Ef,
        EfGpa: Ef / 1000,
        dcrFlex: fRes.DCR,
        phiMn: fRes.phiMn,
        dcrShear: sRes.DCR,
        phiVn: sRes.phiVn,
        dcr,
        dcrPly1: dcrP1,
        dcrPly2: dcrP2,
        dcrPly3: dcrP3,
        pass: dcr <= 1.0,
      });
    }

    return points;
  }, [flexureInputs, shearInputs, mode]);

  // =========================================================================
  // 3. 2D Bivariate Grid Matrix (f'c × Ef -> DCR)
  // =========================================================================
  const fcGridValues = [18, 20, 25, 27.6, 30, 35, 40, 50];
  const efGridValues = [73000, 100000, 180000, 230000, 250000, 300000, 370000];

  const bivariateMatrix = useMemo(() => {
    return fcGridValues.map((fc) => {
      return efGridValues.map((Ef) => {
        let dcr = 0;
        if (mode === 'flexure') {
          const res = calculateFlexure({ ...flexureInputs, fc, Ef });
          dcr = res.DCR;
        } else if (mode === 'shear') {
          const res = calculateShear({ ...shearInputs, fc, Ef });
          dcr = res.DCR;
        } else {
          const fRes = calculateFlexure({ ...flexureInputs, fc, Ef });
          const sRes = calculateShear({ ...shearInputs, fc, Ef });
          dcr = Math.max(fRes.DCR, sRes.DCR);
        }
        return { fc, Ef, dcr };
      });
    });
  }, [flexureInputs, shearInputs, mode]);

  // =========================================================================
  // 4. Sensitivity Derivatives & Leverage Analysis
  // =========================================================================
  const sensitivityAnalysis = useMemo(() => {
    const currentFc = mode === 'shear' ? shearInputs.fc : flexureInputs.fc;
    const currentEf = mode === 'shear' ? shearInputs.Ef : flexureInputs.Ef;

    // Delta fc = +5 MPa
    const fcPlus = currentFc + 5;
    let dcrAtFcPlus = 0;
    if (mode === 'flexure') {
      dcrAtFcPlus = calculateFlexure({ ...flexureInputs, fc: fcPlus }).DCR;
    } else if (mode === 'shear') {
      dcrAtFcPlus = calculateShear({ ...shearInputs, fc: fcPlus }).DCR;
    } else {
      dcrAtFcPlus = Math.max(
        calculateFlexure({ ...flexureInputs, fc: fcPlus }).DCR,
        calculateShear({ ...shearInputs, fc: fcPlus }).DCR
      );
    }
    const dcrChangeFc = dcrAtFcPlus - currentDcr;
    const pctChangeFc = currentDcr > 0 ? (dcrChangeFc / currentDcr) * 100 : 0;

    // Delta Ef = +30,000 MPa (+30 GPa)
    const efPlus = currentEf + 30000;
    let dcrAtEfPlus = 0;
    if (mode === 'flexure') {
      dcrAtEfPlus = calculateFlexure({ ...flexureInputs, Ef: efPlus }).DCR;
    } else if (mode === 'shear') {
      dcrAtEfPlus = calculateShear({ ...shearInputs, Ef: efPlus }).DCR;
    } else {
      dcrAtEfPlus = Math.max(
        calculateFlexure({ ...flexureInputs, Ef: efPlus }).DCR,
        calculateShear({ ...shearInputs, Ef: efPlus }).DCR
      );
    }
    const dcrChangeEf = dcrAtEfPlus - currentDcr;
    const pctChangeEf = currentDcr > 0 ? (dcrChangeEf / currentDcr) * 100 : 0;

    // Minimum required fc to meet target DCR (at current Ef)
    let minFcRequired: number | null = null;
    for (let c = 15; c <= 80; c += 0.5) {
      let d = 0;
      if (mode === 'flexure') d = calculateFlexure({ ...flexureInputs, fc: c }).DCR;
      else if (mode === 'shear') d = calculateShear({ ...shearInputs, fc: c }).DCR;
      else d = Math.max(calculateFlexure({ ...flexureInputs, fc: c }).DCR, calculateShear({ ...shearInputs, fc: c }).DCR);

      if (d <= targetDcr) {
        minFcRequired = c;
        break;
      }
    }

    // Minimum required Ef to meet target DCR (at current fc)
    let minEfRequired: number | null = null;
    for (let e = 50000; e <= 500000; e += 5000) {
      let d = 0;
      if (mode === 'flexure') d = calculateFlexure({ ...flexureInputs, Ef: e }).DCR;
      else if (mode === 'shear') d = calculateShear({ ...shearInputs, Ef: e }).DCR;
      else d = Math.max(calculateFlexure({ ...flexureInputs, Ef: e }).DCR, calculateShear({ ...shearInputs, Ef: e }).DCR);

      if (d <= targetDcr) {
        minEfRequired = e;
        break;
      }
    }

    return {
      currentFc,
      currentEf,
      pctChangeFc,
      pctChangeEf,
      minFcRequired,
      minEfRequired,
    };
  }, [flexureInputs, shearInputs, mode, currentDcr, targetDcr]);

  // =========================================================================
  // 5. Commercial CFRP TDS Library Ranking for this section
  // =========================================================================
  const rankedPresets = useMemo(() => {
    return allPresets.map((preset) => {
      let flexRes = calculateFlexure({
        ...flexureInputs,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      });
      let shearRes = calculateShear({
        ...shearInputs,
        fu: preset.fu,
        eu: preset.eu,
        Ef: preset.Ef,
        tf: preset.tf,
      });

      let dcr = flexRes.DCR;
      if (mode === 'shear') dcr = shearRes.DCR;
      else if (mode === 'envelope') dcr = Math.max(flexRes.DCR, shearRes.DCR);

      let status: 'optimal' | 'conservative' | 'marginal' | 'insufficient' = 'insufficient';
      if (dcr <= 0.70) status = 'conservative';
      else if (dcr <= 0.92) status = 'optimal';
      else if (dcr <= 1.00) status = 'marginal';
      else status = 'insufficient';

      return {
        preset,
        dcr,
        phiMn: flexRes.phiMn,
        phiVn: shearRes.phiVn,
        status,
        flexPass: flexRes.flexurePass,
        shearPass: shearRes.shearPass,
      };
    }).sort((a, b) => {
      // Sort: optimal first, then by proximity to target DCR
      const diffA = Math.abs(a.dcr - targetDcr);
      const diffB = Math.abs(b.dcr - targetDcr);
      return diffA - diffB;
    });
  }, [allPresets, flexureInputs, shearInputs, mode, targetDcr]);

  // Handler to apply selected parameters directly
  const handleApplyParameters = (fc: number, Ef: number, brand?: string) => {
    if (mode === 'flexure' || mode === 'envelope') {
      onFlexureInputChange('fc', fc);
      onFlexureInputChange('Ef', Ef);
      if (brand) onFlexureInputChange('cfrpBrand', brand);
    }
    if (mode === 'shear' || mode === 'envelope') {
      onShearInputChange('fc', fc);
      onShearInputChange('Ef', Ef);
      if (brand) onShearInputChange('cfrpBrand', brand);
    }
  };

  const handleApplyPreset = (preset: CfrpPreset) => {
    if (mode === 'flexure' || mode === 'envelope') {
      onFlexureInputChange('cfrpBrand', preset.brand);
      onFlexureInputChange('fu', preset.fu);
      onFlexureInputChange('eu', preset.eu);
      onFlexureInputChange('Ef', preset.Ef);
      onFlexureInputChange('tf', preset.tf);
    }
    if (mode === 'shear' || mode === 'envelope') {
      onShearInputChange('cfrpBrand', preset.brand);
      onShearInputChange('fu', preset.fu);
      onShearInputChange('eu', preset.eu);
      onShearInputChange('Ef', preset.Ef);
      onShearInputChange('tf', preset.tf);
    }
  };

  // =========================================================================
  // SVG Chart Geometry Helpers
  // =========================================================================
  const chartW = 560;
  const chartH = 240;
  const padL = 46;
  const padR = 24;
  const padT = 24;
  const padB = 34;

  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Y-axis scaling (DCR between 0.40 and 1.40 or clamped to range)
  const dcrMin = 0.40;
  const dcrMax = 1.35;

  const getY = (val: number) => {
    const clamped = Math.max(dcrMin, Math.min(dcrMax, val));
    const ratio = (clamped - dcrMin) / (dcrMax - dcrMin);
    return padT + innerH * (1 - ratio);
  };

  const codeLimitY = getY(1.0);
  const optTopY = getY(0.95);
  const optBtmY = getY(0.75);

  // Concrete Fc Chart X scale: 15 to 60 MPa
  const getX_fc = (fc: number) => {
    const ratio = (fc - 15) / (60 - 15);
    return padL + innerW * ratio;
  };

  // Fiber Ef Chart X scale: 50,000 to 400,000 MPa
  const getX_ef = (ef: number) => {
    const ratio = (ef - 50000) / (400000 - 50000);
    return padL + innerW * ratio;
  };

  // Build SVG path for fc sweep
  const fcPathD = useMemo(() => {
    return fcSweepData.reduce((acc, pt, idx) => {
      const x = getX_fc(pt.fc);
      const y = getY(pt.dcr);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [fcSweepData]);

  // Build SVG paths for Ef sweep (current plies, and comparison plies)
  const efPathD = useMemo(() => {
    return efSweepData.reduce((acc, pt, idx) => {
      const x = getX_ef(pt.Ef);
      const y = getY(pt.dcr);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [efSweepData]);

  const efPathD_Ply1 = useMemo(() => {
    return efSweepData.reduce((acc, pt, idx) => {
      const x = getX_ef(pt.Ef);
      const y = getY(pt.dcrPly1);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [efSweepData]);

  const efPathD_Ply2 = useMemo(() => {
    return efSweepData.reduce((acc, pt, idx) => {
      const x = getX_ef(pt.Ef);
      const y = getY(pt.dcrPly2);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [efSweepData]);

  const currentFc = mode === 'shear' ? shearInputs.fc : flexureInputs.fc;
  const currentEf = mode === 'shear' ? shearInputs.Ef : flexureInputs.Ef;

  const currentFcPointX = getX_fc(currentFc);
  const currentFcPointY = getY(currentDcr);

  const currentEfPointX = getX_ef(currentEf);
  const currentEfPointY = getY(currentDcr);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-mono text-xs">
      {/* ========================================================================= */}
      {/* 1. Header Banner & Mode Selector */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                Sheet 5: Sensitivity & Optimization
              </span>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                DCR Parametric Sensitivity & Capacity Visualizer
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Analyze how concrete compressive strength (<strong className="text-slate-200">f'c</strong>) and fiber modulus (<strong className="text-slate-200">Ef</strong>) govern the Demand Capacity Ratio (DCR) per ACI 440.2R.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMode('flexure')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 font-semibold text-xs ${
                mode === 'flexure'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Flexure (Mu / ΦMn)
            </button>
            <button
              onClick={() => setMode('shear')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 font-semibold text-xs ${
                mode === 'shear'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Shear (Vu / ΦVn)
            </button>
            <button
              onClick={() => setMode('envelope')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 font-semibold text-xs ${
                mode === 'envelope'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Critical Envelope
            </button>
          </div>
        </div>

        {/* Real-time KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-1">
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Design DCR</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-xl font-bold font-mono ${
                  currentDcr <= 0.70
                    ? 'text-sky-300'
                    : currentDcr <= 0.95
                    ? 'text-emerald-400'
                    : currentDcr <= 1.0
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {currentDcr.toFixed(3)}
              </span>
              <span className="text-[10px] font-bold">
                {currentDcr <= 1.0 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> OVERLOAD
                  </span>
                )}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Margin: {((1 - currentDcr) * 100).toFixed(1)}% reserve
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Concrete Compressive f'c</span>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
              {currentFc} <span className="text-xs font-normal text-slate-400">MPa</span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Substrate min: 17 MPa (ACI 440 §8.2)
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fiber Modulus Ef</span>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
              {(currentEf / 1000).toFixed(0)} <span className="text-xs font-normal text-slate-400">GPa</span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {flexureInputs.cfrpBrand || 'CFRP Composite'}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Governing Capacity</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {mode === 'shear' ? (
                <>
                  {currentShear.phiVn.toFixed(1)} <span className="text-xs font-normal text-slate-400">kN</span>
                </>
              ) : (
                <>
                  {currentFlexure.phiMn.toFixed(1)} <span className="text-xs font-normal text-slate-400">kN-m</span>
                </>
              )}
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Demand: {mode === 'shear' ? `${shearInputs.VuDemand} kN` : `${flexureInputs.MuDemand} kN-m`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Side-by-Side Parametric Sensitivity Curves (f'c & Ef) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curve 1: Concrete Compressive Strength f'c vs DCR */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h2 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                <span>1. Concrete Compressive Strength (f'c) Sensitivity</span>
              </h2>
              <span className="text-[10px] text-slate-400">Sweep from 15 MPa to 60 MPa</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
              Active: {currentFc} MPa
            </span>
          </div>

          {/* SVG Line Chart: f'c vs DCR */}
          <div className="relative bg-slate-950 rounded border border-slate-800/80 p-2 overflow-hidden">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-52 select-none"
              onMouseLeave={() => setHoveredFc(null)}
            >
              <defs>
                <linearGradient id="optZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="overloadZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* Background Zones */}
              {/* Overload Zone (DCR > 1.0) */}
              <rect
                x={padL}
                y={padT}
                width={innerW}
                height={Math.max(0, codeLimitY - padT)}
                fill="url(#overloadZoneGrad)"
              />
              {/* Optimal Design Band (0.75 <= DCR <= 0.95) */}
              <rect
                x={padL}
                y={optTopY}
                width={innerW}
                height={Math.max(0, optBtmY - optTopY)}
                fill="url(#optZoneGrad)"
              />

              {/* Horizontal Grid Lines */}
              {[0.5, 0.7, 0.85, 1.0, 1.2].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={padL + innerW}
                      y2={y}
                      stroke={val === 1.0 ? '#ef4444' : '#334155'}
                      strokeWidth={val === 1.0 ? 1.4 : 0.6}
                      strokeDasharray={val === 1.0 ? '4,3' : '2,2'}
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      fontSize="9"
                      fill={val === 1.0 ? '#f87171' : '#64748b'}
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Grid Lines for standard mixes (20, 30, 40, 50, 60 MPa) */}
              {[20, 27.6, 35, 45, 55].map((fc) => {
                const x = getX_fc(fc);
                return (
                  <g key={fc}>
                    <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="#1e293b" strokeWidth="0.8" />
                    <text
                      x={x}
                      y={padT + innerH + 14}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {fc}
                    </text>
                  </g>
                );
              })}

              {/* Substrate Minimum Limit line (17 MPa per ACI 440 Section 8.2) */}
              <line
                x1={getX_fc(17)}
                y1={padT}
                x2={getX_fc(17)}
                y2={padT + innerH}
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="3,2"
              />
              <text
                x={getX_fc(17) + 3}
                y={padT + 12}
                fontSize="8"
                fill="#eab308"
                fontFamily="monospace"
              >
                17 MPa (Substrate Min)
              </text>

              {/* Main Sensitivity Curve */}
              <path d={fcPathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

              {/* Code Limit DCR = 1.0 Label */}
              <text
                x={padL + innerW - 4}
                y={codeLimitY - 4}
                fontSize="8.5"
                fill="#f87171"
                textAnchor="end"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Code Limit (DCR = 1.0)
              </text>

              {/* Optimal Zone Label */}
              <text
                x={padL + innerW - 4}
                y={(optTopY + optBtmY) / 2 + 3}
                fontSize="8"
                fill="#34d399"
                textAnchor="end"
                fontFamily="monospace"
              >
                Optimal Zone (0.75–0.95)
              </text>

              {/* Current Operating Point Dot */}
              <circle cx={currentFcPointX} cy={currentFcPointY} r="7" fill="#06b6d4" opacity="0.25" />
              <circle cx={currentFcPointX} cy={currentFcPointY} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

              {/* Interactive Hover Listener Areas across f'c points */}
              {fcSweepData.map((pt) => {
                const x = getX_fc(pt.fc);
                const y = getY(pt.dcr);
                return (
                  <rect
                    key={pt.fc}
                    x={x - 6}
                    y={padT}
                    width={12}
                    height={innerH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredFc(pt.fc)}
                    onClick={() => handleApplyParameters(pt.fc, currentEf)}
                  />
                );
              })}

              {/* Hover Crosshair & Tooltip */}
              {hoveredFc !== null && (() => {
                const pt = fcSweepData.find((p) => p.fc === hoveredFc);
                if (!pt) return null;
                const hx = getX_fc(pt.fc);
                const hy = getY(pt.dcr);

                return (
                  <g pointerEvents="none">
                    <line x1={hx} y1={padT} x2={hx} y2={padT + innerH} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1={padL} y1={hy} x2={padL + innerW} y2={hy} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" />
                    <circle cx={hx} cy={hy} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                    <g transform={`translate(${Math.min(padL + innerW - 110, Math.max(padL + 10, hx - 55))}, ${Math.max(padT + 5, hy - 45)})`}>
                      <rect width="110" height="36" rx="4" fill="#090d16" stroke="#0284c7" strokeWidth="1" opacity="0.95" />
                      <text x="55" y="14" fontSize="9" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">
                        f'c = {pt.fc} MPa
                      </text>
                      <text x="55" y="27" fontSize="8.5" fill={pt.dcr <= 1.0 ? '#34d399' : '#f87171'} textAnchor="middle">
                        DCR = {pt.dcr.toFixed(3)} ({pt.pass ? 'PASS' : 'FAIL'})
                      </text>
                    </g>
                  </g>
                );
              })()}

              {/* Axis Titles */}
              <text x={padL + innerW / 2} y={chartH - 4} fontSize="9.5" fill="#94a3b8" textAnchor="middle">
                Concrete Compressive Strength f'c (MPa)
              </text>
            </svg>
          </div>

          {/* Quick-Pick Concrete Strength Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">Quick-Pick Mix:</span>
            <div className="flex flex-wrap items-center gap-1">
              {[20, 25, 27.6, 30, 35, 40, 50].map((fcVal) => (
                <button
                  key={fcVal}
                  onClick={() => handleApplyParameters(fcVal, currentEf)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all font-mono font-semibold ${
                    currentFc === fcVal
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {fcVal} MPa
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Curve 2: Fiber Elastic Modulus Ef vs DCR */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h2 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                <span>2. Fiber Elastic Modulus (Ef) Sensitivity</span>
              </h2>
              <span className="text-[10px] text-slate-400">Sweep from 50 GPa to 400 GPa</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
              Active: {(currentEf / 1000).toFixed(0)} GPa
            </span>
          </div>

          {/* SVG Line Chart: Ef vs DCR */}
          <div className="relative bg-slate-950 rounded border border-slate-800/80 p-2 overflow-hidden">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-52 select-none"
              onMouseLeave={() => setHoveredEf(null)}
            >
              {/* Background Zones */}
              <rect
                x={padL}
                y={padT}
                width={innerW}
                height={Math.max(0, codeLimitY - padT)}
                fill="url(#overloadZoneGrad)"
              />
              <rect
                x={padL}
                y={optTopY}
                width={innerW}
                height={Math.max(0, optBtmY - optTopY)}
                fill="url(#optZoneGrad)"
              />

              {/* Horizontal Grid Lines */}
              {[0.5, 0.7, 0.85, 1.0, 1.2].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={padL + innerW}
                      y2={y}
                      stroke={val === 1.0 ? '#ef4444' : '#334155'}
                      strokeWidth={val === 1.0 ? 1.4 : 0.6}
                      strokeDasharray={val === 1.0 ? '4,3' : '2,2'}
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      fontSize="9"
                      fill={val === 1.0 ? '#f87171' : '#64748b'}
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Grid Lines for Ef (100, 200, 300, 400 GPa) */}
              {[100000, 200000, 300000, 400000].map((ef) => {
                const x = getX_ef(ef);
                return (
                  <g key={ef}>
                    <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="#1e293b" strokeWidth="0.8" />
                    <text
                      x={x}
                      y={padT + innerH + 14}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {ef / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Commercial System Markers */}
              {/* SikaWrap Hex-103C ~73k */}
              <line x1={getX_ef(73100)} y1={padT + 16} x2={getX_ef(73100)} y2={padT + innerH} stroke="#64748b" strokeWidth="0.6" strokeDasharray="2,2" />
              <text x={getX_ef(73100)} y={padT + 12} fontSize="7.5" fill="#94a3b8" textAnchor="middle">
                Sika-103C
              </text>

              {/* MasterBrace / Sika 230k-240k */}
              <line x1={getX_ef(230000)} y1={padT + 16} x2={getX_ef(230000)} y2={padT + innerH} stroke="#64748b" strokeWidth="0.6" strokeDasharray="2,2" />
              <text x={getX_ef(230000)} y={padT + 12} fontSize="7.5" fill="#94a3b8" textAnchor="middle">
                Std Modulus
              </text>

              {/* Ply 1 Comparison Line (Dashed Slate) */}
              <path d={efPathD_Ply1} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
              {/* Ply 2 Comparison Line */}
              <path d={efPathD_Ply2} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />

              {/* Active Ply Curve */}
              <path d={efPathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Legend in corner */}
              <g transform={`translate(${padL + 12}, ${padT + 8})`}>
                <line x1="0" y1="0" x2="16" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="20" y="3" fontSize="8" fill="#e2e8f0">Active Design</text>

                <line x1="0" y1="12" x2="16" y2="12" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                <text x="20" y="15" fontSize="8" fill="#94a3b8">1 Ply Base</text>

                <line x1="85" y1="12" x2="101" y2="12" stroke="#a855f7" strokeWidth="1" strokeDasharray="4,2" />
                <text x="105" y="15" fontSize="8" fill="#c084fc">2 Plies</text>
              </g>

              {/* Code Limit Line Label */}
              <text
                x={padL + innerW - 4}
                y={codeLimitY - 4}
                fontSize="8.5"
                fill="#f87171"
                textAnchor="end"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Code Limit (DCR = 1.0)
              </text>

              {/* Current Operating Point Dot */}
              <circle cx={currentEfPointX} cy={currentEfPointY} r="7" fill="#38bdf8" opacity="0.25" />
              <circle cx={currentEfPointX} cy={currentEfPointY} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

              {/* Interactive Hover Listener Areas across Ef */}
              {efSweepData.map((pt) => {
                const x = getX_ef(pt.Ef);
                return (
                  <rect
                    key={pt.Ef}
                    x={x - 8}
                    y={padT}
                    width={16}
                    height={innerH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredEf(pt.Ef)}
                    onClick={() => handleApplyParameters(currentFc, pt.Ef)}
                  />
                );
              })}

              {/* Hover Crosshair & Tooltip */}
              {hoveredEf !== null && (() => {
                const pt = efSweepData.find((p) => p.Ef === hoveredEf);
                if (!pt) return null;
                const hx = getX_ef(pt.Ef);
                const hy = getY(pt.dcr);

                return (
                  <g pointerEvents="none">
                    <line x1={hx} y1={padT} x2={hx} y2={padT + innerH} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1={padL} y1={hy} x2={padL + innerW} y2={hy} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" />
                    <circle cx={hx} cy={hy} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                    <g transform={`translate(${Math.min(padL + innerW - 120, Math.max(padL + 10, hx - 60))}, ${Math.max(padT + 5, hy - 45)})`}>
                      <rect width="120" height="36" rx="4" fill="#090d16" stroke="#0284c7" strokeWidth="1" opacity="0.95" />
                      <text x="60" y="14" fontSize="9" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">
                        Ef = {pt.EfGpa.toFixed(0)} GPa ({pt.Ef.toLocaleString()} MPa)
                      </text>
                      <text x="60" y="27" fontSize="8.5" fill={pt.dcr <= 1.0 ? '#34d399' : '#f87171'} textAnchor="middle">
                        DCR = {pt.dcr.toFixed(3)} ({pt.pass ? 'PASS' : 'FAIL'})
                      </text>
                    </g>
                  </g>
                );
              })()}

              {/* Axis Titles */}
              <text x={padL + innerW / 2} y={chartH - 4} fontSize="9.5" fill="#94a3b8" textAnchor="middle">
                CFRP Elastic Modulus Ef (MPa)
              </text>
            </svg>
          </div>

          {/* Quick-Pick Modulus Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">Standard CFRP Modulus:</span>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: '73 GPa', val: 73100 },
                { label: '96 GPa', val: 95800 },
                { label: '230 GPa', val: 230000 },
                { label: '240 GPa', val: 240000 },
                { label: '252 GPa', val: 252000 },
                { label: '370 GPa', val: 370000 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => handleApplyParameters(currentFc, item.val)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all font-mono font-semibold ${
                    Math.abs(currentEf - item.val) < 2000
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 2D Bivariate Optimization Matrix (f'c × Ef -> DCR Heatmap) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              2D Design Space Matrix: Concrete Strength vs. Fiber Modulus
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Click any cell to immediately apply that parameter pair into your active calculation.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2.5 text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Optimal (0.75–0.95)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Over-designed (&lt;0.75)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Marginal (0.95–1.0)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Overloaded (&gt;1.0)
            </span>
          </div>
        </div>

        {/* Matrix Grid Table */}
        <div className="overflow-x-auto pb-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  f'c \ Ef
                </th>
                {efGridValues.map((ef) => (
                  <th
                    key={ef}
                    className="p-2 text-slate-300 font-mono text-[11px] font-semibold border-b border-slate-800"
                  >
                    {(ef / 1000).toFixed(0)} GPa
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bivariateMatrix.map((row, rowIdx) => {
                const fcVal = fcGridValues[rowIdx];
                return (
                  <tr key={fcVal} className="border-b border-slate-800/40">
                    <td className="p-2 text-left font-bold text-slate-300 font-mono text-[11px] bg-slate-950/60 border-r border-slate-800">
                      {fcVal} MPa
                    </td>
                    {row.map((cell) => {
                      const isCurrent =
                        Math.abs(cell.fc - currentFc) < 0.2 && Math.abs(cell.Ef - currentEf) < 3000;

                      let cellColor = '';
                      if (cell.dcr <= 0.70) {
                        cellColor = 'bg-sky-950/70 text-sky-200 border-sky-800/60 hover:bg-sky-900';
                      } else if (cell.dcr <= 0.95) {
                        cellColor = 'bg-emerald-950/80 text-emerald-200 border-emerald-700/70 hover:bg-emerald-900';
                      } else if (cell.dcr <= 1.00) {
                        cellColor = 'bg-amber-950/70 text-amber-200 border-amber-700/60 hover:bg-amber-900';
                      } else {
                        cellColor = 'bg-rose-950/80 text-rose-200 border-rose-800/80 hover:bg-rose-900';
                      }

                      return (
                        <td key={`${cell.fc}-${cell.Ef}`} className="p-1">
                          <button
                            onClick={() => handleApplyParameters(cell.fc, cell.Ef)}
                            title={`Click to set f'c = ${cell.fc} MPa, Ef = ${(cell.Ef / 1000).toFixed(0)} GPa (DCR = ${cell.dcr.toFixed(3)})`}
                            className={`w-full py-2 px-1.5 rounded border font-mono text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${cellColor} ${
                              isCurrent ? 'ring-2 ring-cyan-400 shadow-md font-extrabold' : ''
                            }`}
                          >
                            <span className="tabular-nums">{cell.dcr.toFixed(3)}</span>
                            {isCurrent && (
                              <span className="text-[8px] bg-cyan-900 text-cyan-200 px-1 rounded uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Target DCR Solver & Sensitivity Derivatives Insight */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target DCR Optimization Solver */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Target className="w-4 h-4 text-emerald-400" />
              Target DCR Optimization Goal-Seek
            </h2>
            <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Target: {targetDcr.toFixed(2)} ({( (1 - targetDcr) * 100).toFixed(0)}% reserve)
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300">Set Desired Target Capacity DCR:</span>
                <span className="font-mono font-bold text-cyan-300">{targetDcr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="1.00"
                step="0.01"
                value={targetDcr}
                onChange={(e) => setTargetDcr(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.60 (Conservative)</span>
                <span>0.85 (Optimal Recommended)</span>
                <span>1.00 (Code Threshold)</span>
              </div>
            </div>

            {/* Solved Requirements */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Required Parameter Adjustments:
              </span>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300 text-xs">Min. Concrete Strength (f'c):</span>
                <div className="flex items-center gap-2 font-mono">
                  {sensitivityAnalysis.minFcRequired ? (
                    <>
                      <strong className="text-cyan-300 text-xs">
                        {sensitivityAnalysis.minFcRequired.toFixed(1)} MPa
                      </strong>
                      <button
                        onClick={() => handleApplyParameters(sensitivityAnalysis.minFcRequired!, currentEf)}
                        className="px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold transition-all"
                      >
                        Apply
                      </button>
                    </>
                  ) : (
                    <span className="text-rose-400 text-xs font-semibold">Exceeds 80 MPa</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-300 text-xs">Min. Fiber Modulus (Ef):</span>
                <div className="flex items-center gap-2 font-mono">
                  {sensitivityAnalysis.minEfRequired ? (
                    <>
                      <strong className="text-cyan-300 text-xs">
                        {(sensitivityAnalysis.minEfRequired / 1000).toFixed(0)} GPa
                      </strong>
                      <button
                        onClick={() => handleApplyParameters(currentFc, sensitivityAnalysis.minEfRequired!)}
                        className="px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold transition-all"
                      >
                        Apply
                      </button>
                    </>
                  ) : (
                    <span className="text-rose-400 text-xs font-semibold">Diminishing returns</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Leverage & Derivative Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              Structural Sensitivity Derivatives & Leverage
            </h2>
            <span className="text-[10px] text-amber-300 font-mono font-semibold">
              Leverage Analysis
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Concrete Leverage (+5 MPa):</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    sensitivityAnalysis.pctChangeFc < 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {sensitivityAnalysis.pctChangeFc.toFixed(1)}% DCR
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Capacity boost from concrete compressive zone
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Fiber Leverage (+30 GPa):</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    sensitivityAnalysis.pctChangeEf < 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {sensitivityAnalysis.pctChangeEf.toFixed(1)}% DCR
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Governed by bond debonding limitation
                </span>
              </div>
            </div>

            {/* Mechanics Explanation */}
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <Info className="w-3.5 h-3.5" />
                Physical Mechanics Insight:
              </div>
              <p>
                Per ACI 440.2R Section 10.1.1, the CFRP debonding strain is defined as:{' '}
                <span className="text-amber-300 font-mono">εfd = 0.41 · √(f'c / (n · Ef · tf))</span>.
              </p>
              <p className="text-slate-400 text-[10px]">
                Because <span className="text-slate-200">εfd</span> is inversely proportional to the square root of <span className="text-slate-200">Ef</span>, increasing the carbon modulus produces diminishing returns. In contrast, increasing concrete compressive strength <span className="text-slate-200">f'c</span> directly enlarges both the concrete compressive block and the substrate bond capacity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. Recommended CFRP Systems Table (Ranked by Section Suitability) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-cyan-400" />
              CFRP System Recommendation Ranking for Active Beam
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Ranked by closeness to Target DCR ({targetDcr.toFixed(2)}) based on verified manufacturer Technical Data Sheets (TDS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToFlexure}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold underline decoration-dotted"
            >
              <span>Back to Flexure Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToShear}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold underline decoration-dotted"
            >
              <span>Back to Shear Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2 px-2.5">System Brand & Manufacturer</th>
                <th className="py-2 px-2.5 text-right">Ef (MPa)</th>
                <th className="py-2 px-2.5 text-right">tf (mm)</th>
                <th className="py-2 px-2.5 text-right">fu (MPa)</th>
                <th className="py-2 px-2.5 text-right">Resulting DCR</th>
                <th className="py-2 px-2.5 text-center">Status</th>
                <th className="py-2 px-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedPresets.slice(0, 8).map((item) => {
                const isActive =
                  (flexureInputs.cfrpBrand && flexureInputs.cfrpBrand.toLowerCase() === item.preset.brand.toLowerCase()) ||
                  (flexureInputs.Ef === item.preset.Ef && Math.abs(flexureInputs.tf - item.preset.tf) < 0.01);

                return (
                  <tr
                    key={item.preset.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isActive ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-100 font-semibold">{item.preset.brand}</strong>
                        {isActive && (
                          <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1.5 py-0.2 rounded font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                        {item.preset.name} · {item.preset.manufacturer}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-slate-200 tabular-nums">
                      {item.preset.Ef.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-slate-300 tabular-nums">
                      {item.preset.tf}
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-slate-300 tabular-nums">
                      {item.preset.fu}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-bold tabular-nums">
                      <span
                        className={
                          item.dcr <= 0.70
                            ? 'text-sky-300'
                            : item.dcr <= 0.95
                            ? 'text-emerald-400'
                            : item.dcr <= 1.0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {item.dcr.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === 'optimal'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.status === 'conservative'
                            ? 'bg-sky-950 text-sky-300 border-sky-800'
                            : item.status === 'marginal'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      {isActive ? (
                        <span className="text-[11px] text-cyan-400 font-bold flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyPreset(item.preset)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-[11px] font-semibold transition-all shadow-sm cursor-pointer border border-slate-700 hover:border-cyan-500"
                        >
                          Select System
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
