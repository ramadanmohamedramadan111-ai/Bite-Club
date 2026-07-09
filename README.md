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

If you are starting from scratch:

```bash
git clone <repo-url>
cd Graduation-Project-ITI
```

If the repository is already cloned:

```bash
cd Graduation-Project-ITI
```

Install project dependencies:

```bash
docker compose run --rm api composer install
docker compose run --rm dashboard npm install
docker compose run --rm web npm install
```

Start the stack:

```bash
docker compose build
docker compose up -d
```

`scripts/init.sh` is only for bootstrapping a brand-new empty scaffold.

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
