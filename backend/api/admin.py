from django.contrib import admin
from .models import Patient, Scan, InferenceResult

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'created_at')
    search_fields = ('patient_id', 'first_name', 'last_name', 'phone_number')

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'uploaded_at')
    list_filter = ('uploaded_at',)

@admin.register(InferenceResult)
class InferenceResultAdmin(admin.ModelAdmin):
    list_display = ('scan', 'confidence_score_melanoma', 'confidence_score_bcc', 'confidence_score_scc', 'created_at')
