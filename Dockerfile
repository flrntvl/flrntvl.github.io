# Development image only. Production is static files served by GitHub Pages.
FROM node:24-bookworm-slim

# git: the build reads each article's last commit date (src/lib/remark-modified-time.mjs).
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# No npm install here: the bind mount replaces /app at runtime. The Makefile installs into the mount instead.

# /app must exist and belong to `node` before the user switch (WORKDIR would create it as root, and too late).
RUN mkdir -p /app && chown node:node /app

# Everything the container writes (node_modules, .astro, dist) lands on the host through the bind mount.
# The `node` user is uid 1000, same as the host user, so those files stay readable and removable without sudo.
USER node

# Project root; the source tree is bind-mounted here.
WORKDIR /app

# Astro dev server default port.
EXPOSE 4321

# --host exposes the server outside the container.
# --ignore-lock disables .astro/dev.json: the lock outlives the container and
# records a PID from another namespace, which blocks restarts. 
# docker compose already owns the lifecycle.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--ignore-lock"]