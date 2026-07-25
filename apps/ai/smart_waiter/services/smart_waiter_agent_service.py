import json
import os
import urllib.error
import urllib.request

from ai_assistant.services.laravel_tool_client import LaravelToolClient
from .smart_waiter_prompt_builder import SmartWaiterPromptBuilder


class SmartWaiterAgentService:
    def __init__(self):
        self.api_key = os.getenv("API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("BASE_URL_CHAT", "http://apiaccess.iti.net.eg//api/v1/student/chat")
        self.model = os.getenv("OPENAI_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
        self.prompt_builder = SmartWaiterPromptBuilder()
        self.tool_client = LaravelToolClient()

    def chat(self, payload):
        if not self.api_key:
            return {"error": "AI service is not configured."}

        restaurant_id = payload["restaurant_id"]
        user_id = payload.get("user_id")

        # Collect tool context from Laravel backend
        tool_results = {}
        try:
            tool_results["restaurant"] = self.tool_client.call("restaurant", {}, restaurant_id)
        except Exception as e:
            tool_results["restaurant"] = {"error": str(e)}

        try:
            tool_results["menu"] = self.tool_client.call("menu", {}, restaurant_id)
        except Exception as e:
            tool_results["menu"] = {"error": str(e)}

        try:
            tool_results["orders"] = self.tool_client.call("orders", {"limit": 10}, restaurant_id)
        except Exception as e:
            tool_results["orders"] = {"error": str(e)}

        if user_id:
            try:
                tool_results["user_history"] = self.tool_client.call("user-history", {"user_id": user_id}, restaurant_id)
            except Exception as e:
                tool_results["user_history"] = {"error": str(e)}

        system_prompt = self.prompt_builder.build(payload)

        user_content = (
            f"Customer Request: \"{payload.get('message')}\"\n\n"
            f"Context Data for Restaurant #{restaurant_id}:\n"
            f"{json.dumps(tool_results, indent=2)}\n\n"
            "Analyze the customer request and menu data, apply budget/group/flavor constraints, "
            "and generate the response strictly in the specified JSON format. "
            "IMPORTANT: Always include restaurant_id and restaurant_name in the output."
        )

        messages = [{"role": "user", "content": user_content}]

        final = self._completion(messages, system_prompt=system_prompt)

        try:
            if "output_text" in final:
                message = final.get("output_text", "")
            else:
                choice = final.get("response", {})
                content_blocks = choice.get("content", [])
                if isinstance(content_blocks, list) and len(content_blocks) > 0:
                    message = content_blocks[0].get("text", "")
                else:
                    message = choice.get("content", "")
        except Exception:
            message = str(final)

        cleaned_message = message.strip()
        if cleaned_message.startswith("```"):
            lines = cleaned_message.splitlines()
            if len(lines) >= 2:
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned_message = "\n".join(lines).strip()

        try:
            res = json.loads(cleaned_message)
        except Exception:
            try:
                res = json.loads(message)
            except Exception:
                return {
                    "error": "Failed to parse Smart Waiter AI response as JSON.",
                    "raw_response": message
                }

        if isinstance(res, dict):
            res.setdefault("restaurant_id", restaurant_id)
            if "restaurant" in tool_results and "name" in tool_results["restaurant"]:
                res.setdefault("restaurant_name", tool_results["restaurant"]["name"])

        return res

    def _completion(self, messages, system_prompt=None):
        body = {
            "model_id": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
        }
        if system_prompt:
            body["system_prompt"] = system_prompt

        request = urllib.request.Request(
            self.base_url,
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
            return {"response": {"content": exc.read().decode("utf-8")}}
        except urllib.error.URLError as exc:
            return {"response": {"content": f"AI provider unavailable: {exc.reason}"}}
