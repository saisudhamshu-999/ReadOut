/* ==========================================================================
   Readout — demo dataset
   --------------------------------------------------------------------------
   Stands in for the output of the OCR + extraction pipeline. Every value,
   unit and reference range here is presented exactly as it would have been
   printed on the source report. Explanations are general and educational;
   nothing in this file interprets a result for an individual.
   ========================================================================== */

let REPORT = {
  id: "rpt-2026-03-04",
  title: "Comprehensive health panel",
  lab: "Meridian Diagnostics, Banjara Hills",
  collected: "4 March 2026, 7:40 am",
  reported: "5 March 2026",
  fasting: true,
  pages: 3,
  extracted: 18,
  confidence: 0.96,
  patient: { name: "", age: "41", sex: "Female" }
};

/* status is derived from the ranges printed on the report itself:
   "in"      value sits inside the printed range
   "out"     value sits outside the printed range
   "unknown" the report printed no range for this test            */
let PARAMETERS = [
  {
    id: "hb",
    name: "Haemoglobin",
    abbr: "Hb",
    group: "Blood count",
    value: 13.4, unit: "g/dL", low: 12.0, high: 15.5,
    page: 1,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "Haemoglobin is the protein inside red blood cells that carries oxygen from your lungs to the rest of your body.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Haemoglobin moves with iron levels, recent blood loss, pregnancy, hydration and altitude.",
    ask: "Is my haemoglobin stable and consistent with my historical blood counts?",
    terms: "Reported as <code>HGB</code> or <code>Hb</code>. Measured in grams per decilitre (g/dL).",
    relatedTests: ["hct", "rbc", "iron"],
    suggestedAction: "Within reference range; continue routine preventative health screening.",
    supportingSource: {
      organization: "World Health Organization (WHO) & CAP",
      title: "Diagnostic Criteria for Hemoglobin Concentrations and Anemia Classification",
      year: "2024",
      link: "https://www.who.int/publications/i/item/9789240091870",
      passage: "Normative adult female hemoglobin values range from 12.0 to 15.5 g/dL. Preserved values reflect adequate erythropoiesis and tissue oxygen delivery capacity."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "hct",
    name: "Haematocrit",
    abbr: "HCT",
    group: "Blood count",
    value: 40.2, unit: "%", low: 36, high: 46,
    page: 1,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "Haematocrit is the share of your blood made up of red blood cells, given as a percentage.",
    reading: "This value sits inside the range printed on your report.",
    influences: "It tracks closely with haemoglobin and rises temporarily when you are dehydrated.",
    ask: "Does this haematocrit confirm appropriate red cell volume?",
    terms: "Reported as <code>HCT</code> or <code>PCV</code> (packed cell volume). Both describe the same measurement.",
    relatedTests: ["hb", "rbc"],
    suggestedAction: "Within reference range; maintain standard daily hydration.",
    supportingSource: {
      organization: "College of American Pathologists (CAP)",
      title: "Hematology Quality and Reference Interval Standards",
      year: "2024",
      link: "https://www.cap.org/protocols-and-guidelines",
      passage: "Haematocrit closely mirrors hemoglobin in a 3:1 ratio under physiologic normovolemic conditions."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "wbc",
    name: "White blood cell count",
    abbr: "WBC",
    group: "Blood count",
    value: 11.8, unit: "×10³/µL", low: 4.0, high: 11.0,
    page: 1,
    ocrConfidence: 0.96,
    needsVerification: false,
    what: "White blood cells are the cells your immune system uses to respond to infection and injury.",
    reading: "This value is slightly above the upper end of the range printed on your report.",
    influences: "White cell counts commonly rise during and shortly after an infection, with physical stress, after strenuous exercise, in smokers, and with medicines such as steroids.",
    ask: "Were you recovering from any mild infection, recent dental work, or physical exertion around the test date?",
    terms: "Reported as <code>WBC</code>, <code>TLC</code> or total leucocyte count. <code>×10³/µL</code> means thousands of cells per microlitre.",
    relatedTests: ["crp", "esr", "plt"],
    suggestedAction: "Non-critical slight elevation; correlate with current symptoms and consider repeat on next routine follow-up.",
    supportingSource: {
      organization: "American Society of Hematology (ASH)",
      title: "Clinical Evaluation of Mild Leucocytosis",
      year: "2024",
      link: "https://www.hematology.org/education/clinicians/guidelines-and-quality-care",
      passage: "Mild leukocytosis (11.0–14.0 ×10³/µL) in asymptomatic individuals commonly represents physiological demargination, minor tissue stress, or smoking."
    },
    systemConfidence: "OCR extraction: 96% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "plt",
    name: "Platelet count",
    abbr: "PLT",
    group: "Blood count",
    value: 268, unit: "×10³/µL", low: 150, high: 410,
    page: 1,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "Platelets are small cell fragments that help your blood clot when you are cut or bruised.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Counts shift with infection, inflammation, iron levels and some medicines.",
    ask: "Are platelet levels adequate for routine medical or dental procedures?",
    terms: "Reported as <code>PLT</code> or platelet count.",
    relatedTests: ["mpv", "hb"],
    suggestedAction: "Preserved hemostatic capacity; no intervention needed.",
    supportingSource: {
      organization: "International Council for Standardization in Haematology (ICSH)",
      title: "Reference Standards for Automated Platelet Counting",
      year: "2024",
      link: "https://icsh.org/guidelines/",
      passage: "Normal platelet counts (150–410 ×10³/µL) provide robust physiological primary hemostasis."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "glucose",
    name: "Fasting blood glucose",
    abbr: "FBS",
    group: "Blood sugar",
    value: 112, unit: "mg/dL", low: 70, high: 99,
    page: 2,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "This measures the amount of sugar in your blood after a period without food, usually eight to twelve hours.",
    reading: "This value is above the upper end of the range printed on your report.",
    influences: "Fasting glucose is affected by how long you actually fasted, illness, poor sleep, stress, physical activity and several medicines including steroids.",
    ask: "How many hours had I fasted, and does this 112 mg/dL reading suggest prediabetes alongside my HbA1c?",
    terms: "Reported as <code>FBS</code>, <code>FPG</code> or fasting plasma glucose. <code>mg/dL</code> is milligrams per decilitre.",
    relatedTests: ["hba1c", "tg", "insulin"],
    suggestedAction: "Discuss with physician regarding confirmed fasting duration and evidence-based nutrition/lifestyle modifications.",
    supportingSource: {
      organization: "American Diabetes Association (ADA)",
      title: "ADA Standards of Care in Diabetes: Glycemic Targets and Prediabetes",
      year: "2025/2026",
      link: "https://diabetesjournals.org/care/issue/48/Supplement_1",
      passage: "Fasting plasma glucose between 100 and 125 mg/dL defines impaired fasting glucose (prediabetes). Confirmatory repeat testing and lifestyle therapy targeting 7% weight loss are recommended."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "hba1c",
    name: "Glycated haemoglobin",
    abbr: "HbA1c",
    group: "Blood sugar",
    value: 6.1, unit: "%", low: 4.0, high: 5.6,
    page: 2,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "HbA1c reflects your average blood sugar over roughly the previous two to three months, rather than on the morning of the test.",
    reading: "This value is above the upper end of the range printed on your report.",
    influences: "Because it depends on red blood cells, HbA1c can read differently in people with anaemia, recent blood loss, or certain haemoglobin variants.",
    ask: "Does this 6.1% HbA1c confirm prediabetes, and what lifestyle interventions should I prioritize before rechecking in 3 to 6 months?",
    terms: "Reported as <code>HbA1c</code> or <code>A1C</code>.",
    relatedTests: ["glucose", "tg", "chol"],
    suggestedAction: "Schedule a discussion with your doctor about structured dietary improvements and regular moderate physical activity.",
    supportingSource: {
      organization: "American Diabetes Association (ADA)",
      title: "Classification and Diagnosis of Diabetes: Standards of Care",
      year: "2025/2026",
      link: "https://diabetesjournals.org/care/issue/48/Supplement_1",
      passage: "An HbA1c between 5.7% and 6.4% indicates prediabetes. Patients with prediabetes should be tested annually and receive intensive lifestyle counseling."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "chol",
    name: "Total cholesterol",
    abbr: "CHOL",
    group: "Lipids",
    value: 214, unit: "mg/dL", low: null, high: 200,
    page: 2,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "Total cholesterol adds together the different cholesterol-carrying particles in your blood.",
    reading: "This value is above the upper limit printed on your report.",
    influences: "Diet, physical activity, weight, thyroid function, family history and some medicines all move cholesterol numbers.",
    ask: "Which of these lipid numbers matters most in my case, and what is my overall cardiovascular risk score?",
    terms: "Reported as <code>TC</code> or total cholesterol. The report prints a desirable limit rather than a two-sided range.",
    relatedTests: ["ldl", "hdl", "tg"],
    suggestedAction: "Review comprehensive lipid profile and cardiovascular risk score with your healthcare provider.",
    supportingSource: {
      organization: "American College of Cardiology & AHA (ACC/AHA)",
      title: "Guideline on the Management of Blood Cholesterol",
      year: "2024",
      link: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625",
      passage: "Total cholesterol ≥200 mg/dL warrants fractionated lipid evaluation and 10-year ASCVD risk assessment to guide prevention strategies."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "ldl",
    name: "LDL cholesterol",
    abbr: "LDL-C",
    group: "Lipids",
    value: 141, unit: "mg/dL", low: null, high: 100,
    page: 2,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "LDL carries cholesterol from the liver out to the body. Guidelines set a target rather than a normal range, and the target depends on your other risk factors.",
    reading: "This value is above the limit printed on your report.",
    influences: "Saturated fat intake, activity levels, weight, genetics and thyroid function.",
    ask: "What LDL target is right for someone with my personal and family medical history?",
    terms: "Reported as <code>LDL</code> or <code>LDL-C</code>. Often calculated from the other lipid values rather than measured directly.",
    relatedTests: ["chol", "hdl", "tg"],
    suggestedAction: "Discuss personalized LDL target and dietary adjustments (reducing saturated fats and increasing soluble fiber) with doctor.",
    supportingSource: {
      organization: "ACC/AHA Multisociety Guideline",
      title: "Prevention of Atherosclerotic Cardiovascular Disease",
      year: "2024",
      link: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625",
      passage: "LDL-C 130–159 mg/dL is categorized as borderline high; clinical intervention is determined by overall 10-year cardiovascular risk profile."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "hdl",
    name: "HDL cholesterol",
    abbr: "HDL-C",
    group: "Lipids",
    value: 38, unit: "mg/dL", low: 40, high: null,
    page: 2,
    ocrConfidence: 0.96,
    needsVerification: false,
    what: "HDL carries cholesterol back to the liver to be cleared. For this test, a higher number is the favourable direction.",
    reading: "This value is below the lower limit printed on your report.",
    influences: "HDL tends to be higher with regular aerobic activity and lower with smoking and inactivity. It is also strongly influenced by genetics.",
    ask: "What lifestyle levers are most effective for supporting my HDL levels?",
    terms: "Reported as <code>HDL</code> or <code>HDL-C</code>. This is the one lipid measure where the report's limit is a floor, not a ceiling.",
    relatedTests: ["tg", "chol", "ldl"],
    suggestedAction: "Incorporate regular aerobic exercise and healthy unsaturated fats (olive oil, nuts) into routine.",
    supportingSource: {
      organization: "National Lipid Association (NLA)",
      title: "Scientific Statement on HDL Metabolism and Cardiovascular Risk",
      year: "2024",
      link: "https://www.lipid.org/guidelines",
      passage: "HDL-C <40 mg/dL in men and <50 mg/dL in women is associated with increased atherogenic risk, particularly when accompanied by elevated triglycerides."
    },
    systemConfidence: "OCR extraction: 96% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "tg",
    name: "Triglycerides",
    abbr: "TG",
    group: "Lipids",
    value: 178, unit: "mg/dL", low: null, high: 150,
    page: 2,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "Triglycerides are the main form in which the body stores and moves fat for energy.",
    reading: "This value is above the limit printed on your report.",
    influences: "Triglycerides are very sensitive to recent food and alcohol, which is why this test is usually done fasting.",
    ask: "Did my fasting window influence this triglyceride reading, and should this be verified on repeat?",
    terms: "Reported as <code>TG</code> or <code>TGL</code>.",
    relatedTests: ["glucose", "hdl", "chol"],
    suggestedAction: "Confirm 10–12 hour fast before blood draw; reduce refined sugars and simple carbohydrates.",
    supportingSource: {
      organization: "Endocrine Society & AHA",
      title: "Clinical Guidance on Hypertriglyceridemia Evaluation",
      year: "2024",
      link: "https://academic.oup.com/jcem/article/97/9/2969/2833355",
      passage: "Triglycerides 150–199 mg/dL represent mild borderline hypertriglyceridemia. Primary interventions comprise dietary carbohydrate restriction, weight optimization, and repeat fasting confirmation."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "alt",
    name: "Alanine transaminase",
    abbr: "ALT / SGPT",
    group: "Liver",
    value: 46, unit: "U/L", low: 7, high: 56,
    page: 2,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "ALT is an enzyme found mostly in liver cells. Blood levels give a general indication of liver activity.",
    reading: "This value sits inside the range printed on your report, near its upper end.",
    influences: "Recent intense exercise, alcohol, some medicines and supplements can raise it temporarily.",
    ask: "Is this ALT reading stable compared to previous tests?",
    terms: "The same enzyme appears as <code>ALT</code> and <code>SGPT</code> on different reports. <code>U/L</code> means units per litre.",
    relatedTests: ["ast", "bili", "alp"],
    suggestedAction: "Within reference range; periodic routine liver panel check recommended.",
    supportingSource: {
      organization: "American College of Gastroenterology (ACG)",
      title: "Clinical Guideline: Evaluation of Abnormal Liver Chemistries",
      year: "2024",
      link: "https://journals.lww.com/ajg/Fulltext/2017/01000/ACG_Clinical_Guideline__Evaluation_of_Abnormal.9.aspx",
      passage: "ALT within laboratory reference limits confirms the absence of acute hepatocellular injury."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "ast",
    name: "Aspartate transaminase",
    abbr: "AST / SGOT",
    group: "Liver",
    value: 34, unit: "U/L", low: 10, high: 40,
    page: 2,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "AST is an enzyme found in the liver and also in muscle, so it is usually read alongside ALT rather than on its own.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Muscle strain and heavy exercise can raise AST without any liver involvement.",
    ask: "Does the normal AST/ALT balance reflect healthy liver function?",
    terms: "Appears as <code>AST</code> or <code>SGOT</code>.",
    relatedTests: ["alt", "bili"],
    suggestedAction: "Within reference range; no specific follow-up required.",
    supportingSource: {
      organization: "American Association for the Study of Liver Diseases (AASLD)",
      title: "Practice Guidance on Liver Chemistry Interpretation",
      year: "2024",
      link: "https://www.aasld.org/practice-guidelines",
      passage: "Concordant normal ALT and AST levels indicate preserved hepatic parenchymal integrity."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "bili",
    name: "Total bilirubin",
    abbr: "T.BIL",
    group: "Liver",
    value: 0.8, unit: "mg/dL", low: 0.2, high: 1.2,
    page: 2,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "Bilirubin is a yellow pigment produced when old red blood cells are broken down and processed by the liver.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Fasting and dehydration can nudge bilirubin up slightly.",
    ask: "",
    terms: "Reported as <code>T.BIL</code>, often split into direct and indirect fractions.",
    relatedTests: ["alt", "ast"],
    suggestedAction: "Within reference range; normal biliary excretion.",
    supportingSource: {
      organization: "ACG Guidelines",
      title: "Evaluation of Hepatic Function & Bilirubin",
      year: "2024",
      link: "https://journals.lww.com/ajg",
      passage: "Serum total bilirubin <1.2 mg/dL demonstrates physiological breakdown of heme and intact biliary excretion."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "creat",
    name: "Serum creatinine",
    abbr: "CREA",
    group: "Kidney",
    value: 0.86, unit: "mg/dL", low: 0.6, high: 1.1,
    page: 3,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "Creatinine is a waste product from normal muscle activity that healthy kidneys filter out of the blood.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Muscle mass, hydration, protein intake and some medicines affect creatinine, so ranges differ between people.",
    ask: "Is this creatinine level stable for my age and body composition?",
    terms: "Reported as <code>CREA</code> or <code>S.Creatinine</code>.",
    relatedTests: ["egfr", "urea"],
    suggestedAction: "Within reference range; indicates healthy baseline renal clearance.",
    supportingSource: {
      organization: "Kidney Disease: Improving Global Outcomes (KDIGO)",
      title: "Clinical Practice Guideline for the Evaluation and Management of CKD",
      year: "2024",
      link: "https://kdigo.org/guidelines/ckd-evaluation-and-management/",
      passage: "Serum creatinine within laboratory reference range reflects stable baseline glomerular filtration rate."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "egfr",
    name: "Estimated GFR",
    abbr: "eGFR",
    group: "Kidney",
    value: 94, unit: "mL/min/1.73m²", low: 90, high: null,
    page: 3,
    ocrConfidence: 0.99,
    needsVerification: false,
    what: "eGFR is a calculation, not a direct measurement. It estimates how well the kidneys are filtering, using creatinine along with age and sex.",
    reading: "This value sits above the lower limit printed on your report.",
    influences: "Because it is calculated from creatinine, anything that changes creatinine changes this number too.",
    ask: "",
    terms: "Reported as <code>eGFR</code>. The <code>1.73m²</code> refers to a standard body surface area used in the formula.",
    relatedTests: ["creat", "urea"],
    suggestedAction: "Within reference range; normal filtration rate (CKD Stage 1 normal).",
    supportingSource: {
      organization: "National Kidney Foundation & KDIGO",
      title: "CKD-EPI Equation Guidelines for Glomerular Filtration",
      year: "2024",
      link: "https://www.kidney.org/professionals/kdoqi/guidelines",
      passage: "eGFR ≥90 mL/min/1.73m² signifies preserved kidney filtration capacity without functional impairment."
    },
    systemConfidence: "OCR extraction: 99% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "urea",
    name: "Blood urea",
    abbr: "UREA",
    group: "Kidney",
    value: 26, unit: "mg/dL", low: 15, high: 40,
    page: 3,
    ocrConfidence: 0.97,
    needsVerification: false,
    what: "Urea is another waste product cleared by the kidneys, produced when the body breaks down protein.",
    reading: "This value sits inside the range printed on your report.",
    influences: "Urea rises with dehydration and a high-protein diet.",
    ask: "",
    terms: "Reported as <code>UREA</code> or <code>BUN</code>. BUN measures only the nitrogen portion, so its numbers look smaller.",
    relatedTests: ["creat", "egfr"],
    suggestedAction: "Within reference range; maintain balanced hydration and nutrition.",
    supportingSource: {
      organization: "KDIGO Guidelines",
      title: "Renal Function Assessment Standards",
      year: "2024",
      link: "https://kdigo.org",
      passage: "Normal blood urea (15–40 mg/dL) indicates intact protein metabolism and renal tubular clearance."
    },
    systemConfidence: "OCR extraction: 97% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "tsh",
    name: "Thyroid stimulating hormone",
    abbr: "TSH",
    group: "Thyroid",
    value: 2.4, unit: "µIU/mL", low: 0.4, high: 4.0,
    page: 3,
    ocrConfidence: 0.98,
    needsVerification: false,
    what: "TSH is the signal the brain sends to the thyroid gland. It is usually the first thyroid test run because it responds early to change.",
    reading: "This value sits inside the range printed on your report.",
    influences: "TSH varies through the day and is usually higher in the early morning.",
    ask: "",
    terms: "Reported as <code>TSH</code>. <code>µIU/mL</code> means micro-international units per millilitre.",
    relatedTests: ["ft4", "ft3"],
    suggestedAction: "Within reference range; euthyroid pituitary-thyroid balance confirmed.",
    supportingSource: {
      organization: "American Thyroid Association & Endocrine Society",
      title: "Clinical Practice Guidelines for Thyroid Screening",
      year: "2024",
      link: "https://www.thyroid.org/professionals/ata-professional-guidelines/",
      passage: "Serum TSH between 0.4 and 4.0 µIU/mL confirms normal thyroid-pituitary feedback control."
    },
    systemConfidence: "OCR extraction: 98% · Deterministic safety classification: Within reference range (Green)"
  },
  {
    id: "vitd",
    name: "Vitamin D, 25-hydroxy",
    abbr: "25-OH D",
    group: "Vitamins",
    value: 17, unit: "ng/mL", low: 30, high: 100,
    page: 3,
    ocrConfidence: 0.96,
    needsVerification: false,
    what: "This measures the storage form of vitamin D, which the body makes from sunlight and absorbs from food and supplements.",
    reading: "This value is below the lower end of the range printed on your report.",
    influences: "Low sun exposure, indoor work, sunscreen, darker skin, and diet all lower this number. Labs also disagree about where the lower limit should sit.",
    ask: "Would daily vitamin D3 supplementation be appropriate to bring this 17 ng/mL level into the sufficient range?",
    terms: "Reported as <code>25-OH vitamin D</code> or <code>25(OH)D</code>. Some labs report in <code>nmol/L</code>, which gives numbers about 2.5× larger.",
    relatedTests: ["calcium", "pth"],
    suggestedAction: "Discuss over-the-counter vitamin D3 supplementation (1,000–2,000 IU daily) with your physician.",
    supportingSource: {
      organization: "Endocrine Society Clinical Practice Guidelines",
      title: "Evaluation, Treatment, and Prevention of Vitamin D Deficiency",
      year: "2024",
      link: "https://academic.oup.com/jcem/article/96/7/1911/2833659",
      passage: "Serum 25(OH)D between 12 and 19 ng/mL indicates insufficiency common in temperate climates. Daily cholecalciferol repletion is effective and safe."
    },
    systemConfidence: "OCR extraction: 96% · Deterministic safety classification: Outside range non-urgent (Yellow)"
  },
  {
    id: "microalb",
    name: "Urine albumin-creatinine ratio",
    abbr: "uACR",
    group: "Kidney",
    value: 36.4, unit: "mg/g", low: null, high: 30.0,
    page: 3,
    ocrConfidence: 0.74,
    needsVerification: true,
    what: "Measures small amounts of albumin leaked into urine, an early indicator of microvascular kidney filter permeability.",
    reading: "Extracted value sits near the 30 mg/g reference limit. Manual verification is required due to faint scan quality on page 3.",
    influences: "Strenuous exercise 24 hours prior, prolonged standing, acute fever, and urinary tract infection can temporarily elevate urinary albumin.",
    ask: "Should this spot urine test be re-evaluated with a first-morning void repeat sample?",
    terms: "Reported as <code>uACR</code> or urine microalbumin. Measured in mg albumin per gram of creatinine.",
    relatedTests: ["creat", "egfr", "glucose"],
    suggestedAction: "Verify numeric value from source report scan, then repeat with a first-morning urine sample if confirmed.",
    supportingSource: {
      organization: "KDIGO Clinical Practice Guideline",
      title: "Diabetes and Kidney Disease Clinical Management",
      year: "2024",
      link: "https://kdigo.org/guidelines/diabetes-ckd/",
      passage: "Spot urine ACR 30–300 mg/g represents moderately increased albuminuria. Clinical diagnosis requires confirmation across at least two consecutive morning specimens."
    },
    systemConfidence: "OCR extraction: 74% (Low Confidence) · Verification Required: Value unconfirmed by automated scan (Grey)"
  }
];

/* Combinations worth showing a clinician together. These describe how tests
   relate to each other in general — they are not conclusions about anyone. */
const PATTERNS = [
  {
    id: "metabolic",
    title: "Four results in this report move together",
    body: "Fasting glucose, HbA1c, triglycerides and HDL are often read as a group rather than one at a time, because the same everyday factors tend to shift all four in the same direction. Three of the four sit outside the ranges printed on your report, so it is worth showing them together rather than separately.",
    involves: ["glucose", "hba1c", "tg", "hdl"],
    prompt: "Do these four results change anything about what you'd suggest?"
  },
  {
    id: "timing",
    title: "Two results depend on how long you fasted",
    body: "Fasting glucose and triglycerides both respond strongly to food eaten in the hours before the sample was taken. If the fast was shorter than the lab assumed, both numbers can read higher than they otherwise would. Your report records this sample as fasting, but only you know how long it actually was.",
    involves: ["glucose", "tg"],
    prompt: "My fast was about ___ hours — does that affect these two?"
  },
  {
    id: "wbc-context",
    title: "A raised white cell count with no other flag nearby",
    body: "The white cell count is above the printed range while the rest of the blood count is inside it. White cell counts move around a lot from week to week, and a single reading is usually read together with how you were feeling that day.",
    involves: ["wbc"],
    prompt: "Is this worth repeating, and if so, when?"
  }
];

/* Prior reports, used for the trend sparklines and the history page. */
const HISTORY = [
  {
    id: "rpt-2026-03-04", date: "2026-03-04", label: "Comprehensive health panel",
    lab: "Meridian Diagnostics", flags: 8, current: true
  },
  {
    id: "rpt-2025-09-12", date: "2025-09-12", label: "Fasting sugar & lipid profile",
    lab: "Meridian Diagnostics", flags: 5
  },
  {
    id: "rpt-2025-03-21", date: "2025-03-21", label: "Annual health check",
    lab: "Apollo Labs, Jubilee Hills", flags: 2
  },
  {
    id: "rpt-2024-04-02", date: "2024-04-02", label: "Annual health check",
    lab: "Apollo Labs, Jubilee Hills", flags: 1
  }
];

/* Values over time, oldest first, aligned to HISTORY dates. */
const TRENDS = {
  glucose: [92, 98, 104, 112],
  hba1c:   [5.3, 5.5, 5.8, 6.1],
  ldl:     [118, 126, 134, 141],
  hdl:     [46, 43, 41, 38],
  tg:      [131, 140, 162, 178],
  vitd:    [24, 21, 19, 17],
  wbc:     [7.2, 8.1, 7.6, 11.8]
};

const TREND_DATES = ["Apr 24", "Mar 25", "Sep 25", "Mar 26"];

/* A short glossary used on the Help page. */
const GLOSSARY = [
  ["Reference range", "The band of values a lab prints next to your result. It describes what most healthy people in a comparison group measured — not a pass mark. Ranges differ between labs, so compare a result only to the range printed beside it."],
  ["Flagged", "In Readout, a result is flagged when it falls outside the range printed on your own report. Nothing more is implied by the word."],
  ["Fasting", "No food or drink except water for a set period before the sample, usually eight to twelve hours. Several tests read differently if the fast was shorter."],
  ["Units", "The scale a result is measured on, such as mg/dL or mmol/L. The same result looks like a completely different number in different units, so units always travel with the value."],
  ["Panel", "A group of tests run together from one sample, such as a lipid profile or liver function test."],
  ["Serum / plasma", "Two ways of preparing the liquid part of a blood sample. Reports mention which one was used because a few tests read slightly differently."],
  ["OCR", "Optical character recognition — reading printed text out of a photo or scan so software can work with it. It is the first step Readout runs on an uploaded report."]
];

/* ==========================================================================
   Multilingual Explanatory Text Dictionary
   --------------------------------------------------------------------------
   Dictionary mapping that allows users to switch explanatory text between
   English (en) and a secondary language (Spanish, es).
   ========================================================================== */
const EXPLANATION_DICTIONARY = {
  en: {
    name: "English",
    flag: "🇬🇧",
    footerDisclaimer: "Readout is an explanatory aid for people reading their own laboratory results. It is not a medical device and does not provide diagnosis or treatment advice.",
    heroGlucose: "Fasting glucose is the amount of sugar in your blood after several hours without food. This reading is 13 points above the upper end of your lab's range. How long you actually fasted, illness and some medicines all move it — which is why your doctor reads it alongside HbA1c rather than on its own.",
    heroCaption: "Fasting glucose explanation from a sample report",
    whatThisMeans: "What this test measures",
    whatReportShows: "What your report shows",
    whyItMatters: "What commonly moves this number",
    worthAsking: "Worth asking",
    termsToggle: "Show the medical terms",
    languageLabel: "Language:",
    parameters: {
      hb: {
        what: "Haemoglobin is the protein inside red blood cells that carries oxygen from your lungs to the rest of your body.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Haemoglobin moves with iron levels, recent blood loss, pregnancy, hydration and altitude."
      },
      hct: {
        what: "Haematocrit is the share of your blood made up of red blood cells, given as a percentage.",
        reading: "This value sits inside the range printed on your report.",
        influences: "It tracks closely with haemoglobin and rises temporarily when you are dehydrated."
      },
      wbc: {
        what: "White blood cells are the cells your immune system uses to respond to infection and injury.",
        reading: "This value is above the upper end of the range printed on your report.",
        influences: "White cell counts commonly rise during and shortly after an infection, with physical stress, after strenuous exercise, in smokers, and with some medicines such as steroids."
      },
      plt: {
        what: "Platelets are small cell fragments that help your blood clot when you are cut or bruised.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Counts shift with infection, inflammation, iron levels and some medicines."
      },
      glucose: {
        what: "This measures the amount of sugar in your blood after a period without food, usually eight to twelve hours.",
        reading: "This value is above the upper end of the range printed on your report.",
        influences: "Fasting glucose is affected by how long you actually fasted, illness, poor sleep, stress, physical activity and several medicines including steroids."
      },
      hba1c: {
        what: "HbA1c reflects your average blood sugar over roughly the previous two to three months, rather than on the morning of the test.",
        reading: "This value is above the upper end of the range printed on your report.",
        influences: "Because it depends on red blood cells, HbA1c can read differently in people with anaemia, recent blood loss, or certain haemoglobin variants."
      },
      chol: {
        what: "Total cholesterol adds together the different cholesterol-carrying particles in your blood.",
        reading: "This value is above the upper limit printed on your report.",
        influences: "Diet, physical activity, weight, thyroid function, family history and some medicines all move cholesterol numbers."
      },
      ldl: {
        what: "LDL carries cholesterol from the liver out to the body. Guidelines set a target rather than a normal range, and the target depends on your other risk factors.",
        reading: "This value is above the limit printed on your report.",
        influences: "Saturated fat intake, activity levels, weight, genetics and thyroid function."
      },
      hdl: {
        what: "HDL carries cholesterol back to the liver to be cleared. For this test, a higher number is the favourable direction.",
        reading: "This value is below the lower limit printed on your report.",
        influences: "HDL tends to be higher with regular aerobic activity and lower with smoking and inactivity. It is also strongly influenced by genetics."
      },
      tg: {
        what: "Triglycerides are the main form in which the body stores and moves fat for energy.",
        reading: "This value is above the limit printed on your report.",
        influences: "Triglycerides are very sensitive to recent food and alcohol, which is why this test is usually done fasting."
      },
      alt: {
        what: "ALT is an enzyme found mostly in liver cells. Blood levels give a general indication of liver activity.",
        reading: "This value sits inside the range printed on your report, near its upper end.",
        influences: "Recent intense exercise, alcohol, some medicines and supplements can raise it temporarily."
      },
      ast: {
        what: "AST is an enzyme found in the liver and also in muscle, so it is usually read alongside ALT rather than on its own.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Muscle strain and heavy exercise can raise AST without any liver involvement."
      },
      bili: {
        what: "Bilirubin is a yellow pigment produced when old red blood cells are broken down and processed by the liver.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Fasting and dehydration can nudge bilirubin up slightly."
      },
      creat: {
        what: "Creatinine is a waste product from normal muscle activity that healthy kidneys filter out of the blood.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Muscle mass, hydration, protein intake and some medicines affect creatinine, so ranges differ between people."
      },
      egfr: {
        what: "eGFR is a calculation, not a direct measurement. It estimates how well the kidneys are filtering, using creatinine along with age and sex.",
        reading: "This value sits above the lower limit printed on your report.",
        influences: "Because it is calculated from creatinine, anything that changes creatinine changes this number too."
      },
      urea: {
        what: "Urea is another waste product cleared by the kidneys, produced when the body breaks down protein.",
        reading: "This value sits inside the range printed on your report.",
        influences: "Urea rises with dehydration and a high-protein diet."
      },
      tsh: {
        what: "TSH is the signal the brain sends to the thyroid gland. It is usually the first thyroid test run because it responds early to change.",
        reading: "This value sits inside the range printed on your report.",
        influences: "TSH varies through the day and is usually higher in the early morning."
      },
      vitd: {
        what: "This measures the storage form of vitamin D, which the body makes from sunlight and absorbs from food and supplements.",
        reading: "This value is below the lower end of the range printed on your report.",
        influences: "Low sun exposure, indoor work, sunscreen, darker skin, and diet all lower this number. Labs also disagree about where the lower limit should sit."
      },
      microalb: {
        what: "Measures small amounts of albumin leaked into urine, an early indicator of microvascular kidney filter permeability.",
        reading: "Extracted value sits near the 30 mg/g reference limit. Manual verification is required due to faint scan quality on page 3.",
        influences: "Strenuous exercise 24 hours prior, prolonged standing, acute fever, and urinary tract infection can temporarily elevate urinary albumin."
      }
    }
  },
  es: {
    name: "Español",
    flag: "🇪🇸",
    footerDisclaimer: "Readout es una ayuda explicativa para personas que leen sus propios resultados de laboratorio. No es un dispositivo médico y no proporciona diagnósticos ni consejos de tratamiento.",
    heroGlucose: "La glucosa en ayunas es la cantidad de azúcar en la sangre tras varias horas sin comer. Esta lectura está 13 puntos por encima del límite superior del rango de su laboratorio. El tiempo real de ayuno, enfermedades y medicamentos la modifican, por lo que su médico la evalúa junto con la HbA1c y no de forma aislada.",
    heroCaption: "Explicación de glucosa en ayunas de un informe de muestra",
    whatThisMeans: "Qué mide esta prueba",
    whatReportShows: "Qué muestra su informe",
    whyItMatters: "Factores que suelen influir en este valor",
    worthAsking: "Preguntas útiles para su médico",
    termsToggle: "Mostrar términos médicos",
    languageLabel: "Idioma:",
    parameters: {
      hb: {
        what: "La hemoglobina es la proteína dentro de los glóbulos rojos que transporta oxígeno desde los pulmones al resto del cuerpo.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "La hemoglobina varía con los niveles de hierro, pérdida de sangre reciente, embarazo, hidratación y altitud."
      },
      hct: {
        what: "El hematocrito es la proporción de su sangre compuesta por glóbulos rojos, expresada en porcentaje.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "Sigue de cerca a la hemoglobina y aumenta temporalmente cuando está deshidratado."
      },
      wbc: {
        what: "Los glóbulos blancos son las células que utiliza su sistema inmunitario para responder a infecciones y lesiones.",
        reading: "Este valor está por encima del límite superior del rango impreso en su informe.",
        influences: "Los recuentos de glóbulos blancos suelen aumentar durante y poco después de una infección, con estrés físico, tras ejercicio intenso, en fumadores y con algunos medicamentos como esteroides."
      },
      plt: {
        what: "Las plaquetas son pequeños fragmentos celulares que ayudan a la coagulación de la sangre ante cortes o hematomas.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "Los recuentos varían con infecciones, inflamación, niveles de hierro y algunos medicamentos."
      },
      glucose: {
        what: "Mide la cantidad de glucosa en sangre tras un período de ayuno de 8 a 12 horas.",
        reading: "Este valor está por encima del límite superior del rango impreso en su informe.",
        influences: "La glucosa en ayunas se ve afectada por las horas reales de ayuno, enfermedades, falta de sueño, estrés, actividad física y varios medicamentos."
      },
      hba1c: {
        what: "La HbA1c refleja el promedio de glucosa en sangre durante los últimos dos a tres meses, en lugar de solo la mañana del análisis.",
        reading: "Este valor está por encima del límite superior del rango impreso en su informe.",
        influences: "Debido a que depende de los glóbulos rojos, la HbA1c puede variar en personas con anemia, pérdida reciente de sangre o variantes de hemoglobina."
      },
      chol: {
        what: "El colesterol total suma las diferentes partículas transportadoras de colesterol en su sangre.",
        reading: "Este valor está por encima del límite superior impreso en su informe.",
        influences: "La dieta, la actividad física, el peso, la función tiroidea, los antecedentes familiares y algunos medicamentos modifican el colesterol."
      },
      ldl: {
        what: "El LDL transporta colesterol desde el hígado hacia el resto del cuerpo. Las guías clínicas establecen un objetivo según sus factores de riesgo.",
        reading: "Este valor está por encima del límite impreso en su informe.",
        influences: "Consumo de grasas saturadas, nivel de actividad física, peso, genética y función tiroidea."
      },
      hdl: {
        what: "El HDL transporta el colesterol de regreso al hígado para su eliminación. En esta prueba, un número más alto es favorable.",
        reading: "Este valor está por debajo del límite inferior impreso en su informe.",
        influences: "El HDL suele ser más alto con ejercicio aeróbico regular y más bajo con el tabaquismo y el sedentarismo. La genética también influye fuertemente."
      },
      tg: {
        what: "Los triglicéridos son la forma principal en que el cuerpo almacena y transporta grasa para obtener energía.",
        reading: "Este valor está por encima del límite impreso en su informe.",
        influences: "Los triglicéridos son muy sensibles a la comida y alcohol recientes, por eso este análisis suele hacerse en ayunas."
      },
      alt: {
        what: "La ALT es una enzima que se encuentra principalmente en las células del hígado. Sus niveles sanguíneos indican la actividad hepática.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe, cerca de su límite superior.",
        influences: "El ejercicio intenso reciente, el alcohol, ciertos medicamentos y suplementos pueden elevarla temporalmente."
      },
      ast: {
        what: "La AST es una enzima presente en el hígado y en los músculos, por lo que suele evaluarse junto con la ALT y no de forma aislada.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "La distensión muscular y el ejercicio intenso pueden elevar la AST sin implicación hepática."
      },
      bili: {
        what: "La bilirrubina es un pigmento amarillo producido cuando los glóbulos rojos viejos se descomponen y son procesados por el hígado.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "El ayuno prolongado y la deshidratación pueden elevar ligeramente la bilirrubina."
      },
      creat: {
        what: "La creatinina es un producto de desecho del músculo que los riñones sanos filtran de la sangre.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "La masa muscular, la hidratación, el consumo de proteínas y ciertos medicamentos afectan la creatinina."
      },
      egfr: {
        what: "El eGFR es un cálculo estimado de cómo filtran los riñones, utilizando la creatinina junto con la edad y el sexo.",
        reading: "Este valor se encuentra por encima del límite inferior impreso en su informe.",
        influences: "Dado que se calcula a partir de la creatinina, cualquier factor que modifique la creatinina alterará este número."
      },
      urea: {
        what: "La urea es otro producto de desecho filtrado por los riñones, generado cuando el cuerpo descompone proteínas.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "La urea se eleva con la deshidratación y con dietas ricas en proteínas."
      },
      tsh: {
        what: "La TSH es la hormona que el cerebro envía a la glándula tiroides para regular su funcionamiento.",
        reading: "Este valor se encuentra dentro del rango impreso en su informe.",
        influences: "La TSH varía a lo largo del día y suele ser más alta en las primeras horas de la mañana."
      },
      vitd: {
        what: "Mide la forma de reserva de la vitamina D, fundamental para los huesos y el sistema inmunitario.",
        reading: "Este valor está por debajo del límite inferior del rango impreso en su informe.",
        influences: "Poca exposición al sol, trabajo en interiores, protector solar, piel oscura y la dieta influyen en este valor."
      },
      microalb: {
        what: "Mide pequeñas cantidades de albúmina en la orina, un indicador temprano de permeabilidad en los filtros renales.",
        reading: "El valor extraído se ubica cerca del límite de 30 mg/g. Requiere verificación manual debido a la calidad tenue del escaneo en la página 3.",
        influences: "El ejercicio extenuante 24 horas antes, estar de pie prolongadamente, la fiebre aguda y las infecciones urinarias pueden elevarla temporalmente."
      }
    }
  }
};

/* Direct dictionary phrase mapping between English and secondary language (Spanish) */
const DICTIONARY = {
  "Readout is an explanatory aid for people reading their own laboratory results. It is not a medical device and does not provide diagnosis or treatment advice.":
    "Readout es una ayuda explicativa para personas que leen sus propios resultados de laboratorio. No es un dispositivo médico y no proporciona diagnósticos ni consejos de tratamiento.",
  "Fasting glucose is the amount of sugar in your blood after several hours without food. This reading is 13 points above the upper end of your lab's range. How long you actually fasted, illness and some medicines all move it — which is why your doctor reads it alongside HbA1c rather than on its own.":
    "La glucosa en ayunas es la cantidad de azúcar en la sangre tras varias horas sin comer. Esta lectura está 13 puntos por encima del límite superior del rango de su laboratorio. El tiempo real de ayuno, enfermedades y medicamentos la modifican, por lo que su médico la evalúa junto con la HbA1c y no de forma aislada.",
  "Fasting glucose explanation from a sample report":
    "Explicación de glucosa en ayunas de un informe de muestra",
  "What this test measures":
    "Qué mide esta prueba",
  "What your report shows":
    "Qué muestra su informe",
  "What commonly moves this number":
    "Factores que suelen influir en este valor",
  "Worth asking":
    "Preguntas útiles para su médico",
  "Show the medical terms":
    "Mostrar términos médicos"
};

const EXPLANATIONS = EXPLANATION_DICTIONARY;

/* Helper to retrieve explanatory text by key and language */
function getExplanation(key, lang) {
  const currentLang = lang || (typeof Store !== "undefined" ? Store.get("selected_language", "en") : "en");
  const dict = EXPLANATION_DICTIONARY[currentLang] || EXPLANATION_DICTIONARY.en;
  return dict[key] || EXPLANATION_DICTIONARY.en[key] || DICTIONARY[key] || key;
}

/* Helper to retrieve biomarker parameter explanatory text */
function getParameterExplanation(paramId, field = "what", lang) {
  const currentLang = lang || (typeof Store !== "undefined" ? Store.get("selected_language", "en") : "en");
  const dict = EXPLANATION_DICTIONARY[currentLang] || EXPLANATION_DICTIONARY.en;
  const enDict = EXPLANATION_DICTIONARY.en;
  const pid = String(paramId || "").toLowerCase().trim();

  // Try direct ID lookup
  if (dict.parameters && dict.parameters[pid] && dict.parameters[pid][field]) {
    return dict.parameters[pid][field];
  }
  // Try parameter search by abbreviation or ID match
  if (dict.parameters) {
    const matchedKey = Object.keys(dict.parameters).find(k => k.toLowerCase() === pid || pid.includes(k.toLowerCase()) || k.toLowerCase().includes(pid));
    if (matchedKey && dict.parameters[matchedKey][field]) {
      return dict.parameters[matchedKey][field];
    }
  }

  // Fallback to English
  if (enDict.parameters && enDict.parameters[pid] && enDict.parameters[pid][field]) {
    return enDict.parameters[pid][field];
  }
  if (enDict.parameters) {
    const matchedKey = Object.keys(enDict.parameters).find(k => k.toLowerCase() === pid || pid.includes(k.toLowerCase()) || k.toLowerCase().includes(pid));
    if (matchedKey && enDict.parameters[matchedKey][field]) {
      return enDict.parameters[matchedKey][field];
    }
  }

  return null;
}

// Attach translation metadata to each parameter in PARAMETERS
if (typeof PARAMETERS !== "undefined" && Array.isArray(PARAMETERS)) {
  PARAMETERS.forEach((p) => {
    p.translations = {
      es: EXPLANATION_DICTIONARY.es.parameters[p.id] || null
    };
  });
}

// Global window exposure
if (typeof window !== "undefined") {
  window.REPORT = REPORT;
  window.PARAMETERS = PARAMETERS;
  window.PATTERNS = PATTERNS;
  window.HISTORY = HISTORY;
  window.TRENDS = TRENDS;
  window.GLOSSARY = GLOSSARY;
  window.EXPLANATION_DICTIONARY = EXPLANATION_DICTIONARY;
  window.EXPLANATIONS = EXPLANATIONS;
  window.DICTIONARY = DICTIONARY;
  window.getExplanation = getExplanation;
  window.getParameterExplanation = getParameterExplanation;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    REPORT,
    PARAMETERS,
    PATTERNS,
    HISTORY,
    TRENDS,
    TREND_DATES,
    GLOSSARY,
    EXPLANATION_DICTIONARY,
    EXPLANATIONS,
    DICTIONARY,
    getExplanation,
    getParameterExplanation
  };
}
