FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services
COPY scripts ./scripts
COPY infra ./infra

ENV NODE_ENV=production

CMD ["node", "services/api-gateway/src/server.mjs"]
