import React from 'react';

interface BeamDiagramProps {
  b: number; // mm
  d: number; // mm
  df: number; // mm
  c: number; // mm
  beta1: number;
  alpha1: number;
  fc: number;
  noOfBars: number;
  barDiameter: number;
  noOfPlies: number;
  tf: number;
  wf: number;
  title?: string;
  isEquilibrium?: boolean;
  viewMode?: 'equilibrium' | 'elastic' | 'comparison';
}

export const BeamDiagram: React.FC<BeamDiagramProps> = ({
  b,
  d,
  df,
  c,
  beta1,
  alpha1,
  fc,
  noOfBars,
  barDiameter,
  noOfPlies,
  tf,
  wf,
  title = 'Beam Cross-Section & Stress Block',
  isEquilibrium = true,
}) => {
  // Scale coordinate system
  // Fixed canvas size: width 660, height 360
  const svgWidth = 660;
  const svgHeight = 360;

  // Aspect ratio calculation
  const totalH = df;
  const totalW = b;
  const scale = Math.min(220 / totalH, 160 / totalW);

  const beamW = totalW * scale;
  const beamH = totalH * scale;

  // Position with comfortable left margin so "Df = 609.6 mm" is never clipped
  const beamX = 85;
  const beamY = 50;

  // Rebar location
  const rebarY = beamY + d * scale;
  const cY = beamY + c * scale;
  const stressBlockDepth = beta1 * c * scale;

  // Right side: Stress Block diagram
  const stressX = beamX + beamW + 70;
  const stressBlockWidth = Math.min(100, Math.max(40, alpha1 * fc * 2.2));

  // Rebar spacing
  const rebarRadius = Math.max(4, (barDiameter / 2) * scale * 0.9);
  const rebarPositions: number[] = [];
  if (noOfBars === 1) {
    rebarPositions.push(beamX + beamW / 2);
  } else {
    const margin = 20 * scale + rebarRadius;
    const availW = beamW - 2 * margin;
    const step = availW / (noOfBars - 1);
    for (let i = 0; i < noOfBars; i++) {
      rebarPositions.push(beamX + margin + i * step);
    }
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <span className="font-semibold text-slate-200 uppercase tracking-wider">{title}</span>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            isEquilibrium
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}
        >
          {isEquilibrium ? '✓ In Equilibrium' : '⚠ Non-Equilibrium State'}
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center py-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[660px] h-auto select-none"
        >
          <defs>
            {/* Concrete texture pattern */}
            <pattern id="concretePattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#1e293b" />
              <circle cx="3" cy="4" r="0.8" fill="#475569" opacity="0.6" />
              <circle cx="11" cy="9" r="1.1" fill="#64748b" opacity="0.4" />
              <circle cx="8" cy="14" r="0.7" fill="#334155" opacity="0.8" />
              <circle cx="14" cy="2" r="0.9" fill="#475569" opacity="0.5" />
            </pattern>

            {/* Stress block gradient */}
            <linearGradient id="stressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>

            {/* Carbon fiber pattern */}
            <pattern id="cfrpPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#0f172a" />
              <path d="M0 0l8 8M8 0L0 8" stroke="#334155" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Dimension Guidelines & Arrows for Beam Cross Section */}
          {/* Top Width b */}
          <line
            x1={beamX}
            y1={beamY - 14}
            x2={beamX + beamW}
            y2={beamY - 14}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line x1={beamX} y1={beamY - 20} x2={beamX} y2={beamY - 8} stroke="#94a3b8" strokeWidth="1" />
          <line
            x1={beamX + beamW}
            y1={beamY - 20}
            x2={beamX + beamW}
            y2={beamY - 8}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <text
            x={beamX + beamW / 2}
            y={beamY - 20}
            fill="#cbd5e1"
            fontSize="10"
            textAnchor="middle"
          >
            b = {b} mm
          </text>

          {/* Left Total Height Df */}
          <line
            x1={beamX - 16}
            y1={beamY}
            x2={beamX - 16}
            y2={beamY + beamH}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line x1={beamX - 22} y1={beamY} x2={beamX - 10} y2={beamY} stroke="#94a3b8" strokeWidth="1" />
          <line
            x1={beamX - 22}
            y1={beamY + beamH}
            x2={beamX - 10}
            y2={beamY + beamH}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <text
            x={beamX - 22}
            y={beamY + beamH / 2}
            fill="#cbd5e1"
            fontSize="10"
            textAnchor="end"
            dominantBaseline="middle"
          >
            Df = {df} mm
          </text>

          {/* Beam Rectangle (Concrete) */}
          <rect
            x={beamX}
            y={beamY}
            width={beamW}
            height={beamH}
            fill="url(#concretePattern)"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Stirrups (Internal frame) */}
          <rect
            x={beamX + 8}
            y={beamY + 8}
            width={beamW - 16}
            height={beamH - 16}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          {/* Rebar tension steel */}
          {rebarPositions.map((rx, idx) => (
            <circle
              key={idx}
              cx={rx}
              cy={rebarY}
              r={rebarRadius}
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1"
            />
          ))}

          {/* Top hanger bars (2 small bars) */}
          <circle cx={beamX + 14} cy={beamY + 14} r="3" fill="#64748b" stroke="#334155" />
          <circle cx={beamX + beamW - 14} cy={beamY + 14} r="3" fill="#64748b" stroke="#334155" />

          {/* Bottom CFRP Laminate */}
          <rect
            x={beamX + (beamW - (wf * scale)) / 2}
            y={beamY + beamH + 1}
            width={Math.min(beamW, wf * scale)}
            height={Math.max(4, noOfPlies * tf * 2)}
            fill="url(#cfrpPattern)"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <text
            x={beamX + beamW / 2}
            y={beamY + beamH + 20}
            fill="#38bdf8"
            fontSize="9"
            textAnchor="middle"
          >
            CFRP ({noOfPlies} plies × {tf} mm)
          </text>

          {/* Neutral Axis (N.A.) dashed line across */}
          <line
            x1={beamX - 10}
            y1={cY}
            x2={stressX + 195}
            y2={cY}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="4,3"
          />
          <text x={beamX + beamW + 8} y={cY - 4} fill="#ef4444" fontSize="9" fontWeight="bold">
            N.A.
          </text>

          {/* Compression Stress Block (Right side) */}
          <text
            x={stressX + 45}
            y={beamY - 14}
            fill="#cbd5e1"
            fontSize="10"
            textAnchor="middle"
          >
            b = {b} mm
          </text>
          <line
            x1={stressX}
            y1={beamY - 8}
            x2={stressX + 90}
            y2={beamY - 8}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Concrete compressive rectangular block */}
          <rect
            x={stressX}
            y={beamY}
            width={90}
            height={stressBlockDepth}
            fill="url(#stressGrad)"
            stroke="#0284c7"
            strokeWidth="1.2"
          />

          {/* Compressive stress arrows */}
          {[0.2, 0.5, 0.8].map((ratio, i) => {
            const arrY = beamY + stressBlockDepth * ratio;
            return (
              <g key={i}>
                <line x1={stressX - 35} y1={arrY} x2={stressX - 4} y2={arrY} stroke="#38bdf8" strokeWidth="1.2" />
                <polygon
                  points={`${stressX - 4},${arrY - 3} ${stressX},${arrY} ${stressX - 4},${arrY + 3}`}
                  fill="#38bdf8"
                />
              </g>
            );
          })}

          {/* ===== COLUMN 1: DIMENSIONS (c and d - c) ===== */}
          {/* Dimension c line & ticks */}
          <line
            x1={stressX + 98}
            y1={beamY}
            x2={stressX + 98}
            y2={cY}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          <line x1={stressX + 93} y1={beamY} x2={stressX + 103} y2={beamY} stroke="#94a3b8" strokeWidth="0.8" />
          <line x1={stressX + 93} y1={cY} x2={stressX + 103} y2={cY} stroke="#94a3b8" strokeWidth="0.8" />
          <text
            x={stressX + 106}
            y={beamY + (cY - beamY) / 2}
            fill="#f8fafc"
            fontSize="9.5"
            fontWeight="bold"
            dominantBaseline="middle"
          >
            c = {c.toFixed(2)} mm
          </text>

          {/* Dimension d - c line & ticks */}
          <line
            x1={stressX + 98}
            y1={cY}
            x2={stressX + 98}
            y2={rebarY}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          <line x1={stressX + 93} y1={rebarY} x2={stressX + 103} y2={rebarY} stroke="#94a3b8" strokeWidth="0.8" />
          <text
            x={stressX + 106}
            y={cY + (rebarY - cY) / 2}
            fill="#cbd5e1"
            fontSize="9"
            dominantBaseline="middle"
          >
            d - c = {(d - c).toFixed(2)} mm
          </text>

          {/* ===== COLUMN 2: EQUILIBRIUM RESULTANT FORCES (Cc, Ts, Tf) ===== */}
          {/* Compression resultant Cc force & dashed connector line */}
          <line
            x1={stressX + 90}
            y1={beamY + stressBlockDepth / 2}
            x2={stressX + 205}
            y2={beamY + stressBlockDepth / 2}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text
            x={stressX + 215}
            y={beamY + stressBlockDepth / 2}
            fill="#38bdf8"
            fontSize="9.5"
            fontWeight="bold"
            dominantBaseline="middle"
          >
            Cc = α₁ f'c β₁ b c
          </text>

          {/* Tension Rebar Force As*fs */}
          <rect
            x={stressX}
            y={rebarY - 2}
            width={90}
            height={4}
            fill="#f59e0b"
            stroke="#b45309"
          />
          <line x1={stressX - 4} y1={rebarY} x2={stressX - 35} y2={rebarY} stroke="#f59e0b" strokeWidth="1.2" />
          <polygon
            points={`${stressX - 35},${rebarY - 3} ${stressX - 40},${rebarY} ${stressX - 35},${rebarY + 3}`}
            fill="#f59e0b"
          />
          <line
            x1={stressX + 90}
            y1={rebarY}
            x2={stressX + 205}
            y2={rebarY}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text
            x={stressX + 215}
            y={rebarY}
            fill="#f59e0b"
            fontSize="9.5"
            fontWeight="bold"
            dominantBaseline="middle"
          >
            Ts = As · fs
          </text>

          {/* Bottom Tension FRP Force Af*ffe */}
          <line
            x1={stressX}
            y1={beamY + beamH}
            x2={stressX + 90}
            y2={beamY + beamH}
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
          <line
            x1={stressX + 90}
            y1={beamY + beamH}
            x2={stressX + 205}
            y2={beamY + beamH}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text
            x={stressX + 215}
            y={beamY + beamH}
            fill="#38bdf8"
            fontSize="9.5"
            fontWeight="bold"
            dominantBaseline="middle"
          >
            Tf = Af · ffe
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div>
          <span className="text-slate-400">Neutral Axis c:</span>{' '}
          <strong className="text-cyan-400">{c.toFixed(2)} mm</strong>
        </div>
        <div>
          <span className="text-slate-400">Stress Block β₁c:</span>{' '}
          <strong className="text-slate-200">{(beta1 * c).toFixed(2)} mm</strong>
        </div>
        <div>
          <span className="text-slate-400">α₁ factor:</span>{' '}
          <strong className="text-slate-200">{alpha1.toFixed(3)}</strong>
        </div>
        <div>
          <span className="text-slate-400">Tensile Arm d - c:</span>{' '}
          <strong className="text-slate-200">{(d - c).toFixed(2)} mm</strong>
        </div>
      </div>
    </div>
  );
};
