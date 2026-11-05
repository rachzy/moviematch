DEV = docker compose -f docker/compose.yaml
PROD = docker compose -f docker/compose.prod.yaml

.PHONY: dev logs prod down test format migrate

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

# Roda no host (requer npm install)
format:
	npm run format

# make migrate name=add_movies
migrate:
	$(DEV) run --rm api npm exec -w api -- prisma migrate dev --name $(name)
