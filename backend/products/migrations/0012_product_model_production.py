from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0011_product_density_thickness"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="product_model",
            field=models.CharField(
                blank=True,
                help_text="Örn. Piramit desen",
                max_length=120,
                verbose_name="Model",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="production",
            field=models.CharField(
                blank=True,
                help_text="Örn. %100 yerli, üretici garantili",
                max_length=160,
                verbose_name="Üretim",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="density",
            field=models.CharField(
                blank=True,
                help_text="Örn. 60 dns",
                max_length=80,
                verbose_name="Yoğunluk",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="dimensions",
            field=models.CharField(
                blank=True,
                help_text="Örn. 100x100 cm",
                max_length=100,
                verbose_name="Ebat",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="thickness",
            field=models.CharField(
                blank=True,
                help_text="Örn. 40 mm",
                max_length=80,
                verbose_name="Kalınlık",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="material",
            field=models.CharField(
                blank=True,
                help_text="Örn. Yanmaz akustik sünger",
                max_length=120,
                verbose_name="Yapı",
            ),
        ),
    ]
