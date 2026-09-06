"""Load bundled fabric photos into ColorSwatch (admin → Renkler).

Usage (VM):
    python manage.py seed_color_swatches
"""
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from products.models import ColorSwatch

SWATCHES = [
    ("K-01", "Bordo"),
    ("K-02", "Antrasit"),
    ("K-03", "Siyah"),
    ("K-04", "Füme Mavi"),
    ("K-05", "Kum Beji"),
    ("K-06", "Koyu Antrasit"),
    ("K-07", "Şarap Kırmızısı"),
    ("K-08", "Petrol Yeşili"),
    ("K-09", "Hardal"),
    ("K-10", "Gül Kurusu"),
    ("K-11", "Kiremit"),
    ("K-12", "Gece Mavisi"),
    ("K-13", "Lacivert-Bordo"),
    ("K-14", "Grafit"),
    ("K-15", "Koyu Bordo"),
    ("K-16", "Orman Yeşili"),
    ("K-17", "Lacivert"),
    ("K-18", "Çelik Mavi"),
    ("K-19", "Deniz Yeşili"),
    ("K-20", "Mavi"),
]


class Command(BaseCommand):
    help = "Gönderilen kumaş fotoğraflarını admin renklerine ekler."

    def handle(self, *args, **options):
        seed_dir = Path(__file__).resolve().parents[2] / "seed_data" / "swatches"
        if not seed_dir.exists():
            self.stderr.write(self.style.ERROR(f"Klasör bulunamadı: {seed_dir}"))
            return

        created, updated = 0, 0
        for code, name in SWATCHES:
            src = seed_dir / f"{code}.jpg"
            if not src.exists():
                self.stderr.write(self.style.WARNING(f"Dosya yok, atlandı: {src.name}"))
                continue

            swatch, was_created = ColorSwatch.objects.get_or_create(
                code=code, defaults={"name": name}
            )
            swatch.name = name
            with src.open("rb") as fh:
                swatch.image.save(f"{code}.jpg", File(fh), save=True)
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"{created} yeni renk eklendi, {updated} güncellendi."))
