from .laravel_tool_client import LaravelToolClient


class ToolExecutor:
    TOOL_NAMES = {
        "menu",
        "dashboard",
        "orders",
        "revenue",
        "customers",
        "restaurant",
        "reviews-summary",
    }

    def __init__(self):
        self.client = LaravelToolClient()

    def definitions(self):
        return [
            {
                "type": "function",
                "function": {
                    "name": name.replace("-", "_"),
                    "description": f"Fetch structured {name} data for the authenticated restaurant.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "from": {"type": "string"},
                            "to": {"type": "string"},
                            "limit": {"type": "integer"},
                        },
                        "additionalProperties": False,
                    },
                },
            }
            for name in sorted(self.TOOL_NAMES)
        ]

    def execute(self, tool_call, restaurant_id):
        function = tool_call.get("function", {})
        requested_name = function.get("name", "").replace("_", "-")

        if requested_name not in self.TOOL_NAMES:
            return {"error": "Unknown tool", "tool": requested_name}

        try:
            arguments = function.get("arguments") or "{}"
            if isinstance(arguments, str):
                import json

                arguments = json.loads(arguments or "{}")
        except ValueError:
            arguments = {}

        return self.client.call(requested_name, arguments, restaurant_id)
