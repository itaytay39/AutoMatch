FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/notifications/ ./services/notifications/

RUN npm install --workspace=services/notifications --workspace=packages/database

RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

RUN cd services/notifications && npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/services/notifications/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/notifications/package.json ./

CMD ["node", "dist/server.js"]
