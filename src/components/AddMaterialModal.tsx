import React, { useState } from 'react';
import { CfrpPreset } from '../types/cfrp';
import { PlusCircle, X, Layers, Calculator, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPreset: (preset: CfrpPreset) => void;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onAddPreset,
}) => {
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState('Unidirectional carbon fiber fabric');
  const [fu, setFu] = useState<string>('3800');
  const [Ef, setEf] = useState<string>('230000');
  const [eu, setEu] = useState<string>('0.0165');
  const [tf, setTf] = useState<string>('0.25');
  const [description, setDescription] = useState('');
  const [tdsReference, setTdsReference] = useState('');
  const [curedSystem, setCuredSystem] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAutoCalculateEu = () => {
    const fuNum = parseFloat(fu);
    const efNum = parseFloat(Ef);
    if (!isNaN(fuNum) && !isNaN(efNum) && efNum > 0) {
      const calculated = (fuNum / efNum).toFixed(5);
      setEu(calculated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBrand = brand.trim();
    if (!cleanBrand) {
      setError('Please provide a System / Brand name.');
      return;
    }

    const fuNum = parseFloat(fu);
    const efNum = parseFloat(Ef);
    const euNum = parseFloat(eu);
    const tfNum = parseFloat(tf);

    if (isNaN(fuNum) || fuNum <= 0) {
      setError('Ultimate tensile strength (fu) must be a positive number.');
      return;
    }
    if (isNaN(efNum) || efNum <= 0) {
      setError('Tensile modulus of elasticity (Ef) must be a positive number.');
      return;
    }
    if (isNaN(euNum) || euNum <= 0) {
      setError('Rupture strain (εu) must be a positive number.');
      return;
    }
    if (isNaN(tfNum) || tfNum <= 0) {
      setError('Single ply thickness (tf) must be a positive number.');
      return;
    }

    const newPreset: CfrpPreset = {
      id: `custom-${Date.now()}-${cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      brand: cleanBrand,
      name: name.trim() || `${cleanBrand} Custom Material System`,
      manufacturer: manufacturer.trim() || 'Custom Manufacturer',
      type: type.trim() || 'Unidirectional Carbon Fiber Polymer',
      fu: fuNum,
      eu: euNum,
      Ef: efNum,
      tf: tfNum,
      description:
        description.trim() ||
        `Custom user-defined CFRP system with fu=${fuNum} MPa, Ef=${efNum} MPa, tf=${tfNum} mm.`,
      tdsReference: tdsReference.trim() || 'Project Specific Technical Data Sheet',
      curedSystem: curedSystem.trim() || 'Structural Epoxy Saturant',
    };

    onAddPreset(newPreset);
    onClose();
  };

  // Quick preview calculations
  const previewFu = parseFloat(fu) || 0;
  const previewEf = parseFloat(Ef) || 0;
  const previewTf = parseFloat(tf) || 0;
  const previewNtfEf = previewTf * previewEf;
  const previewLe = previewNtfEf > 0 ? 23300 / Math.pow(previewNtfEf, 0.58) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Add CFRP Material System
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                  Sheet 3: Shear Retrofitting
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Define and save custom certified carbon fiber composite technical data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                System / Brand Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SikaWrap-430G or Custom Carbon 300"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Manufacturer / Fabricator
              </label>
              <input
                type="text"
                placeholder="e.g. Sika, Fyfe, BASF, Custom Composite"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Full Commercial Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Full Commercial Designation
              </label>
              <input
                type="text"
                placeholder="e.g. SikaWrap® Hex-103C High-Strength CFS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Material / Weave Type
              </label>
              <input
                type="text"
                placeholder="e.g. Unidirectional heavy carbon sheet"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Mechanical Properties Grid */}
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Mechanical Properties (TDS Guaranteed Values)
              </span>
              <span className="text-[10px] text-slate-400">ACI 440.2R Section 9.1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* tf */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">
                  Thickness (tf):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    placeholder="1.012"
                    value={tf}
                    onChange={(e) => setTf(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-right font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-slate-400 text-[10px]">mm/ply</span>
                </div>
              </div>

              {/* Ef */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">
                  Modulus (Ef):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    placeholder="230000"
                    value={Ef}
                    onChange={(e) => setEf(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-right font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-slate-400 text-[10px]">MPa</span>
                </div>
              </div>

              {/* fu */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">
                  Strength (fu):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="10"
                    min="10"
                    placeholder="3800"
                    value={fu}
                    onChange={(e) => setFu(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-right font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-slate-400 text-[10px]">MPa</span>
                </div>
              </div>

              {/* eu */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 text-[11px]">Strain (εu):</label>
                  <button
                    type="button"
                    onClick={handleAutoCalculateEu}
                    className="text-[9px] text-cyan-400 hover:text-cyan-300 underline"
                    title="Calculate εu = fu / Ef"
                  >
                    = fu/Ef
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.0001"
                    min="0.001"
                    placeholder="0.015"
                    value={eu}
                    onChange={(e) => setEu(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-right font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <span className="text-slate-400 text-[10px]">mm/mm</span>
                </div>
              </div>
            </div>

            {/* Calculated Preview Pill */}
            {previewNtfEf > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">1-Ply Stiffness (tf · Ef):</span>
                  <strong className="text-slate-200 font-bold">{previewNtfEf.toFixed(0)} N/mm</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Predicted Active Bond Length (Le):</span>
                  <strong className="text-cyan-300 font-bold">{previewLe.toFixed(3)} mm</strong>
                </div>
              </div>
            )}
          </div>

          {/* Description & TDS References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Description / Application Notes
              </label>
              <textarea
                rows={2}
                placeholder="Dry carbon fiber sheet for wet lay-up installation, utilized for beam shear and flexural strengthening."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-0.5 text-[11px]">
                  TDS Reference / Standard:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manufacturer Technical Data Sheet / ACI 440.2R"
                  value={tdsReference}
                  onChange={(e) => setTdsReference(e.target.value)}
                  className="w-full px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-0.5 text-[11px]">
                  Cured Resin / Saturant System:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sikadur®-300 / MasterBrace® SAT 4500"
                  value={curedSystem}
                  onChange={(e) => setCuredSystem(e.target.value)}
                  className="w-full px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Save & Apply in Shear Retrofit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
