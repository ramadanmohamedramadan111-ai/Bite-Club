from django.db import models


class SmartWaiterConversation(models.Model):
    user_id = models.BigIntegerField(unique=True, db_index=True)
    conversation_id = models.CharField(max_length=64, unique=True, db_index=True)
    restaurant_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    restaurant_name = models.CharField(max_length=255, blank=True, default="")
    messages = models.JSONField(default=list, blank=True)
    summary = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "smart_waiter_conversations"
        managed = True


class SmartWaiterDocument(models.Model):
    document_key = models.CharField(max_length=255, unique=True, db_index=True)
    restaurant_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    source_type = models.CharField(max_length=64, db_index=True)
    source_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    title = models.CharField(max_length=255, blank=True, default="")
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    content_hash = models.CharField(max_length=64, db_index=True)
    embedding = models.JSONField(default=list, blank=True)
    source_updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "smart_waiter_documents"
        managed = True
        indexes = [
            models.Index(fields=["restaurant_id", "source_type"]),
            models.Index(fields=["source_type", "source_id"]),
        ]
