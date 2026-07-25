import json
import os
import urllib.error
import urllib.request

from .conversation_manager import ConversationManager
from .prompt_builder import PromptBuilder
from .tool_executor import ToolExecutor


class OpenAiAgentService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "800"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))
        self.prompt_builder = PromptBuilder()
        self.conversation_manager = ConversationManager()
        self.tool_executor = ToolExecutor()

    def chat(self, payload):
        if not self.api_key:
            return {
                "message": "AI service is not configured.",
                "conversation_id": payload.get("conversation_id"),
                "tool_results": [],
            }

        restaurant_id = payload["restaurant_id"]
        messages = self.conversation_manager.build_messages(payload, self.prompt_builder.build(payload))

        first = self._completion(messages, tools=self.tool_executor.definitions())
        choice = first.get("choices", [{}])[0].get("message", {})
        tool_calls = choice.get("tool_calls") or []
        tool_results = []

        if tool_calls:
            messages.append(choice)
            for tool_call in tool_calls:
                result = self.tool_executor.execute(tool_call, restaurant_id)
                tool_results.append({"tool_call_id": tool_call.get("id"), "result": result})
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.get("id"),
                        "content": json.dumps(result),
                    }
                )

            final = self._completion(messages)
            message = final.get("choices", [{}])[0].get("message", {}).get("content", "")
        else:
            message = choice.get("content", "")

        return {
            "message": message,
            "conversation_id": payload.get("conversation_id"),
            "tool_results": tool_results,
        }

    def _completion(self, messages, tools=None):
        body = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        if tools:
            body["tools"] = tools
            body["tool_choice"] = "auto"

        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            return {"choices": [{"message": {"content": exc.read().decode("utf-8")}}]}
        except urllib.error.URLError as exc:
            return {"choices": [{"message": {"content": f"AI provider unavailable: {exc.reason}"}}]}
