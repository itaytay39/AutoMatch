FROM node:20-alpine AS web-builder
WORKDIR /app

# Install Expo web build deps
COPY apps/mobile/package*.json ./
RUN npm ci

COPY apps/mobile/ .
ENV EXPO_PUBLIC_API_URL=https://api-production-3f4f.up.railway.app/api/v1
RUN npx expo export --platform web --output-dir dist

# ── API builder ─────────────────────────────────────────────────
FROM node:20-alpine AS api-builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/api/ ./services/api/

RUN npm install --workspace=services/api --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/api && npm run build

# ── Runtime ─────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=api-builder /app/services/api/dist ./dist
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/packages ./packages
COPY services/api/package.json ./

# Expo web build served as static files under dist/public
COPY --from=web-builder /app/dist ./dist/public

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma db push --schema=packages/database/schema.prisma --accept-data-loss && node dist/index.js"]
