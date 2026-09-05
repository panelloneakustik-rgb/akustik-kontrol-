from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.deconstruct import deconstructible


@deconstructible
class PrivateInvoiceStorage(FileSystemStorage):
    """Store invoice PDFs outside public MEDIA_ROOT so /media/ cannot serve them."""

    def __init__(self, **kwargs):
        kwargs.setdefault("location", str(settings.PRIVATE_MEDIA_ROOT))
        kwargs.setdefault("base_url", None)
        super().__init__(**kwargs)
