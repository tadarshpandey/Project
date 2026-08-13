from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WasteReportViewSet

router = DefaultRouter()
router.register(r'reports', WasteReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
