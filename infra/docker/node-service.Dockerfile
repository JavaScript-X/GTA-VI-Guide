FROM node:20-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY package.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services
COPY scripts ./scripts
COPY infra ./infra

ENV NODE_ENV=production

USER app

CMD ["node", "services/api-gateway/src/server.mjs"]
