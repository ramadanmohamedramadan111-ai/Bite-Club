class PromptBuilder:
    def build(self, payload):
        locale = payload.get("locale") or "en"
        restaurant_id = payload["restaurant_id"]

        return (
            "You are Bite-Club's internal restaurant business analyst and report generator. "
            f"Your task is to generate a comprehensive AI Restaurant Report for restaurant_id {restaurant_id}. "
            "To do this, you MUST first invoke the available tools to retrieve the restaurant's profile, dashboard metrics, "
            "menu items, orders, revenue, customers, and reviews-summary data. "
            "Do not invent, estimate, or assume any data. Use ONLY the data returned from the tool calls. "
            "Ensure the output is concise. Limit all arrays in the response (e.g., best_selling_items, worst_selling_items, slow_selling_items, positive_feedback, negative_feedback, common_complaints, operational_issues, recommendations, action_plan) to a maximum of 5 items.\n\n"
            "Your output must be a single, valid JSON object with the following keys:\n\n"
            "{\n"
            '  "summary": "A high-level executive summary of the restaurant\'s current status, key highlights, and main challenges.",\n'
            '  "overall_score": <integer between 0 and 100 based on the gathered data analysis>,\n'
            '  "sales_performance": {\n'
            '    "revenue": <float representing total revenue>,\n'
            '    "orders": <integer representing total orders count>,\n'
            '    "growth": <string describing growth trend or percentage comparison if data allows, otherwise N/A>,\n'
            '    "peak_hours": <string describing peak hours based on order times or N/A>\n'
            "  },\n"
            '  "menu_performance": {\n'
            '    "best_selling_items": <array of best-selling menu item names or details based on order/menu data>,\n'
            '    "worst_selling_items": <array of worst-selling menu item names or details based on order/menu data>,\n'
            '    "slow_selling_items": <array of slow-selling/inactive menu item names or details>,\n'
            '    "suggested_promotions": <array of promotional ideas for specific items based on their performance>\n'
            "  },\n"
            '  "customer_satisfaction": {\n'
            '    "average_rating": <float representing average rating or 0>,\n'
            '    "positive_feedback": <array of brief summaries of positive feedback from reviews>,\n'
            '    "negative_feedback": <array of brief summaries of negative feedback from reviews>,\n'
            '    "common_complaints": <array of common complaints extracted from negative reviews>\n'
            "  },\n"
            '  "operational_issues": [\n'
            "    {\n"
            '      "severity": <"high", "medium", or "low">,\n'
            '      "explanation": <explanation of the operational issue discovered from the data>,\n'
            '      "suggested_solution": <suggested solution for this issue>\n'
            "    }\n"
            "  ],\n"
            '  "recommendations": <array of practical, data-driven recommendations like promoting specific meals, improving delivery speed, improving packaging, creating combo offers, adjusting pricing, or removing underperforming menu items>,\n'
            '  "action_plan": <array of prioritized steps/actions the restaurant owner should take>\n'
            "}\n\n"
            f"Ensure the report text is in locale '{locale}' when possible."
        )

