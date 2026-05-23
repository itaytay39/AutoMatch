FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/scraper/ ./services/scraper/

RUN npm install --workspace=services/scraper --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/scraper && npm run build

# ── Runtime image ──────────────────────────────────────────────
# Use slim node image — Playwright is a fallback only; all primary connectors use fetch
FROM node:20-slim
WORKDIR /app

COPY --from=builder /app/services/scraper/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/scraper/package.json ./

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

STOPSIGNAL SIGTERM
CMD ["node", "dist/index.js"]
