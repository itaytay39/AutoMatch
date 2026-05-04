FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/api/ ./services/api/

RUN npm install --workspace=services/api --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/api && npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/api/package.json ./

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma db push --schema=packages/database/schema.prisma --accept-data-loss && node_modules/.bin/tsx packages/database/seed.ts; node dist/index.js"]
