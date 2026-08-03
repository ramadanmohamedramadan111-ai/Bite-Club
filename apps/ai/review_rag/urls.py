from django.urls import path

from .views import ReviewSyncView, MenuItemSyncView

urlpatterns = [
    path("reviews/sync/", ReviewSyncView.as_view(), name="review-sync"),
    path("menu-items/sync/", MenuItemSyncView.as_view(), name="menu-item-sync"),
]
