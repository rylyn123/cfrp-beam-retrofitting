import { CfrpInputs, FlexureResults, IterationStep, ShearInputs, ShearResults, CfrpPreset } from '../types/cfrp';

export const CFRP_PRESETS: CfrpPreset[] = [
  {
    id: 'sample',
    brand: 'SAMPLE DATA',
    name: 'Sample High-Strength Carbon Fiber (Excel Reference)',
    manufacturer: 'Calibrated Reference Benchmark',
    type: 'CFRP Fabric / Unidirectional',
    fu: 621,
    eu: 0.015,
    Ef: 37000,
    tf: 1.012, // Calibrated thickness yielding Le = 51.855 mm with n=1 and Ef=37000
    description: 'Calibrated reference dataset directly from your original ACI 440 Excel calculation sheet (Le = 51.855 mm).',
    tdsReference: 'ACI 440.2R Calibrated Verification Dataset',
    curedSystem: 'Wet Lay-up Laminate',
  },
  {
    id: 'sika-103c',
    brand: 'SikaWrap Hex-103C',
    name: 'SikaWrap® Hex-103C Heavy Unidirectional Fabric',
    manufacturer: 'Sika Corporation',
    type: 'High-strength unidirectional carbon fiber fabric',
    fu: 960,
    eu: 0.0133,
    Ef: 73100,
    tf: 1.00,
    description: 'Heavy unidirectional carbon fiber fabric impregnated with Sikadur 300/301 for flexural and shear strengthening.',
    tdsReference: 'Sika Product Technical Data Sheet Rev 02.2023 / ICC-ES ESR-3288',
    curedSystem: 'Sikadur® Hex 300 / 301 Impregnating Epoxy',
  },
  {
    id: 'sika-230c',
    brand: 'SikaWrap-230C',
    name: 'SikaWrap®-230 C High Strength Woven Carbon',
    manufacturer: 'Sika Corporation',
    type: 'Unidirectional woven carbon fiber fabric',
    fu: 890,
    eu: 0.0136,
    Ef: 65400,
    tf: 0.381,
    description: 'Mid-weight unidirectional woven carbon fiber fabric for structural strengthening of reinforced concrete.',
    tdsReference: 'Sika System Data Sheet Edition 10/2022',
    curedSystem: 'Sikadur®-330 Epoxy Resin Matrix',
  },
  {
    id: 'sika-300c',
    brand: 'SikaWrap-300C',
    name: 'SikaWrap®-300 C Carbon Fiber Fabric',
    manufacturer: 'Sika Corporation',
    type: 'Heavy unidirectional carbon fiber fabric',
    fu: 3900,
    eu: 0.0150,
    Ef: 230000,
    tf: 0.166,
    description: 'Unidirectional woven carbon fiber fabric designed for installation using dry or wet application process.',
    tdsReference: 'Sika Technical Data Sheet 02 02 06 01 001 0 000021',
    curedSystem: 'Sikadur®-300 / Sikadur®-330 Matrix',
  },
  {
    id: 'sika-301c',
    brand: 'SikaWrap-301C',
    name: 'SikaWrap®-301 C High Performance Carbon',
    manufacturer: 'Sika Corporation',
    type: 'High tenacity unidirectional carbon fabric',
    fu: 4900,
    eu: 0.0170,
    Ef: 230000,
    tf: 0.167,
    description: 'High tenacity unidirectional continuous carbon fiber fabric for civil engineering retrofits.',
    tdsReference: 'Sika Technical Data Sheet Version 2024',
    curedSystem: 'Sikadur®-300 Epoxy',
  },
  {
    id: 'tyfo-sch41',
    brand: 'Tyfo SCH-41',
    name: 'Tyfo® SCH-41 Composite System',
    manufacturer: 'Fyfe Co. LLC / Simpson Strong-Tie',
    type: 'High-strength unidirectional carbon fabric',
    fu: 986,
    eu: 0.010,
    Ef: 95800,
    tf: 1.00,
    description: 'Custom weave unidirectional carbon fabric used with Tyfo S Epoxy to strengthen beams, slabs, and columns.',
    tdsReference: 'Fyfe Co. Product Data Sheet SCH-41 / ICC-ES ESR-2103',
    curedSystem: 'Tyfo® S Epoxy Matrix',
  },
  {
    id: 'tyfo-sch11up',
    brand: 'Tyfo SCH-11UP',
    name: 'Tyfo® SCH-11UP High Tensile System',
    manufacturer: 'Fyfe Co. LLC / Simpson Strong-Tie',
    type: 'Unidirectional carbon fabric',
    fu: 1062,
    eu: 0.0105,
    Ef: 102000,
    tf: 0.686,
    description: 'Lightweight high-strength unidirectional carbon composite for reinforced concrete and masonry retrofitting.',
    tdsReference: 'Fyfe Co. Technical Data Sheet Rev 2023',
    curedSystem: 'Tyfo® S Epoxy Matrix',
  },
  {
    id: 'tyfo-bcc',
    brand: 'Tyfo BCC Composite',
    name: 'Tyfo® BCC Carbon/Glass Hybrid',
    manufacturer: 'Fyfe Co. LLC / Simpson Strong-Tie',
    type: 'Bi-directional carbon fabric composite',
    fu: 579,
    eu: 0.0120,
    Ef: 48200,
    tf: 0.860,
    description: 'High performance carbon/glass fabric providing biaxial reinforcement for shear and confinement.',
    tdsReference: 'Fyfe Co. Technical Specification Sheet BCC',
    curedSystem: 'Tyfo® S Epoxy Matrix',
  },
  {
    id: 'masterbrace-fib300',
    brand: 'MasterBrace FIB 300/50',
    name: 'MasterBrace® FIB 300/50 CFS System',
    manufacturer: 'Master Builders Solutions',
    type: 'Unidirectional high modulus carbon fiber sheet',
    fu: 3800,
    eu: 0.0155,
    Ef: 240000,
    tf: 0.166,
    description: 'Dry carbon fiber sheet for wet lay-up installation, utilized in flexural and shear strengthening.',
    tdsReference: 'Master Builders Solutions Technical Data Sheet 03 39 00',
    curedSystem: 'MasterBrace® SAT 4500 Saturant Epoxy',
  },
  {
    id: 'masterbrace-fib600',
    brand: 'MasterBrace FIB 600/50',
    name: 'MasterBrace® FIB 600/50 Heavy CFS',
    manufacturer: 'Master Builders Solutions',
    type: 'Heavyweight unidirectional carbon fiber sheet',
    fu: 3800,
    eu: 0.0155,
    Ef: 240000,
    tf: 0.337,
    description: 'Heavyweight carbon fiber sheet designed to restore and increase flexural load-bearing capacity.',
    tdsReference: 'Master Builders Solutions Technical Data Sheet',
    curedSystem: 'MasterBrace® SAT 4500 Saturant Epoxy',
  },
  {
    id: 'mapei-cuni300',
    brand: 'MapeWrap C UNI-AX 300',
    name: 'MapeWrap C UNI-AX 300 Fabric',
    manufacturer: 'MAPEI',
    type: 'High-strength unidirectional carbon fiber fabric',
    fu: 4800,
    eu: 0.0190,
    Ef: 252000,
    tf: 0.164,
    description: 'High-strength, high-modulus unidirectional carbon fiber fabric for concrete repairs.',
    tdsReference: 'MAPEI Technical Notebook / ACI 440 Conformant',
    curedSystem: 'MapeWrap 31 / 21 Epoxy System',
  },
  {
    id: 'mapei-cuni600',
    brand: 'MapeWrap C UNI-AX 600',
    name: 'MapeWrap C UNI-AX 600 Heavy Fabric',
    manufacturer: 'MAPEI',
    type: 'High modulus unidirectional carbon fiber',
    fu: 4800,
    eu: 0.0190,
    Ef: 252000,
    tf: 0.328,
    description: 'Heavyweight high tensile strength carbon sheet impregnated with epoxy resin for beam retrofitting.',
    tdsReference: 'MAPEI Technical Notebook Section 03 24 00',
    curedSystem: 'MapeWrap 31 Slow/Fast Matrix',
  },
  {
    id: 'torayca-ut70-30',
    brand: 'Torayca UT70-30G',
    name: 'Torayca® Carbon Fiber Fabric UT70-30G',
    manufacturer: 'Toray Carbon Fibers',
    type: 'Aerospace-grade high modulus unidirectional carbon',
    fu: 4900,
    eu: 0.0180,
    Ef: 240000,
    tf: 0.167,
    description: 'Continuous PAN-based carbon fiber sheets for seismic retrofit and bridge girder strengthening.',
    tdsReference: 'Toray Composite Materials Technical Bulletin',
    curedSystem: 'Structural Impregnating Epoxy',
  },
  {
    id: 'torayca-ut70-60',
    brand: 'Torayca UT70-60G',
    name: 'Torayca® Carbon Fiber Fabric UT70-60G',
    manufacturer: 'Toray Carbon Fibers',
    type: 'Heavy tow high modulus unidirectional carbon',
    fu: 4900,
    eu: 0.0180,
    Ef: 240000,
    tf: 0.334,
    description: 'Heavy tow high strength carbon fiber sheet offering double the layer stiffness per application ply.',
    tdsReference: 'Toray Composite Materials Technical Bulletin',
    curedSystem: 'Structural Impregnating Epoxy',
  },
];

