# AGENTS.md

MovieMatch: plataforma (projeto de faculdade) que conecta pessoas por similaridade de gosto em filmes e séries. Prioridade: **simplicidade e o mínimo de código**; evite overengineering.

## Estrutura

Monorepo NX com npm workspaces. NX infere os targets a partir dos `scripts` de cada `apps/*/package.json` (não há `project.json`).

- `apps/www` — Next.js (App Router) + React, porta 3000. Hoje só uma página estática.
- `apps/api` — NestJS (Express) + Prisma, porta 3001. Hoje só `GET /health`. O schema (`prisma/schema.prisma`, model `User`) e as migrations existem, mas o Nest ainda não usa o Prisma Client.
- PostgreSQL 17 via Docker.

## Comandos

Tudo roda via Docker; o `Makefile` é a interface principal (veja o README). Scripts do root (`dev`, `build`, `start`, `test`) apenas disparam `nx run-many -t <target>`.

- Teste único: `docker compose run --rm --no-deps api npm exec -w api -- jest -t "nome do teste"`
- Nova migration: `make migrate name=...` (commite a pasta gerada em `apps/api/prisma/migrations`).

## Docker

- Um único `Dockerfile` na raiz com targets: `dev` (usado por `compose.yaml`), `api` e `www` (usados por `compose.prod.yaml`).
- Dev monta `./apps` no container; mudanças em `package.json`/dependências exigem rebuild (`make dev` já usa `--build`).
- O script `dev`/`start` da api roda `prisma migrate deploy` antes de subir.
- Postgres de dev fica na porta **5433** do host (5432 costuma estar ocupada).

## Versões fixadas de propósito

- **Nest 11** (não 12): o 12 é ESM-only e quebra Jest/CommonJS sem configuração extra.
- **Prisma 6** (não 7): o 7 exige `prisma.config.ts` e driver adapters.
- `apps/api/tsconfig.json` declara `types: ["node", "jest"]` explicitamente (o TS atual não inclui `@types/*` automaticamente).
