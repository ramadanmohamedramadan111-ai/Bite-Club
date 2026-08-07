from concurrent.futures import ThreadPoolExecutor
from review_rag.services.embedding_service import EmbeddingService
from review_rag.services.vector_search_service import VectorSearchService
from ai_assistant.services.laravel_tool_client import LaravelToolClient
from django.core.cache import cache

class MenuRagOrchestrator:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_search = VectorSearchService()
        self.tool_client = LaravelToolClient()
        self.executor = ThreadPoolExecutor(max_workers=3)

    def _ensure_restaurant_synced(self, rid):
        from review_rag.models import MenuItemEmbedding
        # If we already have items for this restaurant, it is synced
        if MenuItemEmbedding.objects.filter(restaurant_id=rid).exists():
            return
            
        # Otherwise, fetch the full menu from Laravel and embed it on the fly!
        menu_data = self.tool_client.call("menu", {}, rid)
        categories = menu_data.get("categories", [])
        
        items_to_embed = []
        for category in categories:
            for item in category.get("items", []):
                items_to_embed.append({
                    "id": item.get("id"),
                    "restaurant_id": rid,
                    "name": item.get("title"),
                    "description": item.get("description"),
                    "price": item.get("price")
                })
        
        if not items_to_embed:
            return
            
        texts = [
            f"Dish: {item.get('name')}. Description: {item.get('description', '')}. Price: {item.get('price')}."
            for item in items_to_embed
        ]
        
        embeddings = self.embedding_service.embed_batch(texts)
        
        if len(embeddings) == len(items_to_embed):
            for i, item in enumerate(items_to_embed):
                MenuItemEmbedding.objects.update_or_create(
                    item_id=item["id"],
                    defaults={
                        "restaurant_id": rid,
                        "embedding": embeddings[i],
                    }
                )

    def get_relevant_menu_items(self, message, restaurant_ids, limit=10):
        """
        Embeds the message, searches the vector DB for the most relevant menu items,
        and fetches those specific items.
        """
        if not restaurant_ids:
            return []

        import threading
        from review_rag.models import MenuItemEmbedding

        try:
            # 0. Check which restaurants need syncing
            unsynced_rids = []
            for rid in restaurant_ids[:3]:
                if not MenuItemEmbedding.objects.filter(restaurant_id=rid).exists():
                    unsynced_rids.append(rid)

            if unsynced_rids:
                # 1. Kick off background sync for missing restaurants via thread pool executor
                for rid in unsynced_rids:
                    self.executor.submit(self._ensure_restaurant_synced, rid)
                
                # 2. For the current fast response, fallback to returning the raw menu items directly (up to 30 items)
                fallback_items = []
                for rid in restaurant_ids[:3]:
                    menu_data = self.tool_client.call("menu", {}, rid)
                    for category in menu_data.get("categories", []):
                        for item in category.get("items", []):
                            fallback_items.append({
                                "restaurant_id": rid,
                                "category_name": category.get("title"),
                                "item": item
                            })
                            if len(fallback_items) >= 30:
                                return fallback_items
                return fallback_items

            # 3. If everything is synced, do the rapid Vector RAG search
            query_emb = self.embedding_service.embed(message)
            
            # 4. Search local vector DB for top matching item IDs
            rag_results = self.vector_search.search_menu_items(restaurant_ids, query_emb, limit=limit)
            item_ids = [r["item_id"] for r in rag_results]
            
            if not item_ids:
                return []

            # 3. Fetch full menus and filter for only the matching items
            relevant_items = []
            
            for rid in restaurant_ids[:3]:
                # Use the cache implemented earlier
                cache_key = f"menu_{rid}"
                categories = cache.get(cache_key)
                if not categories:
                    menu_data = self.tool_client.call("menu", {}, rid)
                    categories = menu_data.get("categories", [])
                    cache.set(cache_key, categories, timeout=300)

                # Iterate through categories and items to extract the matching ones
                for category in categories:
                    for item in category.get("items", []):
                        if item.get("id") in item_ids:
                            relevant_items.append({
                                "restaurant_id": rid,
                                "category_name": category.get("name"),
                                "item": item
                            })

            return relevant_items

        except Exception as e:
            return {"error": f"Menu RAG failed: {str(e)}"}
