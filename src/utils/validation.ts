import { CfrpInputs, ShearInputs } from '../types/cfrp';

export interface ValidationRule {
  min?: number;
  max?: number;
  step?: string;
  unit?: string;
  standard?: string;
  description: string;
}

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
  standard?: string;
  allowedRange?: string;
  currentValue: number | string;
}

// =========================================================================
// ACI 440.2R & ACI 318-19 Parameter Limits
// =========================================================================
export const FLEXURE_PARAM_RULES: Partial<Record<keyof CfrpInputs, ValidationRule>> = {
  fc: {
    min: 17,
    max: 85,
    unit: 'MPa',
    standard: 'ACI 440.2R §8.2 / ACI 318',
    description: "Concrete compressive strength f'c must be ≥ 17 MPa (2500 psi) to ensure adequate substrate bond.",
  },
  fy: {
    min: 250,
    max: 600,
    unit: 'MPa',
    standard: 'ACI 318 §20.2',
    description: 'Steel reinforcement yield strength fy is typically 280 to 520 MPa (Grades 40, 60, 75).',
  },
  d: {
    min: 100,
    max: 3000,
    unit: 'mm',
    standard: 'ACI 318 Physical Depth',
    description: 'Effective flexural depth d of the beam tension reinforcement.',
  },
  b: {
    min: 80,
    max: 2000,
    unit: 'mm',
    standard: 'ACI 318 Beam Width',
    description: 'Beam web or flange width b in millimeters.',
  },
  Cc: {
    min: 15,
    max: 150,
    unit: 'mm',
    standard: 'ACI 318 §20.6.1',
    description: 'Concrete cover Cc to bar centroid must be at least 20–40 mm for durability.',
  },
  noOfBars: {
    min: 1,
    max: 30,
    unit: 'bars',
    standard: 'Reinforcement Layout',
    description: 'Number of tension longitudinal reinforcement bars.',
  },
  barDiameter: {
    min: 9.5,
    max: 57,
    unit: 'mm',
    standard: 'ASTM A615 / Standard Rebars',
    description: 'Bar diameter (10 mm to 57 mm: #3 to #18 bars).',
  },
  Es: {
    min: 160000,
    max: 240000,
    unit: 'MPa',
    standard: 'ACI 318 §20.2.2',
    description: 'Modulus of elasticity of nonprestressed reinforcement is standard 200,000 MPa.',
  },
  MDL: {
    min: 1,
    max: 10000,
    unit: 'kN-m',
    standard: 'Unfactored Dead Load Demand',
    description: 'Unfactored dead load service moment present at time of FRP installation.',
  },
  MLL: {
    min: 0,
    max: 10000,
    unit: 'kN-m',
    standard: 'Unfactored Live Load Demand',
    description: 'Unfactored live load service moment.',
  },
  phiMnExisting: {
    min: 5,
    max: 15000,
    unit: 'kN-m',
    standard: 'ACI 440.2R §9.1',
    description: 'Existing design flexural strength of beam prior to CFRP strengthening.',
  },
  fu: {
    min: 2.0,
    unit: 'MPa',
    standard: 'CFRP Manufacturer TDS',
    description: 'Ultimate tensile strength of CFRP fiber/laminate. Must be ≥ 2.0 MPa.',
  },
  eu: {
    min: 0.001,
    unit: '',
    standard: 'ACI 440.2R Table 9.1',
    description: 'Ultimate rupture strain of CFRP system.',
  },
  Ef: {
    min: 1000,
    unit: 'MPa',
    standard: 'ACI 440.2R Table 9.1',
    description: 'Tensile modulus of elasticity of CFRP.',
  },
  tf: {
    min: 0.05,
    max: 5.0,
    unit: 'mm',
    standard: 'CFRP Laminate Geometry',
    description: 'Nominal thickness per ply of dry fiber sheet (0.1–0.5 mm) or cured plate (1.0–2.5 mm).',
  },
  noOfPlies: {
    min: 1,
    max: 10,
    unit: 'plies',
    standard: 'ACI 440.2R Limit',
    description: 'Number of plies n. ACI 440 recommends limiting plies to avoid premature debonding.',
  },
  wf: {
    min: 25,
    max: 2000,
    unit: 'mm',
    standard: 'Soffit Width',
    description: 'Width of CFRP tension sheet. Cannot exceed beam width b.',
  },
};

