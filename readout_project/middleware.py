"""
Clinical Safety & Security Middleware for Readout.
Injects mandatory clinical disclaimer and security headers into every HTTP response.
"""

class MedicalSafetyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Medical-Safety-Disclaimer'] = 'Readout flags results; it does not diagnose, treat, or replace a clinician.'
        response['X-Content-Type-Options'] = 'nosniff'
        return response
