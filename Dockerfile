FROM node:20-bullseye-slim

WORKDIR /app

# Prisma용 OpenSSL 1.1 설치
RUN apt-get update && \
    apt-get install -y openssl libssl1.1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
