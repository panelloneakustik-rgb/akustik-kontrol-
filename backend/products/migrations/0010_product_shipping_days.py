from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0009_review"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="shipping_days",
            field=models.CharField(
                choices=[
                    ("1-2", "1-2 iş günü"),
                    ("2-3", "2-3 iş günü"),
                    ("2-4", "2-4 iş günü"),
                    ("3-5", "3-5 iş günü"),
                    ("5-7", "5-7 iş günü"),
                    ("7-10", "7-10 iş günü"),
                    ("10-15", "10-15 iş günü"),
                ],
                default="2-4",
                help_text="Ürün sayfasında “X iş günü içinde kargoda” olarak görünür.",
                max_length=10,
                verbose_name="Kargo süresi",
            ),
        ),
    ]
