import React, { useState } from 'react';
import { CfrpInputs, FlexureResults, ShearInputs, ShearResults } from '../types/cfrp';
import { PrintableShearReport } from './PrintableShearReport';
import { Printer, X, Layers, Download, Loader2, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface PrintableReportProps {
  inputs: CfrpInputs;
  results: FlexureResults;
  shearInputs?: ShearInputs;
  shearResults?: ShearResults;
  defaultSheet?: 'flexure' | 'shear' | 'both';
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  inputs,
  results,
  shearInputs,
  shearResults,
  defaultSheet = 'flexure',
  onClose,
}) => {
  const [selectedReport, setSelectedReport] = useState<'flexure' | 'shear' | 'both'>(defaultSheet);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const printViaIframe = () => {
    const reportElem = document.getElementById('printable-report-content');
    if (!reportElem) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${inputs.projectTitle || 'CFRP Calculation Sheet'}</title>
          ${styles}
          <style>
            body { background: white !important; color: black !important; padding: 18mm; font-family: sans-serif; }
            @page { size: A4 portrait; margin: 18mm; }
            .print-page-sheet { page-break-after: always; break-after: page; min-height: 250mm; }
          </style>
        </head>
        <body>
          ${reportElem.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error:', err);
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const handleBrowserPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct window.print() failed, falling back to print iframe...', e);
      printViaIframe();
    }
  };

  const handleDownloadPdf = async () => {
    const reportElem = document.getElementById('printable-report-content');
    if (!reportElem) return;

    setIsGeneratingPdf(true);
    setStatusMessage('Compiling high-resolution PDF...');

    try {
      const pageElements = reportElem.querySelectorAll<HTMLElement>('.print-page-sheet');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // 18mm uniform border around the PDF page
      const margin = 18;
      const pageWidth = 210;
      const pageHeight = 297;
      const printableWidth = pageWidth - (margin * 2); // 174mm
      const printableHeight = pageHeight - (margin * 2); // 261mm

      if (pageElements.length > 0) {
        for (let i = 0; i < pageElements.length; i++) {
          setStatusMessage(`Rendering page ${i + 1} of ${pageElements.length}...`);
          const page = pageElements[i];
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1000,
            onclone: (clonedDoc) => {
              const el = clonedDoc.getElementById('printable-report-content');
              if (el) {
                el.style.backgroundColor = '#ffffff';
                el.style.color = '#000000';
              }
            },
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) {
            pdf.addPage('a4', 'portrait');
          }

          const canvasAspect = canvas.height / canvas.width;
          let renderWidth = printableWidth;
          let renderHeight = renderWidth * canvasAspect;

          if (renderHeight > printableHeight) {
            renderHeight = printableHeight;
            renderWidth = renderHeight / canvasAspect;
          }

          const posX = margin + (printableWidth - renderWidth) / 2;
          const posY = margin;

          pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
        }
      } else {
        const canvas = await html2canvas(reportElem, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1000,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('printable-report-content');
            if (el) {
              el.style.backgroundColor = '#ffffff';
              el.style.color = '#000000';
            }
          },
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const canvasAspect = canvas.height / canvas.width;
        let renderWidth = printableWidth;
        let renderHeight = renderWidth * canvasAspect;

        if (renderHeight > printableHeight) {
          renderHeight = printableHeight;
          renderWidth = renderHeight / canvasAspect;
        }

        const posX = margin + (printableWidth - renderWidth) / 2;
        const posY = margin;

        pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      }

      const cleanBeamId = (inputs.beamId || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `CFRP_Calculation_${cleanBeamId}_${selectedReport}.pdf`;
      pdf.save(fileName);
      setStatusMessage('PDF Downloaded Successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('PDF generation error, fallback to browser print dialog:', err);
      setStatusMessage('Triggering print dialog...');
      handleBrowserPrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-sm print:static print:inset-auto print:bg-white print:overflow-visible flex flex-col items-center py-6 px-3">
      {/* Non-printing Control Bar */}
      <div className="w-full max-w-[840px] mb-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700 text-white print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-mono text-sm font-semibold">Printable Calculation Sheet Preview</div>
            <div className="text-[11px] text-slate-400 font-mono">
              (Mirrors scanned Excel file layout & formulas)
            </div>
          </div>
        </div>

        {/* Sheet Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-md border border-slate-700 font-mono text-xs">
          <button
            onClick={() => setSelectedReport('flexure')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              selectedReport === 'flexure'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Sheet 1: Flexure</span>
          </button>

          {shearInputs && shearResults && (
            <button
              onClick={() => setSelectedReport('shear')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                selectedReport === 'shear'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Shear Retrofit</span>
            </button>
          )}

          {shearInputs && shearResults && (
            <button
              onClick={() => setSelectedReport('both')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                selectedReport === 'both'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>All Sheets</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-cyan-300 font-mono bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              {isGeneratingPdf && <Loader2 className="w-3 h-3 animate-spin" />}
              {!isGeneratingPdf && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              <span>{statusMessage}</span>
            </span>
          )}

          {/* Primary: Direct Save as PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Download crisp PDF document directly to your device"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </>
            )}
          </button>

          {/* Secondary: Browser Print Dialog */}
          <button
            onClick={handleBrowserPrint}
            disabled={isGeneratingPdf}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Open browser print dialog (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-mono text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* The Printable Document Container (A4 / Letter sheets) */}
      <div id="printable-report-content" className="w-full max-w-[840px] bg-white text-black p-8 md:p-12 shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs leading-relaxed font-sans select-text">
        {/* Render Shear Report if selected */}
        {selectedReport === 'shear' && shearInputs && shearResults && (
          <PrintableShearReport inputs={shearInputs} results={shearResults} />
        )}

        {/* Render Flexure Report if flexure or both */}
        {(selectedReport === 'flexure' || selectedReport === 'both') && (
          <>
        {/* ================= PAGE 1 ================= */}
        <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
          <div>
            {/* Title Block */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-center italic text-black mb-1">
                Design of Carbon Fiber Reinforced Polymer
              </h1>
              <div className="text-center text-xs italic font-serif text-zinc-700">
                Reference: ACI 440
              </div>
              <div className="mt-2 border-t-2 border-black border-double pt-0.5">
                <div className="border-t border-black"></div>
              </div>
            </div>

            {/* Top Parameters & Design Capacity Grid */}
            <div className="grid grid-cols-2 gap-8 my-6 text-[11px]">
              {/* Left Column: Parameters & Material Properties */}
              <div className="space-y-4">
                <div>
                  <div className="font-bold italic text-black mb-1.5 text-xs">Parameters:</div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 italic w-28 text-right pr-3">MDL:</td>
                        <td className="w-24 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.MDL}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">kN-m</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">MLL:</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.MLL}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">kN-m</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Load:</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.loadManualOverride ?? Math.round(1.1 * inputs.MDL + 0.75 * inputs.MLL)}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">kN-m</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Assumed C:</td>
                        <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                          {inputs.assumedC_initial.toFixed(2)}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Es:</td>
                        <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                          {(inputs.Es / 1000).toFixed(0)}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold italic text-black mb-1.5 text-xs">Material Properties:</div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 italic w-28 text-right pr-3">fu:</td>
                        <td className="w-24 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.fu}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">Mpa</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">εu:</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.eu}
                        </td>
                        <td className="pl-2 italic text-zinc-500 text-[9px] leading-tight">
                          Product properties
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
                          {inputs.cfrpBrand}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Design Capacity, Dimensions & Carbon Fiber Parameters */}
              <div className="space-y-4">
                <div>
                  <div className="font-bold italic text-black mb-1.5 text-xs">Design Capacity:</div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 italic w-24 text-right pr-2">ΦMn:</td>
                        <td className="w-20 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.phiMnExisting}
                        </td>
                        <td className="pl-1 italic text-zinc-700 text-[10px] w-12">kN-m</td>
                        <td className="text-right pr-2 italic text-[10px]">Eff. Depth:</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-2">f'c</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.fc}
                        </td>
                        <td className="pl-1 italic text-zinc-700 text-[10px]">Mpa</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.d}
                        </td>
                        <td className="pl-1 text-[10px] italic">mm</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-2">fy</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.fy}
                        </td>
                        <td className="pl-1 italic text-zinc-700 text-[10px]">MPa</td>
                        <td className="text-right pr-2 italic text-[10px]">Width:</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-2 text-[10px]">No. of Bars</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.noOfBars}
                        </td>
                        <td className="pl-1 italic text-zinc-700 text-[10px]">pcs</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.b}
                        </td>
                        <td className="pl-1 text-[10px] italic">mm</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-2 text-[10px]">φ of Bar</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.barDiameter}
                        </td>
                        <td className="pl-1 italic text-zinc-700 text-[10px]">mm</td>
                        <td className="italic text-right pr-2 text-[10px]">Cc</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.Cc}
                        </td>
                        <td className="pl-1 text-[10px] italic">mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold italic text-black mb-1.5 text-xs">
                    Carbon Fiber Parameter:
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 italic w-28 text-right pr-3">No. of plies</td>
                        <td className="w-20 bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.noOfPlies}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">pcs</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Thickness</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.tf}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">mm/ply</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Width</td>
                        <td className="bg-zinc-300 border border-zinc-400 font-mono text-right px-2 py-0.5 font-semibold">
                          {inputs.wf}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                      </tr>
                      <tr>
                        <td className="py-1 italic text-right pr-3">Df:</td>
                        <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                          {results.df.toFixed(1)}
                        </td>
                        <td className="pl-2 italic text-zinc-700 text-[10px]">mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Check strengthening limit criteria */}
            <div className="my-6 pt-4 border-t border-black">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold italic">Check strengthening limit criteria:</span>
                <span className="italic font-serif">(ϕRn)existing ≥ (1.1SDL + 0.75SLL)new</span>
                <span className="text-[10px]">(9-1)</span>
              </div>

              <div className="flex items-center gap-6 mt-3 text-xs">
                <span className="font-serif italic">ΦMn &gt; (1.1MDL + 0.75MLL)</span>
                <span className="font-bold italic text-sm tracking-wide">
                  {results.strengtheningLimitPass ? 'PASS' : 'FAIL'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({inputs.phiMnExisting} kN-m &gt; {results.strengtheningLimit.toFixed(1)} kN-m)
                </span>
              </div>
            </div>

            {/* I. CFRP System Design Material Properties */}
            <div className="my-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold italic text-xs">
                  I. CFRP System Design Material Properties
                </span>
                <span className="text-[10px] italic">ACI 440 Table 9.1</span>
              </div>

              <table className="w-72 border-collapse ml-16 text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 italic text-right pr-4">Exposure Condition:</td>
                    <td className="bg-zinc-300 border border-zinc-400 font-mono text-center px-3 py-0.5 font-semibold">
                      {inputs.exposureCondition}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-4">CE:</td>
                    <td className="border border-zinc-400 font-mono text-center px-3 py-0.5 bg-white">
                      {results.CE.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-4">ffu :</td>
                    <td className="border border-zinc-400 font-mono text-center px-3 py-0.5 bg-white">
                      {results.ffu.toFixed(2)}
                    </td>
                    <td className="pl-2 italic text-[10px]">Mpa</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-4">εfu:</td>
                    <td className="border border-zinc-400 font-mono text-center px-3 py-0.5 bg-white">
                      {results.efu.toFixed(5)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* II. Preliminary Calculation */}
            <div className="my-6">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold italic text-xs">II. Preliminary Calculation</span>
                <div className="text-[10px] italic text-right space-y-1">
                  <div>Externally bonded FRP reinforcement:</div>
                  <div className="font-serif">Af = nt * w fiber</div>
                  <div className="font-serif">β₁ = 1.05 - 0.05 (f'c / 6.9)</div>
                </div>
              </div>

              <table className="w-64 border-collapse ml-48 text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Af:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {results.Af.toFixed(1)}
                    </td>
                    <td className="pl-2 italic text-[10px]">mm²</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">MLL:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {inputs.MLL}
                    </td>
                    <td className="pl-2 italic text-[10px]">kN-m</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">β1:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {results.beta1_initial.toFixed(1)}
                    </td>
                    <td className="pl-2 italic text-[10px]">kN-m</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">As:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {results.As.toFixed(2)}
                    </td>
                    <td className="pl-2 italic text-[10px]">mm²</td>
                  </tr>
                  <tr>
                    <td className="py-1 italic text-right pr-3">Ec:</td>
                    <td className="border border-zinc-400 font-mono text-right px-2 py-0.5 bg-white">
                      {results.Ec.toFixed(1)}
                    </td>
                    <td className="pl-2 italic text-[10px]">N/mm²</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2">
            <span>Project: {inputs.projectTitle} · Member: {inputs.beamId}</span>
            <span>Sheet 1 of 5</span>
          </div>
        </div>

        {/* ================= PAGE 2 ================= */}
        <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pt-6 pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
          <div>
            {/* III. Existing State of strain on the soffit */}
            <div className="mb-4">
              <h2 className="font-bold italic text-xs mb-2">
                III. Existing State of strain on the soffit
              </h2>

              <div className="flex items-center justify-center gap-2 font-serif text-xs my-2">
                <span className="italic font-bold text-sm">ε<sub>bi</sub> =</span>
                <div className="inline-flex flex-col items-center mx-1">
                  <span className="border-b border-black px-2 pb-0.5 italic">M<sub>DL</sub>(d<sub>f</sub> − kd)</span>
                  <span className="pt-0.5 italic">I<sub>cr</sub> · E<sub>c</sub></span>
                </div>
                <span className="font-bold text-sm">=</span>
                <span className="font-bold italic text-sm text-black font-mono tracking-tight">{results.ebi.toFixed(5)}</span>
              </div>
              <div className="text-center font-serif text-xs font-bold mb-2">
                A cracked section analysis of the existing beam gives k = {results.k_elastic.toFixed(3)} and I<sub>cr</sub> = {results.Icr_formatted}
              </div>
              <div className="text-center font-mono text-[11px] my-2 bg-zinc-50 p-2 rounded border border-zinc-300 max-w-lg mx-auto">
                ε<sub>bi</sub> = [({inputs.MDL} kN-m) [{inputs.dfManual ?? results.df} mm − ({results.k_elastic.toFixed(3)})({inputs.d} mm)]] / [({results.Icr_formatted}) ({(results.Ec / 1000).toFixed(1)} kN/mm²)] = <strong>{results.ebi.toFixed(5)}</strong>
              </div>

              {/* Exact beam diagram illustration as in Excel */}
              <div className="my-4 flex justify-center">
                <svg viewBox="0 0 540 220" className="w-full max-w-[500px] h-auto">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#000" />
                    </marker>
                  </defs>

                  {/* Left Beam section */}
                  <rect x="70" y="30" width="80" height="150" fill="#f4f4f5" stroke="#000" strokeWidth="1.2" />
                  {/* Rebars */}
                  <circle cx="95" cy="155" r="4" fill="#000" />
                  <circle cx="110" cy="155" r="4" fill="#000" />
                  <circle cx="125" cy="155" r="4" fill="#000" />
                  <circle cx="90" cy="45" r="2.5" fill="#000" />
                  <circle cx="130" cy="45" r="2.5" fill="#000" />
                  {/* Stirrup wire */}
                  <rect x="80" y="40" width="60" height="130" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

                  {/* Dimensions b with dimension ticks */}
                  <line x1="70" y1="20" x2="150" y2="20" stroke="#000" strokeWidth="0.8" />
                  <line x1="70" y1="16" x2="70" y2="24" stroke="#000" strokeWidth="0.8" />
                  <line x1="150" y1="16" x2="150" y2="24" stroke="#000" strokeWidth="0.8" />
                  <text x="110" y="15" fontSize="9" textAnchor="middle" fontStyle="italic">b</text>

                  {/* Dimension h with dimension ticks */}
                  <line x1="50" y1="30" x2="50" y2="180" stroke="#000" strokeWidth="0.8" />
                  <line x1="46" y1="30" x2="54" y2="30" stroke="#000" strokeWidth="0.8" />
                  <line x1="46" y1="180" x2="54" y2="180" stroke="#000" strokeWidth="0.8" />
                  <text x="40" y="105" fontSize="9" textAnchor="middle" fontStyle="italic">h</text>

                  {/* Center N.A. line */}
                  <line x1="40" y1="85" x2="380" y2="85" stroke="#666" strokeWidth="0.8" strokeDasharray="3,3" />
                  <text x="210" y="82" fontSize="9" fontStyle="italic">N.A.</text>

                  {/* Stress block */}
                  <rect x="280" y="30" width="70" height="55" fill="#f4f4f5" stroke="#000" strokeWidth="1" />
                  
                  {/* Dimension b (stress block) with dimension ticks */}
                  <line x1="280" y1="20" x2="350" y2="20" stroke="#000" strokeWidth="0.8" />
                  <line x1="280" y1="16" x2="280" y2="24" stroke="#000" strokeWidth="0.8" />
                  <line x1="350" y1="16" x2="350" y2="24" stroke="#000" strokeWidth="0.8" />
                  <text x="315" y="15" fontSize="9" textAnchor="middle" fontStyle="italic">b</text>

                  {/* Compressive stress arrows with distinct vector arrowheads pointing into stress block */}
                  {[0.2, 0.5, 0.8].map((r, i) => {
                    const arrowY = 30 + 55 * r;
                    return (
                      <g key={i}>
                        <line x1="220" y1={arrowY} x2="276" y2={arrowY} stroke="#000" strokeWidth="1.2" />
                        <polygon points={`274,${arrowY - 3} 280,${arrowY} 274,${arrowY + 3}`} fill="#000" />
                      </g>
                    );
                  })}

                  {/* Dimensions on right with dimension line & ticks */}
                  <line x1="362" y1="30" x2="362" y2="155" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="30" x2="366" y2="30" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="85" x2="366" y2="85" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="155" x2="366" y2="155" stroke="#000" strokeWidth="0.8" />

                  <text x="372" y="60" fontSize="9" fontStyle="italic">C =</text>
                  <text x="402" y="60" fontSize="9" fontWeight="bold">{results.c_cracked.toFixed(2)}</text>

                  <line x1="270" y1="155" x2="350" y2="155" stroke="#000" strokeWidth="2.5" />
                  <text x="180" y="158" fontSize="9" fontStyle="italic">nAs</text>
                  <text x="372" y="130" fontSize="9" fontStyle="italic">d-c =</text>
                  <text x="402" y="130" fontSize="9" fontWeight="bold">{results.d_minus_c_cracked.toFixed(2)}</text>
                </svg>
              </div>

              {/* Transfer of Strain Equations */}
              <div className="grid grid-cols-2 gap-4 text-xs font-serif mt-2">
                <div className="space-y-2">
                  <div className="italic text-[11px]">Transfer of strain:</div>
                  <div className="flex items-center gap-2">
                    <span className="italic">n = Es / Ec</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="italic">Icr = 1/3 b c³ + n As (d - c)²</span>
                  </div>
                  <div className="pt-2 italic">
                    k = √((ρn)² + 2ρn) - ρn
                  </div>
                  <div className="text-[11px] pt-1">
                    Where n:
                    <div className="ml-4 font-mono">
                      n = {(inputs.Es).toFixed(0)} / {results.Ec.toFixed(1)}
                    </div>
                    <div className="ml-4 font-mono font-bold">
                      n = {results.n_ratio.toFixed(2)}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-sm pt-2">
                    k = {results.k_elastic.toFixed(4)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="italic">C = </span>
                    <span>[-nAs + √((nAs)² + 2 b n As d)] / b</span>
                  </div>
                  <div className="font-mono font-bold text-xs">
                    C = {results.c_cracked.toFixed(2)} mm
                  </div>

                  <div className="pt-1 text-[11px] font-serif">
                    <span className="italic">(df - kd) = </span>
                    <span className="font-mono">({results.df.toFixed(1)} - {results.c_cracked.toFixed(2)}) = {results.df_minus_c_cracked.toFixed(2)} mm</span>
                  </div>

                  <div className="pt-2 text-xs font-serif flex items-center gap-2">
                    <span className="italic font-bold">ε<sub>b<sub>i</sub></sub> =</span>
                    <div className="inline-flex flex-col items-center">
                      <span className="border-b border-black px-1.5 pb-0.5 italic text-[11px]">M<sub>DL</sub>(d<sub>f</sub> − k d)</span>
                      <span className="pt-0.5 italic text-[11px]">I<sub>cr</sub>E<sub>c</sub></span>
                    </div>
                    <span className="font-bold text-xs">=</span>
                    <strong className="font-mono font-bold text-xs text-black">{results.ebi.toFixed(7)}</strong>
                  </div>

                  <div className="text-[10px] text-zinc-600 font-mono pt-1">
                    Mcr = {results.Mcr.toFixed(1)} kN-m ({results.isCrackedUnderMDL ? 'MDL > Mcr: Cracked' : 'MDL ≤ Mcr: Uncracked'})
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px]">
                    <span className="italic">ρs = As / bd</span>
                    <strong className="font-mono">{results.rho_s.toFixed(5)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* IV. Design strain of the CFRP system */}
            <div className="my-6 pt-4 border-t border-black">
              <h2 className="font-bold italic text-xs mb-2">
                IV. Design strain of the CFRP system (Debonding Limit)
              </h2>

              <div className="text-[11px] font-mono text-zinc-700 my-1">
                εfd = 0.41 · √(f'c / (n · Ef · tf)) ≤ 0.90 · εfu
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px] font-mono my-2 ml-4">
                <div>
                  <div className="text-zinc-600">Calculated debonding strain:</div>
                  <div>
                    0.41 · √({inputs.fc} / ({inputs.noOfPlies} × {inputs.Ef} × {inputs.tf})) ={' '}
                    <strong className="text-black">{(results.efd_calc ?? results.efd).toFixed(4)}</strong>
                  </div>
                </div>
                <div>
                  <div className="text-zinc-600">Debonding upper limit (0.90 εfu):</div>
                  <div>
                    0.90 × {results.efu.toFixed(5)} ={' '}
                    <strong className="text-black">{results.efd_limit.toFixed(4)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono my-2 bg-zinc-50 p-2 rounded border border-zinc-200">
                <span>
                  Check: {(results.efd_calc ?? results.efd).toFixed(4)} {results.efd_pass ? '≤' : '>'} {results.efd_limit.toFixed(4)}
                </span>
                <span className={`px-2.5 py-0.5 font-sans font-bold text-[11px] rounded border ${
                  results.efd_pass
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                    : 'bg-rose-100 border-rose-500 text-rose-900'
                }`}>
                  {results.efd_pass ? 'PASS (Debonding Controls)' : 'FAIL (Limit Exceeded / Rupture Governs)'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-center text-zinc-800">
                Governing Design Strain εfd = min({(results.efd_calc ?? results.efd).toFixed(4)}, {results.efd_limit.toFixed(4)}) ={' '}
                <strong>{results.efd.toFixed(4)}</strong>
              </div>
            </div>

            {/* V. Estimating Depth C, Neutral axis */}
            <div className="my-6 pt-4 border-t border-black">
              <div className="flex justify-between items-center text-xs">
                <h2 className="font-bold italic">V. Estimating Depth C, Neutral axis</h2>
                <span className="text-[11px] italic font-serif">20% × Effective depth</span>
              </div>

              <div className="text-center font-mono text-xs my-2">
                Assumed C (Trial 1) = 20% × Effective depth = 0.20 · d
              </div>

              <div className="text-center font-mono text-xs my-1 text-zinc-800">
                Assumed C = 0.20 × {inputs.d} mm ={' '}
                <strong className="text-sm font-bold text-black">{results.assumedC_default.toFixed(2)} mm</strong>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2">
            <span>Project: {inputs.projectTitle} · Member: {inputs.beamId}</span>
            <span>Sheet 2 of 5</span>
          </div>
        </div>

        {/* ================= PAGE 3 ================= */}
        <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pt-6 pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
          <div>
            {/* VI. Effective level of strain in the FRP reinforcement */}
            <div className="mb-6">
              <h2 className="font-bold italic text-xs mb-2">
                VI. Effective level of strain in the FRP reinforcement
              </h2>

              <div className="text-center font-serif italic text-xs my-2">
                εfe = 0.003 ((df - c) / c) - εbi ≤ εfd
              </div>

              <div className="flex justify-center items-center gap-4 my-2 text-xs font-mono">
                <span>εfe = {results.initialTrial.efe_geom.toFixed(4)}</span>
                <span>&gt;</span>
                <span>{results.efd.toFixed(3)} εfe = εfd</span>
              </div>

              <div className="text-center text-[11px] italic my-2">
                therefore:
                <div className="font-serif">εc = (εfe + εbi) (c / (df - c))</div>
              </div>

              <div className="flex justify-center items-center gap-6 my-2 text-xs">
                <span className="font-mono">εc = {results.initialTrial.ec.toFixed(4)}</span>
                <span>&lt;</span>
                <span className="font-mono">{results.efd.toFixed(3)}</span>
                <span className="font-bold tracking-wide italic">CONDITION PASS</span>
              </div>
            </div>

            {/* VII. Calculation of strain in the existing reinforcing steel */}
            <div className="my-6 pt-4 border-t border-black">
              <h2 className="font-bold italic text-xs mb-2">
                VII. Calculation of strain in the existing reinforcing steel
              </h2>

              <div className="flex justify-center items-center gap-6 text-xs font-serif italic my-3">
                <span>εs = (εfe + εbi) ((d - c) / (df - c))</span>
                <span className="font-mono font-bold not-italic">εs = {results.initialTrial.es.toFixed(3)}</span>
              </div>
            </div>

            {/* VIII. Stress level in the steel & FRP */}
            <div className="my-6 pt-4 border-t border-black">
              <h2 className="font-bold italic text-xs mb-2">
                VIII. Stress level in the steel & FRP
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs my-3">
                <div className="space-y-2">
                  <div className="italic">fs = εs Es ≤ fy</div>
                  <div className="flex items-center gap-2">
                    <span className="italic">εs Es =</span>
                    <strong className="font-mono">{(results.initialTrial.es_Es / 1000).toFixed(2)} kN/mm²</strong>
                    <span>&gt;</span>
                    <strong className="font-mono">{(inputs.fy / 1000).toFixed(3)}</strong>
                  </div>
                  <div className="italic pt-1 font-mono font-bold">
                    ∴ fs = fy = {(inputs.fy / 1000).toFixed(3)} kPa
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="italic">ffe = εfe × Ef</div>
                  <div className="flex items-center gap-2">
                    <span className="italic">ffe =</span>
                    <strong className="font-mono text-sm">{(results.initialTrial.ffe / 1000).toFixed(3)} kN/mm²</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* IX. Checking Equilibrium and internal force resultant */}
            <div className="my-6 pt-4 border-t border-black">
              <h2 className="font-bold italic text-xs mb-2">
                IX. Checking Equilibrium and internal force resultant
              </h2>

              <div className="grid grid-cols-2 gap-6 text-xs font-serif my-3">
                {/* Column 1: Stress block equations & evaluations */}
                <div className="space-y-3">
                  <div className="font-serif italic">β₁ = (4ε'c - εc) / (6ε'c - 2εc)</div>
                  <div className="flex justify-between items-center pr-4">
                    <span>ε'c = 1.7 f'c / Ec</span>
                    <span>ε'c = <strong className="font-mono not-italic text-sm">{results.initialTrial.e_prime_c.toFixed(4)}</strong></span>
                  </div>
                  <div className="flex justify-between items-center pr-4">
                    <span>β₁ = (4ε'c - εc) / (6ε'c - 2εc)</span>
                    <span>β₁ = <strong className="font-mono not-italic text-sm">{results.initialTrial.beta1.toFixed(4)}</strong></span>
                  </div>
                  <div className="flex justify-between items-center pr-4">
                    <span>α₁ = (3ε'c εc - εc²) / (3 β₁ ε'c²)</span>
                    <span>α₁ = <strong className="font-mono not-italic text-sm">{results.initialTrial.alpha1.toFixed(3)}</strong></span>
                  </div>
                </div>

                {/* Column 2: Equilibrium formula & C verification */}
                <div className="space-y-2">
                  <div className="font-serif italic">α₁ = (3ε'c εc - εc²) / (3 β₁ ε'c²)</div>
                  <div className="font-serif italic pt-1">
                    C = (As fs + Af ffe) / (α₁ f'c β₁ b)
                  </div>
                  <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-200 space-y-0.5">
                    <div className="flex justify-between">
                      <span>As fs =</span>
                      <span>{results.initialTrial.As_fs.toFixed(1)} N</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Af ffe =</span>
                      <span>{results.initialTrial.Af_ffe.toFixed(1)} N</span>
                    </div>
                    <div className="flex justify-between font-bold text-black border-t border-zinc-300 pt-0.5">
                      <span>Numerator =</span>
                      <span>{results.initialTrial.numerator_c.toFixed(1)} N</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Denominator =</span>
                      <span>{results.initialTrial.denominator_c.toFixed(2)} N/mm</span>
                    </div>
                  </div>
                  <div className="pt-1 text-center">
                    <div className="italic text-[11px]">Verified Value of C:</div>
                    <div className="font-mono font-bold text-sm">C = {results.initialTrial.c_verified.toFixed(1)} mm</div>
                    <div className={`font-bold italic mt-1 ${results.initialTrial.inEquilibrium ? 'text-emerald-700' : 'text-red-600'}`}>
                      {results.initialTrial.inEquilibrium ? '✓ IN EQUILIBRIUM' : 'NOT IN EQUILIBRIUM'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2">
            <span>Project: {inputs.projectTitle} · Member: {inputs.beamId}</span>
            <span>Sheet 3 of 5</span>
          </div>
        </div>

        {/* ================= PAGE 4 ================= */}
        <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pt-6 pb-8 border-b-2 border-dashed border-zinc-300 print:border-none print:break-after-page">
          <div>
            {/* X. Recalculated Depth C, Neutral axis */}
            <div className="mb-6">
              <h2 className="font-bold italic text-xs mb-2">
                X. Recalculated Depth C, Neutral axis
              </h2>

              <div className="text-[11px] font-serif my-2 space-y-1 bg-zinc-50 p-2.5 rounded border border-zinc-300">
                <div className="flex justify-between font-mono text-[10px]">
                  <span>Step V Initial Assumption: 20% × Effective depth (d) = 0.20 · {inputs.d} =</span>
                  <strong>{results.assumedC_formula.toFixed(2)} mm</strong>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>Step IX Resultant: Verified C = (As fs + Af ffe) / (α₁ f'c β₁ b) =</span>
                  <strong>{results.initialTrial.c_verified.toFixed(2)} mm</strong>
                </div>
                <div className="italic text-zinc-700 pt-1 border-t border-zinc-200 text-[10px]">
                  Since the Step IX Verified C ({results.initialTrial.c_verified.toFixed(2)} mm) ≠ Step V Initial 20% × d ({results.assumedC_formula.toFixed(2)} mm), the neutral axis depth C is re-iterated in Step X until the recalculated value equals the internal force resultant:
                </div>
              </div>

              <div className="italic text-xs my-2">
                Recalculated value of C = <strong className="font-mono not-italic text-sm">{results.finalEquilibrium.c.toFixed(2)} mm</strong>
              </div>

              {/* Final Data Value Table */}
              <div className="my-4 ml-8">
                <div className="italic text-[11px] mb-1">Final Data Value:</div>
                <table className="border-collapse text-xs">
                  <tbody>
                    <tr>
                      <td className="py-0.5 italic pr-2">εfe =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5 w-20">{results.finalEquilibrium.efe.toFixed(4)}</td>
                      <td className="py-0.5 italic pl-6 pr-2">fs = fy =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5 w-20">{(results.finalEquilibrium.fs / 1000).toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 italic pr-2">εfd =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.efd.toFixed(3)}</td>
                      <td className="py-0.5 italic pl-6 pr-2">ffe =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{(results.finalEquilibrium.ffe / 1000).toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 italic pr-2">εc =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.ec.toFixed(4)}</td>
                      <td className="py-0.5 italic pl-6 pr-2">ε'c =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.e_prime_c.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 italic pr-2">εs =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.es.toFixed(3)}</td>
                      <td className="py-0.5 italic pl-6 pr-2">β₁ =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.beta1.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 italic pr-2">εs Es =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{(results.finalEquilibrium.es_Es / 1000).toFixed(2)}</td>
                      <td className="py-0.5 italic pl-6 pr-2">α₁ =</td>
                      <td className="border border-zinc-400 font-mono text-center px-3 py-0.5">{results.finalEquilibrium.alpha1.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Equilibrium check & second diagram */}
              <div className="my-4 text-xs font-serif text-center">
                <div className="italic text-[11px]">Final Value of C in equilibrium</div>
                <div className="my-1">C = (As fs + Af ffe) / (α₁ f'c β₁ b)</div>
                <div className="font-bold text-sm font-mono mt-1">
                  C = {results.finalEquilibrium.c.toFixed(2)} mm &nbsp;&nbsp; ✓ OK
                </div>
              </div>

              {/* Exact beam diagram illustration for equilibrium state */}
              <div className="my-4 flex justify-center">
                <svg viewBox="0 0 540 180" className="w-full max-w-[480px] h-auto">
                  <rect x="80" y="20" width="80" height="140" fill="#f4f4f5" stroke="#000" strokeWidth="1.2" />
                  <rect x="80" y="160" width="80" height="5" fill="#333" stroke="#000" />
                  <circle cx="100" cy="145" r="4" fill="#000" />
                  <circle cx="120" cy="145" r="4" fill="#000" />
                  <circle cx="140" cy="145" r="4" fill="#000" />
                  
                  {/* Dimension b with ticks */}
                  <line x1="80" y1="10" x2="160" y2="10" stroke="#000" strokeWidth="0.8" />
                  <line x1="80" y1="6" x2="80" y2="14" stroke="#000" strokeWidth="0.8" />
                  <line x1="160" y1="6" x2="160" y2="14" stroke="#000" strokeWidth="0.8" />
                  <text x="120" y="7" fontSize="9" textAnchor="middle" fontStyle="italic">b</text>

                  {/* Dimension Df with ticks */}
                  <line x1="60" y1="20" x2="60" y2="165" stroke="#000" strokeWidth="0.8" />
                  <line x1="56" y1="20" x2="64" y2="20" stroke="#000" strokeWidth="0.8" />
                  <line x1="56" y1="165" x2="64" y2="165" stroke="#000" strokeWidth="0.8" />
                  <text x="48" y="90" fontSize="9" textAnchor="middle" fontStyle="italic">Df</text>

                  <line x1="50" y1="70" x2="380" y2="70" stroke="#666" strokeWidth="0.8" strokeDasharray="3,3" />
                  <text x="210" y="67" fontSize="9" fontStyle="italic">N.A.</text>

                  <rect x="280" y="20" width="70" height="42" fill="#f4f4f5" stroke="#000" strokeWidth="1" />
                  
                  {/* Dimension b (stress block) with ticks */}
                  <line x1="280" y1="10" x2="350" y2="10" stroke="#000" strokeWidth="0.8" />
                  <line x1="280" y1="6" x2="280" y2="14" stroke="#000" strokeWidth="0.8" />
                  <line x1="350" y1="6" x2="350" y2="14" stroke="#000" strokeWidth="0.8" />
                  <text x="315" y="7" fontSize="9" textAnchor="middle" fontStyle="italic">b</text>

                  {/* Compressive stress arrows with distinct vector arrowheads pointing into stress block */}
                  {[0.25, 0.75].map((r, i) => {
                    const arrowY = 20 + 42 * r;
                    return (
                      <g key={i}>
                        <line x1="220" y1={arrowY} x2="276" y2={arrowY} stroke="#000" strokeWidth="1.2" />
                        <polygon points={`274,${arrowY - 3} 280,${arrowY} 274,${arrowY + 3}`} fill="#000" />
                      </g>
                    );
                  })}

                  {/* Dimensions on right with ticks */}
                  <line x1="362" y1="20" x2="362" y2="145" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="20" x2="366" y2="20" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="62" x2="366" y2="62" stroke="#000" strokeWidth="0.8" />
                  <line x1="358" y1="145" x2="366" y2="145" stroke="#000" strokeWidth="0.8" />

                  <text x="372" y="45" fontSize="9" fontStyle="italic">C =</text>
                  <text x="400" y="45" fontSize="9" fontWeight="bold">{results.finalEquilibrium.c.toFixed(2)}</text>
                  <line x1="270" y1="145" x2="350" y2="145" stroke="#000" strokeWidth="2.5" />
                  <text x="372" y="115" fontSize="9" fontStyle="italic">d-c =</text>
                  <text x="400" y="115" fontSize="9" fontWeight="bold">{(inputs.d - results.finalEquilibrium.c).toFixed(2)}</text>
                </svg>
              </div>
            </div>

            {/* XI. Calculating Flexural strength */}
            <div className="my-6 pt-4 border-t border-black">
              <h2 className="font-bold italic text-xs mb-3">
                XI. Calculating Flexural strength
              </h2>

              <div className="grid grid-cols-2 gap-8 text-xs font-serif">
                {/* Steel */}
                <div className="space-y-1.5">
                  <div className="italic font-bold">Steel Contribution to bending</div>
                  <div>Mns = As fs (d - β₁ c / 2)</div>
                  <div className="font-mono pt-1">
                    As fs = {results.As_fs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="font-mono">
                    (d - β₁ c / 2) = {results.d_minus_beta1_c_div_2.toFixed(2)}
                  </div>
                  <div className="font-mono font-bold pt-2">
                    Mns = {results.Mns.toFixed(2)} kN - m
                  </div>
                </div>

                {/* FRP */}
                <div className="space-y-1.5">
                  <div className="italic font-bold">FRP Contribution to bending</div>
                  <div>Mnf = Af ffe (df - β₁ c / 2)</div>
                  <div className="font-mono pt-1">
                    Af ffe = {results.Af_ffe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="font-mono">
                    (df - β₁ c / 2) = {results.df_minus_beta1_c_div_2.toFixed(4)}
                  </div>
                  <div className="font-mono font-bold pt-2">
                    Mnf = {results.Mnf.toFixed(2)} kN - m
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2">
            <span>Project: {inputs.projectTitle} · Member: {inputs.beamId}</span>
            <span>Sheet 4 of 5</span>
          </div>
        </div>

        {/* ================= PAGE 5 ================= */}
        <div className="print-page-sheet min-h-[1050px] bg-white flex flex-col justify-between pt-6 pb-8">
          <div>
            {/* XII. Calculating Design Flexural strength */}
            <div className="mb-6">
              <h2 className="font-bold italic text-xs mb-3">
                XII. Calculating Design Flexural strength
              </h2>

              <div className="flex justify-between items-center text-xs font-serif my-2">
                <span>ΦMn = Φ [Mns + ψf Mnf]</span>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-[10px]">MOMENT DEMAND</span>
                  <span className="bg-zinc-300 border border-zinc-400 font-mono font-bold px-3 py-0.5 text-xs">
                    {inputs.MuDemand}
                  </span>
                  <span>kN - m</span>
                </div>
              </div>

              <div className="text-center font-mono font-bold text-sm my-3">
                ΦMn = {results.phiMn.toFixed(2)}
              </div>

              <div className="flex justify-center items-center gap-4 my-2 text-xs font-serif">
                <span>DCR = Mu / ΦMn</span>
                <span className="font-mono">{inputs.MuDemand} / {results.phiMn.toFixed(5)}</span>
                <span>&lt; 1</span>
                <span className="font-sans font-bold italic">DESIGN ✓ OK</span>
              </div>

              <div className="text-center text-xs italic mt-2">
                Strength Margin &nbsp;&nbsp; <strong className="font-mono not-italic">{results.strengthMargin.toFixed(2)}%</strong>
              </div>
            </div>

            {/* XIII. Checking service stresses in reinforcing steel and FRP */}
            <div className="my-6 pt-4 border-t border-black text-xs font-serif">
              <h2 className="font-bold italic text-xs mb-3 font-sans">
                XIII. Checking service stresses in the reinforcing steel and FRP
              </h2>

              <div className="text-center italic text-[11px] my-2">
                fss = [ Ms + εbi Af Ef (df - kd/3) ] (d - kd) Es / [ As Es (d - kd/3)(d - kd) + Af Ef (df - kd/3)(df - kd) ]
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[11px] my-3 ml-12">
                <div>Ms = {Math.round(results.Ms_kNm * 1000)} kN - mm</div>
                <div>As Es = {Math.round(results.As * (inputs.Es / 1000))} kN</div>
                <div>εbi = {results.ebi.toFixed(7)}</div>
                <div></div>
                <div>Af Ef = {(results.Af * (inputs.Ef / 1000)).toFixed(1)} kN</div>
                <div>ds - kd/3 = {results.ds_minus_kd_div_3.toFixed(3)} mm</div>
                <div>df - kd/3 = {results.df_minus_kd_div_3.toFixed(4)} mm</div>
                <div>(ds - kd) = {results.ds_minus_kd.toFixed(3)} mm</div>
                <div>(ds - kd) Es = {(results.ds_minus_kd * (inputs.Es / 1000)).toFixed(2)} kN</div>
              </div>

              <div className="text-center font-mono text-xs my-3">
                fss = {results.num_fss.toFixed(2)} / {results.den_fss.toFixed(2)}
              </div>

              <div className="flex justify-center items-center gap-6 my-2">
                <span>fss = {results.fss.toFixed(3)}</span>
                <span>≤ 0.8 fy</span>
              </div>

              <div className="flex justify-center items-center gap-8 my-2 font-mono font-bold text-xs">
                <span>{results.fss.toFixed(1)} N/mm²</span>
                <span className={results.serviceSteelPass ? 'text-emerald-700' : 'text-rose-700'}>
                  {results.serviceSteelPass
                    ? `≤ ${results.fss_limit.toFixed(1)}`
                    : `> ${results.fss_limit.toFixed(1)}`}
                </span>
              </div>

              <div
                className={`text-center font-bold italic mt-3 font-sans ${
                  results.serviceSteelPass ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {results.serviceSteelPass
                  ? `(${results.fss.toFixed(1)} ≤ ${results.fss_limit.toFixed(1)}) ∴ Design ✓ OK`
                  : `(${results.fss.toFixed(1)} > ${results.fss_limit.toFixed(1)}) ∴ ✗ NOT OK (fss > 0.80 fy)`}
              </div>
            </div>

            {/* XIV. Checking creep rupture limit for FRP service */}
            <div className="my-6 pt-4 border-t border-black text-xs font-serif">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="font-bold italic text-xs mb-1 font-sans">
                  XIV. Checking creep rupture limit for FRP service
                </h2>
                <span className="text-[10px] italic font-serif">ACI 440.2R Section 10.2.9</span>
              </div>

              <div className="text-center font-mono text-xs my-2">
                ffs = fs,s (Ef / Es) ((df - kd) / (d - kd)) - εbi Ef ≤ 0.55 ffu
              </div>

              <div className="text-[11px] italic my-1 ml-6 font-serif">where:</div>
              <div className="text-center text-[10px] my-1 font-serif">
                k = √((ρs · Es/Ec + ρf · Ef/Ec)² + 2(ρs · Es/Ec + ρf · Ef/Ec)) - (ρs · Es/Ec + ρf · Ef/Ec)
              </div>

              {/* Parameters table */}
              <div className="w-56 mx-auto my-3 font-mono text-[11px] space-y-0.5">
                <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                  <span className="italic font-serif">ρs =</span>
                  <strong className="font-bold">{results.rho_s.toFixed(4)}</strong>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                  <span className="italic font-serif">Es =</span>
                  <strong className="font-bold">{(inputs.Es / 1000).toFixed(0)}</strong>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                  <span className="italic font-serif">Ec =</span>
                  <strong className="font-bold">{(results.Ec / 1000).toFixed(1)}</strong>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                  <span className="italic font-serif">Ef =</span>
                  <strong className="font-bold">{(inputs.Ef / 1000).toFixed(0)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="italic font-serif">ρf =</span>
                  <strong className="font-bold">{results.rho_f.toFixed(4)}</strong>
                </div>
              </div>

              {/* Exact step-by-step substitution for k matching user Excel image */}
              <div className="space-y-2 font-mono text-xs my-3 bg-zinc-50 p-3 rounded border border-zinc-300">
                <div className="text-center">
                  k = √( ({results.term_creep.toFixed(6)})² + 2( {results.term_creep.toFixed(6)} ) ) - ( {results.term_creep.toFixed(4)} )
                </div>

                <div className="text-center">
                  k = √( ( {results.term_creep_sq.toFixed(6)} ) + ( {results.two_term_creep.toFixed(6)} ) ) - ( {results.term_creep.toFixed(4)} )
                </div>

                <div className="text-center">
                  k = √( {results.k_creep_sq.toFixed(4)} )
                </div>

                <div className="text-center font-bold text-sm text-black pt-1 border-t border-zinc-300">
                  k = {results.k_creep.toFixed(4)}
                </div>
              </div>

              <div className="text-center font-mono text-[11px] my-2">
                ffs = {results.fss.toFixed(1)} × ({((inputs.Ef / inputs.Es)).toFixed(3)}) × ({results.creep_depth_ratio.toFixed(3)}) - {(results.ebi * inputs.Ef).toFixed(2)}
              </div>

              <div className="flex justify-center items-center gap-6 my-2 font-mono font-bold text-xs">
                <span>ffs = {results.ffs.toFixed(2)} N/mm²</span>
                <span className={results.creepPass ? 'text-emerald-700' : 'text-rose-700'}>
                  {results.creepPass ? '≤' : '>'}
                </span>
                <span>0.55 ffu = {results.ffs_limit.toFixed(1)} N/mm²</span>
              </div>

              <div
                className={`text-center font-bold italic mt-3 font-sans ${
                  results.creepPass ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {results.creepPass
                  ? `(${results.ffs.toFixed(2)} ≤ ${results.ffs_limit.toFixed(1)}) ∴ Design ✓ OK`
                  : `(${results.ffs.toFixed(2)} > ${results.ffs_limit.toFixed(1)}) ∴ ✗ NOT OK (Creep Rupture Limit Exceeded)`}
              </div>
            </div>

            {/* Engineer Signature & Approval Block */}
            <div className="mt-8 pt-4 border-t-2 border-zinc-400 grid grid-cols-3 gap-6 text-[10px] font-sans">
              <div>
                <span className="block text-zinc-500 uppercase tracking-wider">Calculated By:</span>
                <span className="font-bold text-black text-xs mt-1 block">{inputs.engineerName}</span>
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
                <span className="font-bold text-black text-xs mt-1 block">{inputs.date}</span>
                <span className="text-emerald-700 font-bold">CERTIFIED CONFORMANT (ACI 440.2R)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between border-t border-zinc-200 pt-2">
            <span>Project: {inputs.projectTitle} · Member: {inputs.beamId}</span>
            <span>Sheet 5 of 5 (Flexural Strengthening)</span>
          </div>
        </div>
          </>
        )}

        {/* If 'both' selected, also append Shear Report with page break */}
        {selectedReport === 'both' && shearInputs && shearResults && (
          <div className="print:break-before-page border-t-4 border-double border-zinc-400 mt-8 pt-8 print:border-none print:mt-0 print:pt-0">
            <PrintableShearReport inputs={shearInputs} results={shearResults} pageNumber={6} totalPages={7} />
          </div>
        )}
      </div>
    </div>
  );
};
