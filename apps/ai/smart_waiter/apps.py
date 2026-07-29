from django.apps import AppConfig


class SmartWaiterConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "smart_waiter"

    def ready(self):
        from smart_waiter.services.bootstrap import ensure_smart_waiter_schema

        ensure_smart_waiter_schema()
