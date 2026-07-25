import json
import os
import urllib.error
import urllib.request

from .conversation_manager import ConversationManager
from .prompt_builder import PromptBuilder
from .tool_executor import ToolExecutor


class OpenAiAgentService:
    def __init__(self):
        self.api_key = os.getenv("API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("BASE_URL_CHAT", "http://apiaccess.iti.net.eg//api/v1/student/chat")
        self.model = os.getenv("OPENAI_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
        self.prompt_builder = PromptBuilder()
        self.conversation_manager = ConversationManager()
        self.tool_executor = ToolExecutor()

    def chat(self, payload):
        if not self.api_key:
            return {
                "error": "AI service is not configured.",
            }

        restaurant_id = payload["restaurant_id"]

        # Gather all restaurant analytics using the existing tools
        tool_results = {}
        for tool_name in ["restaurant", "dashboard", "menu", "orders", "revenue", "customers", "reviews-summary"]:
            try:
                tool_results[tool_name] = self.tool_executor.client.call(tool_name, {}, restaurant_id)
            except Exception as e:
                tool_results[tool_name] = {"error": str(e)}

        system_prompt = self.prompt_builder.build(payload)
        user_content = (
            f"Here is the collected restaurant analytics data for restaurant_id {restaurant_id}:\n\n"
            f"{json.dumps(tool_results, indent=2)}\n\n"
            "Please analyze this data and generate the restaurant report in the specified JSON format."
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

        # Clean up markdown code block wrapper if present
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
            return json.loads(cleaned_message)
        except Exception:
            try:
                return json.loads(message)
            except Exception:
                return {
                    "error": "Failed to parse AI report as JSON.",
                    "raw_response": message
                }

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

