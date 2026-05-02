FROM mcr.microsoft.com/playwright:v1.44.1-jammy AS base
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.44.1-jammy
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY package.json ./
RUN npx playwright install chromium --with-deps
CMD ["node", "dist/index.js"]
