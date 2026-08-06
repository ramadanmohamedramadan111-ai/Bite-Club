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
        self.base_url = os.getenv("BASE_URL_CHAT", "https://apiaccess.iti.net.eg/api/v1/student/chat")
        self.model = os.getenv("OPENAI_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
        self.prompt_builder = PromptBuilder()
        self.conversation_manager = ConversationManager()
        self.tool_executor = ToolExecutor()

    def _escape_xml(self, text):
        if not isinstance(text, str):
            return ""
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def chat(self, payload):
        if not self.api_key:
            return {
                "error": "AI service is not configured.",
            }

        restaurant_id = payload["restaurant_id"]
        message = payload.get("message", "")

        # 1. Smart Context Builder: Analyze message keywords to decide which data domains to fetch
        message_lower = message.lower()
        selected_domains = []
        
        if any(w in message_lower for w in ["perform", "revenue", "sales", "finance", "growth", "peak", "money", "income"]):
            selected_domains.append("performance")
            
        if any(w in message_lower for w in ["menu", "item", "dish", "selling", "promote", "best", "worst", "unsold", "product", "pricing"]):
            selected_domains.append("menu")
            
        if any(w in message_lower for w in ["customer", "client", "retention", "returning", "loyal", "visitor", "user"]):
            selected_domains.append("customers")
            
        if any(w in message_lower for w in ["review", "rating", "complaint", "feedback", "critic", "comment", "opinion", "stars"]):
            selected_domains.append("reviews")
            
        if not selected_domains:
            # Fallback to all metrics if query is generic
            selected_domains = ["performance", "menu", "customers", "reviews"]
            
        domains_str = ",".join(selected_domains)

        # 2. Lazy/Unified Aggregated Tool Call
        tool_results = {}
        try:
            tool_results = self.tool_executor.client.call("analytics", {"domains": domains_str}, restaurant_id)
        except Exception as e:
            tool_results = {"error": str(e)}

        system_prompt = self.prompt_builder.build(payload)

        locale = payload.get("locale") or "en"
        escaped_locale = self._escape_xml(locale)

        # JSON serialize metrics and reviews data inside XML delimiters to prevent breakout injections
        serialized_data = json.dumps(tool_results, indent=2)
        escaped_data = self._escape_xml(serialized_data)

        user_content = (
            f"<analysis_parameters>\n"
            f"target_restaurant_id: {restaurant_id}\n"
            f"target_locale: {escaped_locale}\n"
            f"extracted_domains: {domains_str}\n"
            f"</analysis_parameters>\n\n"
            f"<restaurant_data>\n{escaped_data}\n</restaurant_data>\n\n"
            "Analyze the metrics and customer reviews data inside the <restaurant_data> tag. "
            "Apply localized text constraints based on target_locale. "
            "Generate the final restaurant report strictly in the specified JSON format."
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

