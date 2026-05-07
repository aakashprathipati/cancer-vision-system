from django.db import models

class Patient(models.Model):
    patient_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Scan(models.Model):
    patient = models.ForeignKey(Patient, related_name='scans', on_delete=models.CASCADE)
    image_reference = models.CharField(max_length=255) # Path or URL to the image
    clinical_notes = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Scan {self.id} for {self.patient}"

class InferenceResult(models.Model):
    scan = models.OneToOneField(Scan, related_name='inference_result', on_delete=models.CASCADE)
    confidence_score_melanoma = models.FloatField(default=0.0)
    confidence_score_bcc = models.FloatField(default=0.0)
    confidence_score_scc = models.FloatField(default=0.0)
    mask_path = models.CharField(max_length=255, blank=True, null=True)
    processing_time_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Result for Scan {self.scan.id}"
