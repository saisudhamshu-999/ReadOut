import uuid
from django.db import models
from apps.accounts.models import User

def generate_report_id():
    return f"rpt-{uuid.uuid4().hex[:12]}"

class Report(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_report_id)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    title = models.CharField(max_length=255, default='Laboratory Examination Report')
    laboratory = models.CharField(max_length=255, default='Meridian Diagnostics, Banjara Hills')
    collected = models.CharField(max_length=100, default='4 March 2026')
    reported = models.CharField(max_length=100, default='5 March 2026')
    is_fasting = models.BooleanField(default=True)
    pages = models.IntegerField(default=1)
    confidence = models.FloatField(default=0.98)
    extraction_method = models.CharField(max_length=100, default='GEMINI_VISION_AI')
    model_used = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=50, default='COMPLETED')
    patient_name = models.CharField(max_length=255, blank=True, default='')
    patient_age = models.CharField(max_length=50, blank=True, default='')
    patient_sex = models.CharField(max_length=50, blank=True, default='')
    file_path = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'readout_reports'
        ordering = ['-created_at']

    @property
    def flags_count(self):
        count = 0
        for p in self.parameters.all():
            if (p.high is not None and p.value > p.high) or (p.low is not None and p.value < p.low):
                count += 1
        return count

    def to_summary_dict(self):
        total_tests = self.parameters.count()
        return {
            'id': self.id,
            'title': self.title,
            'lab': self.laboratory,
            'date': self.collected,
            'flags': self.flags_count,
            'totalTests': total_tests,
            'confidence': self.confidence,
            'method': self.extraction_method,
            'status': self.status
        }

    def to_detail_dict(self):
        params = [p.to_dict() for p in self.parameters.all()]
        return {
            'id': self.id,
            'title': self.title,
            'lab': self.laboratory,
            'collected': self.collected,
            'reported': self.reported,
            'fasting': self.is_fasting,
            'pages': self.pages,
            'extracted': len(params),
            'confidence': self.confidence,
            'status': self.status,
            'patient': {
                'name': self.patient_name,
                'age': self.patient_age,
                'sex': self.patient_sex
            },
            'parameters': params
        }

    def __str__(self):
        return f"{self.title} ({self.id})"


class LabResult(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    canonical_id = models.CharField(max_length=64, db_index=True)
    report = models.ForeignKey(Report, related_name='parameters', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    abbr = models.CharField(max_length=50, blank=True, default='')
    group = models.CharField(max_length=100, default='General Chemistry')
    value = models.FloatField()
    unit = models.CharField(max_length=50, blank=True, default='')
    low = models.FloatField(null=True, blank=True)
    high = models.FloatField(null=True, blank=True)
    what = models.TextField(blank=True, default='')
    reading = models.TextField(blank=True, default='')
    influences = models.TextField(blank=True, default='')
    ask = models.TextField(blank=True, default='')
    terms = models.TextField(blank=True, default='')
    confidence = models.FloatField(default=0.98)
    source_line = models.TextField(blank=True, default='')
    is_verified = models.BooleanField(default=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'readout_lab_results'
        ordering = ['sort_order', 'id']

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'abbr': self.abbr,
            'group': self.group,
            'value': self.value,
            'unit': self.unit,
            'low': self.low,
            'high': self.high,
            'what': self.what,
            'reading': self.reading,
            'influences': self.influences,
            'ask': self.ask,
            'terms': self.terms,
            'confidence': self.confidence,
            'sourceLine': self.source_line,
            'isVerified': self.is_verified,
            'verifiedAt': self.verified_at.isoformat() if self.verified_at else None
        }

    def __str__(self):
        return f"{self.name}: {self.value} {self.unit} ({self.id})"
