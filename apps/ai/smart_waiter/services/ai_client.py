import json
import os
import urllib.error
import urllib.request


class SmartWaiterAiClient:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "") or os.getenv("API_KEY", "")
        self.chat_url = os.getenv("BASE_URL_CHAT", "").strip()
        self.embed_url = os.getenv("BASE_URL_EMBED", "").strip()
        self.chat_model = os.getenv("OPENAI_MODEL", "")
        self.embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "800"))
        self.timeout = int(os.getenv("OPENAI_TIMEOUT", "60"))

    def complete(self, system_prompt: str, messages: list[dict]) -> str:
        body = {
            "model_id": self.chat_model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        if system_prompt:
            body["system_prompt"] = system_prompt

        response = self._request(self.chat_url, body)
        return self._extract_text(response)

    def embed(self, text: str) -> list[float]:
        text = (text or "").strip()
        if not text or not self.api_key or not self.embedding_model:
            return []

        body = {
            "model_id": self.embedding_model,
            "texts": [text],
            "input_type": "search_document",
        }
        response = self._request(self.embed_url, body)

        embeddings = response.get("embeddings") or []
        if isinstance(embeddings, list) and embeddings:
            first = embeddings[0]
            return first if isinstance(first, list) else []
        return []

    def _request(self, url: str, body: dict) -> dict:
        if not url:
            return {}

        request = urllib.request.Request(
            url,
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
                raw = response.read().decode("utf-8")
                return json.loads(raw or "{}")
        except urllib.error.HTTPError as exc:
            return {"error": exc.read().decode("utf-8")}
        except (urllib.error.URLError, json.JSONDecodeError) as exc:
            return {"error": str(exc)}

    def _extract_text(self, response: dict) -> str:
        if not response:
            return ""

        if isinstance(response.get("output_text"), str):
            return response["output_text"]

        choice = response.get("response", {})
        content = choice.get("content", [])
        if isinstance(content, list) and content:
            first = content[0]
            if isinstance(first, dict):
                return first.get("text", "") or first.get("content", "")

        if isinstance(choice.get("content"), str):
            return choice["content"]

        if isinstance(response.get("message"), str):
            return response["message"]

        return json.dumps(response)