export function lookupBrandProperties(brandName: string, customPresets: CfrpPreset[] = []): CfrpPreset | undefined {
  const normalized = brandName.trim().toLowerCase();
  const all = [...CFRP_PRESETS, ...customPresets];
  return all.find(
    (p) =>
      p.brand.toLowerCase() === normalized ||
      p.id.toLowerCase() === normalized ||
      p.name.toLowerCase().includes(normalized)
  );
}

export const DEFAULT_INPUTS: CfrpInputs = {
  MDL: 97.6, // ACI 440.2R Chapter 14 Example 1 dead-load moment: 97.6 kN-m (72 kip-ft) yielding εbi = 0.00061
  MLL: 100, // Benchmark live-load moment: 100 kN-m
  loadManualOverride: undefined, // Automated Load = 1.1 MDL + 0.75 MLL = 1.1(97.6) + 0.75(100) = 182.36 kN-m
  assumedC_initial: 109.22,
  Es: 200000,

  fu: 621,
  eu: 0.015,
  Ef: 37000,
  cfrpBrand: 'SAMPLE DATA',

  phiMnExisting: 361,
  fc: 34.5,
  fy: 414,
  noOfBars: 3,
  barDiameter: 28.6,
  d: 546.1,
  b: 305,
  Cc: 63.6,
  dfManual: 609.6,
  ebiMode: 'auto',
  ebiManual: undefined,

  noOfPlies: 2,
  tf: 1.02,
  wf: 305,

  exposureCondition: 'Interior',
  MuDemand: 398,
  MsService: 273.912,

  projectTitle: 'CFRP Beam Flexural Strengthening',
  engineerName: 'Professional Structural Engineer',
  checkedBy: 'Lead Technical Director',
  structureName: 'Main Framing Girder G-1',
  beamId: 'BM-204-B',
  date: new Date().toISOString().split('T')[0],
};

