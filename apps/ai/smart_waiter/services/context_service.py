from collections import Counter, defaultdict
from decimal import Decimal

from django.db.utils import OperationalError, ProgrammingError

from smart_waiter.services.source_models import Order, OrderItem, Restaurant, MenuItem, MenuCategory
from smart_waiter.services.source_repository import SourceRepository


class ContextService:
    def __init__(self):
        self.repository = SourceRepository()

    def build(self, payload: dict) -> dict:
        user_id = payload.get("user_id")
        user_context = payload.get("user_context") or {}

        if user_context:
            return self._normalize_user_context(user_context)

        if not user_id:
            return self._empty_context()

        try:
            orders = list(self.repository.recent_orders(int(user_id), limit=20))
        except (OperationalError, ProgrammingError):
            return self._empty_context(user_id=user_id)

        if not orders:
            return self._empty_context(user_id=user_id)

        item_frequency = Counter()
        restaurant_frequency = Counter()
        budgets = []

        try:
            restaurant_map = {restaurant.id: restaurant for restaurant in Restaurant.objects.filter(id__in={order.restaurant_id for order in orders})}
        except (OperationalError, ProgrammingError):
            restaurant_map = {}

        for order in orders:
            restaurant_frequency[order.restaurant_id] += 1
            budgets.append(float(order.total or 0))
            try:
                order_items = OrderItem.objects.filter(order_id=order.id)
            except (OperationalError, ProgrammingError):
                order_items = []
            for item in order_items:
                item_frequency[item.item_name] += int(item.quantity or 1)

        favorite_meals = [name for name, _ in item_frequency.most_common(5)]
        favorite_restaurants = [
            {
                "id": restaurant_id,
                "name": restaurant_map.get(restaurant_id).name if restaurant_map.get(restaurant_id) else "",
                "orders_count": count,
            }
            for restaurant_id, count in restaurant_frequency.most_common(5)
        ]

        recent_orders = [
            {
                "id": order.id,
                "restaurant_id": order.restaurant_id,
                "restaurant_name": restaurant_map.get(order.restaurant_id).name if restaurant_map.get(order.restaurant_id) else "",
                "total": float(order.total or 0),
                "order_type": order.order_type,
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None,
            }
            for order in orders[:5]
        ]

        return {
            "user_id": int(user_id),
            "favorite_meals": favorite_meals,
            "favorite_restaurants": favorite_restaurants,
            "average_budget": round(sum(budgets) / len(budgets), 2) if budgets else None,
            "recent_orders": recent_orders,
            "frequently_ordered_meals": [
                {"name": name, "count": count} for name, count in item_frequency.most_common(5)
            ],
            "trending_meals": self._trending_meals(),
        }

    def _trending_meals(self) -> list[dict]:
        counts = Counter()
        try:
            for item in OrderItem.objects.all():
                counts[item.item_name] += int(item.quantity or 1)
        except (OperationalError, ProgrammingError):
            counts = Counter()
        if not counts:
            try:
                for item in MenuItem.objects.all():
                    counts[item.title] += 1
            except (OperationalError, ProgrammingError):
                return []

        return [{"name": name, "score": count} for name, count in counts.most_common(5)]

    def _normalize_user_context(self, data: dict) -> dict:
        return {
            "user_id": data.get("user_id"),
            "favorite_meals": data.get("favorite_meals") or [],
            "favorite_restaurants": data.get("favorite_restaurants") or [],
            "average_budget": data.get("average_budget"),
            "recent_orders": data.get("recent_orders") or [],
            "frequently_ordered_meals": data.get("frequently_ordered_meals") or [],
            "trending_meals": data.get("trending_meals") or [],
        }

    def _empty_context(self, user_id=None) -> dict:
        return {
            "user_id": user_id,
            "favorite_meals": [],
            "favorite_restaurants": [],
            "average_budget": None,
            "recent_orders": [],
            "frequently_ordered_meals": [],
            "trending_meals": [],
        }
