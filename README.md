# MovieMatch

Plataforma que conecta amantes de filmes e séries por similaridade de gostos.

## Docker

```bash
make dev      # desenvolvimento (hot reload): www :3000, api :3001, postgres :5433
make prod     # produção em background (requer .env: cp .env.example .env)
make down     # derruba dev e prod
make test     # roda os testes dentro do container
make migrate name=nome_da_migration   # cria uma migration Prisma
```

## Sem Docker

Requer Node 24 e um PostgreSQL com `DATABASE_URL` definido.

```bash
npm install
npm run dev     # www + api
npm run build
npm start       # produção
npm test
```
