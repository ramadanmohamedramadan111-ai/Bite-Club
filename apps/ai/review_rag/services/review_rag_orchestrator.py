from review_rag.services.embedding_service import EmbeddingService
from review_rag.services.vector_search_service import VectorSearchService
from ai_assistant.services.laravel_tool_client import LaravelToolClient

class ReviewRagOrchestrator:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_search = VectorSearchService()
        self.tool_client = LaravelToolClient()

    def get_relevant_reviews(self, message, restaurant_ids, limit=5):
        """
        Embeds the message, searches the vector DB for the most relevant reviews,
        and fetches the full review data from the Laravel backend.
        """
        if not restaurant_ids:
            return []

        try:
            # 1. Embed the query
            # Note: The embedding_service in review_rag has an `embed` method, not `embed_text`. 
            # I noticed earlier in smart_waiter_agent_service it was calling `embed_text`.
            # Let's fix that if it was wrong, or just use `embed` as defined in the embedding_service.py
            query_emb = self.embedding_service.embed(message)
            
            # 2. Search local vector DB
            rag_results = self.vector_search.search(restaurant_ids, query_emb, limit=limit)
            review_ids = [r["review_id"] for r in rag_results]
            
            # 3. Fetch full review data from Laravel
            if review_ids:
                reviews_data = self.tool_client.call("reviews", {"review_ids": review_ids})
                return reviews_data.get("reviews", [])
                
            return []
        except Exception as e:
            return {"error": str(e)}
