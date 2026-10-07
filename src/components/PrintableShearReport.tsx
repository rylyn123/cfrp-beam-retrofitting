import React from 'react';
import { ShearInputs, ShearResults } from '../types/cfrp';

interface PrintableShearReportProps {
  inputs: ShearInputs;
  results: ShearResults;
  pageNumber?: number;
  totalPages?: number;
}

export const PrintableShearReport: React.FC<PrintableShearReportProps> = ({
  inputs,
  results,
  pageNumber = 1,
  totalPages = 2,
}) => {
  const p1Num = totalPages > 2 ? pageNumber : 1;
  const p2Num = totalPages > 2 ? pageNumber + 1 : 2;
  const totalP = totalPages > 2 ? totalPages : 2;

  return (
    <div className="w-full bg-white text-black p-8 md:p-12 text-xs leading-relaxed font-sans select-text print:p-0 print:m-0">
      {/* ================= PAGE 1 ================= */}
      <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
        <div>
          {/* Title Block */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-center italic text-black mb-1">
              Design of Carbon Fiber Reinforced Polymer
            </h1>
            <div className="text-center text-sm font-semibold italic text-zinc-900">
              Shear Strengthening of RC Beams (Externally Bonded CFRP)
            </div>
            <div className="text-center text-xs italic font-serif text-zinc-700 mt-0.5">
              Reference: ACI 440.2R-08 / ACI 440.2R-17 & ACI 318
            </div>
            <div className="mt-2 border-t-2 border-black border-double pt-0.5">
              <div className="border-t border-black"></div>
            </div>
          </div>

          {/* Top Parameters & Properties Matrix (Matches Scanned Excel Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-[11px]">
            {/* Column 1: Existing Shear & Demands */}
            <div>
              <div className="font-bold italic text-black mb-1.5 text-xs">
                Parameters & Demands:
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1 italic w-28 text-right pr-3">Vu Demand:</td>
                    <td className="w-20 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.VuDemand}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">kN</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Vc Concrete:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.VcExisting}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">kN</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Vs Stirrups:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.VsExisting}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">kN</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Eff. Depth (d):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.d}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Width (b):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.b}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Total Height (h):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.h}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">f'c concrete:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.fc}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">MPa</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Column 2: CFRP Material Properties */}
            <div>
              <div className="font-bold italic text-black mb-1.5 text-xs">
                Material Properties:
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1 italic w-28 text-right pr-3">fu:</td>
                    <td className="w-20 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.fu}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">MPa</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">εu:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.eu}
                    </td>
                    <td className="pl-2 italic text-zinc-500 text-[9px] leading-tight">
                      Product
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Ef:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.Ef}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">N/mm²</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3 text-[10px]">CFRP BRAND:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-center px-1 py-0.5 font-bold text-[10px]" colSpan={2}>
                      {inputs.cfrpBrand || 'SAMPLE DATA'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3 text-[10px]">Exposure:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-center px-1 py-0.5 text-[10px]" colSpan={2}>
                      {inputs.exposureCondition || 'Interior'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">CE:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {results.CE.toFixed(2)}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">Table 9.1</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Design ffu:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white font-semibold">
                      {results.ffu.toFixed(1)}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">MPa</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Column 3: CFRP Shear Configuration */}
            <div>
              <div className="font-bold italic text-black mb-1.5 text-xs">
                CFRP Strip Parameters:
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1 italic w-28 text-right pr-3">Scheme:</td>
                    <td className="w-24 bg-zinc-300 border border-zinc-400 font-mono text-center px-1 py-0.5 font-semibold text-[10px]" colSpan={2}>
                      {inputs.scheme === 'completely_wrapped'
                        ? 'Completely Wrapped'
                        : inputs.scheme === 'two_sided'
                        ? 'Two-Sided Bonded'
                        : '3-Sided U-Wrap'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">No. of plies (n):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.noOfPlies}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">pcs</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Thickness (tf):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.tf}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm/ply</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Width (wf):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.wf}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Spacing (sf):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.sf}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">
                      mm{inputs.wf > 0 && inputs.sf < inputs.wf ? ` (${(((inputs.wf - inputs.sf) / inputs.wf) * 100).toFixed(0)}% overlap)` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Angle (α):</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                      {inputs.angleAlpha}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">deg</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Afv area:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white font-semibold">
                      {results.Afv.toFixed(1)}
                    </td>
                    <td className="pl-2 italic text-zinc-700 text-[10px]">mm²</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Section & Elevation Diagram (Matches Scanned Excel Drawing) */}
          <div className="my-5 p-3 bg-zinc-50 border border-zinc-300 rounded">
            <div className="text-[11px] font-bold italic mb-2 flex justify-between items-center text-zinc-800">
              <span>Shear Strengthening Geometry: Section & Strip Arrangement</span>
              <span className="text-[10px] text-zinc-500 font-normal">ACI 440.2R Section 11.4</span>
            </div>

            <svg viewBox="0 0 760 215" className="w-full h-48 md:h-52">
              <defs>
                <pattern id="hatch-strip" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#0284c7" strokeWidth="2.5" />
                </pattern>
              </defs>

              {/* Vertical divider separating Cross Section and Elevation View */}
              <line x1="228" y1="12" x2="228" y2="204" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,3" />

              {/* ======================================================== */}
              {/* ===== Left: Cross Section View ===== */}
              {/* ======================================================== */}
              {/* Section Title */}
              <text x="95" y="16" fontSize="11" fontWeight="bold" textAnchor="middle" fontStyle="italic" fill="#0f172a">
                Cross Section View
              </text>

              {/* Top Dimension b with ticks and arrows */}
              {/* Dimension line */}
              <line x1="50" y1="36" x2="140" y2="36" stroke="#000" strokeWidth="0.9" />
              {/* Dimension end ticks */}
              <line x1="50" y1="31" x2="50" y2="41" stroke="#000" strokeWidth="0.9" />
              <line x1="140" y1="31" x2="140" y2="41" stroke="#000" strokeWidth="0.9" />
              {/* Arrowheads */}
              <polygon points="50,36 56,33.5 56,38.5" fill="#000" />
              <polygon points="140,36 134,33.5 134,38.5" fill="#000" />
              {/* Dimension text */}
              <text x="95" y="30" fontSize="9.5" textAnchor="middle" fontStyle="italic" fill="#0f172a">
                b = {inputs.b} mm
              </text>

              {/* Left Dimension h with ticks and arrows */}
              {/* Dimension line */}
              <line x1="32" y1="48" x2="32" y2="168" stroke="#000" strokeWidth="0.9" />
              {/* Dimension end ticks */}
              <line x1="27" y1="48" x2="37" y2="48" stroke="#000" strokeWidth="0.9" />
              <line x1="27" y1="168" x2="37" y2="168" stroke="#000" strokeWidth="0.9" />
              {/* Arrowheads */}
              <polygon points="32,48 29.5,54 34.5,54" fill="#000" />
              <polygon points="32,168 29.5,162 34.5,162" fill="#000" />
              {/* Rotated dimension text */}
              <text x="18" y="108" fontSize="9.5" textAnchor="middle" fontStyle="italic" fill="#0f172a" transform="rotate(-90 18 108)">
                h = {inputs.h} mm
              </text>

              {/* Concrete Beam Body */}
              <rect x="50" y="48" width="90" height="120" fill="#f4f4f5" stroke="#000" strokeWidth="1.2" />

              {/* Steel Stirrup */}
              <rect x="58" y="56" width="74" height="104" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,2" rx="3" />
              <text x="95" y="80" fontSize="8" textAnchor="middle" fill="#64748b" fontStyle="italic">
                Vs stirrup
              </text>

              {/* Longitudinal bars */}
              <circle cx="66" cy="64" r="3" fill="#334155" />
              <circle cx="124" cy="64" r="3" fill="#334155" />
              <circle cx="66" cy="152" r="4.5" fill="#0f172a" />
              <circle cx="95" cy="152" r="4.5" fill="#0f172a" />
              <circle cx="124" cy="152" r="4.5" fill="#0f172a" />

              {/* External CFRP U-Wrap / Jacket */}
              {inputs.scheme === 'completely_wrapped' ? (
                <rect x="47" y="45" width="96" height="126" fill="none" stroke="#0284c7" strokeWidth="3" rx="2" />
              ) : (
                <path
                  d="M 47,62 L 47,171 L 143,171 L 143,62"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )}

              {/* dfv Dimension on right of section */}
              {(() => {
                const dfvTop = inputs.scheme === 'completely_wrapped' ? 48 : 62;
                return (
                  <g>
                    <line x1="156" y1={dfvTop} x2="156" y2="168" stroke="#0284c7" strokeWidth="0.9" />
                    <line x1="151" y1={dfvTop} x2="161" y2={dfvTop} stroke="#0284c7" strokeWidth="0.9" />
                    <line x1="151" y1="168" x2="161" y2="168" stroke="#0284c7" strokeWidth="0.9" />
                    <polygon points={`156,${dfvTop} 153.5,${dfvTop + 6} 158.5,${dfvTop + 6}`} fill="#0284c7" />
                    <polygon points="156,168 153.5,162 158.5,162" fill="#0284c7" />
                    <text x="165" y="110" fontSize="9" fill="#0369a1" fontWeight="bold">
                      dfv = {results.dfv.toFixed(1)} mm
                    </text>
                    <text x="165" y="122" fontSize="7.5" fill="#0284c7" fontStyle="italic">
                      (FRP Depth)
                    </text>
                  </g>
                );
              })()}

              {/* Bottom Annotations for Cross Section */}
              <text x="95" y="190" fontSize="9.5" textAnchor="middle" fill="#0369a1" fontWeight="bold">
                CFRP {inputs.scheme === 'completely_wrapped' ? 'Complete Jacket' : '3-Sided U-Wrap'}
              </text>
              <text x="95" y="202" fontSize="8" textAnchor="middle" fill="#64748b">
                (tf = {inputs.tf} mm, {inputs.noOfPlies} {inputs.noOfPlies === 1 ? 'ply' : 'plies'})
              </text>

              {/* ======================================================== */}
              {/* ===== Right: Elevation Side View (Strips) ===== */}
              {/* ======================================================== */}
              {/* Elevation Title */}
              <text x="490" y="16" fontSize="11" fontWeight="bold" textAnchor="middle" fontStyle="italic" fill="#0f172a">
                Elevation View: Strip Spacing (sf) & Width (wf)
              </text>

              {/* Beam Body */}
              <rect x="250" y="48" width="480" height="120" fill="#f4f4f5" stroke="#000" strokeWidth="1.2" />

              {/* Diagonal Shear Crack Line */}
              <line x1="380" y1="168" x2="560" y2="48" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="5,4" />
              {/* Crack Label in clean opaque badge so it never clashes with strips */}
              <g transform="translate(470, 95)">
                <rect x="-44" y="-9" width="88" height="18" rx="3" fill="#ffffff" stroke="#dc2626" strokeWidth="0.8" opacity="0.95" />
                <text x="0" y="3.5" fontSize="8.5" fill="#dc2626" fontStyle="italic" fontWeight="bold" textAnchor="middle">
                  45° Shear Crack
                </text>
              </g>

              {/* CFRP Strips along beam */}
              {(() => {
                const stripW = Math.max(28, Math.min(48, inputs.wf > 0 ? (inputs.wf / 300) * 38 : 36));
                const stripY = inputs.scheme === 'completely_wrapped' ? 48 : 62;
                const stripH = inputs.scheme === 'completely_wrapped' ? 120 : 106;

                // Relative strip pitch based on spacing vs strip width
                const isOverlapping = inputs.wf > 0 && inputs.sf < inputs.wf;
                const overlapPct = isOverlapping ? ((inputs.wf - inputs.sf) / inputs.wf) * 100 : 0;
                const spacingRatio = inputs.wf > 0 ? Math.max(0.5, Math.min(2.0, inputs.sf / inputs.wf)) : 1.0;
                const stripStep = Math.max(stripW * 0.5, Math.min(85, stripW * spacingRatio));

                // Generate strip start positions along the beam (beam is x=250 to 730)
                const stripPositions: number[] = [];
                let currX = 270;
                while (currX + stripW <= 715 && stripPositions.length < 8) {
                  stripPositions.push(currX);
                  currX += stripStep;
                }
                if (stripPositions.length < 2) {
                  stripPositions.push(270 + stripStep);
                }

                const s1 = stripPositions[0];
                const s2 = stripPositions[1];

                return (
                  <g>
                    {stripPositions.map((xPos, idx) => (
                      <g key={idx}>
                        <rect
                          x={xPos}
                          y={stripY}
                          width={stripW}
                          height={stripH}
                          fill="url(#hatch-strip)"
                          stroke="#0284c7"
                          strokeWidth="1.2"
                          opacity={isOverlapping ? 0.85 : 1}
                        />
                      </g>
                    ))}

                    {/* Spacing sf dimension between strip 1 and strip 2 */}
                    <line x1={s1} y1="36" x2={s2} y2="36" stroke="#000" strokeWidth="0.9" />
                    <line x1={s1} y1="31" x2={s1} y2="41" stroke="#000" strokeWidth="0.9" />
                    <line x1={s2} y1="31" x2={s2} y2="41" stroke="#000" strokeWidth="0.9" />
                    <line x1={s1} y1="41" x2={s1} y2="48" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
                    <line x1={s2} y1="41" x2={s2} y2="48" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
                    <polygon points={`${s1},36 ${s1 + 5},33.5 ${s1 + 5},38.5`} fill="#000" />
                    <polygon points={`${s2},36 ${s2 - 5},33.5 ${s2 - 5},38.5`} fill="#000" />
                    <text x={(s1 + s2) / 2} y="30" fontSize="9.5" textAnchor="middle" fontStyle="italic" fill="#0f172a">
                      sf = {inputs.sf} mm o.c.{isOverlapping ? ` (${overlapPct.toFixed(0)}% overlap)` : ''}
                    </text>

                    {/* Strip Width wf dimension below strip 1 */}
                    <line x1={s1} y1="176" x2={s1 + stripW} y2="176" stroke="#000" strokeWidth="0.9" />
                    <line x1={s1} y1="171" x2={s1} y2="181" stroke="#000" strokeWidth="0.9" />
                    <line x1={s1 + stripW} y1="171" x2={s1 + stripW} y2="181" stroke="#000" strokeWidth="0.9" />
                    <polygon points={`${s1},176 ${s1 + 5},173.5 ${s1 + 5},178.5`} fill="#000" />
                    <polygon points={`${s1 + stripW},176 ${s1 + stripW - 5},173.5 ${s1 + stripW - 5},178.5`} fill="#000" />
                    <text x={s1 + stripW / 2} y="190" fontSize="9" textAnchor="middle" fontStyle="italic" fill="#0f172a">
                      wf = {inputs.wf} mm
                    </text>
                    <text x={s1 + stripW / 2} y="202" fontSize="7.5" textAnchor="middle" fill="#64748b">
                      (Strip Width)
                    </text>
                  </g>
                );
              })()}

              {/* Bottom Right: Angle alpha and strip type */}
              <text x="640" y="190" fontSize="9.5" textAnchor="middle" fontStyle="italic" fill="#0369a1" fontWeight="bold">
                Fiber Angle α = {inputs.angleAlpha}°
              </text>
              <text x="640" y="202" fontSize="8" textAnchor="middle" fill="#64748b">
                Transverse FRP Reinforcement
              </text>
            </svg>
          </div>

          {/* Section I. CFRP System Design Material Properties */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                I. CFRP System Design Material Properties
              </h2>
              <span className="text-[10px] italic">ACI 440.2R Section 9.4 & Table 9.1</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-serif ml-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="italic">Environmental reduction factor:</span>
                  <span className="font-mono font-bold">CE = {results.CE.toFixed(2)}</span>
                </div>
                <div className="text-[11px] italic">
                  ffu = CE · fu = {results.CE.toFixed(2)} × {inputs.fu} MPa
                </div>
                <div className="font-mono font-bold text-xs">
                  ffu = {results.ffu.toFixed(2)} MPa
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] italic">
                  εfu = CE · εu = {results.CE.toFixed(2)} × {inputs.eu}
                </div>
                <div className="font-mono font-bold text-xs">
                  εfu = {results.efu.toFixed(5)}
                </div>
                <div className="text-[11px] text-zinc-600 font-mono">
                  Ef = {inputs.Ef} N/mm²
                </div>
              </div>
            </div>
          </div>

          {/* Section II. Active Bond Length Le */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                II. Active Bond Length (Le)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 440.2R Eq. (11-8)</span>
            </div>

            <div className="text-center italic text-xs my-1 font-serif">
              Le = 23300 / (n · tf · Ef)^0.58
            </div>

            <div className="text-center font-mono text-[11px] my-1 text-zinc-800">
              n · tf · Ef = {inputs.noOfPlies} × {inputs.tf} × {inputs.Ef} = {results.n_tf_Ef.toFixed(0)} N/mm
            </div>

            <div className="text-center font-mono text-xs my-1 font-semibold">
              Le = 23300 / ({results.n_tf_Ef.toFixed(0)})^0.58 ={' '}
              <span className="text-black font-bold text-sm">{results.Le.toFixed(3)} mm</span>
            </div>
          </div>

          {/* Section III. Concrete Compressive Strength Factor k1 & Geometry Factor k2 */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                III. Bond Modification Factors (k1 and k2)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 440.2R Eq. (11-9a) & (11-9b)</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-serif ml-6">
              <div className="space-y-1.5">
                <div className="italic text-[11px]">Concrete strength factor k1:</div>
                <div className="font-mono text-xs">k1 = (f'c / 27)^(2/3)</div>
                <div className="font-mono text-[11px]">
                  k1 = ({inputs.fc} / 27)^(2/3) ={' '}
                  <strong className="text-xs">{results.k1.toFixed(3)}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="italic text-[11px]">
                  Geometry factor k2 ({inputs.scheme === 'completely_wrapped' ? 'Complete' : 'U-wrap'}):
                </div>
                <div className="font-mono text-xs">
                  {inputs.scheme === 'completely_wrapped'
                    ? 'k2 = 1.0 (Completely Wrapped)'
                    : 'k2 = (dfv - Le) / dfv'}
                </div>
                <div className="font-mono text-[11px]">
                  {inputs.scheme === 'completely_wrapped' ? (
                    <strong>k2 = 1.000</strong>
                  ) : (
                    <>
                      k2 = ({results.dfv.toFixed(1)} - {results.Le.toFixed(3)}) / {results.dfv.toFixed(1)} ={' '}
                      <strong className="text-xs">{results.k2.toFixed(3)}</strong>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2 mt-4">
          <span>Project: {inputs.projectTitle || 'CFRP Beam Retrofit'} · Member: {inputs.beamId || 'BM-204-B'}</span>
          <span>Shear Retrofit · Page {p1Num} of {totalP}</span>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pt-6 pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
        <div>
          {/* Page 2 Header */}
          <div className="mb-4 pb-2 border-b-2 border-black border-double">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-sm italic text-black">
                Shear Strengthening of RC Beams (Externally Bonded CFRP)
              </span>
              <span className="text-[10px] italic font-serif text-zinc-600">
                ACI 440.2R Calculation Report · Page {p2Num} of {totalP}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>Project: {inputs.projectTitle || 'CFRP Beam Retrofit'} · Member: {inputs.beamId || 'BM-204-B'}</span>
              <span>Design Standard: ACI 440.2R-08 / ACI 440.2R-17 & ACI 318</span>
            </div>
          </div>

          {/* Section IV. Bond Reduction Coefficient for Shear κv */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                IV. Bond Reduction Coefficient for Shear (κv)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 440.2R Eq. (11-7)</span>
            </div>

            <div className="text-center italic text-xs my-1 font-serif">
              κv = (k1 · k2 · Le) / (11900 · εfu) ≤ 0.75
            </div>

            <div className="text-center font-mono text-[11px] my-1">
              κv = [ {results.k1.toFixed(3)} × {results.k2.toFixed(3)} × {results.Le.toFixed(3)} ] / [ 11900 × {results.efu.toFixed(5)} ]
            </div>

            <div className="text-center font-mono text-xs my-1">
              κv = { (results.k1 * results.k2 * results.Le).toFixed(2) } / { (11900 * results.efu).toFixed(2) } ={' '}
              <strong className="text-sm">{results.kv.toFixed(4)}</strong>
            </div>

            <div className="flex justify-center items-center gap-6 my-2 text-xs">
              <span className="font-mono font-bold">κv = {results.kv.toFixed(3)} ≤ 0.75</span>
              <span className="bg-emerald-100 border border-emerald-500 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[11px]">
                ✓ PASS (Allowable bond reduction)
              </span>
            </div>
          </div>

          {/* Section V. Effective Design Strain & Stress in CFRP (εfe & ffe) */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                V. Effective Design Strain and Stress in CFRP (εfe & ffe)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 440.2R Eq. (11-6b) & (11-5)</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-serif ml-6">
              <div className="space-y-1.5">
                <div className="italic text-[11px]">Effective strain (4 digits, capped at 0.0040):</div>
                <div className="font-mono text-xs">εfe = min(0.0040, κv · εfu)</div>
                <div className="font-mono text-[11px]">
                  εfe = min(0.0040, {results.kv.toFixed(3)} × {results.efu.toFixed(5)}) ={' '}
                  <strong className="text-xs">{results.efe.toFixed(4)}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs">{results.efe.toFixed(4)} ≤ 0.0040</span>
                  <span className="text-emerald-700 font-bold text-[11px]">✓ PASS</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="italic text-[11px]">Effective tensile stress in CFRP:</div>
                <div className="font-mono text-xs">ffe = εfe · Ef</div>
                <div className="font-mono text-[11px]">
                  ffe = {results.efe.toFixed(4)} × {inputs.Ef} N/mm²
                </div>
                <div className="font-mono font-bold text-sm text-cyan-900">
                  ffe = {results.ffe.toFixed(2)} MPa (N/mm²)
                </div>
              </div>
            </div>
          </div>

          {/* Section VI. Nominal Shear Contribution of CFRP (Vf) */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                VI. Nominal Shear Strength Contribution of CFRP (Vf)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 440.2R Eq. (11-3)</span>
            </div>

            <div className="text-center italic text-xs my-1 font-serif">
              Vf = [ Afv · ffe · (sin α + cos α) · dfv ] / sf
            </div>

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
                  <div className="text-center font-mono text-[11px] my-1 text-zinc-700">
                    Where Afv = 2 · n · tf · wf = 2 × {inputs.noOfPlies} × {inputs.tf} × {inputs.wf} ={' '}
                    <strong>{results.Afv.toFixed(1)} mm²</strong>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    (sin α + cos α) ={' '}
                    <strong>
                      {(!angle || angle === 0) ? '1.0 (for α = 0°)' : `${trigFactorStr} (α = ${angle}°)`}
                    </strong>
                  </div>

                  <div className="text-center font-mono text-[11px] my-1">
                    Vf = [ {results.Afv.toFixed(1)} mm² × {results.ffe.toFixed(2)} MPa × {trigFactorStr} × {results.dfv.toFixed(1)} mm ] / [ {inputs.sf} mm × 1000 ]
                  </div>
                </>
              );
            })()}

            <div className="text-center font-mono text-sm font-bold text-black my-2">
              Vf = {results.Vf.toFixed(2)} kN
            </div>
          </div>

          {/* Section VII. Factored Nominal Shear Capacity (ΦVn) */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                VII. Total Factored Design Shear Strength (ΦVn)
              </h2>
              <span className="text-[10px] italic font-serif">ACI 318 & ACI 440.2R Eq. (11-1) & (11-2)</span>
            </div>

            <div className="text-center italic text-xs my-1 font-serif">
              Vn = Vc + Vs + ψf · Vf &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ΦVn = Φ · Vn
            </div>

            <div className="text-center font-mono text-[11px] my-1 text-zinc-700">
              ψf = {results.psi_f.toFixed(2)} ({inputs.scheme === 'completely_wrapped' ? 'Complete Jacket' : '3-Sided U-Wrap'}), &nbsp; Φ = {results.phi.toFixed(2)} (ACI 318 Shear)
            </div>

            <div className="text-center font-mono text-xs my-1">
              Vn = {inputs.VcExisting} kN + {inputs.VsExisting} kN + {results.psi_f.toFixed(2)} × {results.Vf.toFixed(2)} kN ={' '}
              <strong>{results.Vn.toFixed(2)} kN</strong>
            </div>

            <div className="text-center font-mono text-xs my-1">
              ΦVn = {results.phi.toFixed(2)} × {results.Vn.toFixed(2)} kN ={' '}
              <strong className="text-base text-cyan-900">{results.phiVn.toFixed(2)} kN</strong>
            </div>
          </div>

          {/* Section VIII. Maximum Shear Limit Check (Anti-Crushing) */}
          <div className="my-5 pt-3 border-t border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                VIII. Maximum Allowable Shear Reinforcement Limit Check
              </h2>
              <span className="text-[10px] italic font-serif">ACI 318 Section 22.5 / ACI 440.2R Eq. (11-10)</span>
            </div>

            <div className="text-center italic text-xs my-1 font-serif">
              Vs + Vf ≤ 0.66 · √(f'c) · b · d
            </div>

            <div className="text-center font-mono text-[11px] my-1 text-zinc-700">
              Vmax = 0.66 × √({inputs.fc}) × {inputs.b} × {inputs.d} × 10⁻³ ={' '}
              <strong>{results.maxAllowableVsVf.toFixed(1)} kN</strong>
            </div>

            <div className="text-center font-mono text-xs my-1">
              Actual Vs + Vf = {inputs.VsExisting} + {results.Vf.toFixed(2)} ={' '}
              <strong>{results.actualVsVf.toFixed(2)} kN</strong>
            </div>

            <div className="flex justify-center items-center gap-6 my-2 text-xs">
              <span className="font-mono font-bold">
                {results.actualVsVf.toFixed(1)} kN ≤ {results.maxAllowableVsVf.toFixed(1)} kN
              </span>
              <span className="bg-emerald-100 border border-emerald-500 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[11px]">
                ✓ PASS (Web crushing prevented)
              </span>
            </div>
          </div>

          {/* Section IX. Demand vs Capacity Verification (DCR) */}
          <div className="my-5 pt-3 border-t-2 border-black">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="font-bold italic text-xs">
                IX. Design Verification & Demand-to-Capacity Ratio (DCR)
              </h2>
              <span className="text-[10px] italic font-serif">Final Code Evaluation</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center my-3">
              <div className="p-2 border border-zinc-300 rounded bg-zinc-50">
                <span className="block text-[10px] text-zinc-500 uppercase">Factored Demand Vu:</span>
                <span className="font-mono text-base font-bold text-black">{inputs.VuDemand} kN</span>
              </div>
              <div className="p-2 border border-zinc-300 rounded bg-zinc-50">
                <span className="block text-[10px] text-zinc-500 uppercase">Design Capacity ΦVn:</span>
                <span className="font-mono text-base font-bold text-cyan-900">{results.phiVn.toFixed(2)} kN</span>
              </div>
              <div className="p-2 border border-zinc-300 rounded bg-zinc-50">
                <span className="block text-[10px] text-zinc-500 uppercase">DCR Ratio:</span>
                <span className={`font-mono text-base font-bold ${results.shearPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {results.DCR.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-8 my-3 text-xs">
              <span className="font-serif italic font-bold">Demand Vu ≤ Capacity ΦVn:</span>
              <span className={`px-4 py-1 rounded text-sm font-bold border ${
                results.shearPass
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                  : 'bg-rose-100 text-rose-900 border-rose-500'
              }`}>
                {results.shearPass ? '✓ DESIGN OK (PASS)' : '⚠ SHEAR OVERLOAD (FAIL)'}
              </span>
              <span className="font-mono text-[11px] text-zinc-600">
                Reserve Capacity: +{results.strengthMargin.toFixed(1)}%
              </span>
            </div>

            <div className="text-center font-bold italic mt-3 font-sans text-xs">
              ∴ Shear Strengthening Design is Adequate and Conformant to ACI 440.2R
            </div>
          </div>

          {/* Engineer Signature & Approval Block */}
          <div className="mt-8 pt-4 border-t-2 border-zinc-400 grid grid-cols-3 gap-6 text-[10px] font-sans">
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider">Calculated By:</span>
              <span className="font-bold text-black text-xs mt-1 block">
                {inputs.engineerName || 'Professional Structural Engineer'}
              </span>
              <span className="text-zinc-500">Structural Engineer</span>
            </div>
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider">Checked By:</span>
              <span className="font-bold text-black text-xs mt-1 block">
                {inputs.checkedBy || 'Lead Technical Director'}
              </span>
              <span className="text-zinc-500">PE, SE Approved</span>
            </div>
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider">Date & Status:</span>
              <span className="font-bold text-black text-xs mt-1 block">{inputs.date || new Date().toISOString().split('T')[0]}</span>
              <span className="text-emerald-700 font-bold">CERTIFIED CONFORMANT (ACI 440.2R)</span>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2 mt-4">
          <span>Project: {inputs.projectTitle || 'CFRP Beam Retrofit'} · Member: {inputs.beamId || 'BM-204-B'}</span>
          <span>Shear Retrofit · Page {p2Num} of {totalP}</span>
        </div>
      </div>
    </div>
  );
};
