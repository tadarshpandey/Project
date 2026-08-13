import io
from PIL import Image
from decimal import Decimal
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import WasteReport

def generate_test_image(filename='test_waste.jpg', image_format='JPEG'):
    """Generate a temporary in-memory image for upload tests."""
    file_obj = io.BytesIO()
    image = Image.new('RGB', (100, 100), color=(73, 109, 137))
    image.save(file_obj, format=image_format)
    file_obj.seek(0)
    return SimpleUploadedFile(
        name=filename,
        content=file_obj.read(),
        content_type=f'image/{image_format.lower()}'
    )

class WasteReportAPITests(APITestCase):
    def setUp(self):
        self.image = generate_test_image('sample.jpg')
        self.report1 = WasteReport.objects.create(
            image=self.image,
            description="Large garbage pile near main gate",
            latitude=Decimal('25.435800'),
            longitude=Decimal('81.846300'),
            location_name="BBS College Main Gate, Prayagraj",
            status=WasteReport.STATUS_REPORTED
        )
        self.list_url = reverse('report-list')
        self.detail_url = reverse('report-detail', kwargs={'pk': self.report1.pk})
        self.stats_url = reverse('report-stats')

    def test_get_all_reports(self):
        """Test retrieving the list of waste reports."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['location_name'], "BBS College Main Gate, Prayagraj")
        self.assertIn('image_url', response.data[0])

    def test_get_single_report(self):
        """Test retrieving a single waste report."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.report1.id)
        self.assertEqual(response.data['status'], WasteReport.STATUS_REPORTED)

    def test_create_report_success(self):
        """Test creating a new waste report with image and valid coordinates."""
        image_file = generate_test_image('new_waste.jpg')
        payload = {
            'image': image_file,
            'description': 'Plastic bottles scattered along sidewalk',
            'latitude': '25.450000',
            'longitude': '81.860000',
            'location_name': 'Phaphamau Road',
        }
        response = self.client.post(self.list_url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], WasteReport.STATUS_REPORTED)
        self.assertEqual(response.data['location_name'], 'Phaphamau Road')
        self.assertTrue(WasteReport.objects.filter(location_name='Phaphamau Road').exists())

    def test_update_report_status_valid(self):
        """Test transitioning status to IN_PROGRESS and RESOLVED."""
        # Update to IN_PROGRESS
        response = self.client.patch(self.detail_url, {'status': WasteReport.STATUS_IN_PROGRESS}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report1.refresh_from_db()
        self.assertEqual(self.report1.status, WasteReport.STATUS_IN_PROGRESS)

        # Update to RESOLVED
        response = self.client.patch(self.detail_url, {'status': WasteReport.STATUS_RESOLVED}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report1.refresh_from_db()
        self.assertEqual(self.report1.status, WasteReport.STATUS_RESOLVED)

    def test_update_report_status_invalid(self):
        """Test rejecting an invalid status value."""
        response = self.client.patch(self.detail_url, {'status': 'COMPLETED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    def test_create_report_invalid_latitude(self):
        """Test rejecting latitude out of range (-90 to 90)."""
        image_file = generate_test_image('invalid_lat.jpg')
        payload = {
            'image': image_file,
            'description': 'Invalid latitude test',
            'latitude': '95.123456',
            'longitude': '81.860000',
            'location_name': 'Invalid Location',
        }
        response = self.client.post(self.list_url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('latitude', response.data)

    def test_create_report_invalid_longitude(self):
        """Test rejecting longitude out of range (-180 to 180)."""
        image_file = generate_test_image('invalid_lon.jpg')
        payload = {
            'image': image_file,
            'description': 'Invalid longitude test',
            'latitude': '25.450000',
            'longitude': '195.123456',
            'location_name': 'Invalid Location',
        }
        response = self.client.post(self.list_url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('longitude', response.data)

    def test_create_report_missing_fields(self):
        """Test rejecting request with missing required fields."""
        payload = {
            'description': '',
            'location_name': '',
        }
        response = self.client.post(self.list_url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)
        self.assertIn('latitude', response.data)
        self.assertIn('longitude', response.data)

    def test_delete_report(self):
        """Test deleting a waste report."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WasteReport.objects.filter(pk=self.report1.pk).exists())

    def test_stats_endpoint(self):
        """Test stats aggregation endpoint."""
        # Create an in_progress and a resolved report
        WasteReport.objects.create(
            image=generate_test_image('stat1.jpg'),
            description="Report 2",
            latitude=Decimal('25.1'),
            longitude=Decimal('81.1'),
            location_name="Loc 2",
            status=WasteReport.STATUS_IN_PROGRESS
        )
        WasteReport.objects.create(
            image=generate_test_image('stat2.jpg'),
            description="Report 3",
            latitude=Decimal('25.2'),
            longitude=Decimal('81.2'),
            location_name="Loc 3",
            status=WasteReport.STATUS_RESOLVED
        )

        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 3)
        self.assertEqual(response.data['reported'], 1)
        self.assertEqual(response.data['in_progress'], 1)
        self.assertEqual(response.data['resolved'], 1)
