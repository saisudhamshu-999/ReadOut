import os
from django.conf import settings
from django.urls import path, include, re_path
from django.views.static import serve
from apps.core import views as core_views

urlpatterns = [
    # Frontend HTML Pages
    path('', core_views.index_page_view, name='page-index-root'),
    path('index.html', core_views.index_page_view, name='page-index'),
    path('upload.html', core_views.upload_page_view, name='page-upload'),
    path('dashboard.html', core_views.dashboard_page_view, name='page-dashboard'),
    path('summary.html', core_views.summary_page_view, name='page-summary'),
    path('history.html', core_views.history_page_view, name='page-history'),
    path('settings.html', core_views.settings_page_view, name='page-settings'),
    path('help.html', core_views.help_page_view, name='page-help'),

    # Documentation & Specs
    path('docs', core_views.docs_view, name='swagger-docs'),
    path('docs/', core_views.docs_view, name='swagger-docs-slash'),
    path('openapi.json', core_views.openapi_view, name='openapi-spec'),

    # System Health Checks
    path('health', core_views.health_view, name='health-check-root'),
    path('api/health', core_views.health_view, name='health-check-api'),

    # API Subsystems
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.reports.urls')),
    path('api/', include('apps.clinical.urls')),
    path('api/', include('apps.rag.urls')),
    path('api/', include('apps.core.urls')),

    # Direct static & media asset serving for complete auditability
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'assets'}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
