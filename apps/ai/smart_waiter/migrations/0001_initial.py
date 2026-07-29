from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SmartWaiterConversation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_id", models.BigIntegerField(db_index=True, unique=True)),
                ("conversation_id", models.CharField(db_index=True, max_length=64, unique=True)),
                ("restaurant_id", models.BigIntegerField(blank=True, db_index=True, null=True)),
                ("restaurant_name", models.CharField(blank=True, default="", max_length=255)),
                ("messages", models.JSONField(blank=True, default=list)),
                ("summary", models.TextField(blank=True, default="")),
                ("is_active", models.BooleanField(default=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "smart_waiter_conversations",
                "managed": True,
            },
        ),
        migrations.CreateModel(
            name="SmartWaiterDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("document_key", models.CharField(db_index=True, max_length=255, unique=True)),
                ("restaurant_id", models.BigIntegerField(blank=True, db_index=True, null=True)),
                ("source_type", models.CharField(db_index=True, max_length=64)),
                ("source_id", models.BigIntegerField(blank=True, db_index=True, null=True)),
                ("title", models.CharField(blank=True, default="", max_length=255)),
                ("content", models.TextField()),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("content_hash", models.CharField(db_index=True, max_length=64)),
                ("embedding", models.JSONField(blank=True, default=list)),
                ("source_updated_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "smart_waiter_documents",
                "managed": True,
            },
        ),
        migrations.AddIndex(
            model_name="smartwaiterdocument",
            index=models.Index(fields=["restaurant_id", "source_type"], name="smart_waiter_restaur_11e1b6_idx"),
        ),
        migrations.AddIndex(
            model_name="smartwaiterdocument",
            index=models.Index(fields=["source_type", "source_id"], name="smart_waiter_source_t_0f08db_idx"),
        ),
    ]
