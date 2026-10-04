from django.core.management.base import BaseCommand, CommandError

from products.instagram import InstagramApiError, InstagramConfigError, sync_instagram_stories


class Command(BaseCommand):
    help = "Instagram Graph API’den görsel/video çekip site hikâyelerine yazar."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=None)

    def handle(self, *args, **options):
        try:
            result = sync_instagram_stories(limit=options["limit"])
        except InstagramConfigError as exc:
            self.stdout.write(self.style.WARNING(str(exc)))
            return
        except InstagramApiError as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(
            self.style.SUCCESS(
                f"Instagram hikâye: {result['created']} yeni, {result['updated']} güncellendi, "
                f"{result['skipped']} atlandı."
            )
        )
