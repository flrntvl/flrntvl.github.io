#!/usr/bin/env bash
set -euo pipefail

# Every command below assumes the repo root, whatever directory the caller ran from.
cd "$(dirname "$0")/.."

step() {
  printf "\033[44;97m %s \033[0m\n" "$1"
}

success() {
  printf "\033[42;97m %s \033[0m\n" "$1"
}

step "Building the Docker image"
docker compose build

step "Installing npm dependencies"
docker compose run --rm web npm install --no-audit --no-fund

step "Starting the dev server"
make --no-print-directory up

success "Application ready"
success "http://localhost:4321/"
