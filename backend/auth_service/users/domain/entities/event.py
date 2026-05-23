from django.db import models


class Event(models.Model):
    type = models.CharField(max_length=100)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    aggregate_id = models.CharField(max_length=100, blank=True, null=True)
    aggregate_type = models.CharField(max_length=50, blank=True, null=True)
    version = models.IntegerField(default=1)
    metadata = models.JSONField(blank=True, default=dict)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['aggregate_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.type} - {self.aggregate_id}"
