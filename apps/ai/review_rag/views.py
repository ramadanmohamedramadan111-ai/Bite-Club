import json
import os

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .services.embedding_service import EmbeddingService


@method_decorator(csrf_exempt, name="dispatch")
class ReviewSyncView(View):
    def post(self, request):
        internal_key = os.getenv("AI_INTERNAL_API_KEY")
        if internal_key and request.headers.get("X-Internal-API-Key") != internal_key:
            return JsonResponse({"error": "Invalid internal API key"}, status=401)

        try:
            payload = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)

        event = payload.get("event")
        review = payload.get("review") or {}

        if event not in {"created", "updated", "deleted"}:
            return JsonResponse({"error": "Invalid review event"}, status=422)

        if not review.get("id") or not review.get("restaurant_id"):
            return JsonResponse({"error": "Missing review context"}, status=422)

        service = EmbeddingService()
        result = service.sync_review(event, review)

        return JsonResponse(result)
