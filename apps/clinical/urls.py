from django.urls import path
from . import views

urlpatterns = [
    path('history', views.history_view, name='clinical-history'),
    path('timeline', views.timeline_view, name='clinical-timeline'),
    path('trends', views.trends_view, name='clinical-trends'),
    path('comparison', views.comparison_view, name='clinical-comparison'),
    path('analysis/patterns', views.patterns_view, name='clinical-patterns'),
    path('analysis/conditions', views.conditions_view, name='clinical-conditions'),
    path('diagnosis/analyze', views.diagnosis_view, name='clinical-diagnosis'),
    path('prediction/analyze', views.prediction_view, name='clinical-prediction'),
    path('medications/recommend', views.medication_recommend_view, name='clinical-medication-recommend'),
    path('medications/dose-info', views.dose_info_view, name='clinical-dose-info'),
    path('medications/<str:name>', views.medication_detail_view, name='clinical-medication-detail'),
    path('prescriptions/draft', views.prescription_draft_view, name='clinical-prescription-draft'),
]
