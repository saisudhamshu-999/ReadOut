from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.reports.models import Report, LabResult
from apps.core.models import SystemSetting, AuditLog
from services.extractor import DEFAULT_FALLBACK_PARAMS

class Command(BaseCommand):
    help = 'Seeds initial demonstration report and settings'

    def handle(self, *args, **options):
        # Create default demo user
        user, created = User.objects.get_or_create(
            email='patient@readout.health',
            defaults={
                'full_name': 'Ananya Sharma'
            }
        )
        if created:
            user.set_password('readout2026')
            user.save()
            self.stdout.write(self.style.SUCCESS("Created default user: patient@readout.health"))

        # Create demo report if none exists
        if not Report.objects.exists():
            report = Report.objects.create(
                id='rpt-2026-03-04-001',
                user=user,
                title='Comprehensive Metabolic & Lipid Profile',
                laboratory='Meridian Diagnostics, Banjara Hills',
                collected='04 March 2026',
                reported='05 March 2026',
                is_fasting=True,
                pages=2,
                confidence=0.98,
                extraction_method='GEMINI_VISION_AI',
                model_used='gemini-2.5-flash',
                status='COMPLETED',
                patient_name='Ananya Sharma',
                patient_age='41',
                patient_sex='Female'
            )

            for idx, p in enumerate(DEFAULT_FALLBACK_PARAMS):
                val = float(p.get('value', 0.0))
                low = p.get('low')
                high = p.get('high')
                unit = p.get('unit', '')

                reading = "This value sits inside the range printed on your report."
                if high is not None and val > high:
                    reading = f"This value is above the upper end of the range ({high} {unit}) printed on your report."
                elif low is not None and val < low:
                    reading = f"This value is below the lower end of the range ({low} {unit}) printed on your report."

                LabResult.objects.create(
                    id=f"{report.id}_{p.get('id', idx)}",
                    canonical_id=p.get('id', f'p_{idx}'),
                    report=report,
                    name=p.get('name'),
                    abbr=p.get('abbr', ''),
                    group=p.get('group', 'General Chemistry'),
                    value=val,
                    unit=unit,
                    low=low,
                    high=high,
                    what=p.get('what', ''),
                    reading=reading,
                    influences=p.get('influences', ''),
                    ask=p.get('ask', ''),
                    terms=p.get('terms', ''),
                    confidence=0.98,
                    is_verified=True,
                    sort_order=idx
                )

            self.stdout.write(self.style.SUCCESS(f"Seeded baseline report with {len(DEFAULT_FALLBACK_PARAMS)} parameters"))

        # Initialize SystemSettings
        SystemSetting.objects.get_or_create(
            key='global',
            defaults={
                'data': {
                    'units': 'conventional',
                    'theme': 'auto',
                    'textSize': 'normal',
                    'privacyMode': True,
                    'autoVerifyOcr': False
                }
            }
        )
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully."))
