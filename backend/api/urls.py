from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, ScanViewSet, InferenceResultViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'scans', ScanViewSet)
router.register(r'results', InferenceResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
