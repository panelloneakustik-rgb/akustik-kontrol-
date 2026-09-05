import shutil
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "SQLite veritabanının zaman damgalı kopyasını backups/ altına alır."

    def handle(self, *args, **options):
        db = Path(settings.DATABASES["default"]["NAME"])
        if not db.exists():
            self.stderr.write("Veritabanı dosyası yok.")
            return
        dest_dir = Path(settings.BASE_DIR) / "backups"
        dest_dir.mkdir(exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        dest = dest_dir / f"db-{stamp}.sqlite3"
        shutil.copy2(db, dest)
        self.stdout.write(self.style.SUCCESS(f"Yedek alındı: {dest}"))
