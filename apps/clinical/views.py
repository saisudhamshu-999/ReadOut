import json
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.reports.models import Report

BASE_DIR = Path(settings.BASE_DIR)

# Load medical knowledge files
def load_json_file(filename, default=None):
    try:
        p = BASE_DIR / 'medical_knowledge' / filename
        if p.exists():
            with open(p, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return default if default is not None else []

PATTERNS_DB = load_json_file('patterns.json', [])
DRUG_INTERACTIONS_DB = load_json_file('drug_interactions.json', {})
MEDICATIONS_DB = load_json_file('medications.json', {})

HISTORICAL_SERIES = [
    {
        'id': 'rpt-2024-03-10',
        'date': '10 March 2024',
        'laboratory': 'Meridian Diagnostics',
        'markers': {'glucose': 96, 'hba1c': 5.5, 'chol': 192, 'ldl': 118, 'hdl': 45, 'tg': 142, 'vitd': 24, 'creat': 0.84}
    },
    {
        'id': 'rpt-2024-09-18',
        'date': '18 September 2024',
        'laboratory': 'Meridian Diagnostics',
        'markers': {'glucose': 99, 'hba1c': 5.6, 'chol': 198, 'ldl': 124, 'hdl': 43, 'tg': 151, 'vitd': 22, 'creat': 0.85}
    },
    {
        'id': 'rpt-2025-03-14',
        'date': '14 March 2025',
        'laboratory': 'Meridian Diagnostics',
        'markers': {'glucose': 102, 'hba1c': 5.7, 'chol': 202, 'ldl': 129, 'hdl': 41, 'tg': 158, 'vitd': 20, 'creat': 0.86}
    },
    {
        'id': 'rpt-2025-09-22',
        'date': '22 September 2025',
        'laboratory': 'Meridian Diagnostics',
        'markers': {'glucose': 104, 'hba1c': 5.8, 'chol': 206, 'ldl': 134, 'hdl': 40, 'tg': 162, 'vitd': 19, 'creat': 0.87}
    },
    {
        'id': 'rpt-2026-03-04',
        'date': '04 March 2026',
        'laboratory': 'Meridian Diagnostics',
        'markers': {'glucose': 112, 'hba1c': 6.1, 'chol': 214, 'ldl': 141, 'hdl': 38, 'tg': 178, 'vitd': 17, 'creat': 0.88}
    }
]

def history_view(request):
    return JsonResponse({
        'status': 'success',
        'data': {
            'drawCount': len(HISTORICAL_SERIES),
            'firstDate': HISTORICAL_SERIES[0]['date'],
            'latestDate': HISTORICAL_SERIES[-1]['date'],
            'history': HISTORICAL_SERIES
        }
    })

def timeline_view(request):
    events = []
    for entry in HISTORICAL_SERIES:
        flagged_in_draw = []
        m = entry['markers']
        if m.get('glucose', 0) > 99: flagged_in_draw.append('Fasting Glucose')
        if m.get('hba1c', 0) > 5.6: flagged_in_draw.append('HbA1c')
        if m.get('chol', 0) > 200: flagged_in_draw.append('Total Cholesterol')
        if m.get('ldl', 0) > 100: flagged_in_draw.append('LDL')
        if m.get('hdl', 0) < 40: flagged_in_draw.append('HDL')
        if m.get('tg', 0) > 150: flagged_in_draw.append('Triglycerides')
        if m.get('vitd', 0) < 30: flagged_in_draw.append('Vitamin D')

        events.append({
            'reportId': entry['id'],
            'date': entry['date'],
            'lab': entry['laboratory'],
            'flaggedCount': len(flagged_in_draw),
            'flaggedNames': flagged_in_draw,
            'summary': f"{len(flagged_in_draw)} flagged results on {entry['date']}"
        })

    return JsonResponse({
        'status': 'success',
        'data': events
    })

def trends_view(request):
    trends_map = {
        'glucose': {
            'name': 'Fasting Blood Glucose',
            'unit': 'mg/dL',
            'range': '70 – 99 mg/dL',
            'values': [96, 99, 102, 104, 112],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'UPWARD',
            'change24Month': '+16 mg/dL (+16.7%)',
            'velocity': '+0.67 mg/dL per month',
            'trajectory': 'ESCALATING',
            'significance': 'Persistent upward drift into prediabetes range (impaired fasting glucose).'
        },
        'hba1c': {
            'name': 'Glycated Haemoglobin',
            'unit': '%',
            'range': '4.0 – 5.6 %',
            'values': [5.5, 5.6, 5.7, 5.8, 6.1],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'UPWARD',
            'change24Month': '+0.6% (+10.9%)',
            'velocity': '+0.025% per month',
            'trajectory': 'ESCALATING',
            'significance': 'Progressed from optimal (5.5%) through borderline (5.7%) to confirmed prediabetes (6.1%).'
        },
        'chol': {
            'name': 'Total Cholesterol',
            'unit': 'mg/dL',
            'range': '< 200 mg/dL',
            'values': [192, 198, 202, 206, 214],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'UPWARD',
            'change24Month': '+22 mg/dL (+11.5%)',
            'velocity': '+0.92 mg/dL per month',
            'trajectory': 'ESCALATING',
            'significance': 'Crossed 200 mg/dL threshold in 2025, continued gradual elevation.'
        },
        'ldl': {
            'name': 'LDL Cholesterol',
            'unit': 'mg/dL',
            'range': '< 100 mg/dL',
            'values': [118, 124, 129, 134, 141],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'UPWARD',
            'change24Month': '+23 mg/dL (+19.5%)',
            'velocity': '+0.96 mg/dL per month',
            'trajectory': 'ESCALATING',
            'significance': 'Atherogenic lipoprotein count steadily increasing above recommended bounds.'
        },
        'tg': {
            'name': 'Triglycerides',
            'unit': 'mg/dL',
            'range': '< 150 mg/dL',
            'values': [142, 151, 158, 162, 178],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'UPWARD',
            'change24Month': '+36 mg/dL (+25.4%)',
            'velocity': '+1.50 mg/dL per month',
            'trajectory': 'ESCALATING',
            'significance': 'Persistent hypertriglyceridemia consistent with insulin resistance pattern.'
        },
        'vitd': {
            'name': '25-Hydroxy Vitamin D',
            'unit': 'ng/mL',
            'range': '30 – 100 ng/mL',
            'values': [24, 22, 20, 19, 17],
            'dates': ['Mar 2024', 'Sep 2024', 'Mar 2025', 'Sep 2025', 'Mar 2026'],
            'direction': 'DOWNWARD',
            'change24Month': '-7 ng/mL (-29.2%)',
            'velocity': '-0.29 ng/mL per month',
            'trajectory': 'DECLINING',
            'significance': 'Shifted from insufficiency (24 ng/mL) into frank deficiency (< 20 ng/mL).'
        }
    }

    return JsonResponse({
        'status': 'success',
        'data': trends_map
    })

@csrf_exempt
def comparison_view(request):
    return JsonResponse({
        'status': 'success',
        'data': {
            'comparisonDate': 'September 2025 vs March 2026',
            'deltaSummary': 'Fasting glucose increased by 8 mg/dL; HbA1c progressed from 5.8% to 6.1%; LDL increased by 7 mg/dL.',
            'deltas': [
                {'test': 'Fasting Glucose', 'prev': 104, 'cur': 112, 'delta': '+8', 'unit': 'mg/dL', 'direction': 'worse'},
                {'test': 'HbA1c', 'prev': 5.8, 'cur': 6.1, 'delta': '+0.3', 'unit': '%', 'direction': 'worse'},
                {'test': 'Total Cholesterol', 'prev': 206, 'cur': 214, 'delta': '+8', 'unit': 'mg/dL', 'direction': 'worse'},
                {'test': 'LDL Cholesterol', 'prev': 134, 'cur': 141, 'delta': '+7', 'unit': 'mg/dL', 'direction': 'worse'},
                {'test': 'HDL Cholesterol', 'prev': 40, 'cur': 38, 'delta': '-2', 'unit': 'mg/dL', 'direction': 'worse'},
                {'test': 'Triglycerides', 'prev': 162, 'cur': 178, 'delta': '+16', 'unit': 'mg/dL', 'direction': 'worse'},
                {'test': 'Vitamin D', 'prev': 19, 'cur': 17, 'delta': '-2', 'unit': 'ng/mL', 'direction': 'worse'},
                {'test': 'Serum Creatinine', 'prev': 0.87, 'cur': 0.88, 'delta': '+0.01', 'unit': 'mg/dL', 'direction': 'stable'}
            ]
        }
    })

@csrf_exempt
def patterns_view(request):
    patterns = [
        {
            'id': 'glycemic_dysregulation',
            'name': 'Early Glycemic Dysregulation Pattern',
            'confidence': 0.96,
            'status': 'ACTIVE',
            'involves': ['glucose', 'hba1c'],
            'markers': ['Fasting Glucose: 112 mg/dL (>99)', 'HbA1c: 6.1% (>5.6)'],
            'mechanism': 'Concurrent elevation in morning fasting glucose and 90-day glycated hemoglobin indicates sustained hepatic and peripheral insulin resistance.',
            'guideline': 'ADA Standards of Medical Care in Diabetes (2026)',
            'recommendation': 'Lifestyle intervention (Mediterranean dietary pattern, 150 min/wk moderate aerobic exercise). Formal 75g OGTT confirmation if indicated.'
        },
        {
            'id': 'atherogenic_dyslipidemia',
            'name': 'Atherogenic Lipid Triad (Metabolic Dyslipidemia)',
            'confidence': 0.94,
            'status': 'ACTIVE',
            'involves': ['chol', 'ldl', 'hdl', 'tg'],
            'markers': ['Total Chol: 214 mg/dL', 'LDL: 141 mg/dL', 'HDL: 38 mg/dL', 'Triglycerides: 178 mg/dL'],
            'mechanism': 'The combination of elevated triglycerides, low HDL, and borderline-high LDL reflects an increased proportion of small, dense LDL particles prone to arterial wall oxidation.',
            'guideline': 'ACC/AHA Guideline on the Management of Blood Cholesterol',
            'recommendation': 'Assess 10-year ASCVD risk score; reduce dietary refined carbohydrates and saturated fats; recheck lipid panel in 3–6 months.'
        },
        {
            'id': 'hypovitaminosis_d',
            'name': 'Symptomatic / Asymptomatic Hypovitaminosis D',
            'confidence': 0.98,
            'status': 'ACTIVE',
            'involves': ['vitd'],
            'markers': ['25(OH)D: 17 ng/mL (<30 ng/mL)'],
            'mechanism': '25-hydroxyvitamin D < 20 ng/mL qualifies as deficiency, impairing intestinal calcium transport and bone mineral homeostasis.',
            'guideline': 'Endocrine Society Clinical Practice Guideline on Vitamin D',
            'recommendation': 'Oral cholecalciferol (Vitamin D3) supplementation protocol as prescribed by attending clinician.'
        },
        {
            'id': 'preserved_renal',
            'name': 'Preserved Glomerular Filtration & Renal Clearance',
            'confidence': 0.99,
            'status': 'PHYSIOLOGIC_NORMAL',
            'involves': ['creat', 'egfr'],
            'markers': ['Serum Creatinine: 0.88 mg/dL', 'eGFR: 94 mL/min/1.73m²'],
            'mechanism': 'Physiologic creatinine generation and filtration confirm normal baseline renal clearance (KDIGO Stage G1).',
            'guideline': 'KDIGO Clinical Practice Guideline for the Evaluation of CKD',
            'recommendation': 'Maintain hydration; no nephrological dosage adjustments required for standard therapeutics.'
        }
    ]

    return JsonResponse({
        'status': 'success',
        'data': {
            'detectedPatterns': patterns,
            'count': len(patterns),
            'disclaimer': 'Patterns are algorithmic clinical-decision support correlations and do not constitute a clinical diagnosis.'
        }
    })

@csrf_exempt
def conditions_view(request):
    conditions = [
        {
            'condition': 'Impaired Fasting Glucose / Prediabetes',
            'icd10': 'R73.03',
            'status': 'HIGH_PROBABILITY',
            'criteriaMet': 'Fasting Glucose 100–125 mg/dL AND HbA1c 5.7%–6.4%',
            'patientValues': 'FBS 112 mg/dL, HbA1c 6.1%',
            'organization': 'American Diabetes Association (ADA)'
        },
        {
            'condition': 'Mixed Dyslipidemia',
            'icd10': 'E78.2',
            'status': 'HIGH_PROBABILITY',
            'criteriaMet': 'Total Chol > 200 mg/dL, LDL > 100 mg/dL, TG > 150 mg/dL, HDL < 40 mg/dL',
            'patientValues': 'TC 214, LDL 141, TG 178, HDL 38',
            'organization': 'American College of Cardiology (ACC)'
        },
        {
            'condition': 'Vitamin D Deficiency',
            'icd10': 'E55.9',
            'status': 'CONFIRMED_LAB_FLAG',
            'criteriaMet': 'Serum 25-Hydroxyvitamin D < 20 ng/mL',
            'patientValues': '25(OH)D 17 ng/mL',
            'organization': 'Endocrine Society'
        }
    ]

    return JsonResponse({
        'status': 'success',
        'safety_label': 'AI CLINICAL ASSESSMENT — NOT A CONFIRMED DIAGNOSIS',
        'data': {
            'possible_conditions': conditions,
            'conditions': conditions,
            'totalEvaluated': len(conditions),
            'disclaimer': 'Clinical risk flags are educational summaries for consultation with your doctor.'
        }
    })

@csrf_exempt
def diagnosis_view(request):
    return JsonResponse({
        'status': 'success',
        'safety_label': 'EDUCATIONAL DIFFERENTIAL CONSIDERATIONS — NOT A CONFIRMED DIAGNOSIS',
        'data': {
            'confirmed_diagnosis': 'NONE — Readout does not make or confirm diagnoses. A formal diagnosis requires clinical evaluation by a licensed physician.',
            'differentialConsiderations': [
                {
                    'consideration': 'Prediabetes (Impaired Glucose Tolerance)',
                    'evidence': 'Fasting Glucose 112 mg/dL, HbA1c 6.1%, 24-month upward slope.',
                    'action': 'Schedule HbA1c retest in 3 months; evaluate fasting lipid response to exercise.'
                },
                {
                    'consideration': 'Primary Mixed Hyperlipidemia',
                    'evidence': 'Total Cholesterol 214 mg/dL, LDL 141 mg/dL, Triglycerides 178 mg/dL.',
                    'action': 'Review dietary saturated fat intake; calculate ASCVD 10-year risk profile.'
                },
                {
                    'consideration': 'Hypovitaminosis D',
                    'evidence': '25-OH Vitamin D at 17 ng/mL.',
                    'action': 'Discuss oral vitamin D3 replacement with physician.'
                }
            ],
            'disclaimer': 'Differential considerations are educational and do not represent a definitive medical diagnosis.'
        }
    })

@csrf_exempt
def prediction_view(request):
    return JsonResponse({
        'status': 'success',
        'data': {
            'horizon': '12–24 Months',
            'baselineTrajectory': {
                'description': 'Without lifestyle or dietary adjustment, glycemic and lipid parameters project continued upward drift.',
                'projectedGlucose': '118–124 mg/dL by mid-2027',
                'projectedHbA1c': '6.4–6.6% (approaching diabetes diagnostic cutoff of 6.5%)'
            },
            'mitigatedTrajectory': {
                'description': 'With 5–7% body weight reduction and 150 min/wk moderate physical activity (Diabetes Prevention Program model):',
                'projectedGlucose': '92–98 mg/dL (resolution of impaired fasting glucose)',
                'projectedHbA1c': '5.4–5.6% (normalization of 90-day glycemic marker)',
                'projectedTriglycerides': '120–140 mg/dL (-25% reduction)'
            }
        }
    })

def medication_detail_view(request, name):
    clean_name = name.lower().strip()
    med_info = {
        'name': name.title(),
        'class': 'Pharmaceutical / Dietary Supplement',
        'mechanism': f"Clinical reference profile for {name}.",
        'labInterferences': [],
        'monitoringTests': ['Comprehensive Metabolic Panel', 'Complete Blood Count']
    }

    if 'biotin' in clean_name or 'b7' in clean_name:
        med_info.update({
            'name': 'Biotin (Vitamin B7 / Vitamin H)',
            'class': 'Water-Soluble B-Complex Vitamin',
            'mechanism': 'Cofactor for carboxylase enzymes involved in fatty acid, glucose, and amino acid metabolism.',
            'labInterferences': [
                'Interferes with streptavidin-biotin immunoassays: causes falsely low TSH results (mimicking hyperthyroidism).',
                'Causes falsely low Troponin results (potential missed myocardial infarction alert).',
                'May falsely elevate Free T4, Free T3, and cortisol on specific immunoassay platforms.'
            ],
            'clinicalGuidance': 'Discontinue high-dose biotin supplements (>= 5 mg/day) at least 48–72 hours before laboratory blood collection.'
        })
    elif 'metformin' in clean_name:
        med_info.update({
            'name': 'Metformin Hydrochloride',
            'class': 'Biguanide Antihyperglycemic',
            'mechanism': 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, improves insulin sensitivity.',
            'labInterferences': [
                'Long-term use can reduce Vitamin B12 absorption; annual Vitamin B12 monitoring recommended.',
                'Requires baseline serum creatinine and eGFR before initiation (contraindicated if eGFR < 30 mL/min).'
            ],
            'monitoringTests': ['Fasting Blood Glucose', 'HbA1c', 'eGFR', 'Serum Creatinine', 'Vitamin B12']
        })
    elif 'statin' in clean_name or 'atorvastatin' in clean_name:
        med_info.update({
            'name': 'Atorvastatin Calcium',
            'class': 'HMG-CoA Reductase Inhibitor',
            'mechanism': 'Competitively inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis and upregulate LDL receptors.',
            'labInterferences': [
                'May produce transient mild elevations in liver transaminases (ALT/AST).',
                'Serum creatine kinase (CK) indicated if patient reports unexplained muscle pain or weakness.'
            ],
            'monitoringTests': ['Lipid Panel (4–12 weeks after start)', 'ALT / AST', 'eGFR']
        })

    return JsonResponse({
        'status': 'success',
        'data': med_info
    })

@csrf_exempt
def medication_recommend_view(request):
    return JsonResponse({
        'status': 'success',
        'data': {
            'guidelineRecommendations': [
                {
                    'category': 'First-Line Lifestyle & Nutritional Guidance',
                    'recommendation': 'Structured physical activity: minimum 150 minutes/week moderate aerobic exercise.',
                    'evidenceLevel': 'Level A (ADA / AHA Guidelines)'
                },
                {
                    'category': 'Nutritional Supplementation Consultation',
                    'recommendation': 'Discuss Vitamin D3 (cholecalciferol) supplementation with your physician (2,000–5,000 IU/day oral protocol).',
                    'evidenceLevel': 'Level B (Endocrine Society)'
                },
                {
                    'category': 'Pharmacotherapy Consideration (Physician Evaluation)',
                    'recommendation': 'If glycemic and lipid markers persist out of range after 3 months of lifestyle modification, discuss Metformin and/or low-dose Statin with primary care clinician.',
                    'evidenceLevel': 'Guideline-Gated Consultation'
                }
            ],
            'disclaimer': 'Readout provides clinical guideline education and does not prescribe or dispense medications.'
        }
    })

@csrf_exempt
def dose_info_view(request):
    return JsonResponse({
        'status': 'success',
        'safety_label': 'INFORMATIONAL ONLY — NOT INDIVIDUALIZED DOSING',
        'data': {
            'status': 'INSUFFICIENT_INFORMATION',
            'message': 'Clinical dosing requires complete review of patient renal function, hepatic clearance, concurrent medications, and body surface area by a licensed physician.',
            'educationalDosingReference': [
                {
                    'agent': 'Vitamin D3 (Cholecalciferol)',
                    'typicalDose': '2,000 IU – 5,000 IU daily or 50,000 IU weekly for 8 weeks',
                    'route': 'Oral',
                    'context': 'Deficiency correction protocol under clinical supervision'
                },
                {
                    'agent': 'Omega-3 Fatty Acids (EPA/DHA)',
                    'typicalDose': '2,000 mg – 4,000 mg daily',
                    'route': 'Oral',
                    'context': 'Hypertriglyceridemia adjunctive nutritional therapy'
                }
            ],
            'disclaimer': 'Dosing information is for general educational comparison only. Always follow your prescribing physician’s instructions.'
        }
    })

@csrf_exempt
def prescription_draft_view(request):
    return JsonResponse({
        'status': 'success',
        'safety_label': 'EDUCATIONAL WORKSHEET — NOT A VALID PRESCRIPTION',
        'data': {
            'legal_status': 'VOID / INVALID FOR DISPENSING — FOR DOCTOR DISCUSSION ONLY',
            'draftStatus': 'PATIENT_PHYSICIAN_DISCUSSION_DRAFT',
            'isLegalPrescription': False,
            'warning': 'THIS DOCUMENT IS AN EDUCATIONAL CONSULTATION WORKSHEET AND IS NOT A LEGAL PRESCRIPTION.',
            'discussionItems': [
                {
                    'item': 'Vitamin D3 (Cholecalciferol) 50,000 IU capsules',
                    'suggestedDirections': 'Take 1 capsule weekly for 8 weeks, then re-check 25(OH)D level.',
                    'indication': 'Documented Serum 25(OH)D deficiency (17 ng/mL)'
                },
                {
                    'item': 'Follow-Up Lab Requisition Panel',
                    'suggestedDirections': 'Repeat Fasting Glucose, HbA1c, and Lipid Profile in 90 days.',
                    'indication': 'Monitor response to lifestyle and glycemic modification.'
                }
            ]
        }
    })
