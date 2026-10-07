export const EXCEL_VBA_CODE = `' ==============================================================================
' EXCEL VBA MACRO FOR CFRP NEUTRAL AXIS (C) EQUILIBRIUM ITERATION
' Code Module: Sheet1_Flexural_CFRP_Iteration
' Standard: ACI 440.2R Flexural Strengthening of RC Beams
' ==============================================================================

Option Explicit

Public Sub Solve_Equilibrium_NeutralAxis()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Read Section Dimensions & Reinforcement
    Dim b As Double, d As Double, df As Double, As_bar As Double, Af As Double
    Dim fc As Double, fy As Double, Ec As Double, Es As Double, Ef As Double
    Dim ebi As Double, efd As Double, e_prime_c As Double
    
    b = ws.Range("Width_b").Value               ' mm
    d = ws.Range("Eff_Depth_d").Value           ' mm
    df = ws.Range("Depth_Df").Value             ' mm
    As_bar = ws.Range("Rebar_As").Value         ' mm^2
    Af = ws.Range("CFRP_Af").Value              ' mm^2
    fc = ws.Range("Conc_fc").Value              ' MPa
    fy = ws.Range("Steel_fy").Value             ' MPa
    Ec = ws.Range("Conc_Ec").Value              ' MPa
    Es = ws.Range("Steel_Es").Value             ' MPa
    Ef = ws.Range("CFRP_Ef").Value              ' MPa
    ebi = ws.Range("Substrate_ebi").Value       ' initial strain
    efd = ws.Range("CFRP_efd").Value            ' debonding limit strain
    
    e_prime_c = (1.7 * fc) / Ec
    
    ' Iteration parameters
    Dim c_guess As Double, c_calc As Double
    Dim diff As Double, tolerance As Double
    Dim maxIter As Long, i As Long
    Dim damping As Double
    
    c_guess = ws.Range("Assumed_C").Value       ' Initial guess: 0.20 * d
    tolerance = 0.005                           ' Convergence tolerance (mm)
    maxIter = 100
    damping = 0.45                              ' Numerical relaxation factor
    
    Dim efe As Double, ec As Double, es As Double
    Dim fs As Double, ffe As Double
    Dim beta1 As Double, alpha1 As Double
    Dim T_tension As Double, C_compression As Double
    
    ' Clear prior iteration log table if present
    ws.Range("IterationLog").ClearContents
    
    For i = 1 To maxIter
        ' Check strain compatibility
        Dim efe_geom As Double
        efe_geom = 0.003 * ((df - c_guess) / c_guess) - ebi
        
        If efe_geom <= efd Then
            ' Concrete crushing governs
            efe = efe_geom
            ec = 0.003
        Else
            ' FRP debonding governs
            efe = efd
            ec = (efe + ebi) * (c_guess / (df - c_guess))
        End If
        
        ' Steel strain and stresses
        es = (efe + ebi) * ((d - c_guess) / (df - c_guess))
        fs = Application.Min(es * Es, fy)
        ffe = efe * Ef
        
        ' Whitney/Parabolic stress block factors
        beta1 = (4 * e_prime_c - ec) / (6 * e_prime_c - 2 * ec)
        If beta1 < 0.65 Then beta1 = 0.65
        If beta1 > 0.85 Then beta1 = 0.85
        
        alpha1 = (3 * e_prime_c * ec - ec ^ 2) / (3 * beta1 * (e_prime_c ^ 2))
        If alpha1 > 1# Then alpha1 = 1#
        If alpha1 < 0.5 Then alpha1 = 0.5
        
        ' Internal equilibrium: Tension = Compression
        ' T = As*fs + Af*ffe
        ' C = alpha1 * fc * beta1 * b * c
        ' => c_calc = (As*fs + Af*ffe) / (alpha1 * fc * beta1 * b)
        T_tension = As_bar * fs + Af * ffe
        c_calc = T_tension / (alpha1 * fc * beta1 * b)
        
        diff = c_calc - c_guess
        
        ' Write step to Iteration Sheet Log
        ws.Cells(100 + i, 1).Value = i
        ws.Cells(100 + i, 2).Value = Round(c_guess, 4)
        ws.Cells(100 + i, 3).Value = Round(efe, 6)
        ws.Cells(100 + i, 4).Value = Round(ec, 6)
        ws.Cells(100 + i, 5).Value = Round(beta1, 4)
        ws.Cells(100 + i, 6).Value = Round(alpha1, 4)
        ws.Cells(100 + i, 7).Value = Round(c_calc, 4)
        ws.Cells(100 + i, 8).Value = Round(diff, 5)
        
        If Abs(diff) <= tolerance Then
            ' Converged!
            ws.Range("Final_C").Value = Round(c_calc, 2)
            ws.Range("Equilibrium_Status").Value = "OK"
            Exit Sub
        End If
        
        ' Update c_guess with relaxation to prevent oscillatory divergence
        c_guess = c_guess + damping * diff
    Next i
    
    MsgBox "Maximum iterations reached. Final c = " & Round(c_calc, 2) & " mm", vbExclamation
End Sub
`;
