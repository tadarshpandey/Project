from django.db.models import Q, Count
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import WasteReport
from .serializers import WasteReportSerializer, WasteReportStatusUpdateSerializer

class WasteReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Waste Reports to be viewed, created, updated, or deleted.
    """
    queryset = WasteReport.objects.all()
    serializer_class = WasteReportSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ['partial_update', 'update'] and 'status' in self.request.data and len(self.request.data) == 1:
            return WasteReportStatusUpdateSerializer
        return WasteReportSerializer

    def get_queryset(self):
        queryset = WasteReport.objects.all()
        
        # Filter by status if provided in query params (?status=REPORTED)
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        # Search by description or location_name (?search=phaphamau)
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(location_name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        # Ordering (default: -created_at)
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'updated_at', '-updated_at', 'status', '-status']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        # Ensure new report is saved with REPORTED status
        report = serializer.save(status=WasteReport.STATUS_REPORTED)
        headers = self.get_success_headers(serializer.data)
        
        # Return full serialized representation with absolute image URL
        output_serializer = WasteReportSerializer(report, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full updated record with absolute image URL
        output_serializer = WasteReportSerializer(instance, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Aggregate count statistics for dashboard counters.
        """
        total = WasteReport.objects.count()
        reported = WasteReport.objects.filter(status=WasteReport.STATUS_REPORTED).count()
        in_progress = WasteReport.objects.filter(status=WasteReport.STATUS_IN_PROGRESS).count()
        resolved = WasteReport.objects.filter(status=WasteReport.STATUS_RESOLVED).count()

        return Response({
            'total': total,
            'reported': reported,
            'in_progress': in_progress,
            'resolved': resolved,
        }, status=status.HTTP_200_OK)