export const DEFAULT_SHEAR_INPUTS: ShearInputs = {
  VuDemand: 285,
  VcExisting: 110,
  VsExisting: 65,
  d: 546.1,
  b: 305,
  h: 609.6,
  fc: 34.5,
  fu: 621,
  eu: 0.015,
  Ef: 37000,
  tf: 1.012, // Calibrated thickness yielding Le = 51.855 mm with n=1 and Ef=37000
  wf: 150,
  sf: 250,
  noOfPlies: 1, // 1 ply calibrated benchmark for shear retrofit
  scheme: 'u_wrap',
  angleAlpha: 90,
  exposureCondition: 'Interior',
  LeManual: undefined,
  cfrpBrand: 'SAMPLE DATA',
  projectTitle: 'CFRP Beam Flexural & Shear Strengthening',
  engineerName: 'Professional Structural Engineer',
  checkedBy: 'Lead Technical Director',
  structureName: 'Main Framing Girder G-1',
  beamId: 'BM-204-B',
  date: new Date().toISOString().split('T')[0],
};

// Calculate ACI 440 CE environmental reduction factor
export function getEnvironmentalFactor(condition: 'Interior' | 'Exterior' | 'Aggressive'): number {
  switch (condition) {
    case 'Interior':
      return 0.95;
    case 'Exterior':
      return 0.85;
    case 'Aggressive':
      return 0.75;
    default:
      return 0.95;
  }
}

