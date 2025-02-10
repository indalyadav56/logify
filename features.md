        +-------------------------------------+
        |   Company Servers (Clients)        |
        |   (Web App, Backend, Services)     |
        +-------------------------------------+
                    │  (HTTP POST /logs)
                          ▼
          +------------------------------------+
          |  API Gateway / Load Balancer       |   <-- (Rate Limiting, Authentication)
          |  (Nginx / Envoy / AWS ALB)         |
          +------------------------------------+
                          │
                          ▼
          +------------------------------------+
          |  Log Ingestion Service (Go)       |   <-- (Validation, Parsing, Batching)
          |  (Gin / Fiber)                    |
          +------------------------------------+
                          │
                          ▼
          +------------------------------------+
          |  Kafka (Message Queue)            |   <-- (Ensures high availability & reliability)
          |  (Topic: logs, Partitions: per company) |
          +------------------------------------+
                          │
                          ▼
         +---------------------------------------------+
         |  Storage & Indexing                        |
         |  - ClickHouse (Fast Queries)              |
         |  - OpenSearch / Elasticsearch (Search)    |
         |  - S3 (Long-term storage)                 |
         +---------------------------------------------+
                          │
                          ▼
         +---------------------------------------------+
         |  Log Retrieval API & Dashboard             |
         |  - WebSocket for real-time updates         |
         |  - REST API for historical log queries     |
         +---------------------------------------------+



{
  "project_id": "123",
  "service": "auth-service",
  "level": "ERROR",
  "message": "User login failed",
  "timestamp": "2025-02-01T12:34:56Z",
  "metadata": {
    "user_ip": "192.168.1.1",
    "trace_id": "abcd-efgh-ijkl"
  }
}
