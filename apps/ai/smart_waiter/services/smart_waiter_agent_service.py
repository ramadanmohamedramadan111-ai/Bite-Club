import json
import os
import urllib.error
import urllib.request

from ai_assistant.services.laravel_tool_client import LaravelToolClient
from .smart_waiter_prompt_builder import SmartWaiterPromptBuilder
from review_rag.services.embedding_service import EmbeddingService
from review_rag.services.vector_search_service import VectorSearchService

class SmartWaiterAgentService:
    def __init__(self):
        self.api_key = os.getenv("API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("BASE_URL_CHAT", "http://apiaccess.iti.net.eg//api/v1/student/chat")
        self.model = os.getenv("OPENAI_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
        self.prompt_builder = SmartWaiterPromptBuilder()
        self.tool_client = LaravelToolClient()
        self.embedding_service = EmbeddingService()
        self.vector_search = VectorSearchService()

    def chat(self, payload):
        if not self.api_key:
            return {"error": "AI service is not configured."}

        message = payload.get("message", "")

        # 1. Backend Filtering: Get nearby/open restaurants
        tool_results = {}
        filtered_restaurants = []
        try:
            filter_payload = {}
            if payload.get("latitude"): filter_payload["latitude"] = payload["latitude"]
            if payload.get("longitude"): filter_payload["longitude"] = payload["longitude"]
            
            res = self.tool_client.call("filtered-restaurants", filter_payload)
            filtered_restaurants = res.get("restaurants", [])
            tool_results["filtered_restaurants"] = filtered_restaurants
        except Exception as e:
            tool_results["filtered_restaurants"] = {"error": str(e)}

        restaurant_ids = [r["id"] for r in filtered_restaurants] if filtered_restaurants else []

        # 2. Dynamic Data Loading (Menus of top 3 open restaurants)
        target_restaurant_ids = restaurant_ids[:3]
        tool_results["menus"] = {}
        for rid in target_restaurant_ids:
            try:
                menu_data = self.tool_client.call("menu", {}, rid)
                tool_results["menus"][rid] = menu_data.get("categories", [])
            except Exception:
                pass

        # 3. Review RAG
        if restaurant_ids:
            try:
                query_emb = self.embedding_service.embed_text(message)
                rag_results = self.vector_search.search(restaurant_ids, query_emb, limit=5)
                review_ids = [r["review_id"] for r in rag_results]
                
                if review_ids:
                    reviews_data = self.tool_client.call("reviews", {"review_ids": review_ids})
                    tool_results["relevant_reviews"] = reviews_data.get("reviews", [])
            except Exception as e:
                tool_results["relevant_reviews"] = {"error": str(e)}

        # 4. Generate Final Recommendation
        system_prompt = self.prompt_builder.build(payload)

        history = payload.get("conversation", [])
        history_text = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history])
        if history_text:
            history_text = f"\nRecent Conversation History:\n{history_text}\n"

        user_content = (
            f"{history_text}\n"
            f"Customer Request: \"{message}\"\n\n"
            f"Context Data (Filtered Restaurants, Menus, Reviews):\n"
            f"{json.dumps(tool_results, indent=2)}\n\n"
            "Analyze the request and data. Apply budget/group constraints if any. "
            "Generate the response strictly in the specified JSON format. "
            "Include recommended_restaurant_id and recommended_menu_item_ids if you recommend an item."
        )

        messages = [{"role": "user", "content": user_content}]

        final = self._completion(messages, system_prompt=system_prompt)
        cleaned_message = self._extract_message(final)

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
                res = json.loads(self._extract_message(final))
            except Exception:
                return {
                    "error": "Failed to parse Smart Waiter AI response as JSON.",
                    "raw_response": cleaned_message
                }

        return res

    def _extract_message(self, final):
        try:
            if "output_text" in final:
                return final.get("output_text", "")
            else:
                choice = final.get("response", {})
                content_blocks = choice.get("content", [])
                if isinstance(content_blocks, list) and len(content_blocks) > 0:
                    return content_blocks[0].get("text", "")
                else:
                    return choice.get("content", "")
        except Exception:
            return str(final)

    def _completion(self, messages, system_prompt=None, max_tokens=None):
        body = {
            "model_id": self.model,
            "messages": messages,
            "max_tokens": max_tokens or self.max_tokens,
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
