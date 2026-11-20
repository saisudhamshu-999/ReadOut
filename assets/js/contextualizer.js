/* ==========================================================================
   Readout — Smart Clinical Context Engine
   --------------------------------------------------------------------------
   Pre-analytical variables (fasting state, meal timing, medications,
   supplements, and comorbidities) substantially alter laboratory interpretations.
   Collects only relevant clinical information, attributes interpretations
   explicitly, and detects drug-lab and postprandial interferences.
   ========================================================================== */

const Contextualizer = {
  // Stored state
  getState() {
    return Store.get("clinical_context", {
      age: 41,
      sex: "Female",
      fastingStatus: "fasting", // "fasting" | "non_fasting" | "unconfirmed"
      fastingHours: 10,
      timeSinceLastMeal: 10,
      medications: "Metformin 500mg daily",
      supplements: "Vitamin D3 2000 IU",
      conditions: "Prediabetes, Dyslipidemia",
      biotin: false,
      thyroidMeds: false,
      steroids: false,
      diuretics: false
    });
  },

  setState(updates) {
    const current = Contextualizer.getState();
    const next = { ...current, ...updates };
    Store.set("clinical_context", next);
    return next;
  },

  /**
   * Generates clear patient context attribution statements required for clinical research:
   * E.g. "This interpretation considered that the sample was collected after 10 hours of fasting."
   * Or: "Fasting status was not confirmed; interpretation may therefore be limited."
   */
  getContextSummaryStatement() {
    const s = Contextualizer.getState();
    if (s.fastingStatus === "unconfirmed") {
      return "Fasting status was not confirmed; interpretation may therefore be limited.";
    }
    if (s.fastingStatus === "fasting") {
      const hrs = s.fastingHours || s.timeSinceLastMeal || 10;
      return `This interpretation considered that the sample was collected after ${hrs} hours of fasting.`;
    }
    const hrs = s.timeSinceLastMeal || 2;
    return `This interpretation considered that the sample was non-fasting (${hrs} hours since last meal).`;
  },

  /**
   * Returns complete audit disclosure of which patient information was used in the interpretation.
   */
  getDisclosedContext() {
    const s = Contextualizer.getState();
    const meds = s.medications ? s.medications.trim() : "None reported";
    const supps = s.supplements ? s.supplements.trim() : "None reported";
    const conds = s.conditions ? s.conditions.trim() : "None reported";

    return {
      demographics: `Age: ${s.age || '41'}, Sex: ${s.sex || 'Female'}`,
      fastingStatement: Contextualizer.getContextSummaryStatement(),
      fastingStatus: s.fastingStatus,
      fastingHours: s.fastingHours,
      timeSinceLastMeal: s.timeSinceLastMeal,
      medications: meds,
      supplements: supps,
      conditions: conds,
      isFastingConfirmed: s.fastingStatus !== "unconfirmed"
    };
  },

  /**
   * Evaluates active context against current parameters and returns
   * alerts and individual parameter annotations.
   */
  evaluate(parameters = []) {
    const state = Contextualizer.getState();
    const alerts = [];
    const annotations = {}; // paramId -> array of badges/notes

    // 1. Fasting Status Evaluation
    if (state.fastingStatus === "unconfirmed") {
      alerts.push({
        id: "unconfirmed-fasting-alert",
        type: "warning",
        icon: "⚠️",
        title: "Fasting Status Unconfirmed",
        message: "Fasting status was not confirmed; interpretation may therefore be limited. Fasting glucose and triglycerides cannot be definitively graded as basal fasting metrics without confirmed fasting duration."
      });
      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id.includes("glucose") || id === "fbs" || id === "tg" || id.includes("triglyceride")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Fasting Unconfirmed",
            color: "#92400e",
            bg: "#fef3c7",
            detail: "Fasting status was not confirmed; interpretation may therefore be limited."
          });
        }
      });
    } else if (state.fastingStatus === "non_fasting") {
      alerts.push({
        id: "non-fasting-alert",
        type: "info",
        icon: "⏱️",
        title: `Non-Fasting State Active (${state.timeSinceLastMeal || 2}h Postprandial)`,
        message: `This interpretation considered that the sample was collected non-fasting. Blood glucose and serum triglycerides rise physiologically after meals. A 10–12 hour overnight fasting blood draw is required to confirm impaired fasting glucose or calculate accurate Friedewald LDL-C.`
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id.includes("glucose") || id === "fbs" || id === "fpg") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Postprandial Context",
            color: "#0369a1",
            bg: "#e0f2fe",
            detail: "Elevated glucose (120–140 mg/dL) can be normal post-meal in non-diabetic individuals."
          });
        } else if (id === "tg" || id.includes("triglyceride")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Postprandial Lipemia",
            color: "#0369a1",
            bg: "#e0f2fe",
            detail: "Chylomicron production after food intake increases serum triglycerides 20–50%."
          });
        }
      });
    } else {
      // Confirmed fasting
      alerts.push({
        id: "confirmed-fasting-note",
        type: "success",
        icon: "✓",
        title: "Confirmed Fasting Context",
        message: Contextualizer.getContextSummaryStatement()
      });
    }

    // 2. Biotin (Vitamin B7) Interference
    const hasBiotin = state.biotin || (state.supplements && state.supplements.toLowerCase().includes("biotin"));
    if (hasBiotin) {
      alerts.push({
        id: "biotin-alert",
        type: "warning",
        icon: "⚠️",
        title: "Biotin Immunoassay Interference Risk (FDA Safety Advisory)",
        message: "High-dose biotin (>5 mg/day) interferes with streptavidin-biotin immunoassays (falsely low TSH, falsely elevated FT4). Endocrine Society guidelines advise stopping biotin 48–72 hours prior to repeat."
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id === "tsh" || id.includes("thyroid")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Biotin Interference",
            color: "#c2410c",
            bg: "#ffedd5",
            detail: "Biotin supplement intake may artificially suppress TSH on immunoassays."
          });
        }
      });
    }

    // 3. Steroids
    const hasSteroids = state.steroids || (state.medications && state.medications.toLowerCase().includes("prednisone"));
    if (hasSteroids) {
      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id.includes("glucose") || id === "fbs") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Steroid Effect",
            color: "#6b21a8",
            bg: "#f3e8ff",
            detail: "Glucocorticoids induce hepatic gluconeogenesis and peripheral insulin resistance."
          });
        } else if (id === "wbc") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Steroid Leukocytosis",
            color: "#6b21a8",
            bg: "#f3e8ff",
            detail: "Steroids demarginate intravascular neutrophils, causing isolated benign WBC elevation."
          });
        }
      });
    }

    return {
      alerts,
      annotations,
      state,
      statement: Contextualizer.getContextSummaryStatement(),
      disclosure: Contextualizer.getDisclosedContext()
    };
  },

  renderBar(targetElement, onUpdate) {
    if (!targetElement) return;
    const state = Contextualizer.getState();
    const statement = Contextualizer.getContextSummaryStatement();

    targetElement.innerHTML = `
      <div class="card" style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 18px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px">
          <div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:15px">⏱️</span>
              <h3 style="margin:0;font-size:13.5px;font-weight:700;color:var(--ink)">Patient Clinical Context & Pre-Analytical Attribution</h3>
              <span class="chip chip--in" style="font-size:10px;padding:1px 6px">Research Grade</span>
            </div>
            <p style="margin:3px 0 0 0;font-size:12px;color:var(--ink-2);font-weight:500">
              ${esc(statement)}
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" id="edit-patient-context-btn" style="font-size:11.5px;padding:4px 10px">
            ⚙️ Edit Patient Context
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-top:8px;border-top:1px dashed var(--line)">
          <!-- Fasting State Radio Group -->
          <div style="display:inline-flex;background:var(--surface-sunk);padding:2px;border-radius:18px;border:1px solid var(--line);gap:2px">
            <button type="button" class="btn btn-sm ctx-fast-btn ${state.fastingStatus === 'fasting' ? 'btn-primary' : 'btn-ghost'}" data-status="fasting" style="padding:3px 10px;font-size:11px;border-radius:14px">
              ✓ Fasting (${state.fastingHours || 10}h)
            </button>
            <button type="button" class="btn btn-sm ctx-fast-btn ${state.fastingStatus === 'non_fasting' ? 'btn-primary' : 'btn-ghost'}" data-status="non_fasting" style="padding:3px 10px;font-size:11px;border-radius:14px">
              Non-Fasting (${state.timeSinceLastMeal || 2}h)
            </button>
            <button type="button" class="btn btn-sm ctx-fast-btn ${state.fastingStatus === 'unconfirmed' ? 'btn-primary' : 'btn-ghost'}" data-status="unconfirmed" style="padding:3px 10px;font-size:11px;border-radius:14px">
              ⚠️ Unconfirmed
            </button>
          </div>

          <div style="font-size:11.5px;color:var(--ink-3);display:flex;gap:10px;flex-wrap:wrap">
            <span>Age: <strong>${esc(state.age || 41)}</strong></span>
            <span>Sex: <strong>${esc(state.sex || 'Female')}</strong></span>
            <span>Meds: <strong>${esc(state.medications || 'None reported')}</strong></span>
            <span>Supplements: <strong>${esc(state.supplements || 'None reported')}</strong></span>
          </div>
        </div>

        <div id="ctx-alerts-box" style="margin-top:10px"></div>
      </div>
    `;

    Contextualizer.renderAlertsBox($("#ctx-alerts-box"));

    // Event listeners
    $$(".ctx-fast-btn", targetElement).forEach((btn) => {
      btn.addEventListener("click", () => {
        const status = btn.dataset.status;
        Contextualizer.setState({ fastingStatus: status, fasting: status === "fasting" });
        Contextualizer.renderBar(targetElement, onUpdate);
        if (typeof onUpdate === "function") onUpdate();
      });
    });

    const editBtn = $("#edit-patient-context-btn", targetElement);
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        Contextualizer.openEditModal(() => {
          Contextualizer.renderBar(targetElement, onUpdate);
          if (typeof onUpdate === "function") onUpdate();
        });
      });
    }
  },

  openEditModal(onSave) {
    const s = Contextualizer.getState();
    const modalNode = el(`<div>
      <h2>Patient Context Attribution</h2>
      <p class="card-sub" style="margin-bottom:14px">
        Only relevant clinical variables required for laboratory interpretation are collected.
      </p>

      <form id="patient-context-form" style="display:flex;flex-direction:column;gap:12px">
        <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Age:</label>
            <input type="number" id="pctx-age" value="${esc(s.age || 41)}" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
          </div>
          <div>
            <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Biological Sex:</label>
            <select id="pctx-sex" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
              <option value="Female" ${s.sex === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Male" ${s.sex === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Other" ${s.sex === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Fasting / Non-Fasting Status:</label>
          <select id="pctx-fasting-status" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
            <option value="fasting" ${s.fastingStatus === 'fasting' ? 'selected' : ''}>Fasting (water only)</option>
            <option value="non_fasting" ${s.fastingStatus === 'non_fasting' ? 'selected' : ''}>Non-fasting (recent food/beverage consumption)</option>
            <option value="unconfirmed" ${s.fastingStatus === 'unconfirmed' ? 'selected' : ''}>Unconfirmed (unknown fasting duration)</option>
          </select>
        </div>

        <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Fasting Duration (Hours):</label>
            <input type="number" id="pctx-hours" value="${esc(s.fastingHours || 10)}" placeholder="e.g. 10" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
          </div>
          <div>
            <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Hours Since Last Meal:</label>
            <input type="number" id="pctx-meal" value="${esc(s.timeSinceLastMeal || 10)}" placeholder="e.g. 10" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
          </div>
        </div>

        <div>
          <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Prescription Medications:</label>
          <input type="text" id="pctx-meds" value="${esc(s.medications || '')}" placeholder="e.g. Metformin 500mg, Levothyroxine 50mcg, Atorvastatin" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>

        <div>
          <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Supplements & Over-the-Counter:</label>
          <input type="text" id="pctx-supps" value="${esc(s.supplements || '')}" placeholder="e.g. Biotin 5000mcg, Vitamin D3, Fish Oil, Multivitamin" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>

        <div>
          <label style="font-size:11.5px;font-weight:600;display:block;margin-bottom:3px">Known Medical Conditions:</label>
          <input type="text" id="pctx-conds" value="${esc(s.conditions || '')}" placeholder="e.g. Type 2 Diabetes, Hypertension, Hypothyroidism" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>

        <div class="row" style="gap:10px;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-secondary btn-sm" type="button" data-close>Cancel</button>
          <button class="btn btn-primary btn-sm" type="submit">Save & Apply Context</button>
        </div>
      </form>
    </div>`);

    const form = modalNode.querySelector("#patient-context-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = modalNode.querySelector("#pctx-fasting-status").value;
      Contextualizer.setState({
        age: parseInt(modalNode.querySelector("#pctx-age").value, 10) || 41,
        sex: modalNode.querySelector("#pctx-sex").value,
        fastingStatus: status,
        fasting: status === "fasting",
        fastingHours: parseInt(modalNode.querySelector("#pctx-hours").value, 10) || 10,
        timeSinceLastMeal: parseInt(modalNode.querySelector("#pctx-meal").value, 10) || 10,
        medications: modalNode.querySelector("#pctx-meds").value,
        supplements: modalNode.querySelector("#pctx-supps").value,
        conditions: modalNode.querySelector("#pctx-conds").value
      });

      if (typeof openModal === "function") {
        const closeBtn = modalNode.querySelector("[data-close]");
        if (closeBtn) closeBtn.click();
      }
      if (typeof onSave === "function") onSave();
    });

    openModal(modalNode);
  },

  renderAlertsBox(container) {
    if (!container) return;
    const { alerts } = Contextualizer.evaluate(PARAMETERS || []);
    if (!alerts.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = alerts.map((a) => `
      <div style="background:var(--surface-sunk);border-left:3px solid ${a.type === 'warning' ? '#f59e0b' : (a.type === 'success' ? '#16a34a' : '#3b82f6')};padding:8px 12px;border-radius:4px;margin-top:6px;display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:14px">${a.icon}</span>
        <div style="flex:1">
          <strong style="font-size:12px;color:var(--ink)">${esc(a.title)}:</strong>
          <span style="font-size:11.5px;color:var(--ink-2);line-height:1.45;display:inline"> ${esc(a.message)}</span>
        </div>
      </div>
    `).join("");
  }
};

window.Contextualizer = Contextualizer;
