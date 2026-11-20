from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health_view, name='core-health-api'),
    path('settings', views.settings_view, name='core-settings'),
    path('audit', views.audit_view, name='core-audit'),
    path('presentation/download', views.presentation_download_view, name='core-presentation-download'),
]
