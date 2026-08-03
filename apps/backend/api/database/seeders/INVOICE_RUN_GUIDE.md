# دليل تشغيل نظام الفواتير (Restaurant Invoices) — التكامل للفرونت إند

> المستند دا بيشرح: إزاي تشغّل الـ seeder، إزاي تدخل المطعم الديمو، وإزاي تتعامل مع الـ 3 endpoints من الفرونت إند.

---

## 1) تشغيل الـ Seeder

السيدر متسلسل (idempotent) — تقدر تشغّله أكتر من مرة من غير ما يعمّل بيانات مكررة، بيمسح الفواتير القديمة ويعيد توليدها.

```bash
# داخل container الـ api (هو اللي عنده PHP 8.3)
docker exec graduation-project-iti-api-1 php artisan db:seed --class=InvoiceSeeder
```


**اللي بيعمله السيدر:**
1. يضمن وجود مطعم ديمو (La Piazza) جاهز للتسجيل (يعمله لو مش موجود) + إعدادات + منيو.
2. يعيد توليد الفواتير لكل المطاعم الموجودة.
3. لكل مطعم: **7 فواتير** = 3 شهور (فاتورة `paid` + فاتورة `unpaid` كل شهر) + فاتورة `overdue`.

---

## 2) بيانات الدخول (المطعم الديمو)

المطعم دا جاهز ومفعّل:

| الحقل | القيمة |
|---|---|
| `email` | `lapiazza@biteclub.com` |
| `password` | `password123` |
| التوكن | Bearer Token (JWT) |

> **هام:** كل الراوتات محمية بـ `auth.restaurant`، فمحتاج تضيف `Authorization: Bearer <token>` في كل طلب، وهيتعامل على بيانات المطعم اللي اتعمل عليه login.

---

## 3) معرفة الـ Routes

الجذر الكامل: `api/restaurant` (ممكن تتأكد بـ `docker exec graduation-project-iti-api-1 php artisan route:list --path=api/restaurant`).

| الطريقة | المسار | اسم الراوت | الوصف |
|---|---|---|---|
| POST | `/api/restaurant/login` | — | تسجيل الدخول → بيجيب `access_token` |
| GET | `/api/restaurant/invoices` | `restaurant.invoices.index` | قائمة الفواتير (فلترة + paginate) |
| GET | `/api/restaurant/invoices/{id}` | `restaurant.invoices.show` | تفاصيل فاتورة |
| POST | `/api/restaurant/invoices/{id}/pay` | `restaurant.invoices.pay` | إنشاء جلسة دفع |

---

## 4) سيناريو التكامل (بالترتيب)

### 1) تسجيل الدخول وإمساك التوكن
```bash
curl -X POST http://localhost/api/restaurant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lapiazza@biteclub.com","password":"password123"}'
```
الرد:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJ0eXAi...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "restaurant": { "id": 11, "name": "La Piazza", "email": "..." }
  }
}
```
> خد `data.access_token` واضعه في الهيدر `Authorization: Bearer <token>` لكل الطلبات الجاية.

### 2) عرض الفواتير (الفلترة والـ paginate)
```
GET /api/restaurant/invoices?status=unpaid&per_page=15
```
- كيوري اختياري: `status` بقيم `paid` / `unpaid` / `overdue`
- كيوري اختياري: `per_page` من 1 لـ 100 (ديفولت 15)
- `restaurant_id` مبيتبعتش — بيتجيب أوتوماتي من توكن المطعم.

الرد:
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": {
    "items": [
      {
        "id": 164,
        "amount": 1556.05,
        "billing_start_date": "2026-07-01",
        "billing_end_date": "2026-07-31",
        "due_date": "2026-08-14",
        "status": "unpaid",
        "payment_gateway_ref": null,
        "created_at": "2026-07-01 00:00:00",
        "restaurant": { "id": 11, "name": "La Piazza" },
        "platform_dues": []
      }
    ],
    "meta": {}
  }
}
```

### 3) تفاصيل فاتورة واحدة
```
GET /api/restaurant/invoices/{id}
```
الرد:
```json
{
  "success": true,
  "message": "Invoice details retrieved successfully",
  "data": {
    "id": 159,
    "amount": 2643.87,
    "billing_start_date": "2026-05-01",
    "billing_end_date": "2026-05-31",
    "due_date": "2026-06-14",
    "status": "paid",
    "payment_gateway_ref": "INV-B3UD6IYVYPRFAPV",
    "created_at": "2026-05-01 00:00:00",
    "platform_dues": []
  }
}
```
> لو الفاتورة مش موجودة أو مش تبع المطعم الحالي: `404 { "success": false, "message": "Invoice not found." }`

### 4) الدفع (إنشاء جلسة دفع)
```
POST /api/restaurant/invoices/{id}/pay
```
(بالنسبة للفاتورة `unpaid`.)

الرد:
```json
{
  "success": true,
  "message": "Payment session created successfully",
  "data": { "checkout_url": "https://payments.kashier.io/session/..." }
}
```
> افتح `data.checkout_url` في المتصفح لتكملة الدفع (حاليًا `mode=test`).

---

## 5) شكل الـ Response الموحّد

كل الردود من خلال `ApiResponseTrait`:
- **نجاح:** `{ "success": true, "message": "...", "data": {...} }`
- **خطأ:** `{ "success": false, "message": "...", "errors": {...} }`
- كود الحالة: 200/201 للنجاح، 400/422/401/404 للأخطاء.

---

## 6) ملاحظات للمافرونت إند
- هات التوكن من login، حطيته في الهيدر.
- اعرض الفواتير من `data.items`، وتنقّل بـ `meta`.
- استخدم `?status=` للتبويب (Paid / Unpaid / Overdue).
- الفواتير `overdue` و`unpaid` هي اللي ليها زر دفع (`/pay`).
- الفاتورة اللي كانت `paid` مفيهاش زرار دفع.

---

## 7) استكشاف الأخطاء
- السيدر محتاج PHP >= 8.3 => شغّله جوه الـ container:
  `docker exec graduation-project-iti-api-1 php artisan db:seed --class=InvoiceSeeder`.
- لو مش شايف فواتير، تأكد إن المطعم بتاعك `status = active` وإن التوكن للمطم الصحيح.
- الـ `checkout_url` محتاجة إعدادات Kashier (مفاتيح الدفع) عشان الدفع الفعلي يشتغل بره `mode=test`.