export const SHEAR_PARAM_RULES: Partial<Record<keyof ShearInputs, ValidationRule>> = {
  VuDemand: {
    min: 5,
    max: 10000,
    unit: 'kN',
    standard: 'Factored Shear Demand',
    description: 'Factored shear demand Vu under factored ultimate load combinations.',
  },
  VcExisting: {
    min: 0,
    max: 5000,
    unit: 'kN',
    standard: 'ACI 318 Concrete Shear',
    description: 'Nominal concrete shear strength contribution Vc.',
  },
  VsExisting: {
    min: 0,
    max: 5000,
    unit: 'kN',
    standard: 'ACI 318 Stirrup Shear',
    description: 'Nominal steel shear reinforcement strength Vs.',
  },
  fc: {
    min: 17,
    max: 85,
    unit: 'MPa',
    standard: 'ACI 440.2R §8.2',
    description: "Concrete compressive strength f'c must be ≥ 17 MPa for shear strengthening.",
  },
  d: {
    min: 100,
    max: 3000,
    unit: 'mm',
    standard: 'Effective Depth',
    description: 'Effective shear depth d of the reinforced concrete member.',
  },
  b: {
    min: 80,
    max: 2000,
    unit: 'mm',
    standard: 'Web Width',
    description: 'Web width bw of the beam section.',
  },
  h: {
    min: 120,
    max: 3500,
    unit: 'mm',
    standard: 'Total Depth',
    description: 'Total beam depth h. Must be greater than effective depth d.',
  },
  fu: {
    min: 2.0,
    unit: 'MPa',
    standard: 'CFRP Manufacturer TDS',
    description: 'Ultimate tensile strength of CFRP shear strips. Must be ≥ 2.0 MPa.',
  },
  eu: {
    min: 0.001,
    unit: '',
    standard: 'ACI 440.2R Table 9.1',
    description: 'Ultimate rupture strain of CFRP shear reinforcement.',
  },
  Ef: {
    min: 1000,
    unit: 'MPa',
    standard: 'ACI 440.2R Table 9.1',
    description: 'CFRP modulus of elasticity Ef in MPa.',
  },
  tf: {
    min: 0.05,
    max: 5.0,
    unit: 'mm',
    standard: 'Strip Thickness',
    description: 'Thickness of single ply of transverse CFRP.',
  },
  noOfPlies: {
    min: 1,
    max: 6,
    unit: 'plies',
    standard: 'Shear Plies Limit',
    description: 'Number of transverse shear plies (typically 1 to 4).',
  },
  wf: {
    min: 25,
    max: 1000,
    unit: 'mm',
    standard: 'Strip Width',
    description: 'Width wf of individual CFRP transverse strip.',
  },
  sf: {
    min: 25,
    max: 1500,
    unit: 'mm',
    standard: 'ACI 440.2R §11.4',
    description: 'Center-to-center spacing sf of CFRP strips. Must be ≥ 0.5·wf (allowing up to 50% strip overlap) and ≤ wf + d/4.',
  },
  angleAlpha: {
    min: 0,
    max: 90,
    unit: 'deg',
    standard: 'ACI 440.2R Eq. 11-3',
    description: 'Fiber orientation angle α (0° to 90°, where 90° is vertical and 0° is horizontal).',
  },
};

// =========================================================================
// Real-Time Validation Functions
// =========================================================================

