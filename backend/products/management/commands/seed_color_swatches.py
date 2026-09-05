"""Bulk-create ColorSwatch rows from image files already sitting in MEDIA_ROOT/swatches/.

Usage:
    1. Extract the swatch zip so each file (e.g. B-130.jpg) lands in
       backend/media/swatches/
    2. Run: python manage.py seed_color_swatches
"""
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from products.models import ColorSwatch


class Command(BaseCommand):
    help = "Create/update ColorSwatch objects from image files in media/swatches/"

    def handle(self, *args, **options):
        swatch_dir = Path(settings.MEDIA_ROOT) / "swatches"
        if not swatch_dir.exists():
            self.stderr.write(self.style.ERROR(f"Klasör bulunamadı: {swatch_dir}"))
            return

        created, updated = 0, 0
        for file in sorted(swatch_dir.iterdir()):
            if not file.is_file() or file.suffix.lower() not in (".jpg", ".jpeg", ".png"):
                continue
            code = file.stem
            relative_path = f"swatches/{file.name}"

            swatch, was_created = ColorSwatch.objects.get_or_create(
                code=code, defaults={"image": relative_path}
            )
            if not was_created and swatch.image != relative_path:
                swatch.image = relative_path
                swatch.save()
                updated += 1
            elif was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"{created} yeni renk eklendi, {updated} güncellendi."))