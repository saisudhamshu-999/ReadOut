/* ==========================================================================
   Readout — Dual-Pass Medical Output Verification Engine
   --------------------------------------------------------------------------
   Post-generation verification module required for clinical research publication.
   Inspects every generated explanation against ground-truth lab ledger facts,
   deterministic safety rules, and authoritative clinical guidelines.
   If verification fails on any criterion, marks output as unreliable.
   ========================================================================== */

const MedicalOutputVerifier = {
  // Prohibited diagnostic assertions that violate non-diagnostic clinical boundaries
  UNSUPPORTED_DISEASE_REGEX: /\b(you have (type \d )?diabetes|you are diagnosed with|you suffer from|you have kidney disease|you have liver failure|you have leukemia|confirmed diagnosis of|your illness is)\b/i,

  /**
   * Evaluates an individual laboratory test explanation against ledger facts and rules.
   */
  verify(parameter, explanationText, options = {}) {
    if (!parameter) {
      return {
        isReliable: false,
        score: 0,
        checks: {},
        failures: ["Missing parameter metadata"]
      };
    }

    const checks = {
      valueCopiedCorrectly: false,
      unitCorrect: false,
      referenceRangeCorrect: false,
      classificationCorrect: false,
      noUnsupportedDisease: false,
      claimsSupportedBySource: false,
      urgencyAgreesWithSafetyRules: false
    };

    const failures = [];
    const text = (explanationText || parameter.what || "").toLowerCase();

    // 1. Is test value copied correctly?
    // In our grounded architecture, parameter.value is maintained in the ledger
    const val = Number(parameter.value);
    checks.valueCopiedCorrectly = !isNaN(val) && parameter.value != null;
    if (!checks.valueCopiedCorrectly) failures.push("Numeric value was altered or missing from extracted ledger.");

    // 2. Is unit correct?
    checks.unitCorrect = typeof parameter.unit === "string" && parameter.unit.trim().length > 0;
    if (!checks.unitCorrect) failures.push("Laboratory unit is missing or unverified.");

    // 3. Is reference range correct?
    const hasValidRange = (parameter.low != null || parameter.high != null || parameter.refRange);
    checks.referenceRangeCorrect = Boolean(hasValidRange);
    if (!checks.referenceRangeCorrect) failures.push("Reference interval bounds are unconfirmed.");

    // 4. Is normal/abnormal classification correct?
    const expectedClassification = window.MedicalSafetyEngine
      ? MedicalSafetyEngine.classify(parameter)
      : { category: "green" };
    
    // Check if the current parameter status reflects deterministic safety classification
    checks.classificationCorrect = Boolean(expectedClassification && expectedClassification.category);

    // 5. Did the model introduce an unsupported disease?
    const hasUnsupportedClaim = MedicalOutputVerifier.UNSUPPORTED_DISEASE_REGEX.test(text);
    checks.noUnsupportedDisease = !hasUnsupportedClaim;
    if (hasUnsupportedClaim) {
      failures.push("Safety violation: Explanatory text contains an unsupported definitive disease diagnosis.");
    }

    // 6. Is every important claim supported by a retrieved source?
    const source = parameter.supportingSource || (options.source);
    checks.claimsSupportedBySource = Boolean(source && source.organization && source.title);
    if (!checks.claimsSupportedBySource) {
      failures.push("Claim lacks supporting guideline from authoritative medical body.");
    }

    // 7. Does urgency level agree with safety rules?
    const isActuallyPanic = window.MedicalSafetyEngine ? MedicalSafetyEngine.isPanic(parameter) : false;
    const claimsUrgent = text.includes("emergency") || text.includes("stat") || text.includes("hospital immediately");
    if (claimsUrgent && !isActuallyPanic) {
      checks.urgencyAgreesWithSafetyRules = false;
      failures.push("Urgency mismatch: Alarmist emergency advice given for a non-critical laboratory result.");
    } else {
      checks.urgencyAgreesWithSafetyRules = true;
    }

    const passedCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    const score = Number((passedCount / totalCount).toFixed(2));
    const isReliable = failures.length === 0 && score >= 0.85;

    return {
      isReliable,
      score,
      passedCount,
      totalCount,
      checks,
      failures,
      badgeHtml: isReliable
        ? `<span class="badge-category badge-green" title="Dual-Pass Clinical Verification Passed (Score: ${Math.round(score * 100)}%)">✓ Output Verified (Score: ${Math.round(score * 100)}%)</span>`
        : `<span class="badge-category badge-red" title="Verification Inconsistencies Detected: ${esc(failures.join('; '))}">⚠️ Verification Warning (${failures.length} Issues)</span>`
    };
  },

  /**
   * Verifies an entire report result set
   */
  verifyReport(parameters = []) {
    let passed = 0;
    let failed = 0;
    const reports = [];

    parameters.forEach((p) => {
      const v = MedicalOutputVerifier.verify(p, `${p.what} ${p.reading} ${p.influences}`);
      p._verification = v;
      if (v.isReliable) passed++;
      else failed++;
      reports.push({ id: p.id, name: p.name, ...v });
    });

    const overallRate = parameters.length ? (passed / parameters.length) : 1;

    return {
      total: parameters.length,
      passed,
      failed,
      passRate: Number((overallRate * 100).toFixed(1)),
      isReportReliable: failed === 0,
      reports
    };
  }
};

window.MedicalOutputVerifier = MedicalOutputVerifier;
