# One image: builds the React web app and the API, then serves both from Express.

# Stage 1: build the web app (it calls the API on its own origin: /api/v1)
FROM node:22-alpine AS client-builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install --no-audit --no-fund
COPY client/ ./client/
ENV VITE_API_URL=/api/v1
RUN npm run build:client

# Stage 2: build the API
FROM node:22-alpine AS server-builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install --no-audit --no-fund
COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate && npm run build
# Runtime dependencies only (workspaces hoist them to /app/node_modules).
WORKDIR /app
RUN npm prune --omit=dev --workspace server --include-workspace-root=false || true

# Stage 3: production
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/server/package.json ./package.json
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=client-builder /app/client/dist ./public
# Prisma CLI to sync the schema at start (no migrations folder yet; db push never drops data without --accept-data-loss), so the box needs no internet after a reboot.
RUN npm install -g prisma@6 --no-audit --no-fund && npm cache clean --force \
  && mkdir -p uploads && chown -R node:node uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1
CMD ["sh", "-c", "prisma db push --skip-generate && node dist/app.js"]
