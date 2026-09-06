"""Load Plasmen kartela swatches into ColorSwatch.

Codes and names stay as on the kartela: B-010 … B-460.
Usage (VM): python manage.py seed_color_swatches
"""
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from products.models import ColorSwatch

# Plasmen kartela codes — name is the same as the printed code.
SWATCHES = [(f"B-{n:03d}", f"B-{n:03d}") for n in range(10, 470, 10)]


class Command(BaseCommand):
    help = "Karteladaki B-xxx kumaş renklerini admin renklerine ekler (isimler değişmez)."

    def handle(self, *args, **options):
        seed_dir = Path(__file__).resolve().parents[2] / "seed_data" / "swatches"
        if not seed_dir.exists():
            self.stderr.write(self.style.ERROR(f"Klasör bulunamadı: {seed_dir}"))
            return

        removed, _ = ColorSwatch.objects.filter(code__startswith="K-").delete()
        if removed:
            self.stdout.write(f"Eski K- kodlu {removed} kayıt silindi.")

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
