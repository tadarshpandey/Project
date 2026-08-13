import io
from decimal import Decimal
from PIL import Image, ImageDraw, ImageFont
from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from reports.models import WasteReport

def create_sample_image(title, bg_color=(200, 70, 70)):
    img = Image.new('RGB', (600, 400), color=bg_color)
    draw = ImageDraw.Draw(img)
    # Draw simple visual shapes
    draw.rectangle([20, 20, 580, 380], outline=(255, 255, 255), width=3)
    draw.text((40, 50), f"WasteTrack Evidence", fill=(255, 255, 255))
    draw.text((40, 90), f"Location: {title}", fill=(255, 255, 255))
    
    # Save to buffer
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85)
    buf.seek(0)
    return SimpleUploadedFile(
        name=f"{title.lower().replace(' ', '_')}.jpg",
        content=buf.read(),
        content_type='image/jpeg'
    )

class Command(BaseCommand):
    help = 'Seeds initial sample waste reports for development testing'

    def handle(self, *args, **kwargs):
        if WasteReport.objects.exists():
            self.stdout.write(self.style.WARNING('Reports already exist. Skipping seed.'))
            return

        reports = [
            {
                'location_name': 'Phaphamau Road, Prayagraj',
                'description': 'Large accumulation of single-use plastic bottles, snack wrappers, and cardboard boxes discarded near the roadside bus stop.',
                'latitude': Decimal('25.502100'),
                'longitude': '81.854200',
                'status': WasteReport.STATUS_REPORTED,
                'color': (180, 83, 9), # amber
            },
            {
                'location_name': 'BBS College Perimeter Gate, Prayagraj',
                'description': 'Overflowing roadside garbage bin with scattered plastic waste affecting pedestrian walkway. Municipal cleanup scheduled.',
                'latitude': Decimal('25.498400'),
                'longitude': Decimal('81.862100'),
                'status': WasteReport.STATUS_IN_PROGRESS,
                'color': (67, 56, 202), # indigo
            },
            {
                'location_name': 'Civil Lines Shopping Area, Prayagraj',
                'description': 'Construction debris and discarded dry waste reported along the service lane. Successfully collected and sanitized by municipal crew.',
                'latitude': Decimal('25.452800'),
                'longitude': Decimal('81.834000'),
                'status': WasteReport.STATUS_RESOLVED,
                'color': (5, 150, 105), # emerald
            },
        ]

        for item in reports:
            img = create_sample_image(item['location_name'], item.pop('color'))
            WasteReport.objects.create(
                image=img,
                location_name=item['location_name'],
                description=item['description'],
                latitude=item['latitude'],
                longitude=item['longitude'],
                status=item['status']
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(reports)} sample waste reports!'))
