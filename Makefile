PROD = docker compose -f compose.prod.yaml

.PHONY: dev prod down test migrate

dev:
	docker compose up --build

prod:
	$(PROD) up --build -d

down:
	docker compose down
	$(PROD) down

test:
	docker compose run --rm --no-deps api npm test

# make migrate name=add_movies
migrate:
	docker compose run --rm api npm exec -w api -- prisma migrate dev --name $(name)
