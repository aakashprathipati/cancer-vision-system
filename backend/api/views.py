from rest_framework import viewsets
from .models import Patient, Scan, InferenceResult
from .serializers import PatientSerializer, ScanSerializer, InferenceResultSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer

class ScanViewSet(viewsets.ModelViewSet):
    queryset = Scan.objects.all().order_by('-uploaded_at')
    serializer_class = ScanSerializer

class InferenceResultViewSet(viewsets.ModelViewSet):
    queryset = InferenceResult.objects.all().order_by('-created_at')
    serializer_class = InferenceResultSerializer
