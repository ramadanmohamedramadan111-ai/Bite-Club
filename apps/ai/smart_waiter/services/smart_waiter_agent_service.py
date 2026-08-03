import json
import os
import urllib.error
import urllib.request
from django.core.cache import cache

from ai_assistant.services.laravel_tool_client import LaravelToolClient
from .smart_waiter_prompt_builder import SmartWaiterPromptBuilder
from review_rag.services.review_rag_orchestrator import ReviewRagOrchestrator
from review_rag.services.menu_rag_orchestrator import MenuRagOrchestrator

class SmartWaiterAgentService:
    def __init__(self):
        self.api_key = os.getenv("API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("BASE_URL_CHAT", "http://apiaccess.iti.net.eg//api/v1/student/chat")
        self.model = os.getenv("OPENAI_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
        self.prompt_builder = SmartWaiterPromptBuilder()
        self.tool_client = LaravelToolClient()
        self.rag_orchestrator = ReviewRagOrchestrator()
        self.menu_rag_orchestrator = MenuRagOrchestrator()

    def chat(self, payload):
        if not self.api_key:
            return {"error": "AI service is not configured."}

        message = payload.get("message", "")

        # 1. Backend Filtering: Get nearby/open restaurants
        tool_results = {}
        filtered_restaurants = []
        try:
            filter_payload = {}
            if payload.get("latitude"): filter_payload["latitude"] = payload.get("latitude")
            if payload.get("longitude"): filter_payload["longitude"] = payload.get("longitude")
            
            res = self.tool_client.call("filtered-restaurants", filter_payload)
            filtered_restaurants = res.get("restaurants", [])
            tool_results["filtered_restaurants"] = filtered_restaurants
        except Exception as e:
            tool_results["filtered_restaurants"] = {"error": str(e)}

        restaurant_ids = [r["id"] for r in filtered_restaurants] if filtered_restaurants else []

        # 2. Dynamic Data Loading (Relevant Menus via RAG)
        tool_results["relevant_menu_items"] = self.menu_rag_orchestrator.get_relevant_menu_items(
            message, 
            restaurant_ids[:3], 
            limit=10
        )

        # 3. Review RAG
        tool_results["relevant_reviews"] = self.rag_orchestrator.get_relevant_reviews(message, restaurant_ids, limit=5)

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

        # Fix total price hallucination
        rec_restaurant_id = res.get("recommended_restaurant_id")
        items = res.get("items", [])
        
        if not rec_restaurant_id and items:
            res["items"] = []
            res["total_price"] = 0.0
            res["recommended_menu_item_ids"] = []
        elif rec_restaurant_id and items:
            # Filter out any hallucinated items with null IDs to protect the frontend
            valid_items = [item for item in items if item.get("id") is not None]
            res["items"] = valid_items
            
            actual_total = 0.0
            relevant_items = tool_results.get("relevant_menu_items", [])
            
            for item in valid_items:
                item_id = item.get("id")
                quantity = item.get("quantity", 1)
                real_price = None
                
                for r_item in relevant_items:
                    if r_item.get("restaurant_id") == rec_restaurant_id and r_item.get("item", {}).get("id") == item_id:
                        real_price = r_item.get("item", {}).get("price")
                        break
                        
                if real_price is not None:
                    item["price"] = float(real_price)
                    actual_total += float(real_price) * quantity
                else:
                    actual_total += float(item.get("price", 0)) * quantity
                    
            res["total_price"] = actual_total

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
