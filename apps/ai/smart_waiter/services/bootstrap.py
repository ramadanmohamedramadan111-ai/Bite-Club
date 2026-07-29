from django.db import connection

from smart_waiter.models import SmartWaiterConversation, SmartWaiterDocument


def ensure_smart_waiter_schema() -> None:
    existing = set(connection.introspection.table_names())
    models_to_create = []

    if SmartWaiterConversation._meta.db_table not in existing:
        models_to_create.append(SmartWaiterConversation)

    if SmartWaiterDocument._meta.db_table not in existing:
        models_to_create.append(SmartWaiterDocument)

    if not models_to_create:
        return

    with connection.schema_editor() as schema_editor:
        for model in models_to_create:
            schema_editor.create_model(model)
