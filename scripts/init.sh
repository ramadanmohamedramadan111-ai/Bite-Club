#!/bin/bash

docker compose run --rm api composer create-project laravel/laravel . --no-interaction

docker compose run --rm dashboard sh -c "cd /tmp && npm create vite@latest app -- --template react-ts --linter eslint && cp -r /tmp/app/. /app/ && rm -rf /tmp/app"

docker compose run --rm web sh -c "cd /tmp && npx create-next-app@latest app --ts --eslint --app --no-tailwind --src-dir --import-alias '@/*' --yes && cp -r /tmp/app/. /app/ && rm -rf /tmp/app"

docker compose run --rm ai django-admin startproject config .

echo "done"