from django.urls import path

from .views import SmartWaiterChatView

urlpatterns = [
    path("smart-waiter/chat/", SmartWaiterChatView.as_view(), name="smart-waiter-chat"),
]
