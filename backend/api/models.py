# api/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Add any custom fields if needed, like:
    # bio = models.TextField(blank=True)
    pass
