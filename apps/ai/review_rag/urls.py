from django.urls import path

from .views import ReviewSyncView


urlpatterns = [
    path("reviews/sync/", ReviewSyncView.as_view(), name="review-sync"),
]
