from django.db import migrations


def fill_order_codes(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    for order in Order.objects.filter(order_code__isnull=True).iterator():
        Order.objects.filter(pk=order.pk).update(order_code=f"AK-{order.pk}")


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0006_order_invoice_fields"),
    ]

    operations = [
        migrations.RunPython(fill_order_codes, noop),
    ]
