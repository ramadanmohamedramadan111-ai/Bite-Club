import math

from review_rag.models import ReviewEmbedding


class VectorSearchService:
    def search(self, restaurant_ids, query_embedding, limit=5):
        if isinstance(restaurant_ids, int):
            restaurant_ids = [restaurant_ids]

        rows = ReviewEmbedding.objects.filter(restaurant_id__in=restaurant_ids)
        scored = [
            {
                "review_id": row.review_id,
                "restaurant_id": row.restaurant_id,
                "score": self._cosine_similarity(query_embedding, row.embedding),
            }
            for row in rows
            if row.embedding
        ]

        return sorted(scored, key=lambda item: item["score"], reverse=True)[:limit]

    def _cosine_similarity(self, left, right):
        if not left or not right or len(left) != len(right):
            return 0.0

        dot = sum(a * b for a, b in zip(left, right))
        left_norm = math.sqrt(sum(a * a for a in left))
        right_norm = math.sqrt(sum(b * b for b in right))

        if left_norm == 0 or right_norm == 0:
            return 0.0

        return dot / (left_norm * right_norm)
