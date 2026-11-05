# MovieMatch

Plataforma que conecta amantes de filmes e séries por similaridade de gostos.

## Docker

```bash
make dev      # desenvolvimento em background (hot reload): www :3000, api :3001, postgres :5432
make logs s=api   # acompanha os logs de um serviço (api, www ou db); sem s, todos
make prod     # produção em background (requer docker/.env, veja abaixo)
make down     # derruba dev e prod
make test     # roda os testes dentro do container
make migrate name=nome_da_migration   # cria uma migration Prisma
```

## Docker sem Makefile

Os arquivos ficam em `docker/`; rode sempre da raiz do repositório.

```bash
# desenvolvimento
docker compose -f docker/compose.yaml up --build -d
docker compose -f docker/compose.yaml logs -f api   # api, www ou db
docker compose -f docker/compose.yaml down
docker compose -f docker/compose.yaml run --rm --no-deps api npm test
docker compose -f docker/compose.yaml run --rm api npm exec -w api -- prisma migrate dev --name nome_da_migration
```

```bash
# produção (defina a senha do banco antes)
cp docker/.env.example docker/.env
docker compose -f docker/compose.prod.yaml up --build -d
docker compose -f docker/compose.prod.yaml down
```

## Sem Docker

Requer Node >= 24 (npm >= 11) e um PostgreSQL com `DATABASE_URL` definido.

```bash
npm install
npm run dev     # www + api
npm run build
npm start       # produção
npm test
```
