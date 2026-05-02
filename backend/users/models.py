from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random


class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.username


class OTPVerification(models.Model):
    PURPOSE_REGISTRATION    = 'registration'
    PURPOSE_PASSWORD_RESET  = 'password_reset'
    PURPOSE_CHOICES = [
        (PURPOSE_REGISTRATION,   'Registration'),
        (PURPOSE_PASSWORD_RESET, 'Password Reset'),
    ]

    email      = models.EmailField()
    otp_code   = models.CharField(max_length=6)
    purpose    = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_used    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_expired(self):
        """OTP expires after 10 minutes."""
        return (timezone.now() - self.created_at).total_seconds() > 600

    @classmethod
    def generate(cls, email, purpose):
        """Delete old OTPs for this email+purpose, generate a fresh one."""
        cls.objects.filter(email=email, purpose=purpose, is_used=False).delete()
        code = str(random.randint(100000, 999999))
        return cls.objects.create(email=email, otp_code=code, purpose=purpose)

    def __str__(self):
        return f"{self.email} | {self.purpose} | {self.otp_code}"

from products.models import Product

class Wishlist(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
