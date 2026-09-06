from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0010_product_shipping_days"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="density",
            field=models.CharField(
                blank=True,
                help_text="Örn. 30 kg/m³ — sünger yoğunluğu ürüne göre değişir.",
                max_length=80,
                verbose_name="Ürün yoğunluğu",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="thickness",
            field=models.CharField(
                blank=True,
                help_text="Örn. 4 cm, 5 cm",
                max_length=80,
                verbose_name="Kalınlık",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="dimensions",
            field=models.CharField(
                blank=True,
                help_text="Örn. 100 x 100 cm",
                max_length=100,
                verbose_name="Ebat",
            ),
        ),
    ]
