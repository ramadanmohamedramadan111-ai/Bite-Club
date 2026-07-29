import math

from smart_waiter.models import SmartWaiterDocument
from smart_waiter.services.bootstrap import ensure_smart_waiter_schema


class VectorStore:
    def upsert_document(self, payload: dict) -> SmartWaiterDocument:
        ensure_smart_waiter_schema()
        document, _ = SmartWaiterDocument.objects.update_or_create(
            document_key=payload["document_key"],
            defaults=payload,
        )
        return document

    def delete_missing(self, valid_keys: set[str], source_type: str | None = None, restaurant_id: int | None = None) -> None:
        ensure_smart_waiter_schema()
        query = SmartWaiterDocument.objects.all()
        if source_type:
            query = query.filter(source_type=source_type)
        if restaurant_id is not None:
            query = query.filter(restaurant_id=restaurant_id)
        query.exclude(document_key__in=valid_keys).delete()

    def search(self, query_embedding: list[float], *, restaurant_id: int | None = None, source_types: set[str] | None = None, limit: int = 5) -> list[dict]:
        ensure_smart_waiter_schema()
        query = SmartWaiterDocument.objects.exclude(embedding=[]).exclude(embedding__isnull=True)
        if restaurant_id is not None:
            query = query.filter(restaurant_id=restaurant_id)
        if source_types:
            query = query.filter(source_type__in=sorted(source_types))

        scored = []
        for document in query:
            score = self._cosine_similarity(query_embedding, document.embedding or [])
            scored.append({
                "document_key": document.document_key,
                "restaurant_id": document.restaurant_id,
                "source_type": document.source_type,
                "source_id": document.source_id,
                "title": document.title,
                "content": document.content,
                "metadata": document.metadata or {},
                "score": score,
            })

        return sorted(scored, key=lambda item: item["score"], reverse=True)[:limit]

    def by_restaurant(self, restaurant_id: int, limit: int = 20) -> list[SmartWaiterDocument]:
        ensure_smart_waiter_schema()
        return list(
            SmartWaiterDocument.objects.filter(restaurant_id=restaurant_id)
            .exclude(embedding=[])
            .exclude(embedding__isnull=True)
            .order_by("-updated_at")[:limit]
        )

    def _cosine_similarity(self, left: list[float], right: list[float]) -> float:
        if not left or not right or len(left) != len(right):
            return 0.0

        dot = sum(a * b for a, b in zip(left, right))
        left_norm = math.sqrt(sum(a * a for a in left))
        right_norm = math.sqrt(sum(b * b for b in right))

        if left_norm == 0 or right_norm == 0:
            return 0.0

        return dot / (left_norm * right_norm)
