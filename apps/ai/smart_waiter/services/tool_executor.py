from decimal import Decimal
from django.db import transaction

from smart_waiter.services.source_models import Cart, CartItem, MenuCategory, MenuItem, Order, OrderItem, Restaurant, RestaurantSetting
from smart_waiter.services.vector_store import VectorStore
from smart_waiter.services.source_repository import SourceRepository


class ToolExecutor:
    def __init__(self):
        self.repository = SourceRepository()
        self.vector_store = VectorStore()

    def execute(self, tool_name: str, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        handlers = {
            "search_restaurant": self.search_restaurant,
            "search_menu": self.search_menu,
            "get_cart": self.get_cart,
            "add_to_cart": self.add_to_cart,
            "remove_from_cart": self.remove_from_cart,
            "update_cart": self.update_cart,
            "create_order": self.create_order,
        }

        handler = handlers.get(tool_name)
        if not handler:
            return {"error": "Unknown tool", "tool": tool_name}

        return handler(arguments or {}, payload, restaurant_context)

    def search_restaurant(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        query = (arguments.get("query") or payload.get("message") or "").strip()
        latitude = arguments.get("latitude", payload.get("latitude"))
        longitude = arguments.get("longitude", payload.get("longitude"))
        limit = max(1, min(int(arguments.get("limit", 10)), 100))

        if latitude is not None and longitude is not None:
            nearest = self._nearest_restaurants(float(latitude), float(longitude), limit=limit)
            return {"mode": "nearest", "restaurants": nearest}

        embedding = restaurant_context.get("query_embedding") or []
        results = self.vector_store.search(embedding, source_types={"restaurant_profile", "restaurant_description"}, limit=limit)
        if results and not self._is_broad_restaurant_query(query):
            return {"mode": "semantic", "restaurants": results}

        restaurants = self._catalog_restaurants(limit=None if self._is_broad_restaurant_query(query) else limit)
        return {
            "mode": "catalog",
            "restaurants": restaurants,
        }

    def search_menu(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        restaurant_id = arguments.get("restaurant_id") or restaurant_context.get("restaurant_id") or payload.get("restaurant_id")
        query = (arguments.get("query") or payload.get("message") or "").strip()
        limit = max(1, min(int(arguments.get("limit", 5)), 10))
        embedding = restaurant_context.get("query_embedding") or []
        results = self.vector_store.search(embedding, restaurant_id=restaurant_id, source_types={"menu_item", "menu_description"}, limit=limit)
        if not results and query:
            results = self._text_search_menu(query, restaurant_id=restaurant_id, limit=limit)
        return {"restaurant_id": restaurant_id, "items": results}

    def get_cart(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        cart = Cart.objects.filter(user_id=user_id).first()
        if not cart:
            return {"cart": None, "items": [], "total_price": 0.0, "cart_item_count": 0}

        items = list(CartItem.objects.filter(cart_id=cart.id).order_by("id"))
        total = sum((Decimal(item.unit_price) * item.quantity for item in items), Decimal("0"))
        return {
            "cart": {
                "id": cart.id,
                "restaurant_id": cart.restaurant_id,
            },
            "items": [
                {
                    "id": item.item_id,
                    "name": item.item_name,
                    "price": float(item.unit_price),
                    "quantity": int(item.quantity),
                    "notes": item.notes or "",
                }
                for item in items
            ],
            "total_price": float(total),
            "cart_item_count": sum(int(item.quantity) for item in items),
        }

    def add_to_cart(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        items = self._normalize_items(arguments)
        if not items:
            return {"error": "No items to add"}

        restaurant_id = arguments.get("restaurant_id") or payload.get("restaurant_id")
        if not restaurant_id:
            restaurant_id = items[0]["restaurant_id"]

        restaurant = self._restaurant_for_items(items, restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}

        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(user_id=user_id, defaults={"restaurant_id": restaurant.id})
            if cart.restaurant_id != restaurant.id:
                CartItem.objects.filter(cart_id=cart.id).delete()
                cart.restaurant_id = restaurant.id
                cart.save(update_fields=["restaurant_id", "updated_at"])

            added_items = []
            total_price = Decimal("0")
            for item_payload in items:
                menu_item = MenuItem.objects.filter(id=item_payload["id"]).first()
                if not menu_item:
                    continue

                quantity = max(int(item_payload.get("quantity", 1)), 1)
                cart_item, created = CartItem.objects.get_or_create(
                    cart_id=cart.id,
                    item_id=menu_item.id,
                    defaults={
                        "item_name": menu_item.title,
                        "quantity": quantity,
                        "unit_price": menu_item.price,
                        "notes": item_payload.get("notes", ""),
                    },
                )
                if not created:
                    cart_item.quantity += quantity
                    cart_item.unit_price = menu_item.price
                    if item_payload.get("notes") is not None:
                        cart_item.notes = item_payload.get("notes")
                    cart_item.save(update_fields=["quantity", "unit_price", "notes", "updated_at"])

                total_price += Decimal(menu_item.price) * quantity
                added_items.append({
                    "id": menu_item.id,
                    "name": menu_item.title,
                    "price": float(menu_item.price),
                    "quantity": quantity,
                })

        return {
            "cart_updated": True,
            "cart_item_count": sum(int(item.quantity) for item in CartItem.objects.filter(cart_id=cart.id)),
            "total_price": float(total_price),
            "restaurant_id": restaurant.id,
            "restaurant_name": restaurant.name,
            "added_items": added_items,
        }

    def remove_from_cart(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        cart = Cart.objects.filter(user_id=user_id).first()
        if not cart:
            return {"cart_updated": False, "message": "Cart is empty"}

        item_id = arguments.get("item_id")
        if not item_id:
            return {"error": "Missing item_id"}

        deleted, _ = CartItem.objects.filter(cart_id=cart.id, item_id=item_id).delete()
        return {
            "cart_updated": True,
            "removed": deleted > 0,
            "cart_item_count": sum(int(item.quantity) for item in CartItem.objects.filter(cart_id=cart.id)),
        }

    def update_cart(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        cart = Cart.objects.filter(user_id=user_id).first()
        if not cart:
            return {"error": "Cart is empty"}

        item_id = arguments.get("item_id")
        quantity = arguments.get("quantity")
        notes = arguments.get("notes")
        if not item_id or quantity is None:
            return {"error": "Missing item_id or quantity"}

        cart_item = CartItem.objects.filter(cart_id=cart.id, item_id=item_id).first()
        if not cart_item:
            return {"error": "Cart item not found"}

        if int(quantity) <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = int(quantity)
            if notes is not None:
                cart_item.notes = notes
            cart_item.save(update_fields=["quantity", "notes", "updated_at"])

        return {
            "cart_updated": True,
            "cart_item_count": sum(int(item.quantity) for item in CartItem.objects.filter(cart_id=cart.id)),
        }

    def create_order(self, arguments: dict, payload: dict, restaurant_context: dict) -> dict:
        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        cart = Cart.objects.filter(user_id=user_id).first()
        if not cart:
            return {"error": "Cart is empty"}

        items = list(CartItem.objects.filter(cart_id=cart.id))
        if not items:
            return {"error": "Cart is empty"}

        order_type = arguments.get("order_type") or "pickup"
        subtotal = sum((Decimal(item.unit_price) * item.quantity for item in items), Decimal("0"))
        delivery_fee = Decimal(str(arguments.get("delivery_fee", "0")))
        service_fee = Decimal(str(arguments.get("service_fee", "0")))
        total = subtotal + delivery_fee + service_fee

        with transaction.atomic():
            order = Order.objects.create(
                user_id=user_id,
                restaurant_id=cart.restaurant_id,
                order_type=order_type,
                status="pending",
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                service_fee=service_fee,
                total=total,
            )

            for item in items:
                OrderItem.objects.create(
                    order_id=order.id,
                    item_id=item.item_id,
                    item_name=item.item_name,
                    quantity=item.quantity,
                    price=item.unit_price,
                    notes=item.notes,
                )

            CartItem.objects.filter(cart_id=cart.id).delete()

        restaurant = Restaurant.objects.filter(id=cart.restaurant_id).first()
        return {
            "order_created": True,
            "order": {
                "id": order.id,
                "restaurant_id": order.restaurant_id,
                "restaurant_name": restaurant.name if restaurant else "",
                "order_type": order.order_type,
                "status": order.status,
                "subtotal": float(order.subtotal),
                "delivery_fee": float(order.delivery_fee),
                "service_fee": float(order.service_fee),
                "total": float(order.total),
            },
        }

    def _normalize_items(self, arguments: dict) -> list[dict]:
        items = arguments.get("items")
        if isinstance(items, list) and items:
            normalized = []
            for item in items:
                if not isinstance(item, dict):
                    continue
                item_id = item.get("id") or item.get("item_id")
                if not item_id:
                    continue
                normalized.append({
                    "id": int(item_id),
                    "quantity": int(item.get("quantity", 1)),
                    "notes": item.get("notes"),
                    "restaurant_id": item.get("restaurant_id"),
                })
            if normalized:
                return normalized

        item_id = arguments.get("item_id")
        if item_id:
            return [{
                "id": int(item_id),
                "quantity": int(arguments.get("quantity", 1)),
                "notes": arguments.get("notes"),
                "restaurant_id": arguments.get("restaurant_id"),
            }]

        item_name = arguments.get("item_name") or arguments.get("query")
        if item_name:
            match = MenuItem.objects.filter(title__icontains=item_name).first()
            if match:
                category = MenuCategory.objects.filter(id=match.menu_category_id).first()
                return [{
                    "id": match.id,
                    "quantity": int(arguments.get("quantity", 1)),
                    "notes": arguments.get("notes"),
                    "restaurant_id": category.restaurant_id if category else None,
                }]
        return []

    def _restaurant_for_items(self, items: list[dict], restaurant_id: int | None):
        if restaurant_id:
            return Restaurant.objects.filter(id=restaurant_id).first()

        first_item = items[0]
        menu_item = MenuItem.objects.filter(id=first_item["id"]).first()
        if menu_item:
            category = MenuCategory.objects.filter(id=menu_item.menu_category_id).first()
            if category:
                return Restaurant.objects.filter(id=category.restaurant_id).first()
        return None

    def _nearest_restaurants(self, latitude: float, longitude: float, limit: int = 5) -> list[dict]:
        restaurants = []
        for restaurant in Restaurant.objects.all():
            setting = RestaurantSetting.objects.filter(restaurant_id=restaurant.id).first()
            if not setting or setting.latitude is None or setting.longitude is None:
                continue

            distance = self._distance(latitude, longitude, float(setting.latitude), float(setting.longitude))
            restaurants.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "distance_km": round(distance, 2),
                "rating": float(restaurant.average_rating or 0),
                "reviews_count": int(restaurant.reviews_count or 0),
                "address": restaurant.address or "",
            })
        return sorted(restaurants, key=lambda item: item["distance_km"])[:limit]

    def _catalog_restaurants(self, limit: int | None = None) -> list[dict]:
        restaurants = []
        for restaurant in Restaurant.objects.all():
            setting = RestaurantSetting.objects.filter(restaurant_id=restaurant.id).first()
            restaurants.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "description": restaurant.description or "",
                "address": restaurant.address or "",
                "rating": float(restaurant.average_rating or 0),
                "reviews_count": int(restaurant.reviews_count or 0),
                "is_open": bool(setting.is_open) if setting else False,
                "accept_orders": bool(setting.accept_orders) if setting else False,
                "latitude": float(setting.latitude) if setting and setting.latitude is not None else None,
                "longitude": float(setting.longitude) if setting and setting.longitude is not None else None,
            })

        restaurants = sorted(restaurants, key=lambda item: (item["rating"], item["reviews_count"], item["name"]), reverse=True)
        return restaurants if limit is None else restaurants[:limit]

    def _is_broad_restaurant_query(self, query: str) -> bool:
        normalized = " ".join((query or "").lower().split())
        broad_phrases = [
            "all restaurants",
            "show all restaurants",
            "list restaurants",
            "show restaurants",
            "restaurant list",
            "restaurants",
            "nearby restaurants",
            "restaurant options",
            "find restaurants",
            "what restaurants",
        ]
        return any(phrase in normalized for phrase in broad_phrases)

    def _distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        from math import asin, cos, radians, sin, sqrt

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        return 2 * 6371 * asin(sqrt(a))

    def _text_search_menu(self, query: str, restaurant_id: int | None, limit: int) -> list[dict]:
        queryset = MenuItem.objects.all()
        if restaurant_id:
            category_ids = MenuCategory.objects.filter(restaurant_id=restaurant_id).values_list("id", flat=True)
            queryset = queryset.filter(menu_category_id__in=category_ids)
        queryset = queryset.filter(title__icontains=query)
        return [
            {
                "document_key": f"menu_item:{item.id}",
                "source_type": "menu_item",
                "source_id": item.id,
                "title": item.title,
                "content": item.description or "",
                "metadata": {"price": float(item.price or 0)},
                "score": 0.5,
            }
            for item in queryset[:limit]
        ]
