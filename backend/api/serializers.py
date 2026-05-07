from rest_framework import serializers
from .models import Patient, Scan, InferenceResult

class InferenceResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = InferenceResult
        fields = '__all__'

class ScanSerializer(serializers.ModelSerializer):
    inference_result = InferenceResultSerializer(read_only=True)
    class Meta:
        model = Scan
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    scans = ScanSerializer(many=True, read_only=True)
    class Meta:
        model = Patient
        fields = '__all__'