// Evaluate single state for a given neutral axis depth c
export function evaluateDepthC(
  c: number,
  inputs: {
    df: number;
    d: number;
    b: number;
    ebi: number;
    efd: number;
    Es: number;
    fy: number;
    Ef: number;
    fc: number;
    Ec: number;
    As: number;
    Af: number;
  }
) {
  const { df, d, b, ebi, efd, Es, fy, Ef, fc, Ec, As, Af } = inputs;

  // Strain compatibility: FRP strain if concrete strain reaches 0.003
  const efe_geom = 0.003 * ((df - c) / c) - ebi;

  let efe = 0;
  let ec = 0;
  let debondingControls = false;

  if (efe_geom <= efd) {
    // Concrete crushing controls
    efe = Math.max(0, efe_geom);
    ec = 0.003;
    debondingControls = false;
  } else {
    // FRP debonding controls
    efe = efd;
    ec = (efe + ebi) * (c / (df - c));
    debondingControls = true;
  }

  // Steel strain
  const es = (efe + ebi) * ((d - c) / (df - c));
  const es_Es = es * Es;
  const fs = Math.min(es_Es, fy); // MPa
  const ffe = efe * Ef; // MPa

  // Concrete stress block factors (ACI 440 Whitney / parabolic integration)
  const e_prime_c = (1.7 * fc) / Ec;
  const beta1_num = 4 * e_prime_c - ec;
  const beta1_den = 6 * e_prime_c - 2 * ec;
  let beta1 = beta1_den !== 0 ? beta1_num / beta1_den : 0.8;
  beta1 = Math.max(0.65, Math.min(0.85, beta1));

  const alpha1_num = 3 * e_prime_c * ec - ec * ec;
  const alpha1_den = 3 * beta1 * (e_prime_c * e_prime_c);
  let alpha1 = alpha1_den !== 0 ? alpha1_num / alpha1_den : 0.85;
  alpha1 = Math.max(0.5, Math.min(1.0, alpha1));

  // Equilibrium tension force T = As*fs + Af*ffe
  const As_fs = As * fs;
  const Af_ffe = Af * ffe;
  const T_tension = As_fs + Af_ffe;
  const denominator = alpha1 * fc * beta1 * b;
  const c_calc = denominator > 0 ? T_tension / denominator : c;

  return {
    c,
    efe_geom,
    efe,
    debondingControls,
    ec,
    ec_pass: ec <= 0.003 + 1e-4,
    es,
    es_Es,
    fs,
    ffe,
    e_prime_c,
    beta1,
    alpha1,
    As_fs,
    Af_ffe,
    numerator_c: T_tension,
    denominator_c: denominator,
    T_tension,
    c_calc,
    c_verified: c_calc,
    diff: Math.abs(c_calc - c),
    inEquilibrium: Math.abs(c_calc - c) < 0.2,
  };
}

