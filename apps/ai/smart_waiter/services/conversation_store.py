import uuid

from django.db import transaction

from smart_waiter.models import SmartWaiterConversation
from smart_waiter.services.bootstrap import ensure_smart_waiter_schema


class ConversationStore:
    def get_or_create(self, user_id: int, reset: bool = False) -> SmartWaiterConversation:
        ensure_smart_waiter_schema()
        conversation, _ = SmartWaiterConversation.objects.get_or_create(
            user_id=user_id,
            defaults={
                "conversation_id": self._new_id(),
                "messages": [],
                "summary": "",
                "is_active": True,
                "metadata": {},
            },
        )

        if reset:
            conversation.conversation_id = self._new_id()
            conversation.restaurant_id = None
            conversation.restaurant_name = ""
            conversation.messages = []
            conversation.summary = ""
            conversation.is_active = True
            conversation.metadata = {}
            conversation.save(update_fields=[
                "conversation_id",
                "restaurant_id",
                "restaurant_name",
                "messages",
                "summary",
                "is_active",
                "metadata",
                "updated_at",
            ])

        return conversation

    def append(self, conversation: SmartWaiterConversation, role: str, content: str, **extra) -> SmartWaiterConversation:
        messages = list(conversation.messages or [])
        payload = {"role": role, "content": content}
        payload.update({key: value for key, value in extra.items() if value is not None})
        messages.append(payload)
        conversation.messages = self._trim(messages)
        conversation.save(update_fields=["messages", "updated_at"])
        return conversation

    def update_metadata(self, conversation: SmartWaiterConversation, **metadata) -> SmartWaiterConversation:
        current = dict(conversation.metadata or {})
        current.update({key: value for key, value in metadata.items() if value is not None})
        conversation.metadata = current
        conversation.save(update_fields=["metadata", "updated_at"])
        return conversation

    def set_restaurant(self, conversation: SmartWaiterConversation, restaurant_id: int | None, restaurant_name: str = "") -> SmartWaiterConversation:
        conversation.restaurant_id = restaurant_id
        conversation.restaurant_name = restaurant_name or ""
        conversation.save(update_fields=["restaurant_id", "restaurant_name", "updated_at"])
        return conversation

    def _trim(self, messages: list[dict], limit: int = 16) -> list[dict]:
        return messages[-limit:]

    def _new_id(self) -> str:
        return uuid.uuid4().hex
