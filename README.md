# MovieMatch

Plataforma que conecta amantes de filmes e séries por similaridade de gostos.

## Pré-requisitos

### Com Docker

- [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/) (no macOS/Linux, veja a [documentação do Docker](https://docs.docker.com/get-started/get-docker/)).
- `make` é opcional; sem ele, use a seção "Docker sem Makefile".

### Sem Docker

1. Instale o [Node.js](https://nodejs.org/en/download) >= 24 (já inclui o npm >= 11).
2. Instale o [PostgreSQL](https://www.postgresql.org/download/) 17 e crie o usuário e o banco:

```bash
psql -U postgres -c "CREATE USER moviematch WITH PASSWORD 'moviematch';"
psql -U postgres -c "CREATE DATABASE moviematch OWNER moviematch;"
```

3. Defina a variável de ambiente `DATABASE_URL` (a API aplica as migrations ao iniciar):

```bash
export DATABASE_URL=postgresql://moviematch:moviematch@localhost:5432/moviematch   # Linux/macOS
$env:DATABASE_URL="postgresql://moviematch:moviematch@localhost:5432/moviematch"   # PowerShell
```

4. Instale as dependências na raiz do repositório: `npm install`.

### VS Code

Recomendamos a extensão [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`) para formatar o código ao salvar.

## Docker

```bash
make dev      # desenvolvimento em background (hot reload): www :3000, api :3001, postgres :5432
make logs s=api   # acompanha os logs de um serviço (api, www ou db); sem s, todos
make down     # derruba dev e prod
make test     # roda os testes dentro do container
make format   # formata o código com Prettier (roda no host: npm install antes)
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

## Sem Docker

Veja os pré-requisitos acima.

```bash
npm run dev     # www + api
```
