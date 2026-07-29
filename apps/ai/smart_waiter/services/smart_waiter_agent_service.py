import json
from decimal import Decimal

from django.db.utils import OperationalError, ProgrammingError

from smart_waiter.models import SmartWaiterConversation
from smart_waiter.services.ai_client import SmartWaiterAiClient
from smart_waiter.services.context_service import ContextService
from smart_waiter.services.indexer import SmartWaiterIndexer
from smart_waiter.services.prompt_builder import PromptBuilder
from smart_waiter.services.source_models import Cart, Order, Restaurant, RestaurantSetting
from smart_waiter.services.tool_executor import ToolExecutor
from smart_waiter.services.vector_store import VectorStore
from smart_waiter.services.source_repository import SourceRepository
from smart_waiter.services.conversation_store import ConversationStore


class SmartWaiterAgentService:
    def __init__(self):
        self.client = SmartWaiterAiClient()
        self.prompt_builder = PromptBuilder()
        self.conversation_store = ConversationStore()
        self.context_service = ContextService()
        self.vector_store = VectorStore()
        self.tool_executor = ToolExecutor()
        self.repository = SourceRepository()
        self.indexer = SmartWaiterIndexer()

    def chat(self, payload: dict) -> dict:
        if not self.client.api_key:
            return {"error": "AI service is not configured."}

        user_id = payload.get("user_id")
        if not user_id:
            return {"error": "Missing user_id"}

        reset = bool(payload.get("new_chat"))
        try:
            conversation = self.conversation_store.get_or_create(int(user_id), reset=reset)
        except (OperationalError, ProgrammingError) as exc:
            return {"error": f"Smart Waiter storage is unavailable: {exc}"}

        try:
            user_context = self.context_service.build(payload)
        except (OperationalError, ProgrammingError):
            user_context = self.context_service._empty_context(user_id=user_id)

        current_message = payload.get("message", "")
        query_embedding = self.client.embed(current_message)
        broad_restaurant_request = self._is_broad_restaurant_request(current_message)

        restaurant = None if broad_restaurant_request else self._resolve_restaurant(payload, conversation)
        if restaurant:
            try:
                self.conversation_store.set_restaurant(conversation, restaurant.id, restaurant.name)
                self.indexer.refresh_restaurant(int(restaurant.id))
            except (OperationalError, ProgrammingError):
                pass

        try:
            retrieved_documents = self._retrieve_documents(query_embedding, restaurant.id if restaurant else None)
        except (OperationalError, ProgrammingError):
            retrieved_documents = []
        restaurant_context = self._build_restaurant_context(restaurant, payload, user_context, retrieved_documents, query_embedding)

        history = list(conversation.messages or [])
        tool_result = None
        prompt_conversation = history.copy()

        if broad_restaurant_request:
            tool_result = self.tool_executor.execute(
                "search_restaurant",
                {"limit": 100, "query": current_message},
                payload,
                restaurant_context,
            )
            reply = self._format_restaurant_reply(tool_result)
            self._store_turn(conversation, current_message, reply, tool_result)
            return self._build_response(conversation, restaurant, reply, user_context, retrieved_documents, tool_result, {"type": "final"})

        final_payload = None
        for _ in range(3):
            system_prompt = self.prompt_builder.build(
                payload,
                conversation=prompt_conversation,
                user_context=user_context,
                retrieved_documents=retrieved_documents,
                restaurant_context=restaurant_context,
                tool_result=tool_result,
            )
            raw_response = self.client.complete(system_prompt, [{"role": "user", "content": current_message}]).strip()
            parsed = self._parse_response(raw_response)

            if isinstance(parsed, dict) and parsed.get("type") == "tool":
                tool_name = parsed.get("tool", "")
                arguments = parsed.get("arguments") or {}
                tool_result = self.tool_executor.execute(tool_name, arguments, payload, restaurant_context)
                prompt_conversation = prompt_conversation + [
                    {"role": "assistant", "content": json.dumps(parsed, ensure_ascii=True, default=str)},
                    {"role": "tool", "content": json.dumps(tool_result, ensure_ascii=True, default=str), "name": tool_name},
                ]
                continue

            if isinstance(parsed, dict) and parsed.get("type") == "final":
                final_payload = parsed
            else:
                final_payload = {"type": "final", "reply": raw_response}
            break

        if final_payload is None:
            final_payload = {
                "type": "final",
                "reply": "I'm having trouble finishing that right now, but I can try again if you rephrase it.",
            }

        reply = (final_payload.get("reply") or "").strip()
        if not reply:
            reply = "I'm ready to help with your order."

        if tool_result and isinstance(tool_result, dict):
            restaurants = tool_result.get("restaurants")
            if isinstance(restaurants, list) and restaurants:
                if self._looks_generic(reply):
                    reply = self._format_restaurant_reply(tool_result)

        conversation_messages = list(conversation.messages or [])
        conversation_messages.append({"role": "user", "content": current_message})
        if tool_result is not None:
            conversation_messages.append({
                "role": "tool",
                "content": json.dumps(tool_result, ensure_ascii=True, default=str),
            })
        conversation_messages.append({"role": "assistant", "content": reply})
        conversation.messages = conversation_messages[-16:]
        conversation.summary = self._summarize_conversation(conversation_messages)
        conversation.is_active = True
        conversation.save(update_fields=["messages", "summary", "is_active", "updated_at"])

        response = {
            "conversation_id": conversation.conversation_id,
            "restaurant_id": restaurant.id if restaurant else conversation.restaurant_id,
            "restaurant_name": restaurant.name if restaurant else conversation.restaurant_name,
            "reply": reply,
            "user_context": user_context,
            "retrieved_documents": retrieved_documents,
        }
        response.update({key: value for key, value in final_payload.items() if key not in {"type", "reply"}})
        if tool_result is not None:
            response["tool_result"] = tool_result
        if restaurant:
            response["closest_restaurant"] = {
                "id": restaurant.id,
                "name": restaurant.name,
                "latitude": self._restaurant_latitude(restaurant.id),
                "longitude": self._restaurant_longitude(restaurant.id),
            }

        return response

    def _store_turn(self, conversation: SmartWaiterConversation, message: str, reply: str, tool_result: dict | None = None) -> None:
        conversation_messages = list(conversation.messages or [])
        conversation_messages.append({"role": "user", "content": message})
        if tool_result is not None:
            conversation_messages.append({
                "role": "tool",
                "content": json.dumps(tool_result, ensure_ascii=True, default=str),
            })
        conversation_messages.append({"role": "assistant", "content": reply})
        conversation.messages = conversation_messages[-16:]
        conversation.summary = self._summarize_conversation(conversation_messages)
        conversation.is_active = True
        conversation.save(update_fields=["messages", "summary", "is_active", "updated_at"])

    def _build_response(self, conversation: SmartWaiterConversation, restaurant, reply: str, user_context: dict, retrieved_documents: list[dict], tool_result: dict | None, final_payload: dict) -> dict:
        response = {
            "conversation_id": conversation.conversation_id,
            "restaurant_id": restaurant.id if restaurant else conversation.restaurant_id,
            "restaurant_name": restaurant.name if restaurant else conversation.restaurant_name,
            "reply": reply,
            "user_context": user_context,
            "retrieved_documents": retrieved_documents,
        }
        response.update({key: value for key, value in final_payload.items() if key not in {"type", "reply"}})
        if tool_result is not None:
            response["tool_result"] = tool_result
        if restaurant:
            response["closest_restaurant"] = {
                "id": restaurant.id,
                "name": restaurant.name,
                "latitude": self._restaurant_latitude(restaurant.id),
                "longitude": self._restaurant_longitude(restaurant.id),
            }
        return response

    def _retrieve_documents(self, query_embedding: list[float], restaurant_id: int | None) -> list[dict]:
        if query_embedding:
            results = self.vector_store.search(
                query_embedding,
                restaurant_id=restaurant_id,
                source_types={"restaurant_profile", "restaurant_description", "menu_item", "menu_description", "public_review", "public_post"},
                limit=6,
            )
            if results:
                return results

        if restaurant_id is not None:
            documents = self.vector_store.by_restaurant(restaurant_id, limit=8)
            return [
                {
                    "document_key": document.document_key,
                    "restaurant_id": document.restaurant_id,
                    "source_type": document.source_type,
                    "source_id": document.source_id,
                    "title": document.title,
                    "content": document.content,
                    "metadata": document.metadata or {},
                    "score": 0.0,
                }
                for document in documents
            ]

        return [
            {
                "document_key": document.document_key,
                "restaurant_id": document.restaurant_id,
                "source_type": document.source_type,
                "source_id": document.source_id,
                "title": document.title,
                "content": document.content,
                "metadata": document.metadata or {},
                "score": 0.0,
            }
            for document in self.vector_store.search(query_embedding or [0.0], source_types={"restaurant_profile"}, limit=5)
        ]

    def _build_restaurant_context(self, restaurant, payload: dict, user_context: dict, retrieved_documents: list[dict], query_embedding: list[float]) -> dict:
        context = {
            "restaurant_id": restaurant.id if restaurant else payload.get("restaurant_id"),
            "restaurant_name": restaurant.name if restaurant else "",
            "latitude": self._restaurant_latitude(restaurant.id) if restaurant else payload.get("latitude"),
            "longitude": self._restaurant_longitude(restaurant.id) if restaurant else payload.get("longitude"),
            "query_embedding": query_embedding,
        }
        if restaurant:
            context["restaurant"] = {
                "id": restaurant.id,
                "name": restaurant.name,
                "description": restaurant.description or "",
                "address": restaurant.address or "",
                "rating": float(restaurant.average_rating or 0),
                "reviews_count": int(restaurant.reviews_count or 0),
            }
        context["nearby_restaurants"] = self._nearest_restaurants(payload)
        context["retrieved_summary"] = [
            {
                "source_type": doc.get("source_type"),
                "title": doc.get("title"),
                "score": doc.get("score", 0.0),
            }
            for doc in retrieved_documents[:5]
        ]
        return context

    def _resolve_restaurant(self, payload: dict, conversation: SmartWaiterConversation):
        if self._is_broad_restaurant_request(payload.get("message", "")):
            return None

        restaurant_id = payload.get("restaurant_id") or conversation.restaurant_id
        if restaurant_id:
            restaurant = self._safe_first(Restaurant.objects.filter(id=restaurant_id))
            if restaurant:
                return restaurant

        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        if latitude is not None and longitude is not None:
            return self._nearest_restaurant(float(latitude), float(longitude))

        user_id = payload.get("user_id")
        if user_id:
            cart = self._safe_first(Cart.objects.filter(user_id=user_id))
            if cart:
                restaurant = self._safe_first(Restaurant.objects.filter(id=cart.restaurant_id))
                if restaurant:
                    return restaurant

            order = self._safe_first(Order.objects.filter(user_id=user_id).order_by("-created_at"))
            if order:
                restaurant = self._safe_first(Restaurant.objects.filter(id=order.restaurant_id))
                if restaurant:
                    return restaurant

        return self._safe_first(Restaurant.objects.filter(status__in=["active", "approved"]).order_by("-average_rating", "-reviews_count"))

    def _nearest_restaurants(self, payload: dict) -> list[dict]:
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        if latitude is None or longitude is None:
            return []

        results = []
        for restaurant in self._safe_iter(Restaurant.objects.all()):
            lat = self._restaurant_latitude(restaurant.id)
            lng = self._restaurant_longitude(restaurant.id)
            if lat is None or lng is None:
                continue
            distance = self._distance(float(latitude), float(longitude), lat, lng)
            results.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "distance_km": round(distance, 2),
                "rating": float(restaurant.average_rating or 0),
                "reviews_count": int(restaurant.reviews_count or 0),
            })
        return sorted(results, key=lambda item: item["distance_km"])[:5]

    def _nearest_restaurant(self, latitude: float, longitude: float):
        restaurants = self._nearest_restaurants({"latitude": latitude, "longitude": longitude})
        if not restaurants:
            return None
        return Restaurant.objects.filter(id=restaurants[0]["id"]).first()

    def _restaurant_latitude(self, restaurant_id: int):
        setting = self._safe_first(RestaurantSetting.objects.filter(restaurant_id=restaurant_id))
        return float(setting.latitude) if setting and setting.latitude is not None else None

    def _restaurant_longitude(self, restaurant_id: int):
        setting = self._safe_first(RestaurantSetting.objects.filter(restaurant_id=restaurant_id))
        return float(setting.longitude) if setting and setting.longitude is not None else None

    def _distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        from math import asin, cos, radians, sin, sqrt

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        return 2 * 6371 * asin(sqrt(a))

    def _parse_response(self, raw_response: str):
        text = raw_response.strip()
        if text.startswith("```"):
            text = "\n".join(
                line for line in text.splitlines()
                if not line.startswith("```")
            ).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text

    def _summarize_conversation(self, messages: list[dict]) -> str:
        if not messages:
            return ""
        recent = messages[-8:]
        summary = []
        for message in recent:
            role = message.get("role", "user")
            content = message.get("content", "")
            if content:
                summary.append(f"{role}: {content}")
        return " | ".join(summary)[:4000]

    def _safe_first(self, queryset):
        try:
            return queryset.first()
        except (OperationalError, ProgrammingError):
            return None

    def _safe_iter(self, queryset):
        try:
            return list(queryset)
        except (OperationalError, ProgrammingError):
            return []

    def _looks_generic(self, reply: str) -> bool:
        normalized = " ".join((reply or "").lower().split())
        return (
            not normalized
            or "trouble finishing" in normalized
            or "rephrase it" in normalized
            or "ready to help" in normalized
        )

    def _format_restaurant_reply(self, tool_result: dict) -> str:
        restaurants = tool_result.get("restaurants") or []
        mode = tool_result.get("mode")
        if not restaurants:
            return "I couldn't find any restaurants right now."

        names = [restaurant.get("name", "") for restaurant in restaurants if restaurant.get("name")]
        names = names[:5]
        if mode == "nearest":
            return "Here are the closest restaurants I found: " + ", ".join(names) + "."
        if len(restaurants) > len(names):
            return "I found these restaurants: " + ", ".join(names) + f", and {len(restaurants) - len(names)} more."
        return "I found these restaurants: " + ", ".join(names) + "."

    def _is_broad_restaurant_request(self, message: str) -> bool:
        normalized = " ".join((message or "").lower().split())
        broad_phrases = [
            "all restaurants",
            "show all restaurants",
            "list restaurants",
            "show restaurants",
            "restaurant list",
            "restaurants list",
            "restaurants",
            "nearby restaurants",
            "restaurant options",
            "find restaurants",
            "what restaurants",
            "show me restaurants",
            "show me all restaurants",
            "find me restaurants",
        ]
        if any(phrase in normalized for phrase in broad_phrases):
            return True

        has_restaurant_word = "restaurant" in normalized or "restaurants" in normalized or "restursnt" in normalized or "restursnts" in normalized
        has_listing_intent = any(word in normalized for word in ["show", "list", "find", "what", "all", "near", "nearby", "closest", "options"])
        return has_restaurant_word and has_listing_intent
