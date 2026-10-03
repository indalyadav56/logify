.PHONY: build run down mock-data

build: run

run:
	docker compose -f docker-compose.alpine.yaml up -d --build

down:
	docker compose -f docker-compose.alpine.yaml down --remove-orphans
	docker compose -f docker-compose.alpine.yaml -f docker-compose.dev.yaml down --remove-orphans

mock-data:
	python3 mock-data/seed.py $(ARGS)
