from django.urls import path
from . import views

urlpatterns = [
    path('chat', views.chat_view, name='rag-chat'),
    path('rag/query', views.rag_query_view, name='rag-query'),
    path('rag/knowledge-base', views.rag_knowledge_base_view, name='rag-knowledge-base'),
    path('rag/stats', views.rag_stats_view, name='rag-stats'),
]
