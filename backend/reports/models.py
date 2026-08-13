from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class WasteReport(models.Model):
    """
    Model representing a waste report submitted by a citizen/user.
    """
    STATUS_REPORTED = 'REPORTED'
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_RESOLVED = 'RESOLVED'

    STATUS_CHOICES = [
        (STATUS_REPORTED, 'Reported'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
    ]

    image = models.ImageField(
        upload_to='reports/%Y/%m/%d/',
        help_text='Photograph of the reported waste'
    )
    description = models.TextField(
        max_length=1000,
        help_text='Detailed description of the waste'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal('-90.000000')),
            MaxValueValidator(Decimal('90.000000')),
        ],
        help_text='Latitude coordinate between -90 and 90'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal('-180.000000')),
            MaxValueValidator(Decimal('180.000000')),
        ],
        help_text='Longitude coordinate between -180 and 180'
    )
    location_name = models.CharField(
        max_length=255,
        help_text='Human-readable address or landmark name'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_REPORTED,
        db_index=True,
        help_text='Current progress status of the report'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Timestamp when the report was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Timestamp when the report was last updated'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Waste Report'
        verbose_name_plural = 'Waste Reports'

    def __str__(self):
        return f"Report #{self.id} - {self.location_name} [{self.status}]"
