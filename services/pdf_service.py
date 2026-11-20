import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_clinical_report_pdf(report_type: str = 'metabolic') -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F2E5A')
    )
    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#5A6578')
    )
    section_title = ParagraphStyle(
        'SecTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0F2E5A')
    )
    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1E293B')
    )
    cell_norm = ParagraphStyle(
        'CellNorm',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )
    cell_flag = ParagraphStyle(
        'CellFlag',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#B91C1C')
    )

    lab_name = 'MERIDIAN DIAGNOSTIC LABORATORIES'
    lab_sub = 'Department of Clinical Pathology & Laboratory Medicine · ISO 15189 / CAP Certified'
    patient_name = 'Ananya Sharma'
    patient_age = '41 Y / Female'
    sample_id = 'ACC-2026-89410'
    collected_date = '04-Mar-2026, 07:40 AM'
    reported_date = '05-Mar-2026, 11:15 AM'
    fasting_status = 'Fasting: Yes (12 Hours Overnight)'
    ordering_physician = 'Dr. R. K. Saxena, MD (Internal Medicine)'
    report_title = 'COMPREHENSIVE METABOLIC & LIPID PROFILE'

    if report_type == 'thyroid':
        lab_name = 'QUEST DIAGNOSTIC NETWORK LABORATORIES'
        lab_sub = 'Specialized Endocrinology & Hematology Laboratory · CLIA #09D2081492 / CAP Accredited'
        patient_name = 'Priya Sundaram'
        patient_age = '34 Y / Female'
        sample_id = 'QST-2026-44102'
        collected_date = '12-Sep-2026, 08:15 AM'
        reported_date = '13-Sep-2026, 02:30 PM'
        fasting_status = 'Fasting: Yes (10 Hours)'
        ordering_physician = 'Dr. Sarah Jenkins, MD (Endocrinology)'
        report_title = 'THYROID FUNCTION & ANEMIA EVALUATION PANEL'
        test_rows = [
            ('Haemoglobin (HGB)', '9.6', 'g/dL', '12.0 - 15.5', 'LOW'),
            ('Serum Ferritin', '8.2', 'ng/mL', '15.0 - 150.0', 'LOW'),
            ('Thyroid Stimulating Hormone (TSH)', '6.80', 'µIU/mL', '0.40 - 4.00', 'HIGH'),
            ('Free Thyroxine (Free T4)', '0.72', 'ng/dL', '0.80 - 1.80', 'LOW'),
            ('Serum Iron', '32', 'µg/dL', '60 - 170', 'LOW'),
            ('Total Iron Binding Capacity (TIBC)', '412', 'µg/dL', '240 - 450', ''),
            ('Platelet Count', '342', 'x10^3/µL', '150 - 410', ''),
            ('Fasting Blood Glucose', '86', 'mg/dL', '70 - 99', ''),
            ('Serum Creatinine', '0.78', 'mg/dL', '0.60 - 1.10', ''),
        ]
        comments = [
            'Microcytic hypochromic erythrocyte morphology noted on peripheral blood review.',
            'Markedly depleted ferritin indicates severe iron store depletion.',
            'Elevated TSH with subnormal Free T4 is consistent with primary hypothyroidism.'
        ]
    elif report_type == 'critical':
        lab_name = 'ST. JUDE REGIONAL ACUTE CARE CLINICAL LABORATORIES'
        lab_sub = 'Critical Care & Emergency Pathology Department · 24/7 STAT Laboratory Services'
        patient_name = 'Simulated Patient (Emergency Triage)'
        patient_age = '58 Y / Male'
        sample_id = 'STAT-EMERG-2026-99'
        collected_date = '17-Sep-2026, 06:10 AM'
        reported_date = '17-Sep-2026, 06:45 AM (STAT)'
        fasting_status = 'Fasting: Unknown / Emergency Room Admission'
        ordering_physician = 'Dr. M. K. Thorne, MD (Critical Care / Emergency)'
        report_title = 'CRITICAL CARE METABOLIC & HEMATOLOGY STAT PANEL'
        test_rows = [
            ('Serum Potassium (K+)', '6.3', 'mEq/L', '3.5 - 5.0', 'CRITICAL HIGH'),
            ('Serum Sodium (Na+)', '118', 'mEq/L', '136 - 145', 'CRITICAL LOW'),
            ('Haemoglobin (HGB)', '6.8', 'g/dL', '13.0 - 17.5', 'CRITICAL LOW'),
            ('Blood Glucose (STAT)', '435', 'mg/dL', '70 - 99', 'CRITICAL HIGH'),
            ('Platelet Count', '22', 'x10^3/µL', '150 - 410', 'CRITICAL LOW'),
            ('Serum Creatinine', '3.4', 'mg/dL', '0.70 - 1.30', 'HIGH'),
            ('White Blood Cell Count (WBC)', '14.2', 'x10^3/µL', '4.0 - 11.0', 'HIGH')
        ]
        comments = [
            '*** PANIC / CRITICAL VALUE ALERT: Results immediately telephoned to ordering physician. ***',
            'Hyperkalemia (K+ 6.3 mEq/L) carries urgent cardiac arrhythmia risk. Obtain 12-lead ECG STAT.',
            'Severe symptomatic anemia (Hgb 6.8 g/dL) meets clinical transfusion consideration criteria.',
            'Severe hyponatremia (Na+ 118 mEq/L) requires controlled correction in an acute care setting.'
        ]
    else:
        test_rows = [
            ('Haemoglobin (HGB)', '13.4', 'g/dL', '12.0 - 15.5', ''),
            ('Haematocrit (PCV)', '40.2', '%', '36.0 - 46.0', ''),
            ('White Blood Cell Count (WBC)', '11.8', 'x10^3/µL', '4.0 - 11.0', 'HIGH'),
            ('Platelet Count', '268', 'x10^3/µL', '150 - 410', ''),
            ('Fasting Blood Glucose', '112', 'mg/dL', '70 - 99', 'HIGH'),
            ('HbA1c (Glycated Haemoglobin)', '6.1', '%', '4.0 - 5.6', 'HIGH'),
            ('Total Cholesterol', '214', 'mg/dL', '< 200', 'HIGH'),
            ('LDL Cholesterol', '141', 'mg/dL', '< 100', 'HIGH'),
            ('HDL Cholesterol', '38', 'mg/dL', '> 40', 'LOW'),
            ('Triglycerides', '178', 'mg/dL', '< 150', 'HIGH'),
            ('Serum Creatinine', '0.88', 'mg/dL', '0.50 - 1.10', ''),
            ('Estimated GFR (eGFR)', '94', 'mL/min/1.73m²', '> 60', ''),
            ('ALT / SGPT', '34', 'U/L', '7 - 56', ''),
            ('AST / SGOT', '28', 'U/L', '10 - 40', ''),
            ('Total Bilirubin', '0.7', 'mg/dL', '0.2 - 1.2', ''),
            ('25-Hydroxy Vitamin D', '17', 'ng/mL', '30 - 100', 'LOW'),
        ]
        comments = [
            'Impaired fasting glucose and borderline HbA1c indicate prediabetic state.',
            'Mixed atherogenic dyslipidemia noted with low HDL and elevated Triglycerides.',
            'Moderate hypovitaminosis D noted; clinical supplementation suggested.'
        ]

    story = []

    # Header
    header_table = Table([
        [Paragraph(lab_name, title_style), Paragraph(f"<b>Accession:</b> {sample_id}", cell_bold)],
        [Paragraph(lab_sub, sub_style), Paragraph(f"<b>Reported:</b> {reported_date}", cell_norm)]
    ], colWidths=[380, 140])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F2E5A'), spaceAfter=8))

    # Patient & Specimen Info Table
    info_data = [
        [
            Paragraph(f"<b>Patient:</b> {patient_name}", cell_norm),
            Paragraph(f"<b>Age / Sex:</b> {patient_age}", cell_norm),
            Paragraph(f"<b>Collected:</b> {collected_date}", cell_norm)
        ],
        [
            Paragraph(f"<b>Physician:</b> {ordering_physician}", cell_norm),
            Paragraph(f"<b>Status:</b> {fasting_status}", cell_norm),
            Paragraph(f"<b>Panel:</b> {report_title}", cell_bold)
        ]
    ]
    info_table = Table(info_data, colWidths=[180, 160, 180])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 12))

    # Test Results Table
    table_headers = [
        Paragraph("<b>Test Name</b>", cell_bold),
        Paragraph("<b>Result</b>", cell_bold),
        Paragraph("<b>Units</b>", cell_bold),
        Paragraph("<b>Reference Interval</b>", cell_bold),
        Paragraph("<b>Flag</b>", cell_bold)
    ]
    table_rows = [table_headers]

    for name, val, unit, r_range, flag in test_rows:
        val_style = cell_flag if flag else cell_bold
        flag_style = cell_flag if flag else cell_norm
        table_rows.append([
            Paragraph(name, cell_norm),
            Paragraph(val, val_style),
            Paragraph(unit, cell_norm),
            Paragraph(r_range, cell_norm),
            Paragraph(flag, flag_style)
        ])

    results_table = Table(table_rows, colWidths=[200, 70, 70, 110, 70])
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#0F2E5A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    # Row striping
    for i in range(1, len(table_rows)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')))
    results_table.setStyle(TableStyle(t_style))
    story.append(results_table)
    story.append(Spacer(1, 10))

    # Comments
    story.append(Paragraph("<b>Pathology Review & Clinical Notes:</b>", section_title))
    story.append(Spacer(1, 4))
    for c in comments:
        story.append(Paragraph(f"• {c}", cell_norm))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=6))
    story.append(Paragraph(
        "<i>Disclaimer: This document is an authentic laboratory record generated for educational and clinical consultation review. Readout does not provide medical diagnosis or treatment. Consult a licensed physician for medical advice.</i>",
        sub_style
    ))

    doc.build(story)
    return buffer.getvalue()
