from django.db import models


class ReviewEmbedding(models.Model):
    review_id = models.BigIntegerField(unique=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    embedding = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "review_embeddings"
        managed = True

class MenuItemEmbedding(models.Model):
    item_id = models.BigIntegerField(unique=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    embedding = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "menu_item_embeddings"
        managed = True
