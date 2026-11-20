import uuid
from django.db import models
from apps.accounts.models import User

def generate_log_id():
    return f"log-{uuid.uuid4().hex[:12]}"

class AuditLog(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_log_id)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_logs')
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=64, blank=True, default='')
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=64, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'readout_audit_logs'
        ordering = ['-timestamp']

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'action': self.action,
            'resourceType': self.resource_type,
            'resourceId': self.resource_id,
            'details': self.details,
            'ipAddress': self.ip_address,
            'timestamp': self.timestamp.isoformat()
        }

    def __str__(self):
        return f"{self.action} on {self.resource_type} ({self.id})"


class SystemSetting(models.Model):
    key = models.CharField(max_length=64, unique=True, default='global')
    data = models.JSONField(default=dict)

    class Meta:
        db_table = 'readout_system_settings'

    def __str__(self):
        return f"Settings ({self.key})"
