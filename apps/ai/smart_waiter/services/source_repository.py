import hashlib
from collections import defaultdict
from decimal import Decimal

from smart_waiter.services.source_models import (
    Cart,
    CartItem,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    Post,
    Restaurant,
    RestaurantReview,
    RestaurantSetting,
)


class SourceRepository:
    def restaurant_queryset(self):
        return Restaurant.objects.select_related().all().order_by("id")

    def menu_queryset(self):
        return MenuCategory.objects.all().order_by("restaurant_id", "id")

    def item_queryset(self):
        return MenuItem.objects.all().order_by("menu_category_id", "id")

    def review_queryset(self):
        return RestaurantReview.objects.all().order_by("restaurant_id", "id")

    def post_queryset(self):
        return Post.objects.all().order_by("restaurant_id", "id")

    def cart_for_user(self, user_id: int):
        return Cart.objects.filter(user_id=user_id).first()

    def cart_items(self, cart_id: int):
        return CartItem.objects.filter(cart_id=cart_id).order_by("id")

    def recent_orders(self, user_id: int, limit: int = 10):
        return Order.objects.filter(user_id=user_id).order_by("-created_at")[:limit]

    def restaurant_settings_map(self):
        settings = RestaurantSetting.objects.all()
        return {setting.restaurant_id: setting for setting in settings}

    def latest_menu_items_by_restaurant(self):
        categories = list(MenuCategory.objects.all().order_by("restaurant_id", "id"))
        items = list(MenuItem.objects.all().order_by("menu_category_id", "id"))
        category_map = defaultdict(list)
        for item in items:
            category_map[item.menu_category_id].append(item)

        restaurant_items = defaultdict(list)
        for category in categories:
            restaurant_items[category.restaurant_id].extend(category_map.get(category.id, []))

        return restaurant_items

    def build_document_content(self, source_type: str, source) -> tuple[str, str, dict]:
        if source_type == "restaurant_profile":
            content = " | ".join(
                [
                    f"name: {source.name}",
                    f"category_id: {source.category_id or ''}",
                    f"address: {source.address or ''}",
                    f"status: {source.status or ''}",
                    f"rating: {float(source.average_rating or 0)}",
                    f"reviews: {int(source.reviews_count or 0)}",
                    f"orders: {int(source.total_orders_count or 0)}",
                ]
            )
            metadata = self._restaurant_metadata(source)
            return content, source.name, metadata

        if source_type == "restaurant_description":
            content = f"restaurant description: {source.description or ''}"
            metadata = self._restaurant_metadata(source)
            return content, source.name, metadata

        if source_type == "menu_item":
            category = MenuCategory.objects.filter(id=source.menu_category_id).first()
            restaurant_id = category.restaurant_id if category else None
            content = " | ".join(
                [
                    f"restaurant_id: {restaurant_id or ''}",
                    f"item: {source.title}",
                    f"price: {float(source.price or 0)}",
                    f"availability: {source.availability or ''}",
                ]
            )
            metadata = self._menu_metadata(source)
            return content, source.title, metadata

        if source_type == "menu_description":
            content = f"menu description: {source.description or ''}"
            metadata = self._menu_metadata(source)
            return content, source.title, metadata

        if source_type == "public_review":
            content = " | ".join(
                [
                    f"rating: {int(source.rating or 0)}",
                    f"comment: {source.comment or ''}",
                ]
            )
            metadata = self._restaurant_reference_metadata(source.restaurant_id, source.id, "review")
            return content, f"review {source.id}", metadata

        if source_type == "public_post":
            content = " | ".join(
                [
                    f"caption: {source.caption or ''}",
                    f"likes: {int(source.likes_count or 0)}",
                    f"copies: {int(source.copy_count or 0)}",
                ]
            )
            metadata = self._restaurant_reference_metadata(source.restaurant_id, source.id, "post")
            return content, f"post {source.id}", metadata

        raise ValueError(f"Unsupported source type: {source_type}")

    def build_document_key(self, source_type: str, source_id: int, suffix: str = "") -> str:
        return f"{source_type}:{source_id}:{suffix}".rstrip(":")

    def content_hash(self, content: str, metadata: dict) -> str:
        digest = hashlib.sha256()
        digest.update(content.encode("utf-8"))
        digest.update(str(sorted(metadata.items())).encode("utf-8"))
        return digest.hexdigest()

    def _restaurant_metadata(self, source: Restaurant) -> dict:
        settings = RestaurantSetting.objects.filter(restaurant_id=source.id).first()
        return {
            "restaurant_id": source.id,
            "name": source.name,
            "latitude": float(settings.latitude) if settings and settings.latitude is not None else None,
            "longitude": float(settings.longitude) if settings and settings.longitude is not None else None,
            "status": source.status,
            "rating": float(source.average_rating or 0),
            "reviews_count": int(source.reviews_count or 0),
            "address": source.address or "",
        }

    def _menu_metadata(self, source: MenuItem) -> dict:
        category = MenuCategory.objects.filter(id=source.menu_category_id).first()
        restaurant_id = category.restaurant_id if category else None
        return {
            "menu_item_id": source.id,
            "restaurant_id": restaurant_id,
            "menu_category_id": source.menu_category_id,
            "price": float(source.price or 0),
            "availability": source.availability or "",
        }

    def _restaurant_reference_metadata(self, restaurant_id: int, source_id: int, source_kind: str) -> dict:
        return {
            "restaurant_id": restaurant_id,
            "source_kind": source_kind,
            "source_id": source_id,
        }