// Run the full Flexure Calculation based on ACI 440
export function calculateFlexure(inputs: CfrpInputs): FlexureResults {
  const CE = getEnvironmentalFactor(inputs.exposureCondition);
  const ffu = CE * inputs.fu;
  const efu = CE * inputs.eu;

  // Beam Geometry & Reinforcement
  const h_total = inputs.d + inputs.Cc;
  const df = inputs.dfManual !== undefined && inputs.dfManual > 0 ? inputs.dfManual : h_total;
  const Af = inputs.noOfPlies * inputs.tf * inputs.wf;

  // As calculation: standard US #9 bar (nominally 28.6 mm / 1.128 in) has standard area 645.067 mm² (1.00 in²)
  // yielding 3 bars = 1935.2 mm², or computed as pi/4 * d^2
  let singleBarArea = (Math.PI / 4) * Math.pow(inputs.barDiameter, 2);
  if (Math.abs(inputs.barDiameter - 28.6) < 0.1) {
    singleBarArea = 645.067; // standard nominal #9 rebar area
  }
  const As = Math.round(inputs.noOfBars * singleBarArea * 10) / 10;

  // Concrete modulus & Modulus of rupture
  const Ec = 4700 * Math.sqrt(inputs.fc);
  const fr = 0.62 * Math.sqrt(inputs.fc); // ACI 318 / ACI 440 modulus of rupture (MPa)

  // Gross section properties (uncracked state)
  const Ig = (inputs.b * Math.pow(h_total, 3)) / 12; // mm^4
  const yt = h_total / 2; // mm (neutral axis of rectangular section)
  const Mcr = (fr * Ig) / (yt * 1e6); // Cracking moment (kN-m)
  const isCrackedUnderMDL = inputs.MDL > Mcr;

  // Initial beta1
  let beta1_initial = 1.05 - 0.05 * (inputs.fc / 6.9);
  beta1_initial = Math.max(0.65, Math.min(0.85, beta1_initial));

  // Section III: Existing state of strain
  const n_ratio = inputs.Es / Ec;
  const rho_s = As / (inputs.b * inputs.d);
  const rho_n = rho_s * n_ratio;
  const k_elastic = Math.sqrt(Math.pow(rho_n, 2) + 2 * rho_n) - rho_n;
  const c_cracked = k_elastic * inputs.d;
  const d_minus_c_cracked = inputs.d - c_cracked;
  const df_minus_c_cracked = df - c_cracked;

  // Cracked moment of inertia Icr = 1/3 b c^3 + n As (d - c)^2
  // ACI 440.2R Step 3: Icr = 5937 in.^4 = 2471 x 10^6 mm^4
  const Icr =
    (1 / 3) * inputs.b * Math.pow(c_cracked, 3) +
    n_ratio * As * Math.pow(d_minus_c_cracked, 2);
  const Icr_x10_6 = Math.round(Icr / 1e6); // e.g. 2471
  const Icr_formatted = `${Icr_x10_6} × 10⁶ mm⁴`;

  // Initial substrate strain options per ACI 440.2R Step 3 (Eq. 10-1):
  // Cracked soffit strain: εbi = MDL * (df - kd) / (Icr * Ec)
  const MDL_Nmm = inputs.MDL * 1e6;
  const ebi_cracked = (MDL_Nmm * (df - c_cracked)) / (Icr * Ec);
  const ebi_uncracked = (MDL_Nmm * yt) / (Ig * Ec);
  const ebi_steel_level = (MDL_Nmm * (inputs.d - c_cracked)) / (Icr * Ec);

  // Auto selection based on ACI 440.2R Section 10.2.3:
  // If MDL <= Mcr, section is uncracked; if MDL > Mcr, section is cracked
  let ebi_calculated = isCrackedUnderMDL ? ebi_cracked : ebi_uncracked;

  if (inputs.ebiMode === 'steel_level') {
    ebi_calculated = ebi_steel_level;
  } else if (inputs.ebiMode === 'cracked_soffit') {
    ebi_calculated = ebi_cracked;
  } else if (inputs.ebiMode === 'uncracked') {
    ebi_calculated = ebi_uncracked;
  }

  // Active ebi: manual override takes precedence if defined
  const isEbiOverridden = inputs.ebiManual !== undefined && inputs.ebiManual > 0;
  const ebi = isEbiOverridden ? inputs.ebiManual! : ebi_calculated;

  // Section IV: Design strain of CFRP system
  // efd = 0.41 * sqrt(fc / (n * Ef * tf)) <= 0.9 efu
  const n_Ef_tf = inputs.noOfPlies * inputs.Ef * inputs.tf;
  const efd_calc = n_Ef_tf > 0 ? 0.41 * Math.sqrt(inputs.fc / n_Ef_tf) : 0;
  const efd_limit = 0.9 * efu;
  const efd = Math.min(efd_calc, efd_limit);
  const efd_pass = efd_calc <= efd_limit + 1e-6;

  // Check strengthening limit: phiMnExisting >= 1.1 MDL + 0.75 MLL
  const strengtheningLimit =
    inputs.loadManualOverride !== undefined && inputs.loadManualOverride > 0
      ? inputs.loadManualOverride
      : 1.1 * inputs.MDL + 0.75 * inputs.MLL;
  const strengtheningLimitPass = inputs.phiMnExisting >= strengtheningLimit;

  // Section V: Assumed C (20% x Effective depth formula: C = 0.20 * d)
  const assumedC_formula = 0.20 * inputs.d;
  const isAssumedCOverridden =
    inputs.assumedC_initial !== undefined &&
    inputs.assumedC_initial > 0 &&
    Math.abs(inputs.assumedC_initial - assumedC_formula) > 0.05;
  const assumedC_default = isAssumedCOverridden ? inputs.assumedC_initial : assumedC_formula;

  // Section VI - IX: Initial Trial with Assumed C
  const evalParams = {
    df,
    d: inputs.d,
    b: inputs.b,
    ebi,
    efd,
    Es: inputs.Es,
    fy: inputs.fy,
    Ef: inputs.Ef,
    fc: inputs.fc,
    Ec,
    As,
    Af,
  };

  const initialTrial = evaluateDepthC(assumedC_default, evalParams);

  // Section X: VBA Iteration Solver
  // Replicating the VBA macro that solves for equilibrium C
  const iterationSteps: IterationStep[] = [];
  let currentC = assumedC_default;
  const maxIter = 50;
  const tolerance = 0.005; // 0.005 mm tolerance
  let converged = false;

  for (let step = 1; step <= maxIter; step++) {
    const res = evaluateDepthC(currentC, evalParams);
    const diff = res.c_verified - currentC;

    iterationSteps.push({
      step,
      c_assumed: currentC,
      efe: res.efe,
      ec: res.ec,
      es: res.es,
      beta1: res.beta1,
      alpha1: res.alpha1,
      c_calc: res.c_verified,
      diff,
      converged: Math.abs(diff) < tolerance,
    });

    if (Math.abs(diff) < tolerance) {
      converged = true;
      currentC = res.c_verified;
      break;
    }

    // Successive relaxation update: c_next = 0.5 * (c_assumed + c_calc)
    currentC = currentC + 0.45 * diff;
  }

  // Final equilibrium state
  const finalState = evaluateDepthC(currentC, evalParams);
  const finalEquilibrium = {
    c: finalState.c,
    efe: finalState.efe,
    efd,
    ec: finalState.ec,
    es: finalState.es,
    es_Es: finalState.es_Es,
    fs: finalState.fs,
    ffe: finalState.ffe,
    e_prime_c: finalState.e_prime_c,
    beta1: finalState.beta1,
    alpha1: finalState.alpha1,
    As_fs: finalState.As_fs,
    Af_ffe: finalState.Af_ffe,
    numerator_c: finalState.numerator_c,
    denominator_c: finalState.denominator_c,
    c_calc: finalState.c_verified,
    c_verified: finalState.c_verified,
    diff: finalState.diff,
    isEquilibriumOk: Math.abs(finalState.c_verified - finalState.c) < 0.2,
  };

  // Section XI: Flexural Strength
  const As_fs = As * finalEquilibrium.fs; // N
  const d_minus_beta1_c_div_2 = inputs.d - (finalEquilibrium.beta1 * finalEquilibrium.c) / 2;
  const Mns = (As_fs * d_minus_beta1_c_div_2) * 1e-6; // kN-m

  const Af_ffe = Af * finalEquilibrium.ffe; // N
  const df_minus_beta1_c_div_2 = df - (finalEquilibrium.beta1 * finalEquilibrium.c) / 2;
  const Mnf = (Af_ffe * df_minus_beta1_c_div_2) * 1e-6; // kN-m

  // Section XII: Design Flexural Strength
  const psi_f = 0.85; // ACI 440.2R reduction factor for flexural strengthening

  // phi factor based on tension steel strain es (ACI 318 / 440)
  let phi = 0.90;
  if (finalEquilibrium.es >= 0.005) {
    phi = 0.90;
  } else if (finalEquilibrium.es <= 0.002) {
    phi = 0.65;
  } else {
    phi = 0.65 + 0.25 * ((finalEquilibrium.es - 0.002) / 0.003);
  }

  const phiMn = phi * (Mns + psi_f * Mnf);
  const Mu = inputs.MuDemand;
  const DCR = phiMn > 0 ? Mu / phiMn : 999;
  const strengthMargin = DCR * 100;
  const flexurePass = DCR <= 1.0;

  // Section XIII: Checking service stresses
  const Ms_kNm = inputs.MsService ?? 273.912;
  const Ms_Nmm = Ms_kNm * 1e6;

  const ds_minus_kd_div_3 = inputs.d - c_cracked / 3;
  const df_minus_kd_div_3 = df - c_cracked / 3;
  const ds_minus_kd = inputs.d - c_cracked;
  const df_minus_kd = df - c_cracked;

  // fss equation numerator and denominator
  const term1 = Ms_Nmm + ebi * Af * inputs.Ef * df_minus_kd_div_3;
  const term2 = ds_minus_kd * inputs.Es;
  const num_fss = term1 * term2;

  const den1 = As * inputs.Es * ds_minus_kd_div_3 * ds_minus_kd;
  const den2 = Af * inputs.Ef * df_minus_kd_div_3 * df_minus_kd;
  const den_fss = den1 + den2;

  const fss = den_fss > 0 ? num_fss / den_fss : 0; // N/mm²
  const fss_limit = 0.8 * inputs.fy; // 0.80 fy
  const serviceSteelPass = fss <= fss_limit;

  // Section XIV: Checking creep rupture limit
  const rho_f = Af / (inputs.b * inputs.d);
  const modRatio_s = inputs.Es / Ec;
  const modRatio_f = inputs.Ef / Ec;
  const term_creep = rho_s * modRatio_s + rho_f * modRatio_f;
  const term_creep_sq = Math.pow(term_creep, 2);
  const two_term_creep = 2 * term_creep;
  const sum_under_root_creep = term_creep_sq + two_term_creep;
  const k_creep = Math.sqrt(sum_under_root_creep) - term_creep;
  const k_creep_sq = Math.pow(k_creep, 2);

  const creep_depth_ratio = (df - k_creep * inputs.d) / (inputs.d - k_creep * inputs.d);
  const ffs = fss * (inputs.Ef / inputs.Es) * creep_depth_ratio - ebi * inputs.Ef;
  const ffs_limit = 0.55 * ffu;
  const creepPass = ffs <= ffs_limit;

  return {
    strengtheningLimit,
    strengtheningLimitPass,
    CE,
    ffu,
    efu,
    Af,
    beta1_initial,
    As,
    Ec,
    df,
    h_total,
    fr,
    Ig,
    yt,
    Mcr,
    isCrackedUnderMDL,
    n_ratio,
    rho_s,
    k_elastic,
    c_cracked,
    d_minus_c_cracked,
    df_minus_c_cracked,
    Icr,
    Icr_x10_6,
    Icr_formatted,
    ebi_cracked,
    ebi_uncracked,
    ebi_steel_level,
    ebi_calculated,
    ebi,
    isEbiOverridden,
    efd_calc,
    efd,
    efd_limit,
    efd_pass,
    assumedC_formula,
    assumedC_default,
    isAssumedCOverridden,
    initialTrial,
    finalEquilibrium,
    iterationSteps,
    totalIterations: iterationSteps.length,
    As_fs,
    d_minus_beta1_c_div_2,
    Mns,
    Af_ffe,
    df_minus_beta1_c_div_2,
    Mnf,
    psi_f,
    phi,
    phiMn,
    Mu,
    DCR,
    strengthMargin,
    flexurePass,
    Ms_kNm,
    fss,
    fss_limit,
    serviceSteelPass,
    ds_minus_kd_div_3,
    df_minus_kd_div_3,
    ds_minus_kd,
    df_minus_kd,
    num_fss,
    den_fss,
    rho_f,
    term_creep,
    term_creep_sq,
    two_term_creep,
    sum_under_root_creep,
    k_creep_sq,
    k_creep,
    creep_depth_ratio,
    ffs,
    ffs_limit,
    creepPass,
  };
}

