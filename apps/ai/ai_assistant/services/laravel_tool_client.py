import json
import os
import urllib.error
import urllib.request


class LaravelToolClient:
    def __init__(self):
        self.base_url = os.getenv("LARAVEL_API_URL", "http://api:8000").rstrip("/")
        self.internal_api_key = os.getenv("AI_INTERNAL_API_KEY", "")
        self.timeout = int(os.getenv("LARAVEL_API_TIMEOUT", "30"))

    def call(self, tool_name, arguments, restaurant_id=None):
        payload = dict(arguments or {})
        if restaurant_id is not None:
            payload["restaurant_id"] = restaurant_id

        request = urllib.request.Request(
            f"{self.base_url}/api/internal/ai/tools/{tool_name}",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Internal-API-Key": self.internal_api_key,
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
                return json.loads(body or "{}")
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8")
            return {"error": "Laravel tool call failed", "status": exc.code, "body": body}
        except urllib.error.URLError as exc:
            return {"error": "Laravel tool call unavailable", "reason": str(exc.reason)}
