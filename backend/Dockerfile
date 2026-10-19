FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./prisma7.config.ts
RUN npm ci

COPY . .
RUN npx prisma generate --config prisma7.config.ts && npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./prisma7.config.ts
RUN npm ci --omit=dev --ignore-scripts \
  && npm install prisma@7.10.0 dotenv@18.0.7 \
  && npx prisma generate --config prisma7.config.ts

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
