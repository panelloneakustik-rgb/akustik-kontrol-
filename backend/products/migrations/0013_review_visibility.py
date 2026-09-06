from django.db import migrations, models


def forwards(apps, schema_editor):
    Review = apps.get_model("products", "Review")
    Review.objects.filter(is_approved=True).update(visibility="everyone")
    Review.objects.filter(is_approved=False).update(visibility="admin")


def backwards(apps, schema_editor):
    Review = apps.get_model("products", "Review")
    Review.objects.filter(visibility="everyone").update(is_approved=True)
    Review.objects.exclude(visibility="everyone").update(is_approved=False)


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0012_product_model_production"),
    ]

    operations = [
        migrations.AddField(
            model_name="review",
            name="visibility",
            field=models.CharField(
                choices=[
                    ("everyone", "Herkese görünsün"),
                    ("admin", "Sadece bana (admin) görünsün"),
                ],
                default="admin",
                help_text="Herkese: ürün sayfasında yayınlanır. Sadece bana: yalnızca bu admin panelinde durur. Yazan müşteri kendi yorumunu her zaman görür.",
                max_length=20,
                verbose_name="Kimler görsün",
            ),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(
            model_name="review",
            name="is_approved",
        ),
        migrations.AlterModelOptions(
            name="review",
            options={"ordering": ["-created_at"], "verbose_name": "Yorum", "verbose_name_plural": "Yorumlar"},
        ),
    ]
