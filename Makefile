DEV = docker compose -f docker/compose.yaml
PROD = docker compose -f docker/compose.prod.yaml

.PHONY: dev prod down test migrate

dev:
	$(DEV) up --build

prod:
	$(PROD) up --build -d

down:
	$(DEV) down
	$(PROD) down

test:
	$(DEV) run --rm --no-deps api npm test

# make migrate name=add_movies
migrate:
	$(DEV) run --rm api npm exec -w api -- prisma migrate dev --name $(name)
