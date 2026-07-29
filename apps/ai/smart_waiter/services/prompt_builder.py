import json


class PromptBuilder:
    def build(self, payload: dict, *, conversation: list[dict], user_context: dict, retrieved_documents: list[dict], restaurant_context: dict, tool_result: dict | None = None) -> str:
        locale = payload.get("locale") or "en"
        current_message = payload.get("message", "")
        budget = payload.get("budget")
        group_size = payload.get("group_size") or 1
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        new_chat = bool(payload.get("new_chat"))

        sections = [
            "You are Bite Club Smart Waiter, a conversational dining assistant.",
            "Keep replies natural, short, and helpful.",
            "Use the provided context. Do not invent restaurant facts or menu items.",
            "Support one active chat per user. Remember the conversation history provided below.",
            "If the user asks for restaurant selection, prefer the nearest restaurant using latitude/longitude when available.",
            "If you need to take an action, return JSON only in this format:",
            '{"type":"tool","tool":"tool_name","arguments":{}}',
            "When the action is complete, return JSON only in this format:",
            '{"type":"final","reply":"natural response"}',
            "Available tools: search_restaurant, search_menu, get_cart, add_to_cart, remove_from_cart, update_cart, create_order.",
            "Never say 'call this endpoint' or explain APIs.",
            f"Reply in locale: {locale}.",
        ]

        context = [
            "Conversation history:",
            self._format_messages(conversation),
            "",
            "Current user message:",
            current_message,
            "",
            "User context:",
            json.dumps(user_context, ensure_ascii=True, default=str),
            "",
            "Restaurant context:",
            json.dumps(restaurant_context, ensure_ascii=True, default=str),
            "",
            "Retrieved RAG documents:",
            json.dumps(retrieved_documents, ensure_ascii=True, default=str),
        ]

        if budget is not None:
            context.extend(["", f"Budget limit: {budget}"])
        if group_size:
            context.extend(["", f"Group size: {group_size}"])
        if latitude is not None and longitude is not None:
            context.extend(["", f"User location: {latitude}, {longitude}"])
        if new_chat:
            context.extend(["", "The user explicitly started a new chat. Treat this as a fresh conversation."])
        if tool_result is not None:
            context.extend([
                "",
                "Latest tool result:",
                json.dumps(tool_result, ensure_ascii=True, default=str),
            ])

        return "\n".join(sections + [""] + context)

    def _format_messages(self, messages: list[dict]) -> str:
        if not messages:
            return "(none)"

        formatted = []
        for message in messages[-12:]:
            role = message.get("role", "user")
            content = message.get("content", "")
            if not content:
                continue
            formatted.append(f"{role}: {content}")

        return "\n".join(formatted) or "(none)"
