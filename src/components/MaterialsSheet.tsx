import React, { useState } from 'react';
import { CfrpInputs, ShearInputs, CfrpPreset } from '../types/cfrp';
import { CFRP_PRESETS } from '../utils/cfrpMath';
import { AddMaterialModal } from './AddMaterialModal';
import {
  Check,
  Bookmark,
  Layers,
  Building,
  ShieldCheck,
  Sun,
  CloudSun,
  Umbrella,
  PlusCircle,
  Trash2,
  Database,
} from 'lucide-react';

interface MaterialsSheetProps {
  flexureInputs: CfrpInputs;
  shearInputs: ShearInputs;
  onFlexureInputChange: (key: keyof CfrpInputs, value: any) => void;
  onShearInputChange: (key: keyof ShearInputs, value: any) => void;
  onApplyPresetFlexure: (presetId: string) => void;
  onApplyPresetShear: (presetId: string) => void;
  customPresets?: CfrpPreset[];
  onAddCustomPreset?: (preset: CfrpPreset) => void;
  onDeleteCustomPreset?: (id: string) => void;
}

const REBAR_SIZES = [
  { us: '#4', metric: '13 mm', diameter: 12.7, area: 129 },
  { us: '#5', metric: '16 mm', diameter: 15.9, area: 199 },
  { us: '#6', metric: '19 mm', diameter: 19.1, area: 284 },
  { us: '#7', metric: '22 mm', diameter: 22.2, area: 387 },
  { us: '#8', metric: '25 mm', diameter: 25.4, area: 510 },
  { us: '#9', metric: '29 mm', diameter: 28.6, area: 645, isDefault: true },
  { us: '#10', metric: '32 mm', diameter: 32.3, area: 819 },
  { us: '#11', metric: '36 mm', diameter: 35.8, area: 1006 },
];

