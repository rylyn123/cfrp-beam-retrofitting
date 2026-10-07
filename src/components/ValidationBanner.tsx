import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { ValidationIssue } from '../utils/validation';

interface ValidationBannerProps {
  issues: ValidationIssue[];
  title?: string;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  issues,
  title = 'ACI 440 Structural Parameter Compliance',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>ACI 440 Compliance Check:</strong> All parameters are within physically realistic & safe design ranges.
          </span>
        </div>
        <span className="text-[10px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 px-2 py-0.5 rounded font-bold">
          ✓ VALIDATED
        </span>
      </div>
    );
  }

  const hasErrors = errors.length > 0;

  return (
    <div
      className={`rounded-lg border text-xs font-mono transition-all ${
        hasErrors
          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          {hasErrors ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {hasErrors ? 'Structural Constraint Warning' : 'Design Parameter Caution'}:
            </span>{' '}
            <span>
              {errors.length > 0 && `${errors.length} physical/code limit violation${errors.length > 1 ? 's' : ''}`}
              {errors.length > 0 && warnings.length > 0 && ' and '}
              {warnings.length > 0 && `${warnings.length} parameter recommendation notice${warnings.length > 1 ? 's' : ''}`}
              .
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 hover:opacity-80 px-2 py-1 rounded transition-opacity"
        >
          <span>{isExpanded ? 'Hide Details' : `View Issues (${issues.length})`}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 space-y-2">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border flex items-start justify-between gap-3 ${
                issue.severity === 'error'
                  ? 'bg-rose-950/60 border-rose-800/60 text-rose-200'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                      issue.severity === 'error'
                        ? 'bg-rose-900 text-rose-100 border-rose-700'
                        : 'bg-amber-900 text-amber-100 border-amber-700'
                    }`}
                  >
                    {issue.severity === 'error' ? 'Critical' : 'Caution'}
                  </span>
                  <strong className="text-white text-xs">{issue.field}:</strong>
                  {issue.standard && (
                    <span className="text-[10px] text-slate-400 italic">[{issue.standard}]</span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-95">{issue.message}</p>
              </div>

              {issue.allowedRange && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Allowed Range:</span>
                  <span className="font-bold text-cyan-300 text-[11px]">{issue.allowedRange}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
