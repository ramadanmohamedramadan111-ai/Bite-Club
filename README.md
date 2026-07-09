# Full-Stack Monorepo

This project is organized as a monorepo with a monolithic backend.

## Structure

```text
project/
├── docker-compose.yml
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.dashboard
│   ├── Dockerfile.web
│   └── Dockerfile.ai
├── apps/
│   ├── backend/
│   │   └── api/          Laravel
│   ├── frontend/
│   │   ├── dashboard/    React + Vite
│   │   └── web/          Next.js
│   └── ai/               Django
├── nginx/
│   └── conf.d/
│       └── default.conf
└── scripts/
    ├── init.sh
    ├── start.sh
    └── stop.sh
```

## Services

- `api`: Laravel backend
- `dashboard`: React admin dashboard
- `web`: Next.js frontend
- `ai`: Django AI service
- `db`: MySQL database
- `nginx`: reverse proxy and domain router

## Domains

- `api.localhost:8080` routes to the Laravel backend
- `dashboard.localhost:8080` routes to the React dashboard
- `web.localhost:8080` routes to the Next.js app
- `ai.localhost:8080` routes to the Django service

Add this to `/etc/hosts`:

```text
127.0.0.1 api.localhost dashboard.localhost web.localhost ai.localhost
```

## First Time Setup

```bash
docker compose build
chmod +x scripts/init.sh
./scripts/init.sh
docker compose up -d
```

## Daily Commands

```bash
docker compose up -d
docker compose down
docker compose logs -f api
docker compose exec api bash
docker compose exec dashboard sh
docker compose exec web sh
docker compose exec ai bash
```

## Notes

- `docker-compose.yml` defines the full runtime stack.
- `nginx/conf.d/default.conf` maps each domain to its service.
- The backend is monolithic, while the repository itself is split by app.
