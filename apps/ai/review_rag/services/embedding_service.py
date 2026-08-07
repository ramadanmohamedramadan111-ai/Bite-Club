import json
import logging
import os
import urllib.error
import urllib.request

from review_rag.models import ReviewEmbedding, MenuItemEmbedding

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("API_KEY", "")
        self.base_url = os.getenv("BASE_URL_EMBED", "https://apiaccess.iti.net.eg/api/v1/student/embed")
        self.model = os.getenv("OPENAI_EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))

    def sync_review(self, event, review):
        if event == "deleted":
            ReviewEmbedding.objects.filter(review_id=review["id"]).delete()
            return {"synced": True, "event": event, "review_id": review["id"]}

        text = self._review_text(review)
        embedding = self.embed(text)

        ReviewEmbedding.objects.update_or_create(
            review_id=review["id"],
            defaults={
                "restaurant_id": review["restaurant_id"],
                "embedding": embedding,
            },
        )

        return {"synced": True, "event": event, "review_id": review["id"]}

    def sync_menu_item(self, event, item):
        item_id = item.get("id")
        restaurant_id = item.get("restaurant_id")

        if not item_id or not restaurant_id:
            return {"error": "Missing item_id or restaurant_id"}

        if event == "deleted":
            MenuItemEmbedding.objects.filter(item_id=item_id).delete()
            return {"status": "success", "action": "deleted", "item_id": item_id}

        text_to_embed = f"Dish: {item.get('name')}. Description: {item.get('description', '')}. Price: {item.get('price')}."
        emb = self.embed(text_to_embed)

        if not emb:
            return {"error": "Failed to generate embedding"}

        MenuItemEmbedding.objects.update_or_create(
            item_id=item_id,
            defaults={
                "restaurant_id": restaurant_id,
                "embedding": emb,
            },
        )

        return {"status": "success", "action": "upserted", "item_id": item_id}

    def embed(self, text):
        if not self.api_key or not text:
            return []

        payload = {
            "model_id": self.model,
            "texts": [text],
            "input_type": "search_document"
        }

        request = urllib.request.Request(
            self.base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
                embeddings = payload.get("embeddings") or []
                if isinstance(embeddings, list) and len(embeddings) > 0:
                    return embeddings[0]
                return []
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError, IndexError, ValueError):
            return []

    def embed_batch(self, texts):
        if not self.api_key or not texts:
            return []

        payload = {
            "model_id": self.model,
            "texts": texts,
            "input_type": "search_document"
        }

        request = urllib.request.Request(
            self.base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
                return payload.get("embeddings", [])
        except Exception:
            return []

    def _review_text(self, review):
        return " ".join(
            str(value)
            for value in (
                f"rating: {review.get('rating')}",
                f"comment: {review.get('comment') or ''}",
            )
            if value
        )
