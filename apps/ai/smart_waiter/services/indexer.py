from smart_waiter.services.ai_client import SmartWaiterAiClient
from smart_waiter.services.source_models import MenuCategory, MenuItem, Post, Restaurant, RestaurantReview
from smart_waiter.services.source_repository import SourceRepository
from smart_waiter.services.vector_store import VectorStore


class SmartWaiterIndexer:
    def __init__(self):
        self.client = SmartWaiterAiClient()
        self.repository = SourceRepository()
        self.vector_store = VectorStore()

    def index_all(self) -> dict:
        counts = {
            "restaurants": 0,
            "items": 0,
            "reviews": 0,
            "posts": 0,
        }

        valid_keys = set()

        for restaurant in Restaurant.objects.all().order_by("id"):
            content, title, metadata = self.repository.build_document_content("restaurant_profile", restaurant)
            valid_keys.add(self._upsert("restaurant_profile", restaurant.id, None, title, content, metadata, restaurant_id=restaurant.id))
            counts["restaurants"] += 1

            content, title, metadata = self.repository.build_document_content("restaurant_description", restaurant)
            valid_keys.add(self._upsert("restaurant_description", restaurant.id, None, title, content, metadata, restaurant_id=restaurant.id))
            counts["restaurants"] += 1

        for item in MenuItem.objects.all().order_by("menu_category_id", "id"):
            content, title, metadata = self.repository.build_document_content("menu_item", item)
            valid_keys.add(self._upsert("menu_item", item.id, None, title, content, metadata, restaurant_id=metadata.get("restaurant_id")))
            counts["items"] += 1

            if item.description:
                content, title, metadata = self.repository.build_document_content("menu_description", item)
                valid_keys.add(self._upsert("menu_description", item.id, None, title, content, metadata, restaurant_id=metadata.get("restaurant_id")))
                counts["items"] += 1

        for review in RestaurantReview.objects.all().order_by("restaurant_id", "id"):
            content, title, metadata = self.repository.build_document_content("public_review", review)
            valid_keys.add(self._upsert("public_review", review.id, None, title, content, metadata, restaurant_id=review.restaurant_id))
            counts["reviews"] += 1

        for post in Post.objects.all().order_by("restaurant_id", "id"):
            if not post.caption:
                continue
            content, title, metadata = self.repository.build_document_content("public_post", post)
            valid_keys.add(self._upsert("public_post", post.id, None, title, content, metadata, restaurant_id=post.restaurant_id))
            counts["posts"] += 1

        self.vector_store.delete_missing(valid_keys)
        return counts

    def refresh_restaurant(self, restaurant_id: int) -> int:
        valid_keys = set()
        restaurant = Restaurant.objects.filter(id=restaurant_id).first()
        if not restaurant:
            return 0

        content, title, metadata = self.repository.build_document_content("restaurant_profile", restaurant)
        valid_keys.add(self._upsert("restaurant_profile", restaurant.id, None, title, content, metadata, restaurant_id=restaurant.id))

        content, title, metadata = self.repository.build_document_content("restaurant_description", restaurant)
        valid_keys.add(self._upsert("restaurant_description", restaurant.id, None, title, content, metadata, restaurant_id=restaurant.id))

        category_ids = MenuCategory.objects.filter(restaurant_id=restaurant_id).values_list("id", flat=True)
        for item in MenuItem.objects.filter(menu_category_id__in=category_ids):
            content, title, metadata = self.repository.build_document_content("menu_item", item)
            valid_keys.add(self._upsert("menu_item", item.id, None, title, content, metadata, restaurant_id=restaurant.id))
            if item.description:
                content, title, metadata = self.repository.build_document_content("menu_description", item)
                valid_keys.add(self._upsert("menu_description", item.id, None, title, content, metadata, restaurant_id=restaurant.id))

        for review in RestaurantReview.objects.filter(restaurant_id=restaurant_id):
            content, title, metadata = self.repository.build_document_content("public_review", review)
            valid_keys.add(self._upsert("public_review", review.id, None, title, content, metadata, restaurant_id=restaurant_id))

        for post in Post.objects.filter(restaurant_id=restaurant_id):
            if not post.caption:
                continue
            content, title, metadata = self.repository.build_document_content("public_post", post)
            valid_keys.add(self._upsert("public_post", post.id, None, title, content, metadata, restaurant_id=restaurant_id))

        self.vector_store.delete_missing(valid_keys, restaurant_id=restaurant_id)
        return len(valid_keys)

    def _upsert(self, source_type: str, source_id: int, suffix: str | None, title: str, content: str, metadata: dict, restaurant_id: int | None) -> str:
        document_key = self.repository.build_document_key(source_type, source_id, suffix or "")
        embedding = self.client.embed(content)
        self.vector_store.upsert_document({
            "document_key": document_key,
            "restaurant_id": restaurant_id,
            "source_type": source_type,
            "source_id": source_id,
            "title": title,
            "content": content,
            "metadata": metadata,
            "content_hash": self.repository.content_hash(content, metadata),
            "embedding": embedding,
            "source_updated_at": metadata.get("updated_at"),
        })
        return document_key
