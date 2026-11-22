DEV = docker compose -f docker/compose.yaml
PROD = docker compose -f docker/compose.prod.yaml
E2E = docker compose -p moviematch-e2e -f docker/compose.yaml -f docker/compose.e2e.yaml

.PHONY: dev logs prod down test e2e format migrate

dev:
	$(DEV) up --build -d

# make logs s=api  (s opcional: api, www ou db; sem s mostra todos)
logs:
	$(DEV) logs -f --tail=50 $(s)

prod:
	$(PROD) up --build -d

down:
	$(DEV) down
	$(PROD) down

test:
	$(DEV) run --rm --no-deps api npm test
	$(DEV) run --rm --no-deps www npm test -w www

# Testes E2E (Playwright) em containers, com stack e banco isolados do `make dev`
e2e:
	$(E2E) up --build --abort-on-container-exit --exit-code-from e2e; s=$$?; $(E2E) down -v; exit $$s

# Roda no host (requer npm install)
format:
	npm run format

# make migrate name=add_movies
migrate:
	$(DEV) run --rm api npm exec -w api -- prisma migrate dev --name $(name)
