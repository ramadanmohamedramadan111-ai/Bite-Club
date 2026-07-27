# Admin Orders API — Frontend Integration Guide

Base URL: `{{base_url}}/api/admin`  
Auth: All endpoints require `Authorization: Bearer {{admin_token}}` header.  
Content-Type: `application/json`

---

## 1. List Orders

`GET /admin/orders`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `search` | string | No | Search by order ID, customer name, email, or restaurant name |
| `status` | string | No | Filter by status: `awaiting_payment`, `pending`, `preparing`, `ready`, `out_for_delivery`, `completed`, `cancelled` |
| `restaurant_id` | integer | No | Filter by restaurant ID |
| `period` | string | No | Quick date: `today`, `week`, `month` |
| `from` | string (Y-m-d) | No* | Start date for custom range. Requires `to`. |
| `to` | string (Y-m-d) | No* | End date for custom range. Requires `from`. |

\* `from` + `to` must be provided together.

### Success Response (200)

```json
{
  "success": true,
  "message": "Orders retrieved successfully.",
  "data": {
    "filters": {
      "period": "week",
      "from": "2026-07-21",
      "to": "2026-07-27"
    },
    "statistics": {
      "total_orders": 10,
      "pending_orders": 2,
      "processing_orders": 3,
      "completed_orders": 4,
      "cancelled_orders": 1
    },
    "orders": {
      "data": [
        {
          "id": 1,
          "status": "completed",
          "order_type": "delivery",
          "subtotal": 25.50,
          "delivery_fee": 3.99,
          "service_fee": 1.50,
          "total": 30.99,
          "created_at": "2026-07-27 14:30:00",
          "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com"
          },
          "restaurant": {
            "id": 1,
            "name": "Pizza Palace"
          }
        }
      ],
      "links": {
        "first": "...",
        "last": "...",
        "prev": null,
        "next": "..."
      },
      "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "per_page": 15,
        "to": 10,
        "total": 10
      }
    }
  }
}
```

### Error Responses

| Status | Scenario |
|--------|----------|
| 401 | No token / Invalid token / Expired token / User token (not admin) |
| 422 | Invalid query parameter values |

---

## 2. Get Order Details

`GET /admin/orders/{orderId}`

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | integer | Yes | The order ID |

### Success Response (200)

```json
{
  "success": true,
  "message": "Order retrieved successfully.",
  "data": {
    "id": 1,
    "status": "pending",
    "order_type": "delivery",
    "subtotal": 25.50,
    "delivery_fee": 3.99,
    "service_fee": 1.50,
    "total": 30.99,
    "created_at": "2026-07-27 14:30:00",
    "updated_at": "2026-07-27 15:00:00",
    "user": {
      "id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "failed_pickup_count": 0,
      "status": "active",
      "last_login_at": "2026-07-27 10:00:00",
      "created_at": "2026-07-01 08:00:00"
    },
    "restaurant": {
      "id": 1,
      "name": "Pizza Palace",
      "email": "info@pizzapalace.com",
      "phone_number": "+1987654321",
      "address": "123 Main St",
      "description": "Best pizza in town",
      "status": "active",
      "average_rating": 4.5
    },
    "items": [
      {
        "id": 1,
        "item_id": 10,
        "item_name": "Pepperoni Pizza",
        "quantity": 2,
        "price": 12.75,
        "total_price": 25.50,
        "notes": "Extra cheese please"
      }
    ],
    "payments": [
      {
        "id": 1,
        "payment_type": "full",
        "payment_method": "cash",
        "amount": 30.99,
        "status": "paid",
        "transaction_id": "TXN-123456",
        "created_at": "2026-07-27 14:30:00"
      }
    ]
  }
}
```

### Error Responses

| Status | Response | Scenario |
|--------|----------|----------|
| 401 | `{"success": false, "message": "Unauthorized"}` | No/invalid/expired token, or user token (not admin) |
| 404 | `{"success": false, "message": "Order not found.", "data": []}` | Order does not exist |

---

## 3. Data Integrity Checks

When testing, verify these invariants on the frontend:

