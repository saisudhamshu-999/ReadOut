import os
import json
import pytest
from django.test import TestCase, Client
from apps.accounts.models import User
from apps.reports.models import Report, LabResult
from services.extractor import DEFAULT_FALLBACK_PARAMS

class DjangoBackendMigrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create(
            email='testpatient@readout.health',
            full_name='Test Patient'
        )
        self.user.set_password('testpassword123')
        self.user.save()

        self.report = Report.objects.create(
            id='test-rpt-001',
            user=self.user,
            title='Test Comprehensive Metabolic Profile',
            laboratory='Test Diagnostics Lab',
            collected='01 March 2026',
            reported='02 March 2026',
            is_fasting=True,
            pages=1,
            confidence=0.98,
            extraction_method='GEMINI_VISION_AI',
            status='COMPLETED',
            patient_name='Test Patient',
            patient_age='40',
            patient_sex='Female'
        )

        for idx, p in enumerate(DEFAULT_FALLBACK_PARAMS):
            LabResult.objects.create(
                id=f"{self.report.id}_{p.get('id', idx)}",
                canonical_id=p.get('id', f'p_{idx}'),
                report=self.report,
                name=p.get('name'),
                abbr=p.get('abbr', ''),
                group=p.get('group', 'General Chemistry'),
                value=float(p.get('value', 0.0)),
                unit=p.get('unit', ''),
                low=p.get('low'),
                high=p.get('high'),
                what=p.get('what', ''),
                reading=p.get('reading', ''),
                influences=p.get('influences', ''),
                ask=p.get('ask', ''),
                terms=p.get('terms', ''),
                confidence=0.98,
                is_verified=True,
                sort_order=idx
            )

    def test_health_check_endpoint(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('version', data)
        self.assertIn('X-Medical-Safety-Disclaimer', res.headers)
        self.assertIn('Readout flags results', res.headers['X-Medical-Safety-Disclaimer'])

    def test_auth_login(self):
        res = self.client.post('/api/auth/login', data=json.dumps({
            'email': 'testpatient@readout.health',
            'password': 'testpassword123'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('token', data['data'])
        self.assertIn('access_token', data['data'])

    def test_reports_latest(self):
        res = self.client.get('/api/reports/latest')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['data']['id'], self.report.id)
        self.assertEqual(len(data['data']['parameters']), len(DEFAULT_FALLBACK_PARAMS))

    def test_condition_analysis_safety_label(self):
        res = self.client.post('/api/analysis/conditions', data='{}', content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['safety_label'], 'AI CLINICAL ASSESSMENT — NOT A CONFIRMED DIAGNOSIS')
        self.assertTrue(len(data['data']['possible_conditions']) > 0)

    def test_diagnosis_analysis_safety(self):
        res = self.client.post('/api/diagnosis/analyze', data='{}', content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('NOT A CONFIRMED DIAGNOSIS', data['safety_label'])
        self.assertTrue(data['data']['confirmed_diagnosis'].startswith('NONE'))

    def test_prescription_draft_safeguards(self):
        res = self.client.post('/api/prescriptions/draft', data=json.dumps({
            'medication_name': 'Metformin',
            'clinical_indication': 'Elevated fasting blood glucose'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('NOT A VALID PRESCRIPTION', data['safety_label'])
        self.assertIn('VOID / INVALID FOR DISPENSING', data['data']['legal_status'])

    def test_dosage_insufficient_information_safety(self):
        res = self.client.post('/api/medications/dose-info', data=json.dumps({
            'medication_name': 'Metformin'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['data']['status'], 'INSUFFICIENT_INFORMATION')

    def test_chat_grounded_response(self):
        res = self.client.post('/api/chat', data=json.dumps({
            'message': 'What was my latest glucose reading?'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('112', data['data']['answer'])
        self.assertEqual(data['data']['evidence_classification'], 'REPORT_FACT')

    def test_sample_report_pdf_download(self):
        res = self.client.get('/api/sample-report/download?type=metabolic&format=pdf')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers['Content-Type'], 'application/pdf')
        self.assertTrue(len(res.content) > 1000)

    def test_static_html_serving(self):
        for route in ['/', '/index.html', '/upload.html', '/dashboard.html', '/summary.html', '/history.html', '/settings.html', '/help.html']:
            res = self.client.get(route)
            self.assertEqual(res.status_code, 200)
            self.assertIn('text/html', res.headers['Content-Type'])
