# Contexto de build é a raiz do repo. Alvos: dev (compose de desenvolvimento), api e www (produção)
FROM node:24-alpine AS dev
RUN apk add --no-cache openssl
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package*.json ./
COPY --chown=node:node apps/api/package.json apps/api/
COPY --chown=node:node apps/www/package.json apps/www/
RUN npm ci
COPY --chown=node:node . .
RUN npm exec -w api -- prisma generate

FROM dev AS build
RUN npm run build

FROM build AS api
ENV NODE_ENV=production
CMD ["npm", "run", "start", "-w", "api"]

FROM build AS www
ENV NODE_ENV=production
CMD ["npm", "run", "start", "-w", "www"]
