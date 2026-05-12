FROM mcr.microsoft.com/playwright:v1.44.1-jammy AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/scraper/ ./services/scraper/

RUN npm install --workspace=services/scraper --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/scraper && npm run build

# ── Runtime image ──────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.44.1-jammy
WORKDIR /app

# Install Chromium + all OS deps in one layer
RUN npx playwright install chromium --with-deps

COPY --from=builder /app/services/scraper/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/scraper/package.json ./

# Playwright needs a display-less environment
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Graceful shutdown
STOPSIGNAL SIGTERM

CMD ["node", "dist/index.js"]
