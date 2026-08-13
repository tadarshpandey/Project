import os
from decimal import Decimal
from rest_framework import serializers
from .models import WasteReport

# 5 MB maximum image upload size
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

class WasteReportSerializer(serializers.ModelSerializer):
    """
    Full serializer for WasteReport model with custom field validations.
    """
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WasteReport
        fields = [
            'id',
            'image',
            'image_url',
            'description',
            'latitude',
            'longitude',
            'location_name',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    def validate_image(self, value):
        if value:
            # Validate file size
            if value.size > MAX_IMAGE_SIZE_BYTES:
                raise serializers.ValidationError(
                    f"Image file size exceeds limit of 5MB (Received {value.size / (1024 * 1024):.1f}MB)."
                )
            # Validate extension
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                raise serializers.ValidationError(
                    f"Unsupported image format '{ext}'. Allowed formats: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}."
                )
        return value

    def validate_latitude(self, value):
        if value < Decimal('-90.0') or value > Decimal('90.0'):
            raise serializers.ValidationError(
                "Latitude must be between -90.0 and 90.0 degrees."
            )
        return value

    def validate_longitude(self, value):
        if value < Decimal('-180.0') or value > Decimal('180.0'):
            raise serializers.ValidationError(
                "Longitude must be between -180.0 and 180.0 degrees."
            )
        return value

    def validate_description(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Description cannot be empty.")
        if len(cleaned) < 5:
            raise serializers.ValidationError("Description must be at least 5 characters long.")
        return cleaned

    def validate_location_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Location name cannot be empty.")
        return cleaned


class WasteReportStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for updating the status of a waste report.
    """
    status = serializers.ChoiceField(
        choices=WasteReport.STATUS_CHOICES,
        error_messages={
            'invalid_choice': f"Invalid status. Must be one of: {', '.join([c[0] for c in WasteReport.STATUS_CHOICES])}."
        }
    )

    class Meta:
        model = WasteReport
        fields = ['status']
