# AGENTS.md

MovieMatch: plataforma (projeto de faculdade) que conecta pessoas por similaridade de gosto em filmes e séries. Prioridade: **simplicidade e o mínimo de código**; evite overengineering.

## Estrutura

Monorepo NX com npm workspaces. NX infere os targets a partir dos `scripts` de cada `apps/*/package.json` (não há `project.json`).

- `apps/www` — Next.js (App Router) + React, porta 3000. Hoje só uma página estática.
- `apps/api` — NestJS (Express) + Prisma, porta 3001. Hoje só `GET /health`. O schema (`prisma/schema.prisma`, model `User`) e as migrations existem, mas o Nest ainda não usa o Prisma Client.
- PostgreSQL 17 via Docker.

## Comandos

Tudo roda via Docker; o `Makefile` é a interface principal, mas o repo também deve funcionar sem ele (comandos `docker compose -f docker/...` no README). Mantenha os dois em sincronia. Scripts do root (`dev`, `build`, `start`, `test`) apenas disparam `nx run-many -t <target>`.

- Logs: `make dev` sobe em background; use `make logs s=api|www|db` para acompanhar um serviço.
- Teste único: `docker compose -f docker/compose.yaml run --rm --no-deps api npm exec -w api -- jest -t "nome do teste"`
- Nova migration: `make migrate name=...` (commite a pasta gerada em `apps/api/prisma/migrations`).

## Arquitetura do front (`apps/www`): Feature-Based Layered Architecture

- `app/` — só rotas/layout do Next; compõe features, sem lógica de negócio.
- `features/<nome>/` — um diretório por funcionalidade, com suas camadas: `types.ts` (modelos), `api.ts` (acesso à API, via axios) e `ui/` (componentes/hooks). Referência: `features/health`.
- `shared/` — código sem dono de feature (ex.: `shared/lib/http.ts`, a instância única do axios).
- Dependências só descem: `app` → `features/*/ui` → `features/*/api` → `shared`. Features não importam umas das outras; se algo for comum, vai para `shared`.
- Imports usam o alias `@/` (raiz de `apps/www`). Para novas requisições, sempre use `shared/lib/http.ts`.
- A API libera CORS (`app.enableCors()`) porque o browser chama `NEXT_PUBLIC_API_URL` (padrão `http://localhost:3001`) direto.

## Docker

- Tudo em `docker/`: um único `Dockerfile` (contexto de build = raiz do repo) com targets `dev` (usado por `compose.yaml`), `api` e `www` (usados por `compose.prod.yaml`). A `.env` de produção fica em `docker/.env`.
- Dev monta `./apps` no container; mudanças em `package.json`/dependências exigem rebuild (`make dev` já usa `--build`).
- O script `dev`/`start` da api roda `prisma migrate deploy` antes de subir.

## Versões fixadas de propósito

- **Nest 11** (não 12): o 12 é ESM-only e quebra Jest/CommonJS sem configuração extra.
- **Prisma 6** (não 7): o 7 exige `prisma.config.ts` e driver adapters.
- `apps/api/tsconfig.json` declara `types: ["node", "jest"]` explicitamente (o TS atual não inclui `@types/*` automaticamente).
