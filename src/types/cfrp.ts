export interface CfrpInputs {
  // Parameters
  MDL: number; // Dead load moment (kN-m)
  MLL: number; // Live load moment (kN-m)
  loadManualOverride?: number; // Optional manual override for 1.1MDL + 0.75MLL
  assumedC_initial: number; // Assumed initial C (mm)
  Es: number; // Modulus of elasticity of steel (MPa, typically 200,000)

  // Material Properties (CFRP)
  fu: number; // Ultimate tensile strength (MPa)
  eu: number; // Ultimate rupture strain (e.g. 0.015)
  Ef: number; // Modulus of elasticity of CFRP (MPa / N/mm², e.g. 37,000)
  cfrpBrand: string; // Brand name

  // Design Capacity & Existing Section
  phiMnExisting: number; // Existing phi Mn (kN-m)
  fc: number; // Concrete compressive strength f'c (MPa)
  fy: number; // Steel yield strength (MPa)
  noOfBars: number; // Tension rebar count
  barDiameter: number; // Tension rebar diameter (mm)
  d: number; // Effective depth to rebar (mm)
  b: number; // Beam width (mm)
  Cc: number; // Distance from rebar center to bottom soffit (mm)
  dfManual?: number; // Depth to CFRP (mm), default d + Cc

  // Carbon Fiber Parameters
  noOfPlies: number; // n (pcs)
  tf: number; // Thickness per ply (mm)
  wf: number; // CFRP laminate width (mm)

  // Exposure Condition
  exposureCondition: 'Interior' | 'Exterior' | 'Aggressive';

  // Moment Demand
  MuDemand: number; // Factored moment demand Mu (kN-m)

  // Service Moment
  MsService?: number; // Service moment Ms (kN-m), default MDL + MLL or MDL + 0.75MLL

  // Initial Substrate Strain Override
  ebiManual?: number; // Optional manual override for initial substrate strain εbi
  ebiMode?: 'auto' | 'cracked_soffit' | 'steel_level' | 'uncracked'; // Calculation mode

  // Project Info
  projectTitle: string;
  engineerName: string;
  checkedBy?: string;
  structureName: string;
  beamId: string;
  date: string;
}

export interface IterationStep {
  step: number;
  c_assumed: number;
  efe: number;
  ec: number;
  es: number;
  beta1: number;
  alpha1: number;
  c_calc: number;
  diff: number;
  converged: boolean;
}

export interface FlexureResults {
  // Pre-checks
  strengtheningLimit: number; // 1.1 MDL + 0.75 MLL
  strengtheningLimitPass: boolean;

  // I. CFRP System Design Material Properties
  CE: number;
  ffu: number;
  efu: number;

  // II. Preliminary Calculation
  Af: number;
  beta1_initial: number;
  As: number;
  Ec: number;
  df: number;

  // III. Existing State of strain on the soffit
  h_total: number;
  fr: number; // Modulus of rupture (MPa)
  Ig: number; // Gross moment of inertia (mm^4)
  yt: number; // Distance from neutral axis to tension face in gross section (mm)
  Mcr: number; // Cracking moment (kN-m)
  isCrackedUnderMDL: boolean; // Whether MDL exceeds Mcr
  n_ratio: number;
  rho_s: number;
  k_elastic: number;
  c_cracked: number;
  d_minus_c_cracked: number;
  df_minus_c_cracked: number;
  Icr: number;
  Icr_x10_6: number; // Value in 10^6 mm^4 (e.g. 2471 matching ACI 440 Step 3)
  Icr_formatted: string; // e.g. "2471 × 10⁶ mm⁴"
  ebi_cracked: number;
  ebi_uncracked: number;
  ebi_steel_level: number;
  ebi_calculated: number;
  ebi: number;
  isEbiOverridden: boolean;

  // IV. Design strain of the CFRP system
  efd_calc: number; // Raw calculated debonding strain: 0.41 * sqrt(fc / (n * Ef * tf))
  efd: number; // Governing design strain: min(efd_calc, efd_limit)
  efd_limit: number;
  efd_pass: boolean;

  // V. Estimating Depth C
  assumedC_formula: number; // 20% x Effective depth (0.20 * d)
  assumedC_default: number;
  isAssumedCOverridden: boolean;

  // VI. Initial Assumed C trial (Section VI - IX)
  initialTrial: {
    c: number;
    efe_geom: number;
    efe: number;
    debondingControls: boolean;
    ec: number;
    ec_pass: boolean;
    es: number;
    es_Es: number;
    fs: number;
    ffe: number;
    e_prime_c: number;
    beta1: number;
    alpha1: number;
    As_fs: number;
    Af_ffe: number;
    numerator_c: number;
    denominator_c: number;
    T_tension: number;
    c_verified: number;
    diff: number;
    inEquilibrium: boolean;
  };

