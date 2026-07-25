import json
import os
import urllib.error
import urllib.request

from review_rag.models import ReviewEmbedding


class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self.model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
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

    def embed(self, text):
        if not self.api_key or not text:
            return []

        request = urllib.request.Request(
            f"{self.base_url}/embeddings",
            data=json.dumps({"model": self.model, "input": text}).encode("utf-8"),
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
                return payload.get("data", [{}])[0].get("embedding", [])
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError, IndexError, ValueError):
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