### Order List — Statistics
```
pending_orders + processing_orders + completed_orders + cancelled_orders = total_orders
```

### Order Details — Totals
```
subtotal + delivery_fee + service_fee = total

For each item:  price × quantity = total_price
Sum of items(i).total_price = subtotal
```

---

## 4. Postman Setup Guide

### 4.1 Environment Variables

| Variable | Value | Example |
|----------|-------|---------|
| `base_url` | API base URL | `http://localhost:8000` |
| `admin_token` | Admin JWT token | `eyJ0eXAiOiJKV1Qi...` |

### 4.2 Authentication Pre-request Script

```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.collectionVariables.get('admin_token')
});
```

### 4.3 Test Scripts

**Global success check:**
```javascript
pm.test("Status code is 200", () => pm.response.to.have.status(200));
pm.test("Response has success true", () => pm.response.json().success === true);
```

**Statistics integrity (List Orders):**
```javascript
const body = pm.response.json();
const stats = body.data.statistics;
const sum = stats.pending_orders + stats.processing_orders + stats.completed_orders + stats.cancelled_orders;
pm.test("Statistics sum equals total_orders", () => {
    pm.expect(sum).to.eql(stats.total_orders);
});
```

**Order total integrity (Order Details):**
```javascript
const order = pm.response.json().data;
pm.test("Order total math checks out", () => {
    pm.expect(order.subtotal + order.delivery_fee + order.service_fee).to.eql(order.total);
});
const subtotalFromItems = order.items.reduce((sum, item) => sum + item.total_price, 0);
pm.test("Items subtotal matches order subtotal", () => {
    pm.expect(subtotalFromItems).to.eql(order.subtotal);
});
```

---

## 5. Test Cases Checklist

### 5.1 List Orders

| # | Scenario | Query Params | Expected |
|---|----------|-------------|----------|
| 1 | No filters | — | 200, paginated orders + stats |
| 2 | Second page | `?page=2` | 200, `meta.current_page = 2` |
| 3 | Page beyond range | `?page=9999` | 200, empty `data` array |
| 4 | Filter by status | `?status=pending` | 200, all orders have that status |
| 5 | Invalid status | `?status=invalid` | 422 validation error |
| 6 | Filter by restaurant | `?restaurant_id=1` | 200, all orders for that restaurant |
| 7 | Non-existent restaurant | `?restaurant_id=99999` | 422 validation error |
| 8 | Search by order ID | `?search=42` | 200, matching results |
| 9 | Search by customer name | `?search=John` | 200, matching results |
| 10 | Search by email | `?search=john@example.com` | 200, matching results |
| 11 | Search by restaurant | `?search=Pizza` | 200, matching results |
| 12 | Period: today | `?period=today` | 200, only today's orders |
| 13 | Period: week | `?period=week` | 200, orders from this week |
| 14 | Period: month | `?period=month` | 200, orders from this month |
| 15 | Invalid period | `?period=year` | 422 validation error |
| 16 | Custom date range | `?from=2026-07-01&to=2026-07-15` | 200, filtered by range |
| 17 | from without to | `?from=2026-07-01` | 422 |
| 18 | to without from | `?to=2026-07-15` | 422 |
| 19 | from > to | `?from=2026-07-20&to=2026-07-15` | 422 |
| 20 | Invalid date format | `?from=01-07-2026` | 422 |
| 21 | Combined filters | `?status=completed&period=month&restaurant_id=1&search=Doe` | 200 |
| 22 | No auth token | — | 401 |
| 23 | Invalid token | — | 401 |
| 24 | User token (not admin) | — | 401 |

### 5.2 Order Details

| # | Scenario | Order ID | Expected |
|---|----------|----------|----------|
| 1 | Existing order | Valid ID | 200, full details |
| 2 | Non-existent order | 99999 | 404 |
| 3 | Invalid ID (string) | `abc` | 404 |
| 4 | ID = 0 | `0` | 404 |
| 5 | No auth token | Valid ID | 401 |
| 6 | User token (not admin) | Valid ID | 401 |
