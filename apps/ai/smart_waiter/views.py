import json
import os

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .services.smart_waiter_agent_service import SmartWaiterAgentService


@method_decorator(csrf_exempt, name="dispatch")
class SmartWaiterChatView(View):
    def post(self, request):
        internal_key = os.getenv("AI_INTERNAL_API_KEY")
        if internal_key and request.headers.get("X-Internal-API-Key") != internal_key:
            return JsonResponse({"error": "Invalid internal API key"}, status=401)

        try:
            payload = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)

        missing = [field for field in ("message", "user_id") if not payload.get(field)]
        if missing:
            return JsonResponse({"error": "Missing required fields", "fields": missing}, status=422)

        if payload.get("latitude") is not None:
            try:
                payload["latitude"] = float(payload["latitude"])
            except (TypeError, ValueError):
                return JsonResponse({"error": "Invalid latitude"}, status=422)

        if payload.get("longitude") is not None:
            try:
                payload["longitude"] = float(payload["longitude"])
            except (TypeError, ValueError):
                return JsonResponse({"error": "Invalid longitude"}, status=422)

        service = SmartWaiterAgentService()
        response = service.chat(payload)

        status = 200 if "error" not in response else 400
        return JsonResponse(response, status=status)