// Calculate Shear Strengthening according to ACI 440.2R Section 10
export function calculateShear(inputs: ShearInputs): ShearResults {
  const CE = getEnvironmentalFactor(inputs.exposureCondition);
  const ffu = CE * inputs.fu;
  const efu = CE * inputs.eu;

  const Afv = 2 * inputs.noOfPlies * inputs.tf * inputs.wf;
  const n_tf_Ef = inputs.noOfPlies * inputs.tf * inputs.Ef;

  // Active bond length Le = 23300 / (n * tf * Ef)^0.58 (ACI 440.2R Eq. 11-8)
  const Le_calculated = n_tf_Ef > 0 ? 23300 / Math.pow(n_tf_Ef, 0.58) : 51.855;
  const isLeOverridden = inputs.LeManual !== undefined && inputs.LeManual > 0;
  const Le = isLeOverridden ? inputs.LeManual! : Le_calculated;

  // Concrete strength factor k1 = (f'c / 27)^(2/3)
  const k1 = Math.pow(inputs.fc / 27, 2 / 3);

  // Depth of FRP shear reinforcement dfv
  const dfv = inputs.scheme === 'completely_wrapped' ? inputs.h : inputs.d;

  let k2 = 1.0;
  if (inputs.scheme === 'u_wrap') {
    k2 = (dfv - Le) / dfv;
  } else if (inputs.scheme === 'two_sided') {
    k2 = (dfv - 2 * Le) / dfv;
  }
  k2 = Math.max(0.1, Math.min(1.0, k2));

  // Bond reduction factor kv
  let kv = (k1 * k2 * Le) / (11900 * efu);
  if (inputs.scheme === 'completely_wrapped') {
    kv = 1.0;
  } else {
    kv = Math.min(0.75, Math.max(0.05, kv));
  }

  // Effective design strain efe <= min(0.004, kv * efu)
  let efe_raw = 0;
  if (inputs.scheme === 'completely_wrapped') {
    efe_raw = Math.min(0.004, 0.75 * efu);
  } else {
    efe_raw = Math.min(0.004, kv * efu);
  }

  // User requirement: "in Shear Retrofit εfe: use the 4 digit value and do not round up or round down"
  // Truncate to 4 decimal places (no round up, no round down):
  const efe = Math.trunc(efe_raw * 10000) / 10000;

  const ffe = efe * inputs.Ef; // MPa

  // FRP shear contribution Vf
  // ACI 440.2R Eq. (11-3): Vf = (Afv * ffe * (sin α + cos α) * dfv) / sf
  // If fiber angle α is 0, trigFactor = 1.0; if α has value, solve (sin α + cos α)
  const angleAlpha = Number(inputs.angleAlpha);
  const trigFactor = (!angleAlpha || angleAlpha === 0)
    ? 1.0
    : (Math.sin((angleAlpha * Math.PI) / 180) + Math.cos((angleAlpha * Math.PI) / 180));
  const Vf = inputs.sf > 0 ? ((Afv * ffe * trigFactor * dfv) / inputs.sf) * 1e-3 : 0; // kN

  const psi_f = inputs.scheme === 'completely_wrapped' ? 0.95 : 0.85;
  const phi = 0.75; // Shear reduction factor ACI 318

  const Vn = inputs.VcExisting + inputs.VsExisting + psi_f * Vf;
  const phiVn = phi * Vn;

  // Maximum shear limit check: Vs + Vf <= 0.66 * sqrt(fc) * b * d
  const maxAllowableVsVf = (0.66 * Math.sqrt(inputs.fc) * inputs.b * inputs.d) * 1e-3;
  const actualVsVf = inputs.VsExisting + Vf;
  const isMaxLimitOk = actualVsVf <= maxAllowableVsVf;
  const VuLimitMax = phi * (inputs.VcExisting + maxAllowableVsVf);

  const DCR = phiVn > 0 ? inputs.VuDemand / phiVn : 999;
  const strengthMargin = DCR > 0 && DCR <= 1.0 ? ((1 / DCR - 1) * 100) : ((1 - DCR) * 100);
  const shearPass = DCR <= 1.0 && isMaxLimitOk;

  return {
    CE,
    ffu,
    efu,
    Afv,
    Le_calculated,
    Le,
    isLeOverridden,
    k1,
    k2,
    kv,
    efe,
    ffe,
    dfv,
    trigFactor,
    Vf,
    psi_f,
    phi,
    Vn,
    phiVn,
    VuLimitMax,
    isMaxLimitOk,
    DCR,
    shearPass,
    maxAllowableVsVf,
    actualVsVf,
    strengthMargin,
    n_tf_Ef,
  };
}
