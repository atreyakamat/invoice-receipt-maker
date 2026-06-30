# Multi-stage build for Monorepo

# Stage 1: Build client
FROM node:22-alpine AS client-builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci
COPY client/ ./client/
RUN npm run build:client

# Stage 2: Build server
FROM node:22-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci
COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Server
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built server
COPY --from=server-builder /app/server/package*.json ./
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/prisma ./prisma

# Copy built client to serve statically (if using Express to serve static files)
COPY --from=client-builder /app/client/dist ./public

EXPOSE 3000
CMD ["npm", "start"]
