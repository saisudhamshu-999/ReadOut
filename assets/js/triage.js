/* ==========================================================================
   Readout — Critical Value Clinical Triage Engine
   --------------------------------------------------------------------------
   Automated laboratory panic/critical limit surveillance based on CLSI,
   College of American Pathologists (CAP), and NHS Acute Care Guidelines.
   Identifies values posing imminent health risks that require urgent
   physician notification rather than routine review.
   ========================================================================== */

const CRITICAL_THRESHOLDS = {
  potassium: {
    name: "Serum Potassium",
    criticalLow: 2.8,
    criticalHigh: 6.0,
    unit: "mEq/L",
    lowRisk: "Severe Hypokalemia — Increased vulnerability to cardiac dysrhythmias, muscle paralysis, and ileus.",
    highRisk: "Severe Hyperkalemia — Acute risk of lethal cardiac dysrhythmias (ventricular fibrillation, asystole).",
    action: "Requires emergency medical evaluation and 12-lead ECG today. Contact on-call physician or local urgent care."
  },
  sodium: {
    name: "Serum Sodium",
    criticalLow: 120,
    criticalHigh: 158,
    unit: "mEq/L",
    lowRisk: "Severe Hyponatremia — Neurological risk including cerebral edema, seizures, and altered mental status.",
    highRisk: "Severe Hypernatremia — Severe intracellular dehydration and hyperosmolar encephalopathy risk.",
    action: "Requires immediate clinical assessment and controlled electrolyte correction in a monitored setting."
  },
  glucose: {
    name: "Blood Glucose",
    criticalLow: 50,
    criticalHigh: 400,
    unit: "mg/dL",
    lowRisk: "Severe Hypoglycemia — Risk of neuroglycopenia, loss of consciousness, and seizure.",
    highRisk: "Severe Hyperglycemia — Risk of Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).",
    action: "If symptoms present (confusion, lethargy, diaphoresis), seek emergency medical care immediately."
  },
  hb: {
    name: "Haemoglobin",
    criticalLow: 7.0,
    criticalHigh: 20.0,
    unit: "g/dL",
    lowRisk: "Severe Anemia — Below standard clinical transfusion threshold; hemodynamic compromise risk.",
    highRisk: "Severe Polycythemia — Markedly increased blood viscosity and microvascular thrombosis risk.",
    action: "Prompt clinical consultation recommended today to evaluate etiology and transfusion necessity."
  },
  plt: {
    name: "Platelet Count",
    criticalLow: 30,
    criticalHigh: 1000,
    unit: "×10³/µL",
    lowRisk: "Critical Thrombocytopenia — High risk of spontaneous cutaneous, mucosal, or intracranial hemorrhage.",
    highRisk: "Extreme Thrombocytosis — Hypercoagulability or paradoxical microvascular bleeding.",
    action: "Avoid aspirin/NSAIDs/antiplatelets and contact your hematologist or emergency department today."
  },
  calcium: {
    name: "Serum Calcium",
    criticalLow: 6.5,
    criticalHigh: 13.0,
    unit: "mg/dL",
    lowRisk: "Severe Hypocalcemia — Tetany, laryngospasm, and prolonged QT-interval.",
    highRisk: "Hypercalcemic Crisis — Confusion, severe dehydration, and renal compromise.",
    action: "STAT medical consultation required for immediate parenteral or oral stabilization."
  },
  wbc: {
    name: "White Blood Cell Count",
    criticalLow: 1.5,
    criticalHigh: 35.0,
    unit: "×10³/µL",
    lowRisk: "Severe Agranulocytosis / Neutropenia — Extreme vulnerability to life-threatening bacterial/fungal sepsis.",
    highRisk: "Hyperleukocytosis / Severe Leukemoid Reaction — Acute hematologic or severe systemic infectious process.",
    action: "Immediate medical assessment. If fever (>100.4°F/38°C) is present, present to emergency room immediately."
  }
};

