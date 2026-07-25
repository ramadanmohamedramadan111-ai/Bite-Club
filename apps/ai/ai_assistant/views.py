import json
import os

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .services.openai_agent_service import OpenAiAgentService


@method_decorator(csrf_exempt, name="dispatch")
class ChatView(View):
    def post(self, request):
        internal_key = os.getenv("AI_INTERNAL_API_KEY")
        if internal_key and request.headers.get("X-Internal-API-Key") != internal_key:
            return JsonResponse({"error": "Invalid internal API key"}, status=401)

        try:
            payload = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)

        missing = [field for field in ("message", "restaurant_id") if not payload.get(field)]
        if missing:
            return JsonResponse({"error": "Missing required fields", "fields": missing}, status=422)

        service = OpenAiAgentService()
        response = service.chat(payload)

        return JsonResponse(response)