export const MaterialsSheet: React.FC<MaterialsSheetProps> = ({
  flexureInputs,
  shearInputs,
  onFlexureInputChange,
  onShearInputChange,
  onApplyPresetFlexure,
  onApplyPresetShear,
  customPresets = [],
  onAddCustomPreset,
  onDeleteCustomPreset,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const allPresets = [...customPresets, ...CFRP_PRESETS];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
              Sheet 4: Materials & Standards
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Commercial CFRP Specifications & Project Metadata
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Material</span>
          </button>
        </div>
        <p className="text-slate-400 text-xs">
          Independently configure certified manufacturer material systems, exposure conditions, and structural section parameters for Sheet 1 (Flexure Design) and Sheet 3 (Shear Retrofit).
        </p>
      </div>

      {/* Project Metadata Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-slate-200 text-sm">Project & Calculation Sheet Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Project Title:</label>
            <input
              type="text"
              value={flexureInputs.projectTitle}
              onChange={(e) => {
                onFlexureInputChange('projectTitle', e.target.value);
                onShearInputChange('projectTitle', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Structural Member ID:</label>
            <input
              type="text"
              value={flexureInputs.beamId}
              onChange={(e) => {
                onFlexureInputChange('beamId', e.target.value);
                onShearInputChange('beamId', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Structure / Building:</label>
            <input
              type="text"
              value={flexureInputs.structureName}
              onChange={(e) => {
                onFlexureInputChange('structureName', e.target.value);
                onShearInputChange('structureName', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Engineer / Evaluator:</label>
            <input
              type="text"
              value={flexureInputs.engineerName}
              placeholder="e.g. Professional Structural Engineer"
              onChange={(e) => {
                onFlexureInputChange('engineerName', e.target.value);
                onShearInputChange('engineerName', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Checked By:</label>
            <input
              type="text"
              value={flexureInputs.checkedBy || ''}
              placeholder="e.g. Lead Technical Director, PE, SE"
              onChange={(e) => {
                onFlexureInputChange('checkedBy', e.target.value);
                onShearInputChange('checkedBy', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Calculation Date:</label>
            <input
              type="date"
              value={flexureInputs.date}
              onChange={(e) => {
                onFlexureInputChange('date', e.target.value);
                onShearInputChange('date', e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-slate-400 block mb-1 text-[11px]">Governing Code:</label>
            <input
              type="text"
              disabled
              value="ACI 440.2R-08 / ACI 318-19"
              className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-slate-400"
            />
          </div>
        </div>

        {/* Separate Environmental Exposure Conditions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-200 block">
            Environmental Exposure Conditions (ACI 440.2R Table 9.1) — Separate Controls:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sheet 1: Flexure Exposure */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-cyan-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-300">
                  Sheet 1: Flexure Design Exposure
                </span>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-xs font-bold">
                  CE = {flexureInputs.exposureCondition === 'Interior' ? '0.95' : flexureInputs.exposureCondition === 'Exterior' ? '0.85' : '0.75'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Applied to flexural strengthening design (ffu = CE · fu).
              </p>
              <select
                value={flexureInputs.exposureCondition}
                onChange={(e) =>
                  onFlexureInputChange(
                    'exposureCondition',
                    e.target.value as 'Interior' | 'Exterior' | 'Aggressive'
                  )
                }
                className="w-full px-3 py-1.5 font-mono text-xs font-bold bg-slate-800 text-cyan-200 border border-slate-600 rounded focus:border-cyan-400 focus:outline-none"
              >
                <option value="Interior">Interior Exposure (CE = 0.95)</option>
                <option value="Exterior">Exterior Exposure (CE = 0.85)</option>
                <option value="Aggressive">Aggressive Environment (CE = 0.75)</option>
              </select>
            </div>

            {/* Sheet 3: Shear Exposure */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-purple-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-300">
                  Sheet 3: Shear Retrofit Exposure
                </span>
                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-xs font-bold">
                  CE = {shearInputs.exposureCondition === 'Interior' ? '0.95' : shearInputs.exposureCondition === 'Exterior' ? '0.85' : '0.75'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Applied to shear retrofit calculation (ffu = CE · fu, κv, efe, Vf).
              </p>
              <select
                value={shearInputs.exposureCondition}
                onChange={(e) =>
                  onShearInputChange(
                    'exposureCondition',
                    e.target.value as 'Interior' | 'Exterior' | 'Aggressive'
                  )
                }
                className="w-full px-3 py-1.5 font-mono text-xs font-bold bg-slate-800 text-purple-200 border border-slate-600 rounded focus:border-purple-400 focus:outline-none"
              >
                <option value="Interior">Interior Exposure (CE = 0.95)</option>
                <option value="Exterior">Exterior Exposure (CE = 0.85)</option>
                <option value="Aggressive">Aggressive Environment (CE = 0.75)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Systems Library */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-slate-200 text-sm">Manufacturer Technical Data Sheet (TDS) Library</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Material properties (fu, εu, Ef, tf) are calibrated per manufacturer Technical Data Sheets & ACI 440.2R testing. Load separately into Flexure or Shear.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Material</span>
            </button>
            <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
              {allPresets.length} Systems ({customPresets.length} Custom)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick Add Material Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="p-5 rounded-lg border-2 border-dashed border-cyan-700/60 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-900/50 group-hover:bg-cyan-800/70 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mb-3 transition-transform group-hover:scale-105">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-cyan-200">Add New Material</span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Register a custom commercial or laboratory CFRP system into the active database.
            </p>
          </div>

          {/* All Presets (Custom + Built-in) */}
          {allPresets.map((preset) => {
            const isCustom = preset.id.startsWith('custom-');
            const isFlexureSelected =
              flexureInputs.fu === preset.fu &&
              flexureInputs.Ef === preset.Ef &&
              Math.abs(flexureInputs.tf - preset.tf) < 0.001;
            const isShearSelected =
              shearInputs.fu === preset.fu &&
              shearInputs.Ef === preset.Ef &&
              Math.abs(shearInputs.tf - preset.tf) < 0.001;

            return (
              <div
                key={preset.id}
                className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  isFlexureSelected || isShearSelected
                    ? isCustom
                      ? 'bg-purple-950/40 border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                      : 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                    : isCustom
                    ? 'bg-slate-950/80 border-purple-900/50 hover:border-purple-600'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold block ${isCustom ? 'text-purple-300' : 'text-cyan-300'}`}>
                          {preset.brand}
                        </span>
                        {isCustom && (
                          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{preset.manufacturer}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex flex-col items-end gap-1">
                        {isFlexureSelected && (
                          <span className="px-1.5 py-0.5 bg-cyan-900 text-cyan-200 rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Flexure Active
                          </span>
                        )}
                        {isShearSelected && (
                          <span className="px-1.5 py-0.5 bg-purple-900 text-purple-200 rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Shear Active
                          </span>
                        )}
                      </div>
                      {isCustom && onDeleteCustomPreset && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove custom material system "${preset.brand}"?`)) {
                              onDeleteCustomPreset(preset.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                          title="Delete custom preset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-200 text-xs mt-1">{preset.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[11px]">
                    <div>
                      <span className="text-slate-400">Tensile fu:</span>{' '}
                      <strong className="text-slate-200">{preset.fu} MPa</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Rupture εu:</span>{' '}
                      <strong className="text-slate-200">{preset.eu}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Modulus Ef:</span>{' '}
                      <strong className="text-slate-200">{preset.Ef.toLocaleString()} MPa</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Thickness tf:</span>{' '}
                      <strong className={isCustom ? 'text-purple-300 font-bold' : 'text-cyan-300 font-bold'}>
                        {preset.tf} mm
                      </strong>
                    </div>
                  </div>

                  {preset.tdsReference && (
                    <div className="mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span className="text-slate-500">TDS Ref:</span> {preset.tdsReference}
                    </div>
                  )}
                </div>

                {/* Separate Load Buttons */}
                <div className="mt-4 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onApplyPresetFlexure(preset.id)}
                    disabled={isFlexureSelected}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center ${
                      isFlexureSelected
                        ? 'bg-cyan-900/60 text-cyan-300 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50'
                    }`}
                  >
                    {isFlexureSelected ? '✓ In Flexure' : 'Load to Flexure'}
                  </button>

                  <button
                    onClick={() => onApplyPresetShear(preset.id)}
                    disabled={isShearSelected}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center ${
                      isShearSelected
                        ? 'bg-purple-900/60 text-purple-300 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/50'
                    }`}
                  >
                    {isShearSelected ? '✓ In Shear' : 'Load to Shear'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard Rebar Size Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-slate-200 text-sm">ASTM Standard Deformed Steel Bar Properties</h2>
        </div>
        <p className="text-[11px] text-slate-400">
          Standard bar diameter and cross-sectional areas used for internal longitudinal steel tension reinforcement.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">US Designation</th>
                <th className="py-2 px-3">Soft Metric</th>
                <th className="py-2 px-3">Nominal Diameter (mm)</th>
                <th className="py-2 px-3">Nominal Area (mm²)</th>
                <th className="py-2 px-3">Status in Flexure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 text-xs">
              {REBAR_SIZES.map((rebar) => {
                const isActive = Math.abs(flexureInputs.barDiameter - rebar.diameter) < 0.5;
                return (
                  <tr
                    key={rebar.us}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isActive ? 'bg-cyan-950/40 text-cyan-200 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 px-3">{rebar.us}</td>
                    <td className="py-2 px-3 text-slate-400">{rebar.metric}</td>
                    <td className="py-2 px-3 font-mono">{rebar.diameter.toFixed(1)} mm</td>
                    <td className="py-2 px-3 font-mono">{rebar.area} mm²</td>
                    <td className="py-2 px-3">
                      {isActive ? (
                        <span className="text-cyan-400 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> Active ({flexureInputs.noOfBars} bars = {flexureInputs.noOfBars * rebar.area} mm²)
                        </span>
                      ) : (
                        <button
                          onClick={() => onFlexureInputChange('barDiameter', rebar.diameter)}
                          className="text-[11px] text-slate-500 hover:text-cyan-300 underline"
                        >
                          Select
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

      {/* Add Custom Material Modal */}
      <AddMaterialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPreset={(newPreset) => {
          onAddCustomPreset?.(newPreset);
          setShowAddModal(false);
        }}
      />
    </div>
  );
};