export function validateFlexureInputs(inputs: CfrpInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Single Field Validations
  (Object.keys(FLEXURE_PARAM_RULES) as (keyof CfrpInputs)[]).forEach((key) => {
    const rule = FLEXURE_PARAM_RULES[key];
    const val = Number(inputs[key]);
    if (!rule || isNaN(val)) return;

    if (rule.min !== undefined && val < rule.min) {
      const isCritical = val <= 0 || (key === 'fc' && val < 10) || (key === 'd' && val < 50) || (key === 'fu' && val < 2.0);
      issues.push({
        field: key,
        severity: isCritical ? 'error' : 'warning',
        message: `${key} is below recommended limit (${rule.min} ${rule.unit || ''}): ${rule.description}`,
        standard: rule.standard,
        allowedRange: rule.max !== undefined ? `${rule.min} to ${rule.max} ${rule.unit || ''}`.trim() : `≥ ${rule.min} ${rule.unit || ''}`.trim(),
        currentValue: val,
      });
    } else if (rule.max !== undefined && val > rule.max) {
      issues.push({
        field: key,
        severity: 'warning',
        message: `${key} exceeds typical upper limit (${rule.max} ${rule.unit || ''}): ${rule.description}`,
        standard: rule.standard,
        allowedRange: rule.min !== undefined ? `${rule.min} to ${rule.max} ${rule.unit || ''}`.trim() : `≤ ${rule.max} ${rule.unit || ''}`.trim(),
        currentValue: val,
      });
    }
  });

  // 2. Relational / Geometric Validations
  // A. CFRP width wf cannot exceed beam width b
  if (inputs.wf > inputs.b) {
    issues.push({
      field: 'wf',
      severity: 'error',
      message: `CFRP strip width wf (${inputs.wf} mm) cannot exceed beam width b (${inputs.b} mm).`,
      standard: 'Physical Geometry Limit',
      allowedRange: `≤ ${inputs.b} mm`,
      currentValue: inputs.wf,
    });
  }

  // B. Beam Effective Depth d vs df
  const dfActual = inputs.dfManual ?? (inputs.d + inputs.Cc);
  if (dfActual <= inputs.d) {
    issues.push({
      field: 'dfManual',
      severity: 'error',
      message: `Total depth to CFRP df (${dfActual.toFixed(1)} mm) must be greater than steel effective depth d (${inputs.d} mm).`,
      standard: 'Strain Compatibility',
      allowedRange: `> ${inputs.d} mm`,
      currentValue: dfActual,
    });
  }

  // C. Concrete Cover Cc
  if (inputs.Cc < 15) {
    issues.push({
      field: 'Cc',
      severity: 'warning',
      message: `Concrete cover Cc (${inputs.Cc} mm) is unusually thin. Minimum 20–40 mm recommended per ACI 318.`,
      standard: 'ACI 318 §20.6.1',
      allowedRange: '20 to 80 mm',
      currentValue: inputs.Cc,
    });
  }

  // D. Minimum Concrete Strength for FRP Application
  if (inputs.fc < 17) {
    issues.push({
      field: 'fc',
      severity: 'error',
      message: `Concrete strength f'c (${inputs.fc} MPa) is below ACI 440.2R Section 8.2 requirement of 17 MPa (2500 psi) for sound substrate bond.`,
      standard: 'ACI 440.2R §8.2 Substrate Requirement',
      allowedRange: '≥ 17.0 MPa',
      currentValue: inputs.fc,
    });
  }

  // E. Strengthening Limit Check (ACI 440.2R Eq. 9-1)
  const strengthThreshold = 1.1 * inputs.MDL + 0.75 * inputs.MLL;
  if (inputs.phiMnExisting < strengthThreshold) {
    issues.push({
      field: 'phiMnExisting',
      severity: 'warning',
      message: `Existing capacity ΦMn (${inputs.phiMnExisting} kN-m) is less than (1.1 MDL + 0.75 MLL = ${strengthThreshold.toFixed(1)} kN-m). ACI 440.2R Eq. 9-1 unstrengthened limit check not met.`,
      standard: 'ACI 440.2R Eq. (9-1)',
      allowedRange: `≥ ${strengthThreshold.toFixed(1)} kN-m`,
      currentValue: inputs.phiMnExisting,
    });
  }

  return issues;
}

