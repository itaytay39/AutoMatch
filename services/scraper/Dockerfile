FROM mcr.microsoft.com/playwright:v1.44.1-jammy AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/scraper/ ./services/scraper/

RUN npm install --workspace=services/scraper --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/scraper && npm run build

FROM mcr.microsoft.com/playwright:v1.44.1-jammy
WORKDIR /app

COPY --from=builder /app/services/scraper/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/scraper/package.json ./

RUN npx playwright install chromium --with-deps

CMD ["node", "dist/index.js"]