  // X. Recalculated Depth C (VBA Iteration Final Result)
  finalEquilibrium: {
    c: number;
    efe: number;
    efd: number;
    ec: number;
    es: number;
    es_Es: number;
    fs: number;
    ffe: number;
    e_prime_c: number;
    beta1: number;
    alpha1: number;
    As_fs: number;
    Af_ffe: number;
    numerator_c: number;
    denominator_c: number;
    c_calc: number;
    c_verified: number;
    diff: number;
    isEquilibriumOk: boolean;
  };

  // Iteration history log
  iterationSteps: IterationStep[];
  totalIterations: number;

  // XI. Flexural Strength
  As_fs: number;
  d_minus_beta1_c_div_2: number;
  Mns: number; // kN-m
  Af_ffe: number;
  df_minus_beta1_c_div_2: number;
  Mnf: number; // kN-m

  // XII. Design Flexural Strength
  psi_f: number;
  phi: number;
  phiMn: number; // kN-m
  Mu: number;
  DCR: number;
  strengthMargin: number;
  flexurePass: boolean;

  // XIII. Checking service stresses
  Ms_kNm: number;
  fss: number; // N/mm²
  fss_limit: number; // 0.8 fy
  serviceSteelPass: boolean;
  ds_minus_kd_div_3: number;
  df_minus_kd_div_3: number;
  ds_minus_kd: number;
  df_minus_kd: number;
  num_fss: number;
  den_fss: number;

  // XIV. Checking creep rupture limit
  rho_f: number;
  term_creep: number; // (ρs Es/Ec + ρf Ef/Ec)
  term_creep_sq: number; // (term)^2
  two_term_creep: number; // 2 * term
  sum_under_root_creep: number; // term^2 + 2*term
  k_creep_sq: number; // k^2
  k_creep: number;
  creep_depth_ratio: number; // (df - kd)/(d - kd)
  ffs: number; // N/mm²
  ffs_limit: number; // 0.55 ffu
  creepPass: boolean;
}

export interface ShearInputs {
  VuDemand: number; // Factored shear demand (kN)
  VcExisting: number; // Concrete shear capacity (kN)
  VsExisting: number; // Existing steel stirrup capacity (kN)
  d: number; // Effective depth (mm)
  b: number; // Beam web width (mm)
  h: number; // Beam total depth (mm)
  fc: number; // f'c (MPa)
  fu: number; // CFRP tensile strength (MPa)
  eu: number; // CFRP ultimate strain
  Ef: number; // CFRP modulus (MPa)
  tf: number; // Single ply thickness (mm)
  wf: number; // Strip width (mm)
  sf: number; // Center to center spacing of strips (mm)
  noOfPlies: number;
  scheme: 'completely_wrapped' | 'u_wrap' | 'two_sided';
  angleAlpha: number; // Fiber orientation angle (deg, usually 90)
  exposureCondition: 'Interior' | 'Exterior' | 'Aggressive';
  LeManual?: number; // Optional manual override for active bond length Le (mm)
  cfrpBrand?: string;
  projectTitle?: string;
  engineerName?: string;
  checkedBy?: string;
  structureName?: string;
  beamId?: string;
  date?: string;
}

export interface ShearResults {
  CE: number;
  ffu: number;
  efu: number;
  Afv: number; // 2 * n * tf * wf
  Le_calculated: number; // Formula calculated active bond length
  Le: number; // Active bond length (effective value used in calculations)
  isLeOverridden: boolean;
  k1: number;
  k2: number;
  kv: number; // Bond reduction factor
  efe: number; // Effective design strain
  ffe: number; // Effective design stress
  dfv: number; // Effective depth of FRP shear
  trigFactor: number; // Fiber angle trigonometric factor (sin α + cos α), or 1.0 if α is 0
  Vf: number; // FRP shear strength (kN)
  psi_f: number; // 0.95 for completely wrapped, 0.85 for U-wrap
  phi: number; // 0.75 for shear
  Vn: number; // Vc + Vs + psi_f * Vf
  phiVn: number;
  VuLimitMax: number; // Max allowable shear limit
  isMaxLimitOk: boolean;
  DCR: number;
  shearPass: boolean;
  maxAllowableVsVf: number; // 0.66 * sqrt(fc) * b * d (kN)
  actualVsVf: number; // Vs + Vf (kN)
  strengthMargin: number; // %
  n_tf_Ef: number; // n * tf * Ef (N/mm)
}

export interface CfrpPreset {
  id: string;
  brand: string;
  name: string;
  manufacturer: string;
  type: string;
  fu: number;
  eu: number;
  Ef: number;
  tf: number;
  description: string;
  tdsReference?: string;
  curedSystem?: string;
}
