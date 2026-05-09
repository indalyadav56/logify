create-topic:
	docker exec -it logify_kafka kafka-topics \
	--bootstrap-server localhost:29092 \
	--create \
	--topic logs \
	--partitions 1 \
	--replication-factor 1

# ============================================================
# Logify – Docker Compose
# ============================================================
# Usage:
#   docker compose up -d                    # infrastructure only
#   docker compose --profile app up -d      # infra + app services
#   docker compose --profile dev up -d      # infra + dev tools (kafka-ui)
#   docker compose --profile app --profile dev up -d  # everything
# ============================================================

run-dev:
	docker compose --profile dev up -d
