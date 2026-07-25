class ConversationManager:
    def build_messages(self, payload, system_prompt):
        messages = [{"role": "system", "content": system_prompt}]
        conversation = payload.get("conversation") or []

        for message in conversation:
            role = message.get("role")
            content = message.get("content")
            if role in {"user", "assistant", "tool"} and content:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": payload["message"]})

        return messages
