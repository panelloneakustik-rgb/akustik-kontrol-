from django.db import migrations, models
import orders.models
import orders.storage


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0008_order_cargo_company_order_stock_reserved_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="order_code",
            field=models.CharField(
                blank=True,
                help_text="TÜRMOB e-fatura açıklamasına yazılacak kod, örn. AK-1042",
                max_length=20,
                null=True,
                unique=True,
                verbose_name="Sipariş kodu",
            ),
        ),
        migrations.AlterField(
            model_name="order",
            name="invoice_pdf",
            field=models.FileField(
                blank=True,
                help_text="TÜRMOB’da kestiğin e-fatura PDF’ini buraya yükle. Müşteri Siparişlerim’den görür.",
                null=True,
                storage=orders.storage.PrivateInvoiceStorage(),
                upload_to=orders.models.invoice_upload_to,
                verbose_name="TÜRMOB e-fatura PDF",
            ),
        ),
        migrations.AlterField(
            model_name="order",
            name="invoice_number",
            field=models.CharField(blank=True, max_length=64, verbose_name="Fatura no / ETTN"),
        ),
    ]
