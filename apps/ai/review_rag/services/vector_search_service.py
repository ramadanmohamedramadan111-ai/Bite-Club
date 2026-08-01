import math

from review_rag.models import ReviewEmbedding, MenuItemEmbedding


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

    def search_menu_items(self, restaurant_ids, query_embedding, limit=10):
        if not query_embedding:
            return []

        embeddings = MenuItemEmbedding.objects.filter(restaurant_id__in=restaurant_ids)

        results = []
        for e in embeddings:
            try:
                if isinstance(e.embedding, str):
                    emb = eval(e.embedding)
                else:
                    emb = e.embedding
                
                similarity = self._cosine_similarity(query_embedding, emb)
                results.append(
                    {
                        "item_id": e.item_id,
                        "restaurant_id": e.restaurant_id,
                        "similarity": similarity,
                    }
                )
            except Exception:
                continue

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]

    def _cosine_similarity(self, left, right):
        if not left or not right or len(left) != len(right):
            return 0.0

        dot = sum(a * b for a, b in zip(left, right))
        left_norm = math.sqrt(sum(a * a for a in left))
        right_norm = math.sqrt(sum(b * b for b in right))

        if left_norm == 0 or right_norm == 0:
            return 0.0

        return dot / (left_norm * right_norm)
