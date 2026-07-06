# Engineering Knowledge Base — single-image production build.
# Serves the built React frontend AND the Express API from one Node process.
FROM node:22-bookworm-slim

WORKDIR /app

# Toolchain for building the better-sqlite3 native module if a prebuild is missing.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Install all deps (dev deps are needed to build the frontend).
COPY package*.json ./
RUN npm ci

# Build the frontend (tsc + vite → /dist).
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000
# Point the SQLite file at a mounted volume in your host's dashboard, e.g. DB_PATH=/data/data.db
EXPOSE 4000

CMD ["node", "server/index.js"]
