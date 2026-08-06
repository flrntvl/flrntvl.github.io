.PHONY: install deps deps-update build up down reup web check types lint lint-fix format cc

install:
	@./scripts/install.sh

build:
	@docker compose build

up:
	@docker compose up -d

down:
	@docker compose down

reup:
	@docker compose down
	@docker compose up -d

# cc clears Astro caches, then brings the server back up.
# We also seed .astro/settings.json from inside the container. This records a fresh
# update-check timestamp using the same user as the web service, avoiding an
# immediate Astro CLI update-check write after the cache clear and preserving
# container ownership of the .astro directory.
cc:
	@docker compose down
	@rm -rf .astro node_modules/.astro
	@docker compose run --rm web sh -c 'mkdir -p .astro && printf "{\"_variables\":{\"lastUpdateCheck\":%s000}}" "$$(date +%s)" > .astro/settings.json'
	@docker compose up -d

web:
	@docker compose exec web bash

deps:
	@docker compose run --rm web npm install --no-audit --no-fund

deps-update:
	@docker compose run --rm web npx --yes npm-check-updates --interactive --install never
	@docker compose run --rm web npm install --no-audit --no-fund

check:
	@docker compose run --rm web npm run check

types:
	@docker compose run --rm web npm run types

lint:
	@docker compose run --rm web npm run lint

lint-fix:
	@docker compose run --rm web npm run lint:fix

format:
	@docker compose run --rm web npm run format