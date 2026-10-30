# ---- Build: client bundle + compiled server ----
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci

COPY server server
COPY client client
RUN npm run build -w client \
 && cd server && npx prisma generate && npm run build

# ---- Runtime: server production deps only ----
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl tini wget

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN apk add --no-cache --virtual .build python3 make g++ \
 && npm ci --omit=dev --workspace=server --include-workspace-root=false \
 && npm cache clean --force \
 && apk del .build

COPY server/prisma server/prisma
RUN cd server && npx prisma generate

# OCR language data baked in so the container works offline.
RUN mkdir -p /app/tessdata \
 && wget -qO- https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz | gunzip > /app/tessdata/eng.traineddata

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist server/public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p /data && chown node:node /data

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data \
    TESSDATA_DIR=/app/tessdata

USER node
WORKDIR /app/server
EXPOSE 3000
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh"]
CMD ["node", "dist/app.js"]
