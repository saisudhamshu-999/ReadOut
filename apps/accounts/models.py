import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password

def generate_user_id():
    return f"usr-{uuid.uuid4().hex[:12]}"

class User(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_user_id)
    email = models.EmailField(unique=True, db_index=True)
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'readout_users'
        ordering = ['-created_at']

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password(raw_password, self.password_hash)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'fullName': self.full_name
        }

    def __str__(self):
        return f"{self.email} ({self.id})"
