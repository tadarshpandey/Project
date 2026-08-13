from django.contrib import admin
from .models import WasteReport

@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'location_name', 'status', 'latitude', 'longitude', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('location_name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
