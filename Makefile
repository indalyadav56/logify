build:
	docker compose -f docker-compose.alpine.yaml up -d --build

.PHONY: mock-data
mock-data:
	python3 mock-data/seed.py $(ARGS)
