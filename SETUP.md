# 🚀 خطوات التشغيل الكاملة

## 📁 Structure
```
project/
├── docker-compose.yml
├── docker/
│   ├── Dockerfile.api          ← Laravel (PHP 8.3)
│   ├── Dockerfile.dashboard    ← React (Node 20)
│   ├── Dockerfile.web          ← Next.js (Node 20)
│   └── Dockerfile.ai           ← Django (Python 3.12)
├── apps/
│   ├── backend/api/            ← Laravel code (فاضي - init هيملاه)
│   ├── frontend/dashboard/     ← React code  (فاضي - init هيملاه)
│   ├── frontend/web/           ← Next.js code (فاضي - init هيملاه)
│   └── ai/                     ← Django code  (فاضي - init هيملاه)
├── nginx/conf.d/default.conf   ← Subdomains config
└── scripts/
    ├── init.sh    ← شغّله مرة واحدة بس في الأول
    ├── start.sh
    └── stop.sh
```

---

## ✅ الخطوة 1 — فك الـ ZIP

```bash
unzip project.zip
cd project
```

---

## ✅ الخطوة 2 — أضف الـ Subdomains في hosts

### على Linux / Mac:
```bash
sudo nano /etc/hosts
```
أضف السطر ده:
```
127.0.0.1 api.localhost dashboard.localhost web.localhost ai.localhost
```

### على Windows:
افتح Notepad as Administrator وافتح الملف:
```
C:\Windows\System32\drivers\etc\hosts
```
أضف:
```
127.0.0.1 api.localhost dashboard.localhost web.localhost ai.localhost
```

---

## ✅ الخطوة 3 — شغّل init.sh (مرة واحدة بس!)

```bash
chmod +x scripts/init.sh
./scripts/init.sh
```

السكريبت ده هيعمل أوتوماتيك:
- `docker compose build` — يبني الـ images
- `composer create-project laravel/laravel` — ينشئ Laravel
- `npm create vite@latest` — ينشئ React
- `npx create-next-app@latest` — ينشئ Next.js
- `django-admin startproject` — ينشئ Django

---

## ✅ الخطوة 4 — شغّل كل الـ services

```bash
docker compose up -d
```

---

## 🌍 افتح في المتصفح

| URL | App |
|-----|-----|
| http://api.localhost:8080 | Laravel |
| http://dashboard.localhost:8080 | React (Vite) |
| http://web.localhost:8080 | Next.js |
| http://ai.localhost:8080 | Django |

---

## 📋 أوامر يومية

```bash
# تشغيل
docker compose up -d

# وقف
docker compose down

# شوف الـ logs
docker compose logs -f
docker compose logs -f api        # Laravel فقط
docker compose logs -f dashboard  # React فقط

# دخول جوه container
docker compose exec api bash         # Laravel
docker compose exec dashboard sh     # React
docker compose exec web sh           # Next.js
docker compose exec ai bash          # Django
docker compose exec db bash          # MySQL

# install packages
docker compose exec api composer require package-name
docker compose exec dashboard npm install package-name
docker compose exec web npm install package-name
docker compose exec ai pip install package-name
```

---

## 🗃️ Volumes

| Volume | الغرض |
|--------|--------|
| `db_data` | MySQL data — بيفضل موجود حتى بعد `down` |
| `dashboard_nm` | node_modules React — isolated عن الـ host |
| `web_nm` | node_modules Next.js — isolated عن الـ host |

كل الـ **source code** هو bind mount — أي تعديل على جهازك بيظهر فوراً جوه الـ container بدون restart.

---

## ❌ مشاكل شائعة وحلها

### Port 80 مشغول
المشروع شغّال على **8080** مش 80 — مفيش مشكلة.

### init.sh بيقول "not empty"
```bash
# امسح يدوياً وشغّل تاني
find apps/backend/api -mindepth 1 -delete
find apps/frontend/dashboard -mindepth 1 -delete
find apps/frontend/web -mindepth 1 -delete
find apps/ai -mindepth 1 -delete
./scripts/init.sh
```

### Subdomains مش شغالة
تأكد إنك أضفت السطر في `/etc/hosts` صح وجرب تعمل:
```bash
ping api.localhost
```
لو مش شغال ارجع للخطوة 2.

### MySQL مش بيتوصل
```bash
docker compose exec db mysql -u laravel -psecret laravel
```
---

## 🔄 لو عايز تبدأ من الأول

```bash
docker compose down -v   # بيوقف ويمسح الـ volumes
find apps/backend/api -mindepth 1 -delete
find apps/frontend/dashboard -mindepth 1 -delete
find apps/frontend/web -mindepth 1 -delete
find apps/ai -mindepth 1 -delete
./scripts/init.sh
docker compose up -d
```
