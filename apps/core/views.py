import os
import json
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse, HttpResponse, Http404, FileResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AuditLog, SystemSetting
from apps.accounts.auth_utils import get_current_user

BASE_DIR = Path(settings.BASE_DIR)

DEFAULT_SETTINGS = {
    'units': 'conventional',
    'theme': 'auto',
    'textSize': 'normal',
    'privacyMode': True,
    'autoVerifyOcr': False
}

def health_view(request):
    return JsonResponse({
        'status': 'healthy',
        'version': '2.0.0',
        'service': 'Readout Clinical Laboratory Intelligence Engine',
        'runtime': 'Django 5.2 (Python 3.11)',
        'timestamp': datetime.now().isoformat()
    })

@csrf_exempt
def settings_view(request):
    obj, _ = SystemSetting.objects.get_or_create(key='global', defaults={'data': DEFAULT_SETTINGS})

    if request.method == 'GET':
        return JsonResponse({
            'status': 'success',
            'data': obj.data
        })

    elif request.method in ['PUT', 'POST']:
        try:
            body = json.loads(request.body.decode('utf-8') or '{}')
        except Exception:
            body = {}

        current = dict(obj.data)
        current.update(body)
        obj.data = current
        obj.save()

        return JsonResponse({
            'status': 'success',
            'data': obj.data
        })

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def audit_view(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

    logs = AuditLog.objects.all().order_by('-timestamp')[:50]
    return JsonResponse({
        'status': 'success',
        'data': [l.to_dict() for l in logs]
    })

def presentation_download_view(request):
    pptx_path = BASE_DIR / 'Readout_Clinical_Intelligence_Deck.pptx'
    if not pptx_path.exists():
        return JsonResponse({'status': 'error', 'message': 'Presentation deck not found.'}, status=404)

    return FileResponse(
        open(pptx_path, 'rb'),
        as_attachment=True,
        filename='Readout_Clinical_Intelligence_Deck.pptx',
        content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )

def openapi_view(request):
    openapi_path = BASE_DIR / 'medical_knowledge' / 'openapi.json'
    if not openapi_path.exists():
        return JsonResponse({'status': 'error', 'message': 'OpenAPI spec not found.'}, status=404)

    with open(openapi_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return JsonResponse(data)

def docs_view(request):
    html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Readout Clinical Intelligence API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .clinical-disclaimer-banner {
      background: #0F3831;
      color: #E6F4EA;
      padding: 12px 24px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #10B981;
    }
    .clinical-disclaimer-banner a { color: #A7F3D0; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="clinical-disclaimer-banner">
    <div>
      <strong>READOUT CLINICAL INTELLIGENCE API</strong> — Fully Migrated to Django 5.2 REST Engine.
      <span>Readout explains laboratory findings; it does not diagnose or replace a licensed clinician.</span>
    </div>
    <a href="/">← Return to Application</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis]
      });
    };
  </script>
</body>
</html>"""
    return HttpResponse(html, content_type='text/html')

def serve_html_file(filename):
    file_path = BASE_DIR / filename
    if not file_path.exists():
        raise Http404(f"File {filename} not found")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/html')

def index_page_view(request):
    return serve_html_file('index.html')

def upload_page_view(request):
    return serve_html_file('upload.html')

def dashboard_page_view(request):
    return serve_html_file('dashboard.html')

def summary_page_view(request):
    return serve_html_file('summary.html')

def history_page_view(request):
    return serve_html_file('history.html')

def settings_page_view(request):
    return serve_html_file('settings.html')

def help_page_view(request):
    return serve_html_file('help.html')