export function validateShearInputs(inputs: ShearInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Single Field Validations
  (Object.keys(SHEAR_PARAM_RULES) as (keyof ShearInputs)[]).forEach((key) => {
    const rule = SHEAR_PARAM_RULES[key];
    const val = Number(inputs[key]);
    if (!rule || isNaN(val)) return;

    if (rule.min !== undefined && val < rule.min) {
      const isCritical = val <= 0 || (key === 'fc' && val < 10) || (key === 'd' && val < 50) || (key === 'fu' && val < 2.0);
      issues.push({
        field: key,
        severity: isCritical ? 'error' : 'warning',
        message: `${key} is below recommended limit (${rule.min} ${rule.unit || ''}): ${rule.description}`,
        standard: rule.standard,
        allowedRange: rule.max !== undefined ? `${rule.min} to ${rule.max} ${rule.unit || ''}`.trim() : `≥ ${rule.min} ${rule.unit || ''}`.trim(),
        currentValue: val,
      });
    } else if (rule.max !== undefined && val > rule.max) {
      issues.push({
        field: key,
        severity: 'warning',
        message: `${key} exceeds typical upper limit (${rule.max} ${rule.unit || ''}): ${rule.description}`,
        standard: rule.standard,
        allowedRange: rule.min !== undefined ? `${rule.min} to ${rule.max} ${rule.unit || ''}`.trim() : `≤ ${rule.max} ${rule.unit || ''}`.trim(),
        currentValue: val,
      });
    }
  });

  // 2. Relational Validations
  // A. Total depth h must exceed effective depth d
  if (inputs.h <= inputs.d) {
    issues.push({
      field: 'h',
      severity: 'error',
      message: `Total beam height h (${inputs.h} mm) must be strictly greater than effective depth d (${inputs.d} mm).`,
      standard: 'Physical Cross Section',
      allowedRange: `> ${inputs.d} mm`,
      currentValue: inputs.h,
    });
  }

  // B. Spacing sf: allow overlapping of spacing up to 50% of strip width wf (sf >= 0.5 * wf)
  const minAllowableSpacing = 0.5 * inputs.wf;
  if (inputs.sf < minAllowableSpacing) {
    const overlapPercent = inputs.wf > 0 ? (((inputs.wf - inputs.sf) / inputs.wf) * 100).toFixed(0) : '0';
    issues.push({
      field: 'sf',
      severity: 'error',
      message: `Center-to-center strip spacing sf (${inputs.sf} mm) cannot be less than 50% of strip width wf (${minAllowableSpacing.toFixed(1)} mm). Strip overlap is ${overlapPercent}%, exceeding allowable 50% overlap limit.`,
      standard: 'CFRP Strip Overlap Limit (≤ 50% wf)',
      allowedRange: `≥ ${minAllowableSpacing.toFixed(1)} mm (up to 50% overlap of wf)`,
      currentValue: inputs.sf,
    });
  }

  // C. Maximum spacing limit per ACI 440.2R Section 11.4: sf <= wf + d/4
  const maxAllowableSpacing = inputs.wf + inputs.d / 4;
  if (inputs.sf > maxAllowableSpacing) {
    issues.push({
      field: 'sf',
      severity: 'warning',
      message: `Strip spacing sf (${inputs.sf} mm) exceeds ACI 440.2R Section 11.4 maximum spacing limit (wf + d/4 = ${maxAllowableSpacing.toFixed(1)} mm). Continuous shear cracks may cross without intercepting strips.`,
      standard: 'ACI 440.2R Section 11.4',
      allowedRange: `≤ ${maxAllowableSpacing.toFixed(1)} mm`,
      currentValue: inputs.sf,
    });
  }

  // D. Concrete strength f'c >= 17 MPa
  if (inputs.fc < 17) {
    issues.push({
      field: 'fc',
      severity: 'error',
      message: `Concrete strength f'c (${inputs.fc} MPa) is below ACI 440.2R Section 8.2 requirement of 17 MPa (2500 psi).`,
      standard: 'ACI 440.2R §8.2 Substrate Requirement',
      allowedRange: '≥ 17.0 MPa',
      currentValue: inputs.fc,
    });
  }

  // E. Fiber Orientation Angle
  if (inputs.angleAlpha < 0 || inputs.angleAlpha > 90) {
    issues.push({
      field: 'angleAlpha',
      severity: 'warning',
      message: `Fiber orientation angle α (${inputs.angleAlpha}°) is outside allowed range (0° to 90°).`,
      standard: 'ACI 440.2R Eq. 11-3',
      allowedRange: '0° to 90°',
      currentValue: inputs.angleAlpha,
    });
  }

  return issues;
}
