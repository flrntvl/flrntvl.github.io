.PHONY: install deps deps-update build up down web check types lint lint-fix format

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