const TriageEngine = {
  getPanicInfo(p) {
    if (!p) return null;
    const id = (p.canonicalId || p.id || "").toLowerCase();
    const val = Number(p.value);
    if (isNaN(val)) return null;

    // Check matching rule
    let rule = null;
    if (id.includes("potassium") || id === "k" || id === "k+") rule = CRITICAL_THRESHOLDS.potassium;
    else if (id.includes("sodium") || id === "na" || id === "na+") rule = CRITICAL_THRESHOLDS.sodium;
    else if (id.includes("glucose") || id === "fbs" || id === "fpg") rule = CRITICAL_THRESHOLDS.glucose;
    else if (id === "hb" || id.includes("haemoglobin") || id.includes("hemoglobin")) rule = CRITICAL_THRESHOLDS.hb;
    else if (id === "plt" || id.includes("platelet")) rule = CRITICAL_THRESHOLDS.plt;
    else if (id.includes("calcium") || id === "ca") rule = CRITICAL_THRESHOLDS.calcium;
    else if (id === "wbc" || id.includes("white blood")) rule = CRITICAL_THRESHOLDS.wbc;

    if (!rule) return null;

    if (rule.criticalLow != null && val <= rule.criticalLow) {
      return {
        param: p,
        rule,
        type: "LOW",
        value: val,
        threshold: rule.criticalLow,
        risk: rule.lowRisk,
        rationale: rule.lowRisk,
        action: rule.action
      };
    } else if (rule.criticalHigh != null && val >= rule.criticalHigh) {
      return {
        param: p,
        rule,
        type: "HIGH",
        value: val,
        threshold: rule.criticalHigh,
        risk: rule.highRisk,
        rationale: rule.highRisk,
        action: rule.action
      };
    }
    return null;
  },

  isPanic(p) {
    return !!this.getPanicInfo(p);
  },

  /**
   * Deterministic 4-category clinical classifier:
   * - Green: Within reference range
   * - Yellow: Outside range but non-urgent
   * - Red: Potentially critical—prompt medical review required
   * - Grey: Value or unit needs manual verification
   */
  classify(p) {
    if (!p) return { category: "grey", label: "Value or unit needs manual verification", color: "grey" };

    // 1. Check for Grey (needs manual verification)
    const isLowConfidence = (p.ocrConfidence != null && p.ocrConfidence < 0.85) || (p.confidence != null && p.confidence < 0.85);
    const isMissingValueOrUnit = p.value == null || p.value === "" || isNaN(Number(p.value)) || !p.unit;
    const isManualVerifyRequired = p.needsVerification === true || p.status === "unverified" || p.status === "unknown";
    const hasNoPrintedRange = p.low == null && p.high == null && !p.refRange;

    if (isLowConfidence || isMissingValueOrUnit || isManualVerifyRequired || hasNoPrintedRange) {
      return {
        category: "grey",
        name: "Grey",
        label: "Value or unit needs manual verification",
        statusText: "Needs manual verification",
        dotClass: "dot--grey",
        chipClass: "chip--grey",
        badgeClass: "badge-grey",
        pinClass: "gauge-pin--grey",
        colorHex: "#64748b",
        bgHex: "#f1f5f9",
        urgent: false,
        reason: isLowConfidence
          ? `Low OCR confidence (${Math.round((p.ocrConfidence || p.confidence || 0) * 100)}%). Manual review required before trusting extraction.`
          : (isMissingValueOrUnit ? "Incomplete numeric value or unit extracted from document." : "Reference range not printed on source document; cannot evaluate.")
      };
    }

    // 2. Check for Red (Potentially critical) - strictly crosses validated threshold
    const panicInfo = this.getPanicInfo(p);
    if (panicInfo) {
      return {
        category: "red",
        name: "Red",
        label: "Potentially critical—prompt medical review required",
        statusText: "Potentially critical",
        dotClass: "dot--critical",
        chipClass: "chip--critical",
        badgeClass: "badge-red",
        pinClass: "gauge-pin--critical",
        colorHex: "#dc2626",
        bgHex: "#fee2e2",
        urgent: true,
        panicInfo,
        reason: `Crosses established hospital critical threshold (${panicInfo.type === 'LOW' ? '≤' : '≥'} ${panicInfo.threshold} ${panicInfo.rule.unit}). Prompt medical review required.`
      };
    }

    // 3. Check for Yellow (Outside range but non-urgent)
    const val = Number(p.value);
    const isHigh = p.high != null && val > p.high;
    const isLow = p.low != null && val < p.low;
    if (isHigh || isLow) {
      return {
        category: "yellow",
        name: "Yellow",
        label: "Outside range but non-urgent",
        statusText: "Outside range (non-urgent)",
        dotClass: "dot--yellow",
        chipClass: "chip--yellow",
        badgeClass: "badge-yellow",
        pinClass: "gauge-pin--yellow",
        colorHex: "#d97706",
        bgHex: "#fef3c7",
        urgent: false,
        direction: isHigh ? "above" : "below",
        limit: isHigh ? p.high : p.low,
        reason: `Result is ${isHigh ? 'above' : 'below'} the laboratory's reference range (${p.low ?? 0}–${p.high} ${p.unit}), but does not cross critical alarm limits.`
      };
    }

    // 4. Otherwise Green (Within reference range)
    return {
      category: "green",
      name: "Green",
      label: "Within reference range",
      statusText: "Within the laboratory reference range.",
      dotClass: "dot--green",
      chipClass: "chip--green",
      badgeClass: "badge-green",
      pinClass: "gauge-pin--green",
      colorHex: "#16a34a",
      bgHex: "#dcfce7",
      urgent: false,
      reason: "Within the laboratory reference range."
    };
  },

  evaluate(parameters = []) {
    const criticals = [];
    const yellows = [];
    const greens = [];
    const greys = [];

    parameters.forEach((p) => {
      const cls = this.classify(p);
      p._classification = cls;
      if (cls.category === "red") criticals.push({ ...cls.panicInfo, classification: cls });
      else if (cls.category === "yellow") yellows.push(p);
      else if (cls.category === "green") greens.push(p);
      else greys.push(p);
    });

    return {
      hasCritical: criticals.length > 0,
      criticals,
      yellows,
      greens,
      greys,
      counts: {
        total: parameters.length,
        red: criticals.length,
        yellow: yellows.length,
        green: greens.length,
        grey: greys.length
      }
    };
  },

  renderBanner(triageResult, targetElement) {
    if (!targetElement) return;

    if (!triageResult || !triageResult.hasCritical) {
      targetElement.innerHTML = `
        <div style="display:inline-flex;align-items:center;gap:8px;background:var(--surface-sunk);border:1px solid var(--line);padding:6px 12px;border-radius:16px;font-size:12px;color:var(--ink-2);margin-bottom:14px">
          <span style="color:#16a34a;font-size:13px">🛡️</span>
          <span><strong>Medical Safety Surveillance:</strong> No result met the system’s predefined critical-value thresholds.</span>
        </div>
      `;
      return;
    }

    const itemsHtml = triageResult.criticals.map((c) => `
      <div style="background:#fff;border-left:4px solid #dc2626;padding:12px 14px;border-radius:4px;margin-top:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <strong style="color:#991b1b;font-size:13.5px">
            🚨 ${esc(c.param.name)}: <span class="num">${c.value} ${esc(c.param.unit)}</span>
          </strong>
          <span style="background:#fee2e2;color:#991b1b;font-weight:700;padding:2px 8px;border-radius:10px;font-size:11px">
            POTENTIALLY CRITICAL ${c.type} (Threshold: ${c.type === 'LOW' ? '≤' : '≥'} ${c.threshold} ${c.rule.unit})
          </span>
        </div>
        <p style="font-size:12.5px;color:#7f1d1d;margin:6px 0 4px;line-height:1.45">
          <strong>Clinical Risk:</strong> ${esc(c.risk)}
        </p>
        <p style="font-size:12px;color:#1e293b;margin:0;font-weight:500">
          <strong>Validated Action Protocol:</strong> ${esc(c.action)}
        </p>
      </div>
    `).join("");

    targetElement.innerHTML = `
      <div class="card" style="background:#fef2f2;border:2px solid #ef4444;border-radius:var(--r-md);padding:16px 18px;margin-bottom:20px;box-shadow:0 4px 14px rgba(220,38,38,0.12)">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="font-size:24px;line-height:1">🚨</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
              <h2 style="font-size:16px;color:#991b1b;margin:0;font-weight:700">
                Prompt Medical Review Required (${triageResult.counts.red} Potentially Critical ${triageResult.counts.red === 1 ? 'Value' : 'Values'})
              </h2>
              <span style="background:#dc2626;color:#fff;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:12px;text-transform:uppercase;letter-spacing:0.04em">
                Emergency Triage Alert
              </span>
            </div>
            <p style="font-size:12.5px;color:#7f1d1d;margin:6px 0 8px;line-height:1.5">
              One or more values cross predefined clinical safety thresholds. Red status is reserved strictly for acute physiological abnormalities requiring direct medical review today.
            </p>
            ${itemsHtml}
            <div style="margin-top:12px;padding-top:10px;border-top:1px solid #fecaca;font-size:11.5px;color:#991b1b;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <span>⚠️ Do not stop or alter prescription medications without physician confirmation.</span>
              <span style="font-weight:600">Take this original report to your urgent care or physician.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

const MedicalSafetyEngine = TriageEngine;
window.MedicalSafetyEngine = MedicalSafetyEngine;
window.TriageEngine = TriageEngine;
window.CRITICAL_THRESHOLDS = CRITICAL_THRESHOLDS;
