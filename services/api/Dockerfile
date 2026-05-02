FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo root and all packages
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/api/ ./services/api/

# Install all deps
RUN npm install --workspace=services/api --workspace=packages/database

# Generate Prisma client
RUN DATABASE_URL="postgresql://placeholder@placeholder:5432/placeholder" \
    npx prisma generate --schema=packages/database/schema.prisma

# Build API
RUN cd services/api && npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY services/api/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
