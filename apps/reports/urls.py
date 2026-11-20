from django.urls import path
from . import views

urlpatterns = [
    path('reports/upload', views.report_upload_view, name='reports-upload'),
    path('reports', views.reports_list_view, name='reports-list'),
    path('reports/<str:report_id>', views.report_detail_view, name='reports-detail'),
    path('reports/<str:report_id>/status', views.report_status_view, name='reports-status'),
    path('reports/<str:report_id>/results', views.report_results_view, name='reports-results'),
    path('reports/<str:report_id>/quality', views.report_quality_view, name='reports-quality'),
    path('reports/<str:report_id>/summary', views.report_summary_view, name='reports-summary'),
    path('reports/<str:report_id>/export', views.report_export_view, name='reports-export'),
    path('results/<str:result_id>/verify', views.verify_result_view, name='results-verify'),
    path('sample-report/download', views.sample_report_download_view, name='sample-report-download'),
]
